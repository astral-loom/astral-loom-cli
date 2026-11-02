import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { sorobanInvokeCommand } from '../soroban-invoke.js';
import { Keypair, StrKey } from '@stellar/stellar-sdk';

const { state } = vi.hoisted(() => {
  const state = {
    urls: [] as string[],
    simulated: [] as unknown[],
    result: undefined as unknown,
    failure: undefined as unknown,
    shouldFail: false,
    config: {} as Record<string, string>,
  };
  return { state };
});

vi.mock('../config.js', () => ({ readConfig: () => state.config }));

vi.mock('@stellar/stellar-sdk', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@stellar/stellar-sdk')>();

  class ServerStub {
    constructor(url: string) {
      state.urls.push(url);
    }
    simulateTransaction(transaction: unknown) {
      state.simulated.push(transaction);
      return state.shouldFail ? Promise.reject(state.failure) : Promise.resolve(state.result);
    }
  }

  return { ...actual, rpc: { ...actual.rpc, Server: ServerStub } };
});

const CONTRACT_ID = StrKey.encodeContract(Keypair.random().rawPublicKey());

function captureLogs() {
  const logs: unknown[][] = [];
  const errs: unknown[][] = [];
  const log = vi.spyOn(console, 'log').mockImplementation((...args: unknown[]) => {
    logs.push(args);
  });
  const error = vi.spyOn(console, 'error').mockImplementation((...args: unknown[]) => {
    errs.push(args);
  });
  return {
    errs,
    out: () => logs.map((args) => args.map(String).join(' ')).join('\n'),
    errText: () => errs.map((args) => args.map(String).join(' ')).join('\n'),
    restore: () => {
      log.mockRestore();
      error.mockRestore();
    },
  };
}

describe('Soroban Invoke Command', () => {
  it('should have correct name', () => {
    expect(sorobanInvokeCommand.name()).toBe('soroban-invoke');
  });

  it('should have correct description containing Soroban or soroban', () => {
    const desc = sorobanInvokeCommand.description();
    expect(desc.includes('Soroban') || desc.includes('soroban')).toBe(true);
  });

  it('should have an option --network with default testnet', () => {
    const networkOption = sorobanInvokeCommand.options.find((opt) => opt.long === '--network');
    expect(networkOption).toBeDefined();
    expect(networkOption?.defaultValue).toBe('testnet');
  });
});

describe('soroban-invoke action', () => {
  let captured: ReturnType<typeof captureLogs>;
  let exitCodeBefore: string | number | null | undefined;

  beforeEach(() => {
    exitCodeBefore = process.exitCode;
    state.urls = [];
    state.simulated = [];
    state.result = undefined;
    state.failure = undefined;
    state.shouldFail = false;
    state.config = {};
    captured = captureLogs();
  });

  afterEach(() => {
    captured.restore();
    process.exitCode = exitCodeBefore;
  });

  it('simulates against the testnet RPC endpoint by default', async () => {
    state.result = { transactionData: 'AAAA', cost: { cpuInsns: '100' } };

    await sorobanInvokeCommand.parseAsync([CONTRACT_ID, 'transfer', '42'], { from: 'user' });

    expect(state.urls).toEqual(['https://soroban-testnet.stellar.org']);
    expect(state.simulated).toHaveLength(1);
    expect(captured.out()).toContain(`Simulating transfer on contract ${CONTRACT_ID} (testnet)`);
  });

  it('uses the saved config network when the CLI flag is absent', async () => {
    state.config = { network: 'mainnet' };
    state.result = { transactionData: 'AAAA', cost: {} };

    await sorobanInvokeCommand.parseAsync([CONTRACT_ID, 'ping'], { from: 'user' });

    expect(state.urls).toEqual(['https://mainnet.stellar.googleapis.com']);
  });

  it('lets an explicit CLI network win over the saved config', async () => {
    state.config = { network: 'mainnet' };
    state.result = { transactionData: 'AAAA', cost: {} };

    await sorobanInvokeCommand.parseAsync([CONTRACT_ID, 'ping', '-n', 'testnet'], { from: 'user' });

    expect(state.urls).toEqual(['https://soroban-testnet.stellar.org']);
  });

  it('accepts both JSON-encoded and plain-string arguments', async () => {
    state.result = { transactionData: 'AAAA', cost: {} };

    await sorobanInvokeCommand.parseAsync([CONTRACT_ID, 'mint', '42', '"7"', 'raw-text'], {
      from: 'user',
    });

    expect(state.simulated).toHaveLength(1);
    expect(captured.out()).toContain('Simulation Success');
  });

  it('prints the return value when the simulation provides one', async () => {
    const { nativeToScVal } = await import('@stellar/stellar-sdk');
    state.result = {
      transactionData: 'AAAA',
      cost: { cpuInsns: '9' },
      result: { retval: nativeToScVal(7) },
    };

    await sorobanInvokeCommand.parseAsync([CONTRACT_ID, 'get'], { from: 'user' });

    expect(captured.out()).toContain('Cost:');
    expect(captured.out()).toContain('Return Value:');
  });

  it('skips the return value when the simulation result is empty', async () => {
    state.result = { transactionData: 'AAAA', cost: { cpuInsns: '1' }, result: {} };

    await sorobanInvokeCommand.parseAsync([CONTRACT_ID, 'get'], { from: 'user' });

    expect(captured.out()).not.toContain('Return Value:');
  });

  it('reports a simulation error and stops', async () => {
    state.result = { error: 'HostError: NotFound' };

    await sorobanInvokeCommand.parseAsync([CONTRACT_ID, 'get'], { from: 'user' });

    expect(captured.errText()).toContain('Simulation Error: HostError: NotFound');
    expect(captured.out()).not.toContain('Simulation Success');
  });

  it('reports an incomplete simulation that is neither success nor error', async () => {
    state.result = { notYetSimulating: true };

    await sorobanInvokeCommand.parseAsync([CONTRACT_ID, 'get'], { from: 'user' });

    expect(captured.errText()).toContain('Simulation failed or incomplete');
  });

  it('rejects an unknown network without contacting RPC', async () => {
    await sorobanInvokeCommand.parseAsync([CONTRACT_ID, 'get', '--network', 'devnet'], {
      from: 'user',
    });

    expect(state.urls).toEqual([]);
    expect(captured.errText()).toContain('Unknown network "devnet"');
    expect(captured.errText()).toContain('testnet, mainnet');
    expect(process.exitCode).toBe(1);
  });

  it('reports an RPC failure', async () => {
    state.shouldFail = true;
    state.failure = new Error('rpc unreachable');

    await sorobanInvokeCommand.parseAsync([CONTRACT_ID, 'get'], { from: 'user' });

    expect(captured.errText()).toContain('Error: rpc unreachable');
  });

  it('stringifies a non-Error RPC failure', async () => {
    state.shouldFail = true;
    state.failure = 'socket hung up';

    await sorobanInvokeCommand.parseAsync([CONTRACT_ID, 'get'], { from: 'user' });

    expect(captured.errText()).toContain('socket hung up');
  });
});
