import { Command } from 'commander';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';

const CONFIG_PATH = join(homedir(), '.loomrc.json');

function readConfig(): Record<string, string> {
  if (!existsSync(CONFIG_PATH)) return {};
  try {
    return JSON.parse(readFileSync(CONFIG_PATH, 'utf-8'));
  } catch {
    return {};
  }
}

function writeConfig(config: Record<string, string>): void {
  writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
}

export const configCommand = new Command('config')
  .description('Manage loom CLI configuration');

configCommand
  .command('set <key> <value>')
  .description('Set a configuration value (e.g., config set network testnet)')
  .action((key: string, value: string) => {
    const config = readConfig();
    config[key] = value;
    writeConfig(config);
    console.log(`Set ${key} = ${value}`);
  });

configCommand
  .command('get <key>')
  .description('Get a configuration value')
  .action((key: string) => {
    const config = readConfig();
    if (key in config) {
      console.log(config[key]);
    } else {
      console.log(`Key '${key}' not set.`);
    }
  });

configCommand
  .command('list')
  .description('List all configuration values')
  .action(() => {
    const config = readConfig();
    if (Object.keys(config).length === 0) {
      console.log('No configuration values set.');
    } else {
      for (const [k, v] of Object.entries(config)) {
        console.log(`${k} = ${v}`);
      }
    }
  });
