import { describe, it, expect } from 'vitest';
import { accountCommand } from '../account.js';

describe('Account Command', () => {
  it('should have correct name', () => {
    expect(accountCommand.name()).toBe('account');
  });

  it('should have a subcommand named create', () => {
    const subcommands = accountCommand.commands.map((cmd) => cmd.name());
    expect(subcommands).toContain('create');
  });
});
