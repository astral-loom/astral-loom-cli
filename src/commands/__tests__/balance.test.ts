import { describe, it, expect } from 'vitest';
import { balanceCommand } from '../balance.js';

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
