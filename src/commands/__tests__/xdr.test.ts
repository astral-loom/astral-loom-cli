import { describe, it, expect } from 'vitest';
import { decodeXdrCommand } from '../xdr.js';

describe('XDR Command', () => {
  it('should have correct name', () => {
    expect(decodeXdrCommand.name()).toBe('decode');
  });
});
