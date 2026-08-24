#!/usr/bin/env node

import { Command } from 'commander';
import { accountCommand } from './commands/account.js';
import { xdrCommand } from './commands/xdr.js';
import { balanceCommand } from './commands/balance.js';

const program = new Command();

program
  .name('loom')
  .description('Astral Loom CLI - Command-line tools for Stellar developers')
  .version('1.0.0');

program.addCommand(accountCommand);
program.addCommand(xdrCommand);
program.addCommand(balanceCommand);

program.parse(process.argv);
