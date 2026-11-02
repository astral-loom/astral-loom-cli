import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { configCommand, readConfig, writeConfig, CONFIG_PATH } from '../config.js';
import fs from 'fs';

vi.mock('fs');

function stubDisk(config: Record<string, string> | undefined) {
  vi.mocked(fs.existsSync).mockReturnValue(config !== undefined);
  vi.mocked(fs.readFileSync).mockReturnValue(config === undefined ? '' : JSON.stringify(config));
}

describe('Config Command', () => {
  it('should have correct name', () => {
    expect(configCommand.name()).toBe('config');
  });

  it('should expose set, get and list subcommands', () => {
    const subcommands = configCommand.commands.map((cmd) => cmd.name());
    expect(subcommands).toEqual(expect.arrayContaining(['set', 'get', 'list']));
  });

  it('should read config correctly from disk', () => {
    stubDisk({ network: 'mainnet' });

    const config = readConfig();
    expect(config.network).toBe('mainnet');
  });

  it('should return empty object if config file does not exist', () => {
    vi.mocked(fs.existsSync).mockReturnValue(false);

    const config = readConfig();
    expect(config).toEqual({});
  });
});

describe('readConfig resilience', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns an empty object when the file is not valid JSON', () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readFileSync).mockReturnValue('{ this is not json');

    expect(readConfig()).toEqual({});
  });
});

describe('writeConfig', () => {
  beforeEach(() => vi.clearAllMocks());

  it('writes the config as pretty JSON to the user config path', () => {
    writeConfig({ network: 'testnet' });

    expect(fs.writeFileSync).toHaveBeenCalledWith(
      CONFIG_PATH,
      JSON.stringify({ network: 'testnet' }, null, 2)
    );
  });
});

describe('config set / get / list actions', () => {
  let log: ReturnType<typeof vi.spyOn>;
  let out: string[];

  beforeEach(() => {
    vi.clearAllMocks();
    out = [];
    log = vi.spyOn(console, 'log').mockImplementation((...args: unknown[]) => {
      out.push(args.map(String).join(' '));
    });
  });

  afterEach(() => {
    log.mockRestore();
  });

  it('stores a new value and confirms the assignment', async () => {
    stubDisk({});

    await configCommand.parseAsync(['set', 'network', 'mainnet'], { from: 'user' });

    expect(fs.writeFileSync).toHaveBeenCalledWith(
      CONFIG_PATH,
      JSON.stringify({ network: 'mainnet' }, null, 2)
    );
    expect(out).toContain('Set network = mainnet');
  });

  it('keeps unrelated keys already on disk', async () => {
    stubDisk({ theme: 'dark' });

    await configCommand.parseAsync(['set', 'network', 'testnet'], { from: 'user' });

    expect(fs.writeFileSync).toHaveBeenCalledWith(
      CONFIG_PATH,
      JSON.stringify({ theme: 'dark', network: 'testnet' }, null, 2)
    );
  });

  it('prints the stored value for a key that exists', async () => {
    stubDisk({ network: 'public' });

    await configCommand.parseAsync(['get', 'network'], { from: 'user' });

    expect(out).toEqual(['public']);
  });

  it('says so when the requested key is not set', async () => {
    stubDisk({ network: 'public' });

    await configCommand.parseAsync(['get', 'theme'], { from: 'user' });

    expect(out).toEqual(["Key 'theme' not set."]);
  });

  it('reports an empty config without listing anything', async () => {
    stubDisk({});

    await configCommand.parseAsync(['list'], { from: 'user' });

    expect(out).toEqual(['No configuration values set.']);
  });

  it('lists every stored key and value', async () => {
    stubDisk({ network: 'testnet', theme: 'dark' });

    await configCommand.parseAsync(['list'], { from: 'user' });

    expect(out).toEqual(['network = testnet', 'theme = dark']);
  });
});
