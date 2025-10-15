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
exports.configCommand = void 0;
const commander_1 = require("commander");
const path = __importStar(require("path"));
const fs = __importStar(require("fs-extra"));
const chalk = __importStar(require("chalk"));
exports.configCommand = new commander_1.Command('config')
    .description('Manage project configuration');
exports.configCommand
    .command('show')
    .description('Show current configuration')
    .action(showConfig);
async function showConfig() {
    try {
        const packageJsonPath = path.join(process.cwd(), 'package.json');
        if (!fs.existsSync(packageJsonPath)) {
            console.error(chalk.red('Not in a Creatoria project directory'));
            process.exit(1);
        }
        const packageJson = fs.readJsonSync(packageJsonPath);
        const envPath = path.join(process.cwd(), '.env');
        console.log(chalk.cyan('\n=== Project Configuration ===\n'));
        console.log(chalk.blue('Project Name:'), packageJson.name);
        console.log(chalk.blue('Version:'), packageJson.version);
        console.log(chalk.blue('Description:'), packageJson.description || 'N/A');
        if (fs.existsSync(envPath)) {
            const envContent = fs.readFileSync(envPath, 'utf-8');
            const envVars = envContent.split('\n').filter(line => line && !line.startsWith('#'));
            console.log(chalk.cyan('\n=== Environment Variables ===\n'));
            envVars.forEach(line => {
                const [key] = line.split('=');
                if (key) {
                    console.log(chalk.gray(`  ${key}`));
                }
            });
        }
        console.log('');
    }
    catch (error) {
        console.error(chalk.red('Error showing config:'), error.message);
        process.exit(1);
    }
}
//# sourceMappingURL=config.js.map