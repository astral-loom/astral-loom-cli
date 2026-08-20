import { describe, it, expect } from 'vitest';
import { decodeXdrCommand } from '../xdr';

describe('XDR Command', () => {
  it('should have correct name', () => {
    expect(decodeXdrCommand.name()).toBe('xdr');
  });
});
