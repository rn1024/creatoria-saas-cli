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
exports.LazyLoader = void 0;
const command_registry_1 = require("./command-registry");
const logger_service_1 = require("../../common/logger/logger.service");
const logger_decorator_1 = require("../../common/decorators/logger.decorator");
const base_exception_1 = require("../../common/exceptions/base.exception");
const error_types_1 = require("../../common/types/error.types");
const path = __importStar(require("path"));
class LazyLoader {
    static instance;
    registry;
    logger = new logger_service_1.LoggerService('LazyLoader');
    cache = new Map();
    constructor() {
        this.registry = command_registry_1.CommandRegistry.getInstance();
    }
    static getInstance() {
        if (!LazyLoader.instance) {
            LazyLoader.instance = new LazyLoader();
        }
        return LazyLoader.instance;
    }
    async loadCommand(name) {
        if (this.cache.has(name)) {
            this.logger.debug(`Loading command from cache: ${name}`);
            return this.cache.get(name);
        }
        const metadata = this.registry.getCommand(name);
        if (!metadata) {
            throw new base_exception_1.BaseException(`Command '${name}' not found`, {
                code: 'CLI_4000',
                category: error_types_1.ErrorCategory.BUSINESS,
                severity: error_types_1.ErrorSeverity.ERROR,
            });
        }
        if (metadata.instance) {
            this.cache.set(name, metadata.instance);
            return metadata.instance;
        }
        if (!metadata.modulePath || !metadata.className) {
            throw new base_exception_1.BaseException(`Command '${name}' missing module information`, {
                code: 'CLI_4001',
                category: error_types_1.ErrorCategory.CONFIGURATION,
                severity: error_types_1.ErrorSeverity.ERROR,
            });
        }
        const startTime = Date.now();
        try {
            const module = await this.dynamicImport(metadata.modulePath);
            const CommandClass = module[metadata.className];
            if (!CommandClass) {
                throw new Error(`Class '${metadata.className}' not found in module`);
            }
            const instance = new CommandClass();
            const loadTime = Date.now() - startTime;
            this.registry.updateInstance(name, instance, loadTime);
            this.cache.set(name, instance);
            this.logger.info(`Lazy loaded command: ${name} (${loadTime}ms)`);
            return instance;
        }
        catch (error) {
            const loadTime = Date.now() - startTime;
            throw new base_exception_1.BaseException(`Failed to load command '${name}'`, {
                code: 'CLI_4002',
                category: error_types_1.ErrorCategory.SYSTEM,
                severity: error_types_1.ErrorSeverity.ERROR,
                context: {
                    module: 'LazyLoader',
                    method: 'loadCommand',
                    metadata: {
                        command: name,
                        modulePath: metadata.modulePath,
                        className: metadata.className,
                        loadTime,
                    },
                },
                cause: error,
            });
        }
    }
    async dynamicImport(modulePath) {
        if (modulePath.startsWith('.')) {
            modulePath = path.resolve(__dirname, modulePath);
        }
        try {
            const module = await import(modulePath);
            return module;
        }
        catch (error) {
            try {
                return require(modulePath);
            }
            catch (requireError) {
                throw error;
            }
        }
    }
    async preloadCommands(names) {
        this.logger.info(`Preloading ${names.length} commands`);
        const startTime = Date.now();
        const results = await Promise.allSettled(names.map(name => this.loadCommand(name)));
        const loadTime = Date.now() - startTime;
        const succeeded = results.filter(r => r.status === 'fulfilled').length;
        const failed = results.filter(r => r.status === 'rejected').length;
        this.logger.info(`Preloading complete: ${succeeded} succeeded, ${failed} failed (${loadTime}ms)`);
        results.forEach((result, index) => {
            if (result.status === 'rejected') {
                this.logger.error(`Failed to preload command '${names[index]}'`, result.reason);
            }
        });
    }
    clearCache() {
        this.cache.clear();
        this.logger.debug('Command cache cleared');
    }
    getCacheStats() {
        return {
            size: this.cache.size,
            commands: Array.from(this.cache.keys()),
        };
    }
    async reloadCommand(name) {
        this.cache.delete(name);
        const metadata = this.registry.getCommand(name);
        if (metadata?.modulePath) {
            const resolvedPath = path.resolve(__dirname, metadata.modulePath);
            delete require.cache[require.resolve(resolvedPath)];
        }
        return this.loadCommand(name);
    }
}
exports.LazyLoader = LazyLoader;
__decorate([
    (0, logger_decorator_1.Performance)(100),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LazyLoader.prototype, "loadCommand", null);
//# sourceMappingURL=lazy-loader.js.map