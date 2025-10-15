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
var HotReloadService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.HotReloadService = void 0;
const common_1 = require("@nestjs/common");
const chokidar = __importStar(require("chokidar"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs-extra"));
const chalk = require('chalk');
let HotReloadService = HotReloadService_1 = class HotReloadService {
    logger = new common_1.Logger(HotReloadService_1.name);
    watchers = new Map();
    moduleCache = new Map();
    reloadCallbacks = new Map();
    async watchModule(modulePath, moduleName) {
        if (this.watchers.has(moduleName)) {
            await this.stopWatching(moduleName);
        }
        console.log(chalk.blue(`🔄 Watching module: ${moduleName}`));
        const watcher = chokidar.watch(modulePath, {
            ignored: [
                /(^|[\/\\])\../,
                /node_modules/,
                /dist/,
                /coverage/,
                /\.spec\.ts$/,
                /\.test\.ts$/,
            ],
            persistent: true,
            ignoreInitial: true,
            awaitWriteFinish: {
                stabilityThreshold: 300,
                pollInterval: 100,
            },
        });
        watcher
            .on('change', async (filePath) => {
            console.log(chalk.yellow(`📝 File changed: ${path.relative(modulePath, filePath)}`));
            await this.reloadModule(moduleName);
        })
            .on('add', async (filePath) => {
            console.log(chalk.green(`➕ File added: ${path.relative(modulePath, filePath)}`));
            await this.reloadModule(moduleName);
        })
            .on('unlink', async (filePath) => {
            console.log(chalk.red(`➖ File removed: ${path.relative(modulePath, filePath)}`));
            await this.reloadModule(moduleName);
        })
            .on('error', (error) => {
            console.error(chalk.red(`❌ Watcher error for ${moduleName}:`), error);
        });
        this.watchers.set(moduleName, watcher);
    }
    async stopWatching(moduleName) {
        const watcher = this.watchers.get(moduleName);
        if (watcher) {
            await watcher.close();
            this.watchers.delete(moduleName);
            console.log(chalk.gray(`⏹️  Stopped watching: ${moduleName}`));
        }
    }
    async stopAll() {
        for (const [moduleName, watcher] of this.watchers.entries()) {
            await watcher.close();
            console.log(chalk.gray(`⏹️  Stopped watching: ${moduleName}`));
        }
        this.watchers.clear();
    }
    registerReloadCallback(moduleName, callback) {
        this.reloadCallbacks.set(moduleName, callback);
    }
    async reloadModule(moduleName) {
        try {
            console.log(chalk.cyan(`♻️  Reloading module: ${moduleName}`));
            this.clearModuleCache(moduleName);
            const callback = this.reloadCallbacks.get(moduleName);
            if (callback) {
                await callback();
            }
            this.emitReloadEvent(moduleName);
            console.log(chalk.green(`✅ Module reloaded: ${moduleName}`));
        }
        catch (error) {
            console.error(chalk.red(`❌ Failed to reload module ${moduleName}:`), error.message);
        }
    }
    clearModuleCache(moduleName) {
        const projectRoot = process.cwd();
        const modulePattern = path.join(projectRoot, 'src', 'modules', moduleName);
        Object.keys(require.cache).forEach((key) => {
            if (key.includes(modulePattern)) {
                delete require.cache[key];
            }
        });
        this.moduleCache.delete(moduleName);
    }
    emitReloadEvent(moduleName) {
        process.emit('module:reload', moduleName);
    }
    getStatus() {
        return {
            active: Array.from(this.watchers.keys()),
            total: this.watchers.size,
        };
    }
    async enableProjectHotReload() {
        const projectRoot = process.cwd();
        const modulesPath = path.join(projectRoot, 'src', 'modules');
        if (!await fs.pathExists(modulesPath)) {
            console.log(chalk.yellow('No modules directory found'));
            return;
        }
        const modules = await fs.readdir(modulesPath);
        for (const moduleName of modules) {
            const modulePath = path.join(modulesPath, moduleName);
            const stats = await fs.stat(modulePath);
            if (stats.isDirectory()) {
                await this.watchModule(modulePath, moduleName);
            }
        }
        console.log(chalk.green(`\n✨ Hot reload enabled for ${modules.length} modules`));
        console.log(chalk.gray('Press Ctrl+C to stop watching\n'));
    }
};
exports.HotReloadService = HotReloadService;
exports.HotReloadService = HotReloadService = HotReloadService_1 = __decorate([
    (0, common_1.Injectable)()
], HotReloadService);
//# sourceMappingURL=hot-reload.service.js.map