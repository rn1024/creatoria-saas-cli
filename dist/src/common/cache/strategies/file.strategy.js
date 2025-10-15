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
exports.FileCacheStrategy = void 0;
const fs = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
const crypto = __importStar(require("crypto"));
const logger_service_1 = require("../../logger/logger.service");
class FileCacheStrategy {
    cacheDir;
    ttl;
    maxSize;
    logger = new logger_service_1.LoggerService('FileCacheStrategy');
    index = new Map();
    constructor(options = {}) {
        this.cacheDir = options.cacheDir || path.join(process.cwd(), '.cache');
        this.ttl = options.ttl || 1000 * 60 * 60 * 24;
        this.maxSize = options.maxSize || 100 * 1024 * 1024;
        this.initializeCacheDir();
        this.loadIndex();
    }
    initializeCacheDir() {
        try {
            fs.ensureDirSync(this.cacheDir);
        }
        catch (error) {
            this.logger.error('Failed to create cache directory', error);
        }
    }
    loadIndex() {
        const indexPath = path.join(this.cacheDir, 'index.json');
        try {
            if (fs.existsSync(indexPath)) {
                const data = fs.readJsonSync(indexPath);
                this.index = new Map(Object.entries(data));
                this.cleanExpired();
            }
        }
        catch (error) {
            this.logger.error('Failed to load cache index', error);
        }
    }
    saveIndex() {
        const indexPath = path.join(this.cacheDir, 'index.json');
        try {
            const data = Object.fromEntries(this.index);
            fs.writeJsonSync(indexPath, data, { spaces: 2 });
        }
        catch (error) {
            this.logger.error('Failed to save cache index', error);
        }
    }
    async get(key) {
        const indexEntry = this.index.get(key);
        if (!indexEntry) {
            return undefined;
        }
        if (Date.now() > indexEntry.expires) {
            await this.delete(key);
            return undefined;
        }
        const filePath = path.join(this.cacheDir, indexEntry.file);
        try {
            const entry = await fs.readJson(filePath);
            const hash = this.calculateHash(entry.value);
            if (hash !== entry.hash) {
                this.logger.warn(`Cache corruption detected for key: ${key}`);
                await this.delete(key);
                return undefined;
            }
            return entry.value;
        }
        catch (error) {
            this.logger.error(`Failed to read cache file for key: ${key}`, error);
            await this.delete(key);
            return undefined;
        }
    }
    async set(key, value, ttl) {
        const fileName = this.generateFileName(key);
        const filePath = path.join(this.cacheDir, fileName);
        const expires = Date.now() + (ttl || this.ttl);
        const entry = {
            value,
            expires,
            created: Date.now(),
            hash: this.calculateHash(value),
        };
        try {
            await fs.writeJson(filePath, entry, { spaces: 2 });
            this.index.set(key, {
                file: fileName,
                expires,
            });
            this.saveIndex();
            await this.checkSize();
        }
        catch (error) {
            this.logger.error(`Failed to write cache for key: ${key}`, error);
        }
    }
    async delete(key) {
        const indexEntry = this.index.get(key);
        if (!indexEntry) {
            return false;
        }
        const filePath = path.join(this.cacheDir, indexEntry.file);
        try {
            await fs.remove(filePath);
            this.index.delete(key);
            this.saveIndex();
            return true;
        }
        catch (error) {
            this.logger.error(`Failed to delete cache for key: ${key}`, error);
            return false;
        }
    }
    async clear() {
        try {
            const files = await fs.readdir(this.cacheDir);
            for (const file of files) {
                if (file !== 'index.json') {
                    await fs.remove(path.join(this.cacheDir, file));
                }
            }
            this.index.clear();
            this.saveIndex();
        }
        catch (error) {
            this.logger.error('Failed to clear cache', error);
        }
    }
    async cleanExpired() {
        const now = Date.now();
        const toDelete = [];
        for (const [key, entry] of this.index) {
            if (now > entry.expires) {
                toDelete.push(key);
            }
        }
        for (const key of toDelete) {
            await this.delete(key);
        }
        if (toDelete.length > 0) {
            this.logger.info(`Cleaned ${toDelete.length} expired cache entries`);
        }
    }
    async checkSize() {
        try {
            const files = await fs.readdir(this.cacheDir);
            let totalSize = 0;
            const fileSizes = [];
            for (const file of files) {
                if (file !== 'index.json') {
                    const filePath = path.join(this.cacheDir, file);
                    const stats = await fs.stat(filePath);
                    totalSize += stats.size;
                    let key;
                    for (const [k, v] of this.index) {
                        if (v.file === file) {
                            key = k;
                            break;
                        }
                    }
                    fileSizes.push({ file, size: stats.size, key });
                }
            }
            if (totalSize > this.maxSize) {
                fileSizes.sort((a, b) => b.size - a.size);
                let deleted = 0;
                for (const { key } of fileSizes) {
                    if (totalSize <= this.maxSize) {
                        break;
                    }
                    if (key) {
                        await this.delete(key);
                        totalSize -= fileSizes[deleted].size;
                        deleted++;
                    }
                }
                if (deleted > 0) {
                    this.logger.info(`Evicted ${deleted} cache entries to maintain size limit`);
                }
            }
        }
        catch (error) {
            this.logger.error('Failed to check cache size', error);
        }
    }
    generateFileName(key) {
        const hash = crypto.createHash('md5').update(key).digest('hex');
        return `${hash}.json`;
    }
    calculateHash(value) {
        const data = JSON.stringify(value);
        return crypto.createHash('sha256').update(data).digest('hex');
    }
    async getStats() {
        const files = await fs.readdir(this.cacheDir);
        let totalSize = 0;
        let oldest;
        let newest;
        for (const file of files) {
            if (file !== 'index.json') {
                const filePath = path.join(this.cacheDir, file);
                const stats = await fs.stat(filePath);
                totalSize += stats.size;
                const mtime = stats.mtime.getTime();
                if (!oldest || mtime < oldest) {
                    oldest = mtime;
                }
                if (!newest || mtime > newest) {
                    newest = mtime;
                }
            }
        }
        return {
            entries: this.index.size,
            totalSize,
            oldestEntry: oldest ? new Date(oldest) : undefined,
            newestEntry: newest ? new Date(newest) : undefined,
        };
    }
}
exports.FileCacheStrategy = FileCacheStrategy;
//# sourceMappingURL=file.strategy.js.map