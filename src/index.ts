#!/usr/bin/env node

import { Command } from 'commander';
import { createAccountCommand } from './commands/account.js';
import { decodeXdrCommand } from './commands/xdr.js';

const program = new Command();

program
  .name('loom')
  .description('Astral Loom CLI - Command-line tools for Stellar developers')
  .version('1.0.0');

program.addCommand(createAccountCommand);
program.addCommand(decodeXdrCommand);

program.parse(process.argv);
