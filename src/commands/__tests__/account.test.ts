import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { accountCommand } from '../account.js';

const { fetchMock } = vi.hoisted(() => ({ fetchMock: vi.fn() }));
vi.mock('node-fetch', () => ({ default: fetchMock }));

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

describe('Account Command', () => {
  it('should have correct name', () => {
    expect(accountCommand.name()).toBe('account');
  });

  it('should have a subcommand named create', () => {
    const subcommands = accountCommand.commands.map((cmd) => cmd.name());
    expect(subcommands).toContain('create');
  });
});

describe('account create', () => {
  let captured: ReturnType<typeof captureLogs>;

  beforeEach(() => {
    fetchMock.mockReset();
    captured = captureLogs();
  });

  afterEach(() => {
    captured.restore();
  });

  it('funds the generated keypair on testnet', async () => {
    fetchMock.mockResolvedValue({ ok: true });

    await accountCommand.parseAsync(['create'], { from: 'user' });

    const url = fetchMock.mock.calls[0][0] as string;
    expect(url).toMatch(/^https:\/\/friendbot\.stellar\.org\?addr=G[A-Z2-7]{55}$/);
    expect(captured.out).toContain('SUCCESS! Account funded successfully.');
  });

  it('hides the secret key unless it is explicitly requested', async () => {
    fetchMock.mockResolvedValue({ ok: true });

    await accountCommand.parseAsync(['create'], { from: 'user' });

    expect(captured.out).toContain('Secret Key: [hidden]  Pass --reveal-secret to print it.');
    expect(captured.out.join('\n')).not.toMatch(/^Secret Key: S/);
  });

  it('prints the secret key when --reveal-secret is passed', async () => {
    fetchMock.mockResolvedValue({ ok: true });

    await accountCommand.parseAsync(['create', '--reveal-secret'], { from: 'user' });

    expect(captured.out.join('\n')).toMatch(/Secret Key: S[A-Z2-7]{55}/);
    expect(captured.out.join('\n')).toContain('Never share it or commit it.');
  });

  it('reports the friendbot error detail when funding fails', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      json: async () => ({ detail: 'limit reached' }),
    });

    await accountCommand.parseAsync(['create'], { from: 'user' });

    expect(captured.errs.join(' ')).toContain('limit reached');
  });

  it('falls back to the whole friendbot payload when there is no detail', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      json: async () => ({ status: 429 }),
    });

    await accountCommand.parseAsync(['create'], { from: 'user' });

    expect(captured.errs.join(' ')).toContain('[object Object]');
  });

  it('surfaces a thrown error instead of crashing', async () => {
    fetchMock.mockRejectedValue(new Error('offline'));

    await accountCommand.parseAsync(['create'], { from: 'user' });

    expect(captured.errs.join(' ')).toContain('Error creating account: offline');
  });

  it('prints non-Error rejections verbatim', async () => {
    fetchMock.mockRejectedValue('friendbot said no');

    await accountCommand.parseAsync(['create'], { from: 'user' });

    expect(captured.errs.join(' ')).toContain('friendbot said no');
  });
});
