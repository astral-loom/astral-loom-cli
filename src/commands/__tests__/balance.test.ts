import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { balanceCommand } from '../balance.js';

const { state } = vi.hoisted(() => {
  const state = {
    urls: [] as string[],
    queried: [] as string[],
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
    accounts() {
      return {
        accountId(publicKey: string) {
          state.queried.push(publicKey);
          return {
            call: () =>
              state.shouldFail ? Promise.reject(state.failure) : Promise.resolve(state.result),
          };
        },
      };
    }
  }
  return { ...actual, Horizon: { ...actual.Horizon, Server: ServerStub } };
});

const ACCOUNT = 'GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';

function captureLogs() {
  const out: string[] = [];
  const errs: string[] = [];
  const log = vi.spyOn(console, 'log').mockImplementation((...args: unknown[]) => {
    out.push(args.map(String).join(' '));
  });
  const error = vi.spyOn(console, 'error').mockImplementation((...args: unknown[]) => {
    errs.push(args.map(String).join(' '));
  });
  return { out, errs, restore: () => { log.mockRestore(); error.mockRestore(); } };
}

describe('Balance Command', () => {
  it('should have correct name', () => {
    expect(balanceCommand.name()).toBe('balance');
  });

  it('should have correct description containing balance', () => {
    expect(balanceCommand.description().toLowerCase()).toContain('balance');
  });

  it('should have an argument for publicKey', () => {
    const args = balanceCommand.registeredArguments.map((arg) => arg.name());
    expect(args).toContain('publicKey');
  });

  it('should have an option --network with default testnet', () => {
    const networkOption = balanceCommand.options.find((opt) => opt.long === '--network');
    expect(networkOption).toBeDefined();
    expect(networkOption?.defaultValue).toBe('testnet');
  });
});

describe('balance action', () => {
  let captured: ReturnType<typeof captureLogs>;

  beforeEach(() => {
    state.urls = [];
    state.queried = [];
    state.result = { balances: [] };
    state.failure = undefined;
    state.shouldFail = false;
    state.config = {};
    captured = captureLogs();
  });

  afterEach(() => {
    captured.restore();
  });

  it('queries testnet horizon when no network is given', async () => {
    await balanceCommand.parseAsync([ACCOUNT], { from: 'user' });

    expect(state.urls).toEqual(['https://horizon-testnet.stellar.org']);
    expect(state.queried).toEqual([ACCOUNT]);
    expect(captured.out.join(' ')).toContain('Querying testnet for account');
  });

  it('uses the configured network when --network is not passed on the CLI', async () => {
    state.config = { network: 'mainnet' };

    await balanceCommand.parseAsync([ACCOUNT], { from: 'user' });

    expect(state.urls).toEqual(['https://horizon.stellar.org']);
    expect(captured.out.join(' ')).toContain('Querying mainnet');
  });

  it('lets an explicit CLI network win over the saved config', async () => {
    state.config = { network: 'mainnet' };

    await balanceCommand.parseAsync([ACCOUNT, '--network', 'testnet'], { from: 'user' });

    expect(state.urls).toEqual(['https://horizon-testnet.stellar.org']);
  });

  it('renders native, asset and limit-free balances', async () => {
    state.result = {
      balances: [
        { asset_type: 'native', balance: '100.0000000' },
        { asset_type: 'credit_alphanum4', asset_code: 'USDC', balance: '5.0000000', limit: '1000.0000000' },
        { asset_type: 'liquidity_pool', balance: '1.0000000', limit: '' },
        { asset_type: 'claimable_balance', balance: '2.0000000' },
      ],
    };

    await balanceCommand.parseAsync([ACCOUNT, '-n', 'mainnet'], { from: 'user' });

    const table = captured.out.join('\n');
    expect(table).toContain('XLM');
    expect(table).toContain('USDC');
    expect(table).toContain('UNKNOWN');
    expect(table).toContain('Unlimited');
    expect(table).toContain('100.0000000');
  });

  it('reports a lookup failure without throwing', async () => {
    state.shouldFail = true;
    state.failure = new Error('account not found');

    await balanceCommand.parseAsync([ACCOUNT], { from: 'user' });

    expect(captured.errs.join(' ')).toContain('Error fetching balance: account not found');
  });

  it('wraps non-Error rejections so the message still prints', async () => {
    state.shouldFail = true;
    state.failure = 'horizon is down';

    await balanceCommand.parseAsync([ACCOUNT], { from: 'user' });

    expect(captured.errs.join(' ')).toContain('Error fetching balance: horizon is down');
  });
});
