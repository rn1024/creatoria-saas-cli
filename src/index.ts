#!/usr/bin/env node

import { Command } from 'commander';
import { createCommand } from './commands/create';
import { moduleCommand } from './commands/module';
import { dbCommand } from './commands/db';
import { configCommand } from './commands/config';

const program = new Command();

program
  .name('cra')
  .description('Creatoria CLI - A lightweight CLI for scaffolding SaaS applications')
  .version('0.2.0');

// Register commands
program.addCommand(createCommand);
program.addCommand(moduleCommand);
program.addCommand(dbCommand);
program.addCommand(configCommand);

// Parse arguments
program.parse(process.argv);

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
