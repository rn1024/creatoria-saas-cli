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
var RemoteModuleService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RemoteModuleService = void 0;
const common_1 = require("@nestjs/common");
const fs = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
const child_process_1 = require("child_process");
const util_1 = require("util");
const execAsync = (0, util_1.promisify)(child_process_1.exec);
const chalk = require('chalk');
let RemoteModuleService = RemoteModuleService_1 = class RemoteModuleService {
    logger = new common_1.Logger(RemoteModuleService_1.name);
    cacheDir = path.join(process.env.HOME || '', '.creatoria', 'module-cache');
    constructor() {
        fs.ensureDirSync(this.cacheDir);
    }
    async fetchRegistry() {
        const localRegistryPath = path.join(__dirname, '../../../../../creatoria-saas-modules/registry.json');
        if (!fs.existsSync(localRegistryPath)) {
            throw new Error('Module registry not found');
        }
        return fs.readJson(localRegistryPath);
    }
    async fetchModule(moduleName, version) {
        console.log(chalk.blue(`Fetching module ${moduleName}${version ? `@${version}` : ''}...`));
        const registry = await this.fetchRegistry();
        const moduleInfo = registry.modules[moduleName];
        if (!moduleInfo) {
            throw new Error(`Module ${moduleName} not found in registry`);
        }
        const cacheKey = `${moduleName}-${version || moduleInfo.version}`;
        const cachedPath = path.join(this.cacheDir, cacheKey);
        if (fs.existsSync(cachedPath)) {
            console.log(chalk.gray('Using cached version'));
            return cachedPath;
        }
        if (moduleInfo.repository.startsWith('git')) {
            return await this.cloneFromGit(moduleInfo.repository, cachedPath, version);
        }
        else if (moduleInfo.path) {
            return await this.copyFromLocal(moduleInfo.path, cachedPath);
        }
        else {
            throw new Error(`Unsupported repository type for ${moduleName}`);
        }
    }
    async cloneFromGit(repoUrl, targetPath, version) {
        console.log(chalk.gray(`Cloning from ${repoUrl}...`));
        try {
            await execAsync(`git clone ${repoUrl} ${targetPath}`);
            if (version) {
                await execAsync(`git checkout ${version}`, { cwd: targetPath });
            }
            await fs.remove(path.join(targetPath, '.git'));
            console.log(chalk.green('Module downloaded successfully'));
            return targetPath;
        }
        catch (error) {
            await fs.remove(targetPath);
            throw new Error(`Failed to clone module: ${error.message}`);
        }
    }
    async copyFromLocal(sourcePath, targetPath) {
        console.log(chalk.gray(`Copying from local path ${sourcePath}...`));
        const absoluteSource = path.isAbsolute(sourcePath)
            ? sourcePath
            : path.join(__dirname, '../../../../../', sourcePath);
        if (!fs.existsSync(absoluteSource)) {
            throw new Error(`Local module path not found: ${absoluteSource}`);
        }
        await fs.copy(absoluteSource, targetPath, {
            filter: (src) => {
                const basename = path.basename(src);
                return !basename.includes('node_modules') &&
                    !basename.includes('.git') &&
                    !basename.includes('dist');
            }
        });
        console.log(chalk.green('Module copied successfully'));
        return targetPath;
    }
    async listAvailableModules() {
        const registry = await this.fetchRegistry();
        return Object.keys(registry.modules);
    }
    async getModuleInfo(moduleName) {
        const registry = await this.fetchRegistry();
        return registry.modules[moduleName];
    }
    async clearCache(moduleName) {
        if (moduleName) {
            const files = await fs.readdir(this.cacheDir);
            const moduleFiles = files.filter(f => f.startsWith(`${moduleName}-`));
            for (const file of moduleFiles) {
                await fs.remove(path.join(this.cacheDir, file));
            }
            console.log(chalk.green(`Cache cleared for module ${moduleName}`));
        }
        else {
            await fs.emptyDir(this.cacheDir);
            console.log(chalk.green('Module cache cleared'));
        }
    }
    async validateModule(modulePath) {
        const requiredFiles = ['module.json'];
        const requiredDirs = [];
        for (const file of requiredFiles) {
            if (!fs.existsSync(path.join(modulePath, file))) {
                console.log(chalk.red(`Missing required file: ${file}`));
                return false;
            }
        }
        for (const dir of requiredDirs) {
            if (!fs.existsSync(path.join(modulePath, dir))) {
                console.log(chalk.red(`Missing required directory: ${dir}`));
                return false;
            }
        }
        try {
            const moduleJson = await fs.readJson(path.join(modulePath, 'module.json'));
            if (!moduleJson.name) {
                console.log(chalk.red('module.json missing required field: name'));
                return false;
            }
            if (!moduleJson.version) {
                console.log(chalk.red('module.json missing required field: version'));
                return false;
            }
            return true;
        }
        catch (error) {
            console.log(chalk.red(`Invalid module.json: ${error.message}`));
            return false;
        }
    }
};
exports.RemoteModuleService = RemoteModuleService;
exports.RemoteModuleService = RemoteModuleService = RemoteModuleService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], RemoteModuleService);
//# sourceMappingURL=remote-module.service.js.map