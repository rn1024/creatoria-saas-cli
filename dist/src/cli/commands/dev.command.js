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
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DevCommand = void 0;
const common_1 = require("@nestjs/common");
const nest_commander_1 = require("nest-commander");
const chalk = __importStar(require("chalk"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs-extra"));
const child_process_1 = require("child_process");
const hot_reload_service_1 = require("../services/hot-reload.service");
const dynamic_module_loader_service_1 = require("../services/dynamic-module-loader.service");
let DevCommand = class DevCommand extends nest_commander_1.CommandRunner {
    hotReloadService;
    moduleLoader;
    constructor(hotReloadService, moduleLoader) {
        super();
        this.hotReloadService = hotReloadService;
        this.moduleLoader = moduleLoader;
    }
    async run(passedParams, options) {
        try {
            const projectRoot = process.cwd();
            const packageJsonPath = path.join(projectRoot, 'package.json');
            if (!await fs.pathExists(packageJsonPath)) {
                console.log(chalk.red('❌ Not in a Creatoria SaaS project directory'));
                return;
            }
            console.log(chalk.blue('\n🚀 Starting development server...\n'));
            const port = options.port || process.env.PORT || '3000';
            const env = {
                ...process.env,
                NODE_ENV: 'development',
                PORT: port,
            };
            if (options.debug) {
                env.DEBUG = '*';
            }
            const packageJson = await fs.readJSON(packageJsonPath);
            const devScript = packageJson.scripts?.['start:dev'] || 'nest start --watch';
            const devProcess = (0, child_process_1.spawn)('npm', ['run', 'start:dev'], {
                env,
                stdio: 'inherit',
                shell: true,
            });
            if (options.hotReload) {
                console.log(chalk.cyan('\n🔥 Hot reload enabled\n'));
                await new Promise(resolve => setTimeout(resolve, 3000));
                await this.hotReloadService.enableProjectHotReload();
                await this.registerReloadCallbacks();
            }
            process.on('SIGINT', async () => {
                console.log(chalk.yellow('\n\n👋 Shutting down development server...'));
                if (options.hotReload) {
                    await this.hotReloadService.stopAll();
                }
                devProcess.kill('SIGTERM');
                process.exit(0);
            });
            devProcess.on('error', (error) => {
                console.error(chalk.red('❌ Failed to start development server:'), error);
                process.exit(1);
            });
            devProcess.on('exit', (code) => {
                if (code !== 0 && code !== null) {
                    console.error(chalk.red(`❌ Development server exited with code ${code}`));
                    process.exit(code);
                }
            });
        }
        catch (error) {
            console.error(chalk.red('❌ Error:'), error.message);
            process.exit(1);
        }
    }
    async registerReloadCallbacks() {
        const projectRoot = process.cwd();
        const modulesPath = path.join(projectRoot, 'src', 'modules');
        if (!await fs.pathExists(modulesPath)) {
            return;
        }
        const modules = await fs.readdir(modulesPath);
        for (const moduleName of modules) {
            const modulePath = path.join(modulesPath, moduleName);
            const stats = await fs.stat(modulePath);
            if (stats.isDirectory()) {
                this.hotReloadService.registerReloadCallback(moduleName, async () => {
                    console.log(chalk.cyan(`📦 Reloading module: ${moduleName}`));
                    const success = await this.moduleLoader.reloadModule(moduleName);
                    if (success) {
                        console.log(chalk.green(`✅ Module reloaded: ${moduleName}`));
                        this.triggerAppReload();
                    }
                    else {
                        console.log(chalk.red(`❌ Failed to reload module: ${moduleName}`));
                    }
                });
            }
        }
    }
    triggerAppReload() {
        process.emit('app:reload');
        const mainPath = path.join(process.cwd(), 'src', 'main.ts');
        if (fs.existsSync(mainPath)) {
            const currentTime = new Date();
            fs.utimesSync(mainPath, currentTime, currentTime);
        }
    }
    parsePort(val) {
        return val;
    }
    parseWatch() {
        return true;
    }
    parseHotReload() {
        return true;
    }
    parseDebug() {
        return true;
    }
};
exports.DevCommand = DevCommand;
__decorate([
    (0, nest_commander_1.Option)({
        flags: '-p, --port <port>',
        description: 'Port to run the server on',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", String)
], DevCommand.prototype, "parsePort", null);
__decorate([
    (0, nest_commander_1.Option)({
        flags: '-w, --watch',
        description: 'Enable file watching',
        defaultValue: true,
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Boolean)
], DevCommand.prototype, "parseWatch", null);
__decorate([
    (0, nest_commander_1.Option)({
        flags: '-hr, --hot-reload',
        description: 'Enable hot module reload',
        defaultValue: false,
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Boolean)
], DevCommand.prototype, "parseHotReload", null);
__decorate([
    (0, nest_commander_1.Option)({
        flags: '-d, --debug',
        description: 'Enable debug mode',
        defaultValue: false,
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Boolean)
], DevCommand.prototype, "parseDebug", null);
exports.DevCommand = DevCommand = __decorate([
    (0, nest_commander_1.Command)({
        name: 'dev',
        description: 'Start development server with hot reload',
    }),
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [hot_reload_service_1.HotReloadService,
        dynamic_module_loader_service_1.DynamicModuleLoaderService])
], DevCommand);
//# sourceMappingURL=dev.command.js.map