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
exports.FileManagerService = void 0;
const fs = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
const common_1 = require("@nestjs/common");
const cache_service_1 = require("../cache/cache.service");
const cache_decorator_1 = require("../cache/cache.decorator");
const logger_service_1 = require("../logger/logger.service");
const logger_decorator_1 = require("../decorators/logger.decorator");
const pLimit = __importStar(require("p-limit"));
let FileManagerService = class FileManagerService {
    cache;
    logger = new logger_service_1.LoggerService('FileManager');
    fileCache = new Map();
    constructor() {
        this.cache = new cache_service_1.CacheService();
    }
    async batchRead(paths, options = {}) {
        const { cache = true, parallel = true, concurrency = 10, encoding = 'utf8', } = options;
        if (!parallel) {
            const results = [];
            for (const filePath of paths) {
                try {
                    const content = await this.readFile(filePath, { cache, encoding });
                    results.push({ path: filePath, content });
                }
                catch (error) {
                    results.push({ path: filePath, error: error });
                }
            }
            return results;
        }
        const limit = pLimit(concurrency);
        const tasks = paths.map(filePath => limit(async () => {
            try {
                const content = await this.readFile(filePath, { cache, encoding });
                return { path: filePath, content };
            }
            catch (error) {
                return { path: filePath, error: error };
            }
        }));
        return Promise.all(tasks);
    }
    async readFile(filePath, options = {}) {
        const { encoding = 'utf8', cache = true } = options;
        if (cache) {
            const stats = await fs.stat(filePath);
            const cached = this.fileCache.get(filePath);
            if (cached && cached.mtime === stats.mtime.getTime()) {
                this.logger.debug(`File cache hit: ${filePath}`);
                return cached.content;
            }
        }
        const content = await fs.readFile(filePath, encoding);
        if (cache) {
            const stats = await fs.stat(filePath);
            this.fileCache.set(filePath, {
                content,
                mtime: stats.mtime.getTime(),
            });
        }
        return content;
    }
    async batchWrite(files, options = {}) {
        const { parallel = true, concurrency = 10 } = options;
        if (!parallel) {
            for (const file of files) {
                await this.writeFile(file.path, file.content);
            }
            return;
        }
        const limit = pLimit(concurrency);
        const tasks = files.map(file => limit(() => this.writeFile(file.path, file.content)));
        await Promise.all(tasks);
    }
    async writeFile(filePath, content, options = {}) {
        const { encoding = 'utf8' } = options;
        await fs.ensureDir(path.dirname(filePath));
        await fs.writeFile(filePath, content, encoding);
        this.fileCache.delete(filePath);
    }
    async batchCopy(pairs, options = {}) {
        const { parallel = true, concurrency = 10 } = options;
        if (!parallel) {
            for (const { src, dest } of pairs) {
                await fs.copy(src, dest);
            }
            return;
        }
        const limit = pLimit(concurrency);
        const tasks = pairs.map(({ src, dest }) => limit(() => fs.copy(src, dest)));
        await Promise.all(tasks);
    }
    async batchDelete(paths, options = {}) {
        const { parallel = true, concurrency = 10 } = options;
        if (!parallel) {
            for (const filePath of paths) {
                await this.deleteFile(filePath);
            }
            return;
        }
        const limit = pLimit(concurrency);
        const tasks = paths.map(filePath => limit(() => this.deleteFile(filePath)));
        await Promise.all(tasks);
    }
    async deleteFile(filePath) {
        await fs.remove(filePath);
        this.fileCache.delete(filePath);
    }
    async findFiles(directory, pattern, options = {}) {
        const { maxDepth = 10, excludeDirs = ['node_modules', '.git', 'dist'] } = options;
        const results = [];
        async function search(dir, depth) {
            if (depth > maxDepth)
                return;
            const entries = await fs.readdir(dir, { withFileTypes: true });
            const tasks = entries.map(async (entry) => {
                const fullPath = path.join(dir, entry.name);
                if (entry.isDirectory()) {
                    if (!excludeDirs.includes(entry.name)) {
                        await search(fullPath, depth + 1);
                    }
                }
                else if (entry.isFile()) {
                    const matches = typeof pattern === 'string'
                        ? entry.name.includes(pattern)
                        : pattern.test(entry.name);
                    if (matches) {
                        results.push(fullPath);
                    }
                }
            });
            await Promise.all(tasks);
        }
        await search(directory, 0);
        return results;
    }
    async getDirectorySize(directory) {
        let totalSize = 0;
        async function calculateSize(dir) {
            const entries = await fs.readdir(dir, { withFileTypes: true });
            const tasks = entries.map(async (entry) => {
                const fullPath = path.join(dir, entry.name);
                if (entry.isDirectory()) {
                    await calculateSize(fullPath);
                }
                else if (entry.isFile()) {
                    const stats = await fs.stat(fullPath);
                    totalSize += stats.size;
                }
            });
            await Promise.all(tasks);
        }
        await calculateSize(directory);
        return totalSize;
    }
    async cleanOldFiles(directory, maxAge, options = {}) {
        const { dryRun = false, excludePatterns = [] } = options;
        const now = Date.now();
        const filesToDelete = [];
        async function scan(dir) {
            const entries = await fs.readdir(dir, { withFileTypes: true });
            const tasks = entries.map(async (entry) => {
                const fullPath = path.join(dir, entry.name);
                const excluded = excludePatterns.some(pattern => pattern.test(fullPath));
                if (excluded)
                    return;
                if (entry.isDirectory()) {
                    await scan(fullPath);
                }
                else if (entry.isFile()) {
                    const stats = await fs.stat(fullPath);
                    const age = now - stats.mtime.getTime();
                    if (age > maxAge) {
                        filesToDelete.push(fullPath);
                        if (!dryRun) {
                            await fs.remove(fullPath);
                        }
                    }
                }
            });
            await Promise.all(tasks);
        }
        await scan(directory);
        if (filesToDelete.length > 0) {
            this.logger.info(`${dryRun ? 'Would delete' : 'Deleted'} ${filesToDelete.length} old files`);
        }
        return filesToDelete;
    }
    async readJson(filePath) {
        const content = await this.readFile(filePath);
        return JSON.parse(content);
    }
    async writeJson(filePath, data, pretty = true) {
        const content = pretty
            ? JSON.stringify(data, null, 2)
            : JSON.stringify(data);
        await this.writeFile(filePath, content);
    }
    getCacheStats() {
        return {
            fileCache: this.fileCache.size,
            globalStats: this.cache.getStats(),
        };
    }
    clearCache() {
        this.fileCache.clear();
        this.cache.clear('file-content');
        this.cache.clear('file-search');
        this.cache.clear('dir-size');
        this.cache.clear('json-content');
        this.logger.info('File cache cleared');
    }
};
exports.FileManagerService = FileManagerService;
__decorate([
    (0, logger_decorator_1.Performance)(100),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array, Object]),
    __metadata("design:returntype", Promise)
], FileManagerService.prototype, "batchRead", null);
__decorate([
    (0, cache_decorator_1.Cacheable)({
        namespace: 'file-content',
        ttl: 60000,
        keyGenerator: (path) => path,
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], FileManagerService.prototype, "readFile", null);
__decorate([
    (0, cache_decorator_1.CacheEvict)({
        namespace: 'file-content',
        keyGenerator: (path) => path,
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], FileManagerService.prototype, "writeFile", null);
__decorate([
    (0, cache_decorator_1.CacheEvict)({
        namespace: 'file-content',
        keyGenerator: (path) => path,
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FileManagerService.prototype, "deleteFile", null);
__decorate([
    (0, cache_decorator_1.Cacheable)({
        namespace: 'file-search',
        ttl: 30000,
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], FileManagerService.prototype, "findFiles", null);
__decorate([
    (0, cache_decorator_1.Cacheable)({
        namespace: 'dir-size',
        ttl: 60000,
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FileManagerService.prototype, "getDirectorySize", null);
__decorate([
    (0, cache_decorator_1.Cacheable)({
        namespace: 'json-content',
        ttl: 60000,
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FileManagerService.prototype, "readJson", null);
__decorate([
    (0, cache_decorator_1.CacheEvict)({
        namespace: 'json-content',
        keyGenerator: (path) => path,
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Boolean]),
    __metadata("design:returntype", Promise)
], FileManagerService.prototype, "writeJson", null);
exports.FileManagerService = FileManagerService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], FileManagerService);
//# sourceMappingURL=file-manager.service.js.map