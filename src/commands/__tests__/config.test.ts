import { describe, it, expect, vi } from 'vitest';
import { configCommand, readConfig } from '../config.js';
import fs from 'fs';

vi.mock('fs');

describe('Config Command', () => {
  it('should have correct name', () => {
    expect(configCommand.name()).toBe('config');
  });

  it('should expose set, get and list subcommands', () => {
    const subcommands = configCommand.commands.map((cmd) => cmd.name());
    expect(subcommands).toEqual(expect.arrayContaining(['set', 'get', 'list']));
  });

  it('should read config correctly from disk', () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ network: 'mainnet' }));

    const config = readConfig();
    expect(config.network).toBe('mainnet');
  });

  it('should return empty object if config file does not exist', () => {
    vi.mocked(fs.existsSync).mockReturnValue(false);

    const config = readConfig();
    expect(config).toEqual({});
  });
});
