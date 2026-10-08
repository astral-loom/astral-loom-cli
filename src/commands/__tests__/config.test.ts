import { describe, it, expect } from 'vitest';
import { configCommand } from '../config.js';

describe('Config Command', () => {
  it('should have correct name', () => {
    expect(configCommand.name()).toBe('config');
  });

  it('should expose set, get and list subcommands', () => {
    const subcommands = configCommand.commands.map((cmd) => cmd.name());
    expect(subcommands).toEqual(expect.arrayContaining(['set', 'get', 'list']));
  });
});
