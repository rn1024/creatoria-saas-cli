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
var ModuleCommand_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModuleCommand = void 0;
const common_1 = require("@nestjs/common");
const chalk = require('chalk');
const fs = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
const config_service_1 = require("../../config/config.service");
let ModuleCommand = ModuleCommand_1 = class ModuleCommand {
    configService;
    logger = new common_1.Logger(ModuleCommand_1.name);
    constructor(configService) {
        this.configService = configService;
    }
    async install(source) {
        console.log(chalk.yellow('Module install command is deprecated. Use "module add <name>" instead.'));
    }
    async list() {
        try {
            const configPath = path.resolve(process.cwd(), 'creatoria.config.json');
            if (!fs.existsSync(configPath)) {
                console.log(chalk.yellow('Not in a Creatoria SaaS project directory.'));
                return;
            }
            const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
            const modules = config.modules || [];
            if (modules.length === 0) {
                console.log(chalk.yellow('No modules installed'));
                return;
            }
            console.log(chalk.blue('\nInstalled Modules:\n'));
            console.log(chalk.gray('─'.repeat(60)));
            for (const moduleName of modules) {
                console.log(`${chalk.green('●')} ${chalk.white(moduleName)}`);
            }
            console.log(chalk.gray('─'.repeat(60)));
            console.log(chalk.gray(`\nTotal: ${modules.length} modules`));
        }
        catch (error) {
            console.error(chalk.red('Failed to list modules:'), error.message);
        }
    }
    async enable(name) {
        console.log(chalk.yellow('Module enable/disable is not supported with static modules.'));
    }
    async disable(name) {
        console.log(chalk.yellow('Module enable/disable is not supported with static modules.'));
    }
    async info(name) {
        try {
            const modulePath = path.resolve(process.cwd(), 'src/modules', name);
            if (!fs.existsSync(modulePath)) {
                console.log(chalk.red(`Module ${name} not found`));
                return;
            }
            console.log(chalk.blue(`\nModule Information: ${name}\n`));
            console.log(chalk.gray('─'.repeat(60)));
            console.log(`${chalk.cyan('Name:')}         ${name}`);
            console.log(`${chalk.cyan('Path:')}         ${modulePath}`);
            console.log(chalk.gray('─'.repeat(60)));
        }
        catch (error) {
            console.error(chalk.red('Failed to get module info:'), error.message);
        }
    }
    async runAdd(args, options) {
        const moduleName = args[0];
        const source = options.source;
        const skipInstall = options.skipInstall;
        if (!moduleName) {
            throw new Error('Module name is required');
        }
        if (!source || !await fs.pathExists(source)) {
            throw new Error('Valid source path is required');
        }
        const modulePath = path.join(process.cwd(), 'modules', moduleName);
        if (await fs.pathExists(modulePath) && !options.force) {
            throw new Error(`Module ${moduleName} already exists`);
        }
        await fs.copy(source, modulePath);
        const configPath = path.join(process.cwd(), '.creatoria', 'config.json');
        const config = await fs.readJSON(configPath);
        if (!config.modules.includes(moduleName)) {
            config.modules.push(moduleName);
            await fs.writeJSON(configPath, config, { spaces: 2 });
        }
        if (!skipInstall) {
            console.log('Installing module dependencies...');
        }
    }
    async runList(args, options) {
        await this.list();
    }
    async runRemove(args, options) {
        const moduleName = args[0];
        if (!moduleName) {
            throw new Error('Module name is required');
        }
        const modulePath = path.join(process.cwd(), 'modules', moduleName);
        if (!await fs.pathExists(modulePath)) {
            throw new Error(`Module ${moduleName} does not exist`);
        }
        if (!options.force) {
            console.log('Use --force to confirm removal');
            return;
        }
        await fs.remove(modulePath);
        const configPath = path.join(process.cwd(), '.creatoria', 'config.json');
        const config = await fs.readJSON(configPath);
        config.modules = config.modules.filter((m) => m !== moduleName);
        await fs.writeJSON(configPath, config, { spaces: 2 });
    }
};
exports.ModuleCommand = ModuleCommand;
exports.ModuleCommand = ModuleCommand = ModuleCommand_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_service_1.ConfigService])
], ModuleCommand);
//# sourceMappingURL=module.command.js.map