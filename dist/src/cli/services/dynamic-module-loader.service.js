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
var DynamicModuleLoaderService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DynamicModuleLoaderService = void 0;
const common_1 = require("@nestjs/common");
const path = __importStar(require("path"));
const fs = __importStar(require("fs-extra"));
const ts = __importStar(require("typescript"));
const chalk = require('chalk');
let DynamicModuleLoaderService = DynamicModuleLoaderService_1 = class DynamicModuleLoaderService {
    logger = new common_1.Logger(DynamicModuleLoaderService_1.name);
    loadedModules = new Map();
    moduleRegistry = new Map();
    async loadModule(moduleName, modulePath) {
        try {
            console.log(chalk.blue(`📦 Loading module: ${moduleName}`));
            if (!await fs.pathExists(modulePath)) {
                throw new Error(`Module path not found: ${modulePath}`);
            }
            const moduleFile = await this.findModuleFile(modulePath);
            if (!moduleFile) {
                throw new Error(`No module file found in ${modulePath}`);
            }
            if (moduleFile.endsWith('.ts')) {
                await this.compileTypeScript(moduleFile);
            }
            const compiledPath = moduleFile.replace('.ts', '.js');
            delete require.cache[require.resolve(compiledPath)];
            const moduleExports = require(compiledPath);
            const ModuleClass = this.findModuleClass(moduleExports);
            if (!ModuleClass) {
                throw new Error(`No valid NestJS module found in ${moduleFile}`);
            }
            const dynamicModule = {
                module: ModuleClass,
                imports: [],
                providers: [],
                exports: [],
            };
            const metadata = {
                name: moduleName,
                path: modulePath,
                module: ModuleClass,
                lastModified: new Date(),
                dependencies: await this.extractDependencies(moduleFile),
            };
            this.loadedModules.set(moduleName, metadata);
            this.moduleRegistry.set(moduleName, dynamicModule);
            console.log(chalk.green(`✅ Module loaded: ${moduleName}`));
            return dynamicModule;
        }
        catch (error) {
            console.error(chalk.red(`❌ Failed to load module ${moduleName}:`), error.message);
            return null;
        }
    }
    async reloadModule(moduleName) {
        try {
            const metadata = this.loadedModules.get(moduleName);
            if (!metadata) {
                console.log(chalk.yellow(`Module ${moduleName} not loaded`));
                return false;
            }
            console.log(chalk.cyan(`♻️  Reloading module: ${moduleName}`));
            this.clearModuleFromCache(metadata.path);
            const dynamicModule = await this.loadModule(moduleName, metadata.path);
            if (!dynamicModule) {
                return false;
            }
            this.moduleRegistry.set(moduleName, dynamicModule);
            console.log(chalk.green(`✅ Module reloaded: ${moduleName}`));
            return true;
        }
        catch (error) {
            console.error(chalk.red(`❌ Failed to reload module ${moduleName}:`), error.message);
            return false;
        }
    }
    async unloadModule(moduleName) {
        try {
            const metadata = this.loadedModules.get(moduleName);
            if (!metadata) {
                return false;
            }
            this.clearModuleFromCache(metadata.path);
            this.loadedModules.delete(moduleName);
            this.moduleRegistry.delete(moduleName);
            console.log(chalk.gray(`📤 Module unloaded: ${moduleName}`));
            return true;
        }
        catch (error) {
            console.error(chalk.red(`❌ Failed to unload module ${moduleName}:`), error.message);
            return false;
        }
    }
    getLoadedModules() {
        return Array.from(this.loadedModules.values());
    }
    getModule(moduleName) {
        return this.moduleRegistry.get(moduleName);
    }
    async findModuleFile(modulePath) {
        const patterns = [
            `${path.basename(modulePath)}.module.ts`,
            `${path.basename(modulePath)}.module.js`,
            'index.ts',
            'index.js',
            'module.ts',
            'module.js',
        ];
        for (const pattern of patterns) {
            const filePath = path.join(modulePath, pattern);
            if (await fs.pathExists(filePath)) {
                return filePath;
            }
            const srcPath = path.join(modulePath, 'src', pattern);
            if (await fs.pathExists(srcPath)) {
                return srcPath;
            }
        }
        return null;
    }
    findModuleClass(exports) {
        if (exports.default && this.isNestModule(exports.default)) {
            return exports.default;
        }
        for (const key of Object.keys(exports)) {
            if (this.isNestModule(exports[key])) {
                return exports[key];
            }
        }
        return null;
    }
    isNestModule(target) {
        if (typeof target !== 'function') {
            return false;
        }
        const metadata = Reflect.getMetadata('imports', target);
        return metadata !== undefined;
    }
    async compileTypeScript(filePath) {
        const source = await fs.readFile(filePath, 'utf8');
        const compilerOptions = {
            module: ts.ModuleKind.CommonJS,
            target: ts.ScriptTarget.ES2020,
            experimentalDecorators: true,
            emitDecoratorMetadata: true,
            esModuleInterop: true,
            skipLibCheck: true,
            strict: false,
        };
        const result = ts.transpileModule(source, {
            compilerOptions,
            fileName: path.basename(filePath),
        });
        const outputPath = filePath.replace('.ts', '.js');
        await fs.writeFile(outputPath, result.outputText);
    }
    async extractDependencies(moduleFile) {
        const dependencies = [];
        try {
            const source = await fs.readFile(moduleFile, 'utf8');
            const importRegex = /import\s+.*?\s+from\s+['"](.+?)['"]/g;
            let match;
            while ((match = importRegex.exec(source)) !== null) {
                const importPath = match[1];
                if (!importPath.startsWith('.') && !importPath.startsWith('@nestjs')) {
                    dependencies.push(importPath);
                }
            }
        }
        catch (error) {
            this.logger.error(`Failed to extract dependencies from ${moduleFile}:`, error);
        }
        return dependencies;
    }
    clearModuleFromCache(modulePath) {
        Object.keys(require.cache).forEach((key) => {
            if (key.includes(modulePath)) {
                delete require.cache[key];
            }
        });
    }
};
exports.DynamicModuleLoaderService = DynamicModuleLoaderService;
exports.DynamicModuleLoaderService = DynamicModuleLoaderService = DynamicModuleLoaderService_1 = __decorate([
    (0, common_1.Injectable)()
], DynamicModuleLoaderService);
//# sourceMappingURL=dynamic-module-loader.service.js.map