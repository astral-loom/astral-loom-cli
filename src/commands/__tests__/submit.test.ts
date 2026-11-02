import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { submitCommand } from '../submit.js';

const { state } = vi.hoisted(() => {
  const state = {
    urls: [] as string[],
    parsed: [] as string[],
    response: undefined as unknown,
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
    submitTransaction() {
      return state.shouldFail ? Promise.reject(state.failure) : Promise.resolve(state.response);
    }
  }

  const TransactionBuilderStub = {
    fromXDR: (xdrString: string) => {
      state.parsed.push(xdrString);
      return { reconstructedFrom: xdrString };
    },
  };

  return {
    ...actual,
    Horizon: { ...actual.Horizon, Server: ServerStub },
    TransactionBuilder: TransactionBuilderStub,
  };
});

const ENVELOPE = 'AAAAAGVHOZtlD6mqbWAM6Tm6-signed-envelope';

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
    logs,
    errs,
    out: () => logs.map((args) => args.map(String).join(' ')).join('\n'),
    errText: () => errs.map((args) => args.map(String).join(' ')).join('\n'),
    restore: () => {
      log.mockRestore();
      error.mockRestore();
    },
  };
}

describe('Submit Command', () => {
  it('should have correct name', () => {
    expect(submitCommand.name()).toBe('submit');
  });

  it('should have correct description containing submit or transaction', () => {
    const desc = submitCommand.description().toLowerCase();
    expect(desc.includes('submit') || desc.includes('transaction')).toBe(true);
  });

  it('should have an option --network with default testnet', () => {
    const networkOption = submitCommand.options.find((opt) => opt.long === '--network');
    expect(networkOption).toBeDefined();
    expect(networkOption?.defaultValue).toBe('testnet');
  });
});

describe('submit action', () => {
  let captured: ReturnType<typeof captureLogs>;

  beforeEach(() => {
    state.urls = [];
    state.parsed = [];
    state.response = undefined;
    state.failure = undefined;
    state.shouldFail = false;
    state.config = {};
    captured = captureLogs();
  });

  afterEach(() => {
    captured.restore();
  });

  it('parses the envelope and prints the accepted hash and ledger', async () => {
    state.response = { hash: 'abc123', ledger: 42 };

    await submitCommand.parseAsync([ENVELOPE], { from: 'user' });

    expect(state.parsed).toEqual([ENVELOPE]);
    expect(state.urls).toEqual(['https://horizon-testnet.stellar.org']);
    expect(captured.out()).toContain('Hash: abc123');
    expect(captured.out()).toContain('Ledger: 42');
    expect(captured.out()).toContain('Explorer: https://stellar.expert/explorer/testnet/tx/abc123');
  });

  it('omits the ledger line when horizon does not report one', async () => {
    state.response = { hash: 'abc123' };

    await submitCommand.parseAsync([ENVELOPE, '--network', 'mainnet'], { from: 'user' });

    expect(state.urls).toEqual(['https://horizon.stellar.org']);
    expect(captured.out()).not.toContain('Ledger:');
    expect(captured.out()).toContain('Explorer: https://stellar.expert/explorer/public/tx/abc123');
  });

  it('prints horizon result codes when the transaction is rejected', async () => {
    const resultCodes = { transaction: 'txFailed', operations: ['opNoTrust'] };
    state.shouldFail = true;
    state.failure = { response: { data: { extras: { result_codes: resultCodes } } } };

    await submitCommand.parseAsync([ENVELOPE], { from: 'user' });

    expect(captured.errText()).toContain('Error submitting transaction:');
    expect(captured.errs.at(-1)).toEqual(['Result Codes:', resultCodes]);
  });

  it('prints the detail string when there are no result codes', async () => {
    state.shouldFail = true;
    state.failure = { response: { data: { detail: 'tx failed' } } };

    await submitCommand.parseAsync([ENVELOPE], { from: 'user' });

    expect(captured.errText()).toContain('tx failed');
  });

  it('prints the message for a plain error with no response payload', async () => {
    state.shouldFail = true;
    state.failure = new Error('bad xdr');

    await submitCommand.parseAsync([ENVELOPE], { from: 'user' });

    expect(captured.errText()).toContain('bad xdr');
  });

  it('wraps a non-Error rejection so something is always reported', async () => {
    state.shouldFail = true;
    state.failure = 'network unreachable';

    await submitCommand.parseAsync([ENVELOPE], { from: 'user' });

    expect(captured.errText()).toContain('network unreachable');
  });
});
