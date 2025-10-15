"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.COMMAND_DEFINITIONS = void 0;
exports.registerAllCommands = registerAllCommands;
exports.getPreloadCommands = getPreloadCommands;
const command_registry_1 = require("./command-registry");
exports.COMMAND_DEFINITIONS = [
    {
        name: 'module-add',
        description: 'Add a module to the project',
        modulePath: '../commands/module-add.command',
        className: 'ModuleAddCommand',
        preload: false,
        priority: 20,
    },
    {
        name: 'module-install',
        description: 'Install modules from remote repository',
        modulePath: '../commands/module.command',
        className: 'ModuleCommand',
    },
    {
        name: 'module-list',
        description: 'List all installed modules',
        modulePath: '../commands/module.command',
        className: 'ModuleCommand',
    },
    {
        name: 'module-enable',
        description: 'Enable a module',
        modulePath: '../commands/module.command',
        className: 'ModuleCommand',
    },
    {
        name: 'module-disable',
        description: 'Disable a module',
        modulePath: '../commands/module.command',
        className: 'ModuleCommand',
    },
    {
        name: 'module-info',
        description: 'Show module information',
        modulePath: '../commands/module.command',
        className: 'ModuleCommand',
    },
    {
        name: 'db-migrate',
        description: 'Run database migrations',
        modulePath: '../commands/database.command',
        className: 'DatabaseCommand',
    },
    {
        name: 'db-seed',
        description: 'Run database seeds',
        modulePath: '../commands/database.command',
        className: 'DatabaseCommand',
    },
    {
        name: 'db-reset',
        description: 'Reset database',
        modulePath: '../commands/database.command',
        className: 'DatabaseCommand',
    },
    {
        name: 'config-show',
        description: 'Show current configuration',
        modulePath: '../commands/config.command',
        className: 'ConfigCommand',
    },
    {
        name: 'config-set',
        description: 'Set a configuration value',
        modulePath: '../commands/config.command',
        className: 'ConfigCommand',
    },
    {
        name: 'create',
        description: 'Create a new project',
        modulePath: '../commands/create.command',
        className: 'CreateCommand',
        preload: true,
        priority: 1,
    },
    {
        name: 'init',
        description: 'Initialize the project',
        modulePath: '../commands/init.command',
        className: 'InitCommand',
        preload: true,
        priority: 2,
    },
];
function registerAllCommands() {
    const registry = command_registry_1.CommandRegistry.getInstance();
    exports.COMMAND_DEFINITIONS.forEach(def => {
        registry.register(def.name, def.description, def.modulePath, def.className);
    });
}
function getPreloadCommands() {
    return exports.COMMAND_DEFINITIONS
        .filter(def => def.preload)
        .sort((a, b) => (a.priority || 100) - (b.priority || 100))
        .map(def => def.name);
}
//# sourceMappingURL=command-definitions.js.map