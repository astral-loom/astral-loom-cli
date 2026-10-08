import { describe, it, expect } from 'vitest';
import { submitCommand } from '../submit.js';

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
