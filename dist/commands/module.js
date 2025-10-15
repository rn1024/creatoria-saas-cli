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
exports.moduleCommand = void 0;
const commander_1 = require("commander");
const path = __importStar(require("path"));
const fs = __importStar(require("fs-extra"));
const chalk = __importStar(require("chalk"));
exports.moduleCommand = new commander_1.Command('module')
    .description('Manage project modules');
exports.moduleCommand
    .command('list')
    .description('List all installed modules')
    .action(listModules);
exports.moduleCommand
    .command('add <module-name>')
    .description('Add a new module to the project')
    .action(addModule);
async function listModules() {
    try {
        const modulesDir = path.join(process.cwd(), 'src', 'modules');
        if (!fs.existsSync(modulesDir)) {
            console.log(chalk.yellow('No modules directory found'));
            return;
        }
        const modules = fs.readdirSync(modulesDir).filter(item => {
            const itemPath = path.join(modulesDir, item);
            return fs.statSync(itemPath).isDirectory();
        });
        if (modules.length === 0) {
            console.log(chalk.yellow('No modules found'));
            return;
        }
        console.log(chalk.cyan('\nInstalled modules:'));
        modules.forEach(module => {
            console.log(chalk.green(`  ✓ ${module}`));
        });
        console.log('');
    }
    catch (error) {
        console.error(chalk.red('Error listing modules:'), error.message);
        process.exit(1);
    }
}
async function addModule(moduleName) {
    try {
        console.log(chalk.yellow('\n⚠️  Module generation is not yet implemented in v0.2.0'));
        console.log(chalk.gray('This feature will be added in a future release\n'));
    }
    catch (error) {
        console.error(chalk.red('Error adding module:'), error.message);
        process.exit(1);
    }
}
//# sourceMappingURL=module.js.map