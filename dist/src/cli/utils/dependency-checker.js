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
exports.DependencyChecker = void 0;
const fs = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
const chalk = require('chalk');
class DependencyChecker {
    projectPath;
    modulesRepoPath;
    installedModules = new Set();
    moduleRegistry = new Map();
    constructor(projectPath, modulesRepoPath) {
        this.projectPath = projectPath;
        this.modulesRepoPath = modulesRepoPath;
    }
    async initialize() {
        const configPath = path.join(this.projectPath, 'creatoria.config.json');
        if (fs.existsSync(configPath)) {
            const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
            if (config.modules && Array.isArray(config.modules)) {
                config.modules.forEach((mod) => this.installedModules.add(mod));
            }
        }
        const registryPath = path.join(this.modulesRepoPath, 'registry.json');
        if (fs.existsSync(registryPath)) {
            const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
            if (registry.modules) {
                for (const [name, info] of Object.entries(registry.modules)) {
                    const moduleJsonPath = path.join(this.modulesRepoPath, info.path, 'module.json');
                    if (fs.existsSync(moduleJsonPath)) {
                        const moduleData = JSON.parse(fs.readFileSync(moduleJsonPath, 'utf8'));
                        this.moduleRegistry.set(name, {
                            name: moduleData.name,
                            version: moduleData.version,
                            dependencies: moduleData.dependencies || { modules: [], packages: {} }
                        });
                    }
                }
            }
        }
    }
    async checkDependencies(moduleName) {
        const result = {
            valid: true,
            missingModules: [],
            circularDependency: false,
            dependencyChain: []
        };
        const moduleInfo = this.moduleRegistry.get(moduleName);
        if (!moduleInfo) {
            console.error(chalk.red(`Module ${moduleName} not found in registry`));
            result.valid = false;
            return result;
        }
        const moduleDeps = moduleInfo.dependencies.modules || [];
        for (const dep of moduleDeps) {
            if (!this.installedModules.has(dep)) {
                result.missingModules.push(dep);
            }
        }
        const visited = new Set();
        const recursionStack = new Set();
        result.circularDependency = this.hasCircularDependency(moduleName, visited, recursionStack, result.dependencyChain);
        if (result.missingModules.length > 0 || result.circularDependency) {
            result.valid = false;
        }
        return result;
    }
    hasCircularDependency(moduleName, visited, recursionStack, chain) {
        visited.add(moduleName);
        recursionStack.add(moduleName);
        chain.push(moduleName);
        const moduleInfo = this.moduleRegistry.get(moduleName);
        if (moduleInfo && moduleInfo.dependencies.modules) {
            for (const dep of moduleInfo.dependencies.modules) {
                if (!visited.has(dep)) {
                    if (this.hasCircularDependency(dep, visited, recursionStack, chain)) {
                        return true;
                    }
                }
                else if (recursionStack.has(dep)) {
                    chain.push(dep);
                    return true;
                }
            }
        }
        recursionStack.delete(moduleName);
        if (!chain[chain.length - 1].includes('->')) {
            chain.pop();
        }
        return false;
    }
    getAllDependencies(moduleName) {
        const allModules = new Set();
        const allPackages = {};
        const visited = new Set();
        this.collectDependencies(moduleName, allModules, allPackages, visited);
        return { modules: allModules, packages: allPackages };
    }
    collectDependencies(moduleName, modules, packages, visited) {
        if (visited.has(moduleName))
            return;
        visited.add(moduleName);
        const moduleInfo = this.moduleRegistry.get(moduleName);
        if (!moduleInfo)
            return;
        if (moduleInfo.dependencies.modules) {
            for (const dep of moduleInfo.dependencies.modules) {
                modules.add(dep);
                this.collectDependencies(dep, modules, packages, visited);
            }
        }
        if (moduleInfo.dependencies.packages) {
            Object.assign(packages, moduleInfo.dependencies.packages);
        }
    }
    printDependencyReport(moduleName, checkResult) {
        console.log(chalk.blue('\n依赖检查报告:'));
        console.log(chalk.gray('─'.repeat(60)));
        if (checkResult.valid) {
            console.log(chalk.green('✅ 所有依赖检查通过'));
        }
        else {
            if (checkResult.missingModules.length > 0) {
                console.log(chalk.yellow('⚠️  缺失的依赖模块:'));
                checkResult.missingModules.forEach(mod => {
                    console.log(chalk.yellow(`   - ${mod}`));
                });
                console.log(chalk.gray('\n请先安装这些模块:'));
                checkResult.missingModules.forEach(mod => {
                    console.log(chalk.cyan(`   creatoria-saas module add ${mod}`));
                });
            }
            if (checkResult.circularDependency) {
                console.log(chalk.red('❌ 检测到循环依赖:'));
                console.log(chalk.red(`   ${checkResult.dependencyChain.join(' → ')}`));
            }
        }
        console.log(chalk.gray('─'.repeat(60)));
    }
}
exports.DependencyChecker = DependencyChecker;
//# sourceMappingURL=dependency-checker.js.map