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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModuleManagerService = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const child_process_1 = require("child_process");
const chalk_1 = __importDefault(require("chalk"));
class ModuleManagerService {
    projectPath;
    modulesPath;
    constructor(projectPath = process.cwd()) {
        this.projectPath = projectPath;
        this.modulesPath = path.join(projectPath, 'node_modules', '@creatoria-saas');
    }
    async installModule(moduleName, version) {
        console.log(chalk_1.default.blue(`📦 安装模块: ${moduleName}${version ? `@${version}` : ''}`));
        try {
            const packageName = `@creatoria-saas/${moduleName}${version ? `@${version}` : ''}`;
            (0, child_process_1.execSync)(`pnpm add ${packageName}`, { cwd: this.projectPath, stdio: 'inherit' });
            const moduleConfig = await this.getModuleConfig(moduleName);
            await this.checkDependencies(moduleConfig);
            await this.registerModule(moduleName, moduleConfig);
            console.log(chalk_1.default.green(`✅ 模块 ${moduleName} 安装成功`));
        }
        catch (error) {
            console.error(chalk_1.default.red(`❌ 模块安装失败: ${error.message}`));
            throw error;
        }
    }
    async uninstallModule(moduleName) {
        console.log(chalk_1.default.blue(`🗑  卸载模块: ${moduleName}`));
        try {
            const dependents = await this.findDependents(moduleName);
            if (dependents.length > 0) {
                throw new Error(`以下模块依赖 ${moduleName}: ${dependents.join(', ')}`);
            }
            await this.unregisterModule(moduleName);
            (0, child_process_1.execSync)(`pnpm remove @creatoria-saas/${moduleName}`, {
                cwd: this.projectPath,
                stdio: 'inherit'
            });
            console.log(chalk_1.default.green(`✅ 模块 ${moduleName} 卸载成功`));
        }
        catch (error) {
            console.error(chalk_1.default.red(`❌ 模块卸载失败: ${error.message}`));
            throw error;
        }
    }
    async listModules() {
        const modules = [];
        if (!fs.existsSync(this.modulesPath)) {
            return modules;
        }
        const items = fs.readdirSync(this.modulesPath);
        for (const item of items) {
            const modulePath = path.join(this.modulesPath, item);
            if (fs.statSync(modulePath).isDirectory()) {
                try {
                    const config = await this.getModuleConfig(item);
                    modules.push(config);
                }
                catch (error) {
                }
            }
        }
        return modules;
    }
    async getModuleConfig(moduleName) {
        const modulePath = path.join(this.modulesPath, moduleName);
        const configPath = path.join(modulePath, 'module.json');
        if (!fs.existsSync(configPath)) {
            throw new Error(`模块 ${moduleName} 缺少 module.json 配置文件`);
        }
        return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    }
    async checkDependencies(config) {
        if (!config.dependencies) {
            return;
        }
        if (config.dependencies.modules) {
            for (const dep of config.dependencies.modules) {
                const depPath = path.join(this.modulesPath, dep);
                if (!fs.existsSync(depPath)) {
                    throw new Error(`缺少依赖模块: ${dep}，请先安装`);
                }
            }
        }
    }
    async registerModule(moduleName, config) {
        const appModulePath = path.join(this.projectPath, 'src', 'app.module.ts');
        if (!fs.existsSync(appModulePath)) {
            console.log(chalk_1.default.yellow('⚠️  未找到 app.module.ts，跳过自动注册'));
            return;
        }
        console.log(chalk_1.default.cyan(`
请手动在 app.module.ts 中注册模块:

import { ${this.toPascalCase(moduleName)}Module } from '@creatoria-saas/${moduleName}';

@Module({
  imports: [
    // ...
    ${this.toPascalCase(moduleName)}Module,
  ],
})
export class AppModule {}
    `));
    }
    async unregisterModule(moduleName) {
        console.log(chalk_1.default.cyan(`请手动从 app.module.ts 中移除 ${this.toPascalCase(moduleName)}Module`));
    }
    async findDependents(moduleName) {
        const dependents = [];
        const modules = await this.listModules();
        for (const module of modules) {
            if (module.dependencies?.modules?.includes(moduleName)) {
                dependents.push(module.name);
            }
        }
        return dependents;
    }
    toPascalCase(str) {
        return str.replace(/(^|[-_])(\w)/g, (_, __, char) => char.toUpperCase());
    }
}
exports.ModuleManagerService = ModuleManagerService;
//# sourceMappingURL=module-manager.service.js.map