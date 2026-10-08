import { describe, it, expect } from 'vitest';
import { sorobanInvokeCommand } from '../soroban-invoke.js';

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
