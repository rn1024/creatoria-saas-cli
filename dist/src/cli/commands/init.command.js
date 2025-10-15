"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.InitCommand = void 0;
const common_1 = require("@nestjs/common");
const fs = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
const child_process_1 = require("child_process");
const chalk = require('chalk');
let InitCommand = class InitCommand {
    async run(args, options) {
        const skipDb = options.skipDb || false;
        const skipSeed = options.skipSeed || false;
        const specificModules = options.modules ? options.modules.split(',') : null;
        console.log(chalk.blue('🚀 Initializing Creatoria SaaS project...'));
        try {
            const configPath = path.resolve(process.cwd(), 'creatoria.config.json');
            if (!fs.existsSync(configPath)) {
                throw new Error('Not in a Creatoria SaaS project directory. Please run this command from your project root.');
            }
            const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
            if (config.database && config.database.initialized) {
                const answer = await this.promptUser('Project already initialized. Reinitialize? (y/N): ');
                if (answer.toLowerCase() !== 'y') {
                    console.log(chalk.yellow('Initialization cancelled.'));
                    return;
                }
            }
            const installedModules = config.modules || [];
            if (installedModules.length === 0) {
                console.log(chalk.yellow('No modules installed. Nothing to initialize.'));
                return;
            }
            const modulesToInit = specificModules
                ? installedModules.filter((m) => specificModules.includes(m))
                : installedModules;
            console.log(chalk.gray(`Found ${modulesToInit.length} module(s) to initialize: ${modulesToInit.join(', ')}`));
            const moduleInitInfos = [];
            for (const moduleName of modulesToInit) {
                const modulePath = path.resolve(process.cwd(), 'src/modules', moduleName);
                const moduleJsonPath = path.join(modulePath, 'module.json');
                if (fs.existsSync(moduleJsonPath)) {
                    const moduleJson = JSON.parse(fs.readFileSync(moduleJsonPath, 'utf8'));
                    if (moduleJson.init) {
                        const initScriptPath = path.join(modulePath, moduleJson.init.script || 'init.js');
                        if (fs.existsSync(initScriptPath)) {
                            moduleInitInfos.push({
                                name: moduleName,
                                priority: moduleJson.init.priority || 100,
                                script: initScriptPath,
                                path: modulePath
                            });
                        }
                        else {
                            console.log(chalk.yellow(`⚠️  Init script not found for ${moduleName}: ${initScriptPath}`));
                        }
                    }
                }
            }
            moduleInitInfos.sort((a, b) => a.priority - b.priority);
            console.log(chalk.blue('\n📋 Initialization order:'));
            moduleInitInfos.forEach((info, index) => {
                console.log(chalk.gray(`  ${index + 1}. ${info.name} (priority: ${info.priority})`));
            });
            console.log(chalk.blue('\n🔧 Running initialization scripts...'));
            for (const moduleInfo of moduleInitInfos) {
                console.log(chalk.cyan(`\n▶ Initializing ${moduleInfo.name}...`));
                try {
                    if (!skipDb) {
                        await this.runMigrations(moduleInfo);
                    }
                    if (!skipSeed) {
                        await this.runSeeds(moduleInfo);
                    }
                    await this.runInitScript(moduleInfo);
                    console.log(chalk.green(`✅ ${moduleInfo.name} initialized successfully`));
                }
                catch (error) {
                    console.error(chalk.red(`❌ Failed to initialize ${moduleInfo.name}:`), error.message);
                    const answer = await this.promptUser('Continue with other modules? (Y/n): ');
                    if (answer.toLowerCase() === 'n') {
                        throw new Error('Initialization aborted by user');
                    }
                }
            }
            config.database = config.database || {};
            config.database.initialized = true;
            config.database.initializedAt = new Date().toISOString();
            fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
            console.log(chalk.green('\n✨ Initialization complete!'));
            console.log(chalk.gray('Your project is ready to use.'));
        }
        catch (error) {
            console.error(chalk.red('Initialization failed:'), error.message);
            process.exit(1);
        }
    }
    async runMigrations(moduleInfo) {
        const migrationsPath = path.join(moduleInfo.path, 'migrations');
        if (!fs.existsSync(migrationsPath)) {
            console.log(chalk.gray(`  No migrations found for ${moduleInfo.name}`));
            return;
        }
        const migrationFiles = fs.readdirSync(migrationsPath)
            .filter(f => f.endsWith('.sql'))
            .sort();
        if (migrationFiles.length === 0) {
            console.log(chalk.gray(`  No migration files found for ${moduleInfo.name}`));
            return;
        }
        console.log(chalk.gray(`  Running ${migrationFiles.length} migration(s)...`));
        for (const file of migrationFiles) {
            const filePath = path.join(migrationsPath, file);
            console.log(chalk.gray(`    - ${file}`));
            console.log(chalk.yellow(`    ⚠️  Migration execution not implemented yet`));
        }
    }
    async runSeeds(moduleInfo) {
        const seedsPath = path.join(moduleInfo.path, 'seeds');
        if (!fs.existsSync(seedsPath)) {
            console.log(chalk.gray(`  No seeds found for ${moduleInfo.name}`));
            return;
        }
        const seedFiles = fs.readdirSync(seedsPath)
            .filter(f => f.endsWith('.sql') || f.endsWith('.js'))
            .sort();
        if (seedFiles.length === 0) {
            console.log(chalk.gray(`  No seed files found for ${moduleInfo.name}`));
            return;
        }
        console.log(chalk.gray(`  Running ${seedFiles.length} seed file(s)...`));
        for (const file of seedFiles) {
            const filePath = path.join(seedsPath, file);
            console.log(chalk.gray(`    - ${file}`));
            if (file.endsWith('.js')) {
                try {
                    const seedModule = require(filePath);
                    if (typeof seedModule.run === 'function') {
                        await seedModule.run();
                        console.log(chalk.green(`    ✓ ${file} executed`));
                    }
                    else {
                        console.log(chalk.yellow(`    ⚠️  ${file} does not export a run function`));
                    }
                }
                catch (error) {
                    console.error(chalk.red(`    ✗ ${file} failed:`), error.message);
                }
            }
            else {
                console.log(chalk.yellow(`    ⚠️  SQL seed execution not implemented yet`));
            }
        }
    }
    async runInitScript(moduleInfo) {
        if (!fs.existsSync(moduleInfo.script)) {
            console.log(chalk.gray(`  No init script found at ${moduleInfo.script}`));
            return;
        }
        console.log(chalk.gray(`  Running init script...`));
        return new Promise((resolve, reject) => {
            const child = (0, child_process_1.spawn)('node', [moduleInfo.script], {
                cwd: moduleInfo.path,
                stdio: 'inherit'
            });
            child.on('close', (code) => {
                if (code === 0) {
                    resolve();
                }
                else {
                    reject(new Error(`Init script exited with code ${code}`));
                }
            });
            child.on('error', (error) => {
                reject(error);
            });
        });
    }
    promptUser(question) {
        return new Promise((resolve) => {
            process.stdout.write(chalk.cyan(question));
            process.stdin.once('data', (data) => {
                resolve(data.toString().trim());
            });
        });
    }
};
exports.InitCommand = InitCommand;
exports.InitCommand = InitCommand = __decorate([
    (0, common_1.Injectable)()
], InitCommand);
//# sourceMappingURL=init.command.js.map