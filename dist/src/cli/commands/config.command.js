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
exports.ConfigCommand = void 0;
const common_1 = require("@nestjs/common");
const chalk = __importStar(require("chalk"));
const fs = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
const config_service_1 = require("../../config/config.service");
let ConfigCommand = class ConfigCommand {
    configService;
    constructor(configService) {
        this.configService = configService;
    }
    async show() {
        console.log(chalk.blue('\nCurrent Configuration:\n'));
        console.log(chalk.gray('─'.repeat(60)));
        console.log(chalk.cyan('Application:'));
        console.log(`  Name:     ${this.configService.app.name}`);
        console.log(`  Version:  ${this.configService.app.version}`);
        console.log(`  Port:     ${this.configService.app.port}`);
        console.log(`  Prefix:   ${this.configService.app.prefix}`);
        console.log(chalk.cyan('\nModules:'));
        console.log(`  Source:   ${this.configService.modules.source}`);
        console.log(`  Version:  ${this.configService.modules.version}`);
        console.log(`  Enabled:  ${this.configService.modules.enabled.join(', ')}`);
        console.log(chalk.cyan('\nDatabase:'));
        console.log(`  Type:     ${this.configService.database.type}`);
        console.log(`  Host:     ${this.configService.database.host}`);
        console.log(`  Port:     ${this.configService.database.port}`);
        console.log(`  Database: ${this.configService.database.database}`);
        console.log(chalk.cyan('\nRedis:'));
        console.log(`  Host:     ${this.configService.redis.host}`);
        console.log(`  Port:     ${this.configService.redis.port}`);
        console.log(chalk.cyan('\nRabbitMQ:'));
        console.log(`  URL:      ${this.configService.rabbitmq.url}`);
        console.log(chalk.cyan('\nJWT:'));
        console.log(`  Expires:  ${this.configService.jwt.expiresIn}`);
        console.log(chalk.cyan('\nSwagger:'));
        console.log(`  Enabled:  ${this.configService.swagger.enabled}`);
        console.log(`  Path:     ${this.configService.swagger.path}`);
        console.log(chalk.gray('─'.repeat(60)));
    }
    async set(key, value) {
        try {
            const envPath = path.join(process.cwd(), '.env');
            let envContent = '';
            if (await fs.pathExists(envPath)) {
                envContent = await fs.readFile(envPath, 'utf-8');
            }
            const lines = envContent.split('\n');
            const envKey = key.toUpperCase().replace(/\./g, '_');
            let found = false;
            for (let i = 0; i < lines.length; i++) {
                if (lines[i].startsWith(`${envKey}=`)) {
                    lines[i] = `${envKey}=${value}`;
                    found = true;
                    break;
                }
            }
            if (!found) {
                lines.push(`${envKey}=${value}`);
            }
            await fs.writeFile(envPath, lines.join('\n'));
            console.log(chalk.green(`✓ Configuration updated: ${key} = ${value}`));
            console.log(chalk.yellow('Please restart the application for changes to take effect'));
        }
        catch (error) {
            console.error(chalk.red('✗ Failed to update configuration:'), error.message);
            process.exit(1);
        }
    }
    async runShow(args, options) {
        await this.show();
    }
    async runGet(args, options) {
        const key = args[0];
        if (!key) {
            throw new Error('Configuration key is required');
        }
        const configPath = path.join(process.cwd(), '.creatoria', 'config.json');
        const config = await fs.readJSON(configPath);
        const keys = key.split('.');
        let value = config;
        for (const k of keys) {
            value = value[k];
            if (value === undefined) {
                throw new Error(`Configuration key ${key} not found`);
            }
        }
        console.log(`${key}: ${value}`);
    }
    async runSet(args, options) {
        const key = args[0];
        const value = options.value;
        if (!key) {
            throw new Error('Configuration key is required');
        }
        if (value === undefined) {
            throw new Error('Configuration value is required');
        }
        const configPath = path.join(process.cwd(), '.creatoria', 'config.json');
        const config = await fs.readJSON(configPath);
        const keys = key.split('.');
        let target = config;
        for (let i = 0; i < keys.length - 1; i++) {
            if (!target[keys[i]]) {
                target[keys[i]] = {};
            }
            target = target[keys[i]];
        }
        const lastKey = keys[keys.length - 1];
        if (!isNaN(Number(value))) {
            target[lastKey] = Number(value);
        }
        else if (value === 'true' || value === 'false') {
            target[lastKey] = value === 'true';
        }
        else {
            target[lastKey] = value;
        }
        await fs.writeJSON(configPath, config, { spaces: 2 });
        console.log(chalk.green(`✓ Configuration updated: ${key} = ${value}`));
    }
    async runValidate(args, options) {
        const configPath = path.join(process.cwd(), '.creatoria', 'config.json');
        if (!await fs.pathExists(configPath)) {
            throw new Error('Configuration file not found');
        }
        const config = await fs.readJSON(configPath);
        if (!config.version) {
            throw new Error('Invalid configuration: missing version field');
        }
        if (!config.app && !config.modules) {
            throw new Error('Invalid configuration: validation failed');
        }
        console.log(chalk.green('✓ Configuration is valid'));
    }
};
exports.ConfigCommand = ConfigCommand;
exports.ConfigCommand = ConfigCommand = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_service_1.ConfigService])
], ConfigCommand);
//# sourceMappingURL=config.command.js.map