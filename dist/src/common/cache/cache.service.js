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
var CacheService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheService = void 0;
const common_1 = require("@nestjs/common");
const logger_service_1 = require("../logger/logger.service");
const crypto = __importStar(require("crypto"));
let CacheService = class CacheService {
    static { CacheService_1 = this; }
    static instance;
    caches = new Map();
    stats = new Map();
    logger = new logger_service_1.LoggerService('CacheService');
    globalMaxSize = 100 * 1024 * 1024;
    currentSize = 0;
    constructor() {
        if (CacheService_1.instance) {
            return CacheService_1.instance;
        }
        CacheService_1.instance = this;
    }
    get(key, namespace = 'default') {
        const cache = this.getNamespaceCache(namespace);
        const entry = cache.get(key);
        const stats = this.getNamespaceStats(namespace);
        if (!entry) {
            stats.misses++;
            this.logger.debug(`Cache miss: ${namespace}:${key}`);
            return undefined;
        }
        if (entry.expires > 0 && Date.now() > entry.expires) {
            this.delete(key, namespace);
            stats.misses++;
            this.logger.debug(`Cache expired: ${namespace}:${key}`);
            return undefined;
        }
        entry.hits++;
        entry.lastAccessed = new Date();
        stats.hits++;
        this.logger.debug(`Cache hit: ${namespace}:${key} (hits: ${entry.hits})`);
        return entry.value;
    }
    set(key, value, options = {}) {
        const namespace = options.namespace || 'default';
        const ttl = options.ttl || 0;
        const cache = this.getNamespaceCache(namespace);
        const size = this.calculateSize(value);
        if (this.currentSize + size > this.globalMaxSize) {
            this.evict(size);
        }
        const entry = {
            value,
            expires: ttl > 0 ? Date.now() + ttl : 0,
            size,
            hits: 0,
            created: new Date(),
            lastAccessed: new Date(),
        };
        const oldEntry = cache.get(key);
        if (oldEntry) {
            this.currentSize -= oldEntry.size;
        }
        cache.set(key, entry);
        this.currentSize += size;
        const stats = this.getNamespaceStats(namespace);
        stats.entries = cache.size;
        stats.size += size;
        this.logger.debug(`Cache set: ${namespace}:${key} (size: ${size}, ttl: ${ttl})`);
    }
    delete(key, namespace = 'default') {
        const cache = this.getNamespaceCache(namespace);
        const entry = cache.get(key);
        if (entry) {
            this.currentSize -= entry.size;
            const stats = this.getNamespaceStats(namespace);
            stats.entries--;
            stats.size -= entry.size;
            cache.delete(key);
            this.logger.debug(`Cache deleted: ${namespace}:${key}`);
            return true;
        }
        return false;
    }
    clear(namespace) {
        if (namespace) {
            const cache = this.getNamespaceCache(namespace);
            let totalSize = 0;
            cache.forEach(entry => {
                totalSize += entry.size;
            });
            this.currentSize -= totalSize;
            cache.clear();
            const stats = this.getNamespaceStats(namespace);
            stats.entries = 0;
            stats.size = 0;
            this.logger.info(`Cache cleared: ${namespace}`);
        }
        else {
            this.caches.clear();
            this.stats.clear();
            this.currentSize = 0;
            this.logger.info('All caches cleared');
        }
    }
    async getOrSet(key, factory, options = {}) {
        const namespace = options.namespace || 'default';
        const cached = this.get(key, namespace);
        if (cached !== undefined) {
            return cached;
        }
        const value = await factory();
        this.set(key, value, options);
        return value;
    }
    generateKey(...parts) {
        const data = JSON.stringify(parts);
        return crypto.createHash('md5').update(data).digest('hex');
    }
    getStats(namespace) {
        if (namespace) {
            return this.getNamespaceStats(namespace);
        }
        return new Map(this.stats);
    }
    getSize() {
        return {
            current: this.currentSize,
            max: this.globalMaxSize,
            usage: (this.currentSize / this.globalMaxSize) * 100,
        };
    }
    cleanup() {
        const now = Date.now();
        let cleaned = 0;
        this.caches.forEach((cache, namespace) => {
            const toDelete = [];
            cache.forEach((entry, key) => {
                if (entry.expires > 0 && now > entry.expires) {
                    toDelete.push(key);
                }
            });
            toDelete.forEach(key => {
                this.delete(key, namespace);
                cleaned++;
            });
        });
        if (cleaned > 0) {
            this.logger.info(`Cleaned ${cleaned} expired entries`);
        }
    }
    getNamespaceCache(namespace) {
        if (!this.caches.has(namespace)) {
            this.caches.set(namespace, new Map());
        }
        return this.caches.get(namespace);
    }
    getNamespaceStats(namespace) {
        if (!this.stats.has(namespace)) {
            this.stats.set(namespace, {
                hits: 0,
                misses: 0,
                size: 0,
                entries: 0,
                hitRate: 0,
            });
        }
        const stats = this.stats.get(namespace);
        const total = stats.hits + stats.misses;
        stats.hitRate = total > 0 ? (stats.hits / total) * 100 : 0;
        return stats;
    }
    calculateSize(obj) {
        if (obj === null || obj === undefined) {
            return 0;
        }
        if (typeof obj === 'string') {
            return obj.length * 2;
        }
        if (typeof obj === 'number') {
            return 8;
        }
        if (typeof obj === 'boolean') {
            return 4;
        }
        if (obj instanceof Buffer) {
            return obj.length;
        }
        try {
            const json = JSON.stringify(obj);
            return json.length * 2;
        }
        catch {
            return 1024;
        }
    }
    evict(requiredSize) {
        const entries = [];
        this.caches.forEach((cache, namespace) => {
            cache.forEach((entry, key) => {
                entries.push({ namespace, key, entry });
            });
        });
        entries.sort((a, b) => a.entry.lastAccessed.getTime() - b.entry.lastAccessed.getTime());
        let freed = 0;
        for (const { namespace, key } of entries) {
            if (freed >= requiredSize) {
                break;
            }
            const deleted = this.delete(key, namespace);
            if (deleted) {
                freed += requiredSize;
            }
        }
        this.logger.debug(`Evicted cache to free ${freed} bytes`);
    }
};
exports.CacheService = CacheService;
exports.CacheService = CacheService = CacheService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], CacheService);
//# sourceMappingURL=cache.service.js.map