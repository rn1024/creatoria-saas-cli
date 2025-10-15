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
var ModuleLoaderService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModuleLoaderService = void 0;
const common_1 = require("@nestjs/common");
const fs = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
const simpleGit = __importStar(require("simple-git"));
const config_service_1 = require("../../config/config.service");
const module_interface_1 = require("../../interfaces/module.interface");
let ModuleLoaderService = ModuleLoaderService_1 = class ModuleLoaderService {
    configService;
    logger = new common_1.Logger(ModuleLoaderService_1.name);
    git = simpleGit.default();
    modules = new Map();
    constructor(configService) {
        this.configService = configService;
    }
    async loadModules() {
        const enabledModules = this.configService.modules.enabled;
        const loadedModules = [];
        for (const moduleName of enabledModules) {
            try {
                const module = await this.loadModule(moduleName);
                if (module) {
                    loadedModules.push(module);
                }
            }
            catch (error) {
                this.logger.error(`Failed to load module ${moduleName}:`, error);
            }
        }
        return loadedModules;
    }
    async installModule(moduleSource) {
        const installPath = this.configService.modules.installPath;
        const [protocol, repo] = moduleSource.split(':');
        if (protocol === 'github') {
            const gitUrl = `https://github.com/${repo}.git`;
            const targetPath = path.join(installPath, 'remote');
            this.logger.log(`Installing modules from ${gitUrl}...`);
            if (await fs.pathExists(targetPath)) {
                await this.git.cwd(targetPath).pull();
            }
            else {
                await this.git.clone(gitUrl, targetPath);
            }
            const { exec } = require('child_process');
            await new Promise((resolve, reject) => {
                exec('npm install', { cwd: targetPath }, (error) => {
                    if (error)
                        reject(error);
                    else
                        resolve(true);
                });
            });
            await new Promise((resolve, reject) => {
                exec('npm run build', { cwd: targetPath }, (error) => {
                    if (error)
                        reject(error);
                    else
                        resolve(true);
                });
            });
            this.logger.log('Modules installed successfully');
        }
    }
    async loadModule(moduleName) {
        const modulePath = path.join(this.configService.modules.installPath, 'remote', 'packages', moduleName);
        if (!await fs.pathExists(modulePath)) {
            this.logger.warn(`Module ${moduleName} not found at ${modulePath}`);
            return null;
        }
        const metadataPath = path.join(modulePath, 'module.json');
        let metadata;
        if (await fs.pathExists(metadataPath)) {
            metadata = await fs.readJson(metadataPath);
        }
        else {
            metadata = {
                name: moduleName,
                displayName: moduleName,
                version: '1.0.0',
                description: `${moduleName} module`,
                author: 'Creatoria Team',
            };
        }
        const moduleInfo = {
            id: `${moduleName}-${metadata.version}`,
            name: moduleName,
            version: metadata.version,
            status: module_interface_1.ModuleStatus.ENABLED,
            path: modulePath,
            metadata,
            installedAt: new Date(),
            updatedAt: new Date(),
        };
        this.modules.set(moduleName, moduleInfo);
        try {
            const moduleFile = path.join(modulePath, 'dist', 'src', `${moduleName}.module.js`);
            if (await fs.pathExists(moduleFile)) {
                const moduleExports = require(moduleFile);
                const ModuleClass = moduleExports[Object.keys(moduleExports)[0]];
                this.logger.log(`Loaded module: ${moduleName} v${metadata.version}`);
                return ModuleClass;
            }
        }
        catch (error) {
            this.logger.error(`Failed to load module class for ${moduleName}:`, error);
        }
        return null;
    }
    async enableModule(moduleName) {
        const moduleInfo = this.modules.get(moduleName);
        if (moduleInfo) {
            moduleInfo.status = module_interface_1.ModuleStatus.ENABLED;
            this.modules.set(moduleName, moduleInfo);
            this.logger.log(`Module ${moduleName} enabled`);
        }
    }
    async disableModule(moduleName) {
        const moduleInfo = this.modules.get(moduleName);
        if (moduleInfo) {
            moduleInfo.status = module_interface_1.ModuleStatus.DISABLED;
            this.modules.set(moduleName, moduleInfo);
            this.logger.log(`Module ${moduleName} disabled`);
        }
    }
    getModuleInfo(moduleName) {
        return this.modules.get(moduleName);
    }
    getAllModules() {
        return Array.from(this.modules.values());
    }
    isModuleEnabled(moduleName) {
        const moduleInfo = this.modules.get(moduleName);
        return moduleInfo?.status === module_interface_1.ModuleStatus.ENABLED;
    }
};
exports.ModuleLoaderService = ModuleLoaderService;
exports.ModuleLoaderService = ModuleLoaderService = ModuleLoaderService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_service_1.ConfigService])
], ModuleLoaderService);
//# sourceMappingURL=module-loader.service.js.map