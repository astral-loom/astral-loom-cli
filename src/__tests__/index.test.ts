import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('fs');

const cryptoDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'crypto');
const originalArgv = process.argv;

function captureOutput() {
  const written: string[] = [];
  const spy = vi.spyOn(console, 'log').mockImplementation((...args: unknown[]) => {
    written.push(args.map(String).join(' '));
  });
  return { written, restore: () => spy.mockRestore() };
}

describe('CLI entry point', () => {
  let out: ReturnType<typeof captureOutput>;

  beforeEach(() => {
    vi.resetModules();
    out = captureOutput();
  });

  afterEach(() => {
    out.restore();
    process.argv = originalArgv;
    if (cryptoDescriptor) Object.defineProperty(globalThis, 'crypto', cryptoDescriptor);
  });

  it('wires the config command through to its action', async () => {
    process.argv = ['node', 'loom', 'config', 'list'];

    await import('../index.js');

    expect(out.written.join('')).toContain('No configuration values set.');
  });

  it('installs the Web Crypto polyfill when the runtime has no global crypto', async () => {
    expect(Reflect.deleteProperty(globalThis, 'crypto')).toBe(true);
    expect(globalThis.crypto).toBeUndefined();
    process.argv = ['node', 'loom', 'config', 'list'];

    await import('../index.js');

    expect(typeof globalThis.crypto.subtle.digest).toBe('function');
    expect(out.written.join('')).toContain('No configuration values set.');
  });
});
