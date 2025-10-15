"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemoryCacheStrategy = void 0;
const lru_cache_1 = require("lru-cache");
class MemoryCacheStrategy {
    cache;
    hits = 0;
    misses = 0;
    constructor(options = {}) {
        this.cache = new lru_cache_1.LRUCache({
            max: options.max || 1000,
            maxSize: options.maxSize || 50 * 1024 * 1024,
            ttl: options.ttl || 1000 * 60 * 60,
            updateAgeOnGet: options.updateAgeOnGet ?? true,
            updateAgeOnHas: options.updateAgeOnHas ?? false,
            sizeCalculation: (value) => {
                return this.calculateSize(value);
            },
        });
    }
    get(key) {
        const value = this.cache.get(key);
        if (value !== undefined) {
            this.hits++;
        }
        else {
            this.misses++;
        }
        return value;
    }
    set(key, value, ttl) {
        const options = ttl ? { ttl } : undefined;
        this.cache.set(key, value, options);
    }
    delete(key) {
        return this.cache.delete(key);
    }
    has(key) {
        return this.cache.has(key);
    }
    clear() {
        this.cache.clear();
        this.hits = 0;
        this.misses = 0;
    }
    keys() {
        return Array.from(this.cache.keys());
    }
    size() {
        return this.cache.size;
    }
    getStats() {
        const total = this.hits + this.misses;
        return {
            hits: this.hits,
            misses: this.misses,
            hitRate: total > 0 ? (this.hits / total) * 100 : 0,
            size: this.cache.size,
            calculatedSize: this.cache.calculatedSize || 0,
        };
    }
    calculateSize(obj) {
        if (obj === null || obj === undefined) {
            return 1;
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
        if (obj instanceof ArrayBuffer) {
            return obj.byteLength;
        }
        try {
            return JSON.stringify(obj).length * 2;
        }
        catch {
            return 1024;
        }
    }
    prune() {
        this.cache.purgeStale();
    }
}
exports.MemoryCacheStrategy = MemoryCacheStrategy;
//# sourceMappingURL=memory.strategy.js.map