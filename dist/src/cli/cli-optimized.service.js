"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OptimizedCliService = void 0;
const common_1 = require("@nestjs/common");
const commander_1 = require("commander");
const lazy_loader_1 = require("./core/lazy-loader");
const command_registry_1 = require("./core/command-registry");
const logger_service_1 = require("../common/logger/logger.service");
const lazy_command_decorator_1 = require("./decorators/lazy-command.decorator");
const logger_decorator_1 = require("../common/decorators/logger.decorator");
const chalk = require('chalk');
let OptimizedCliService = class OptimizedCliService {
    program;
    loader;
    registry;
    logger = new logger_service_1.LoggerService('CliService');
    constructor() {
        this.program = new commander_1.Command();
        this.loader = lazy_loader_1.LazyLoader.getInstance();
        this.registry = command_registry_1.CommandRegistry.getInstance();
        this.initializeCommands();
    }
    initializeCommands() {
        const startTime = Date.now();
        this.program
            .name('creatoria')
            .description('Creatoria SaaS CLI')
            .version('1.0.0')
            .option('--verbose', 'Enable verbose output')
            .option('--no-color', 'Disable colored output')
            .option('--profile', 'Show performance profiling');
        this.registerModuleCommands();
        this.registerDatabaseCommands();
        this.registerConfigCommands();
        this.registerProjectCommands();
        const initTime = Date.now() - startTime;
        this.logger.debug(`Command structure initialized in ${initTime}ms`);
    }
    registerModuleCommands() {
        const module = this.program.command('module');
        this.registry.register('module-add', 'Add a module to the project', '../commands/module-add.command', 'ModuleAddCommand');
        module
            .command('add <name>')
            .description('Add a module to the project')
            .option('--skip-deps', 'Skip dependency check')
            .action(async (name, options) => {
            await this.executeCommand('module-add', [name], options);
        });
        module
            .command('install [source]')
            .description('Install modules from remote repository')
            .action(async (source) => {
            await this.executeCommand('module-install', [source]);
        });
        module
            .command('list')
            .description('List all installed modules')
            .action(async () => {
            await this.executeCommand('module-list');
        });
        module
            .command('enable <name>')
            .description('Enable a module')
            .action(async (name) => {
            await this.executeCommand('module-enable', [name]);
        });
        module
            .command('disable <name>')
            .description('Disable a module')
            .action(async (name) => {
            await this.executeCommand('module-disable', [name]);
        });
        module
            .command('info <name>')
            .description('Show module information')
            .action(async (name) => {
            await this.executeCommand('module-info', [name]);
        });
    }
    registerDatabaseCommands() {
        const db = this.program.command('db');
        db
            .command('migrate')
            .description('Run database migrations')
            .option('--module <module>', 'Run migrations for specific module')
            .action(async (options) => {
            await this.executeCommand('db-migrate', [], options);
        });
        db
            .command('seed')
            .description('Run database seeds')
            .option('--module <module>', 'Run seeds for specific module')
            .action(async (options) => {
            await this.executeCommand('db-seed', [], options);
        });
        db
            .command('reset')
            .description('Reset database')
            .action(async () => {
            await this.executeCommand('db-reset');
        });
    }
    registerConfigCommands() {
        const config = this.program.command('config');
        config
            .command('show')
            .description('Show current configuration')
            .action(async () => {
            await this.executeCommand('config-show');
        });
        config
            .command('set <key> <value>')
            .description('Set a configuration value')
            .action(async (key, value) => {
            await this.executeCommand('config-set', [key, value]);
        });
    }
    registerProjectCommands() {
        this.program
            .command('create <name>')
            .description('Create a new project from the Creatoria template')
            .option('--skip-install', 'Skip running npm install')
            .option('--db-host <host>', 'Database host')
            .option('--db-port <port>', 'Database port')
            .option('--db-database <name>', 'Database name')
            .option('--db-username <username>', 'Database username')
            .option('--db-password <password>', 'Database password')
            .action(async (name, options) => {
            await this.executeCommand('create', [name], options);
        });
        this.registry.register('init', 'Initialize the project', '../commands/init.command', 'InitCommand');
        this.program
            .command('init')
            .description('Initialize the project and run module initialization scripts')
            .option('--skip-db', 'Skip database migrations')
            .option('--skip-seed', 'Skip seed data')
            .option('--modules <modules>', 'Only initialize specific modules (comma-separated)')
            .action(async (options) => {
            await this.executeCommand('init', [], options);
        });
        this.program
            .command('start')
            .description('Start the application')
            .option('-p, --port <port>', 'Port to listen on')
            .option('-e, --env <env>', 'Environment (development, production)')
            .action(async (options) => {
            await this.executeCommand('start', [], options);
        });
        this.program
            .command('dev')
            .description('Start the application in development mode')
            .option('--watch-modules', 'Watch for module changes')
            .action(async (options) => {
            await this.executeCommand('dev', [], options);
        });
    }
    async executeCommand(commandName, args = [], options = {}) {
        const startTime = Date.now();
        try {
            const command = await this.loader.loadCommand(commandName);
            if (!command || typeof command.run !== 'function') {
                throw new Error(`Command '${commandName}' does not have a run method`);
            }
            const loadTime = Date.now() - startTime;
            this.logger.debug(`Command '${commandName}' loaded in ${loadTime}ms`);
            const execStartTime = Date.now();
            await command.run(args, options);
            const execTime = Date.now() - execStartTime;
            this.logger.debug(`Command '${commandName}' executed in ${execTime}ms`);
            if (this.program.opts().profile) {
                this.showPerformanceInfo(commandName, loadTime, execTime);
            }
        }
        catch (error) {
            this.logger.error(`Failed to execute command '${commandName}'`, error);
            throw error;
        }
    }
    async run() {
        const startTime = Date.now();
        if (process.env.PRELOAD_COMMANDS === 'true') {
            const preloadList = (0, lazy_command_decorator_1.getPreloadList)();
            if (preloadList.length > 0) {
                await this.loader.preloadCommands(preloadList);
            }
        }
        await this.program.parseAsync(process.argv);
        const totalTime = Date.now() - startTime;
        if (this.program.opts().profile) {
            this.showOverallPerformance(totalTime);
        }
    }
    showPerformanceInfo(commandName, loadTime, execTime) {
        console.log(chalk.gray('\n📊 Performance Profile:'));
        console.log(chalk.gray(`   Command: ${commandName}`));
        console.log(chalk.gray(`   Load time: ${loadTime}ms`));
        console.log(chalk.gray(`   Execution time: ${execTime}ms`));
        console.log(chalk.gray(`   Total time: ${loadTime + execTime}ms`));
    }
    showOverallPerformance(totalTime) {
        const stats = this.registry.getStats();
        const cacheStats = this.loader.getCacheStats();
        console.log(chalk.gray('\n📊 Overall Performance:'));
        console.log(chalk.gray(`   Total execution time: ${totalTime}ms`));
        console.log(chalk.gray(`   Commands registered: ${stats.total}`));
        console.log(chalk.gray(`   Commands loaded: ${stats.loaded}`));
        console.log(chalk.gray(`   Average load time: ${stats.averageLoadTime.toFixed(2)}ms`));
        console.log(chalk.gray(`   Commands cached: ${cacheStats.size}`));
        if (stats.loaded > 0) {
            console.log(chalk.gray(`   Loaded commands: ${cacheStats.commands.join(', ')}`));
        }
    }
};
exports.OptimizedCliService = OptimizedCliService;
__decorate([
    (0, logger_decorator_1.Performance)(50),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Array, Object]),
    __metadata("design:returntype", Promise)
], OptimizedCliService.prototype, "executeCommand", null);
exports.OptimizedCliService = OptimizedCliService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], OptimizedCliService);
//# sourceMappingURL=cli-optimized.service.js.map