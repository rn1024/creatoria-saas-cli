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
exports.ModulesService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const fs = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
let ModulesService = class ModulesService {
    configService;
    modulesPath;
    configPath;
    constructor(configService) {
        this.configService = configService;
        this.modulesPath = path.join(process.cwd(), 'modules');
        this.configPath = path.join(process.cwd(), '.creatoria', 'config.json');
    }
    async addModule(moduleName, options = {}) {
        const modulePath = path.join(this.modulesPath, moduleName);
        const sourcePath = options.sourcePath;
        if (!sourcePath || !await fs.pathExists(sourcePath)) {
            throw new Error('Source path does not exist');
        }
        if (await fs.pathExists(modulePath) && !options.force) {
            throw new Error(`Module ${moduleName} already exists`);
        }
        await fs.copy(sourcePath, modulePath);
        await this.updateConfig('add', moduleName);
        return true;
    }
    async removeModule(moduleName) {
        const modulePath = path.join(this.modulesPath, moduleName);
        if (!await fs.pathExists(modulePath)) {
            throw new Error(`Module ${moduleName} does not exist`);
        }
        await fs.remove(modulePath);
        await this.updateConfig('remove', moduleName);
        return true;
    }
    async listModules() {
        if (!await fs.pathExists(this.configPath)) {
            return [];
        }
        const config = await fs.readJSON(this.configPath);
        return config.modules || [];
    }
    async checkDependencies(moduleName) {
        const modulePath = path.join(this.modulesPath, moduleName);
        const packageJsonPath = path.join(modulePath, 'package.json');
        if (!await fs.pathExists(packageJsonPath)) {
            return false;
        }
        const packageJson = await fs.readJSON(packageJsonPath);
        const dependencies = packageJson.dependencies || {};
        for (const dep of Object.keys(dependencies)) {
            if (dep.startsWith('module-')) {
                const depPath = path.join(this.modulesPath, dep);
                if (!await fs.pathExists(depPath)) {
                    return false;
                }
            }
        }
        return true;
    }
    async initializeModule(moduleName) {
        const modulePath = path.join(this.modulesPath, moduleName);
        const initFile = path.join(modulePath, 'init.js');
        if (await fs.pathExists(initFile)) {
            const init = require(initFile);
            if (typeof init === 'function') {
                await init();
            }
        }
        return true;
    }
    async updateConfig(action, moduleName) {
        await fs.ensureDir(path.dirname(this.configPath));
        let config = { modules: [] };
        if (await fs.pathExists(this.configPath)) {
            config = await fs.readJSON(this.configPath);
        }
        if (action === 'add' && !config.modules.includes(moduleName)) {
            config.modules.push(moduleName);
        }
        else if (action === 'remove') {
            config.modules = config.modules.filter((m) => m !== moduleName);
        }
        await fs.writeJSON(this.configPath, config, { spaces: 2 });
    }
};
exports.ModulesService = ModulesService;
exports.ModulesService = ModulesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], ModulesService);
//# sourceMappingURL=modules.service.js.map