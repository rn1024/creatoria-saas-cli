#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const create_1 = require("./commands/create");
const module_1 = require("./commands/module");
const db_1 = require("./commands/db");
const config_1 = require("./commands/config");
const program = new commander_1.Command();
program
    .name('cra')
    .description('Creatoria CLI - A lightweight CLI for scaffolding SaaS applications')
    .version('0.2.0');
// Register commands
program.addCommand(create_1.createCommand);
program.addCommand(module_1.moduleCommand);
program.addCommand(db_1.dbCommand);
program.addCommand(config_1.configCommand);
// Parse arguments
program.parse(process.argv);
// Show help if no command provided
if (!process.argv.slice(2).length) {
    program.outputHelp();
}
//# sourceMappingURL=index.js.map