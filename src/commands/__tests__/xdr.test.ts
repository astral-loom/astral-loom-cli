import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { decodeXdrCommand } from '../xdr.js';

describe('XDR Command', () => {
  const validXdr =
    'AAAAAgAAAAC2jE+U+ukXFoFvks57nkynW3VejuCU/iKUKj3ZdWquvwAAAGQAAAAAAAAAZQAAAAEAAAAAAAAAAAAAAABqx60zAAAAAAAAAAEAAAAAAAAAAQAAAAD2NK5xbT3fQZoNRpInJlpaQwzmZQD/tSMwt/+NMXRm6AAAAAAAAAAABfXhAAAAAAAAAAAA';

  let consoleLogSpy: ReturnType<typeof vi.spyOn>;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  it('should have correct name and description', () => {
    expect(decodeXdrCommand.name()).toBe('decode');
    expect(decodeXdrCommand.description()).toBe('Pretty-print an XDR string (TransactionEnvelope)');
  });

  it('should successfully decode valid XDR string and output structured JSON', async () => {
    await decodeXdrCommand.parseAsync(['node', 'test', validXdr]);

    expect(consoleLogSpy).toHaveBeenCalled();
    const output = consoleLogSpy.mock.calls[0][0] as string;
    const parsed = JSON.parse(output);

    expect(parsed).toBeDefined();
    expect(parsed.tx).toBeDefined();
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it('should handle invalid base64 input with user-friendly error message', async () => {
    await decodeXdrCommand.parseAsync(['node', 'test', 'not-valid-base64-or-xdr!@#$']);

    expect(consoleErrorSpy).toHaveBeenCalled();
    const errorOutput = consoleErrorSpy.mock.calls[0][0] as string;
    expect(errorOutput).toContain('Failed to decode XDR as TransactionEnvelope:');
    expect(consoleLogSpy).not.toHaveBeenCalled();
  });
});
