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
exports.ModuleDoctorCommand = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const chalk = __importStar(require("chalk"));
class ModuleDoctorCommand {
    static register(program) {
        program
            .command('module:doctor [module-name]')
            .description('诊断模块健康状态')
            .action(async (moduleName) => {
            console.log('🔍 开始模块健康检查...');
            if (moduleName) {
                await this.checkModule(moduleName);
            }
            else {
                await this.checkAllModules();
            }
        });
    }
    static async checkModule(moduleName) {
        const modulePath = path.join(process.cwd(), 'node_modules', `@creatoria-saas/${moduleName}`);
        if (!fs.existsSync(modulePath)) {
            console.log(chalk.red(`❌ 模块 ${moduleName} 未安装`));
            return;
        }
        console.log(chalk.green(`\n检查模块: ${moduleName}`));
        const checks = [
            { file: 'module.json', required: true, desc: '模块元数据' },
            { file: 'package.json', required: true, desc: '包配置' },
            { file: 'src/entities', required: true, desc: '实体定义' },
            { file: 'src/dto', required: true, desc: 'DTO定义' },
        ];
        let healthy = true;
        for (const check of checks) {
            const filePath = path.join(modulePath, check.file);
            const exists = fs.existsSync(filePath);
            if (exists) {
                console.log(chalk.green(`  ✓ ${check.desc}`));
            }
            else if (check.required) {
                console.log(chalk.red(`  ✗ ${check.desc} 缺失`));
                healthy = false;
            }
            else {
                console.log(chalk.yellow(`  ⚠ ${check.desc} 缺失（可选）`));
            }
        }
        await this.checkDependencies(modulePath);
        if (healthy) {
            console.log(chalk.green(`\n✅ 模块 ${moduleName} 状态健康`));
        }
        else {
            console.log(chalk.red(`\n❌ 模块 ${moduleName} 存在问题，请修复`));
        }
    }
    static async checkAllModules() {
        const packagesPath = path.join(process.cwd(), 'node_modules', '@creatoria-saas');
        if (!fs.existsSync(packagesPath)) {
            console.log(chalk.yellow('未发现已安装的模块'));
            return;
        }
        const modules = fs.readdirSync(packagesPath)
            .filter(item => fs.statSync(path.join(packagesPath, item)).isDirectory());
        for (const module of modules) {
            await this.checkModule(module);
        }
    }
    static async checkDependencies(modulePath) {
        const moduleJsonPath = path.join(modulePath, 'module.json');
        if (!fs.existsSync(moduleJsonPath)) {
            return;
        }
        try {
            const moduleConfig = JSON.parse(fs.readFileSync(moduleJsonPath, 'utf-8'));
            if (moduleConfig.dependencies) {
                console.log(chalk.cyan('  依赖检查:'));
                if (moduleConfig.dependencies.system) {
                    for (const dep of moduleConfig.dependencies.system) {
                        console.log(chalk.gray(`    - 系统功能: ${dep}`));
                    }
                }
                if (moduleConfig.dependencies.modules) {
                    for (const dep of moduleConfig.dependencies.modules) {
                        const depPath = path.join(process.cwd(), 'node_modules', `@creatoria-saas/${dep}`);
                        if (fs.existsSync(depPath)) {
                            console.log(chalk.green(`    ✓ 模块依赖: ${dep}`));
                        }
                        else {
                            console.log(chalk.red(`    ✗ 模块依赖: ${dep} (未安装)`));
                        }
                    }
                }
            }
        }
        catch (error) {
            console.log(chalk.red('  无法读取模块配置'));
        }
    }
}
exports.ModuleDoctorCommand = ModuleDoctorCommand;
//# sourceMappingURL=module-doctor.command.js.map