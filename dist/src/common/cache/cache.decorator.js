"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cacheable = Cacheable;
exports.CacheEvict = CacheEvict;
exports.CachePut = CachePut;
exports.CacheableBatch = CacheableBatch;
exports.CacheStats = CacheStats;
const cache_service_1 = require("./cache.service");
const logger_service_1 = require("../logger/logger.service");
const cacheService = new cache_service_1.CacheService();
const logger = new logger_service_1.LoggerService('CacheDecorator');
function Cacheable(options = {}) {
    return function (target, propertyKey, descriptor) {
        const originalMethod = descriptor.value;
        const className = target.constructor.name;
        const namespace = options.namespace || className;
        descriptor.value = async function (...args) {
            if (options.condition && !options.condition(...args)) {
                return originalMethod.apply(this, args);
            }
            const key = options.keyGenerator
                ? options.keyGenerator(...args)
                : cacheService.generateKey(propertyKey, ...args);
            const cached = cacheService.get(key, namespace);
            if (cached !== undefined) {
                logger.debug(`Cache hit for ${className}.${propertyKey}`);
                return cached;
            }
            logger.debug(`Cache miss for ${className}.${propertyKey}, executing method`);
            const result = await originalMethod.apply(this, args);
            cacheService.set(key, result, {
                ...options,
                namespace,
            });
            return result;
        };
        return descriptor;
    };
}
function CacheEvict(options = {}) {
    return function (target, propertyKey, descriptor) {
        const originalMethod = descriptor.value;
        const className = target.constructor.name;
        const namespace = options.namespace || className;
        descriptor.value = async function (...args) {
            const result = await originalMethod.apply(this, args);
            if (options.allEntries) {
                cacheService.clear(namespace);
                logger.debug(`Cleared all cache entries for namespace: ${namespace}`);
            }
            else {
                const key = options.key ||
                    (options.keyGenerator
                        ? options.keyGenerator(...args)
                        : cacheService.generateKey(propertyKey, ...args));
                cacheService.delete(key, namespace);
                logger.debug(`Evicted cache key: ${namespace}:${key}`);
            }
            return result;
        };
        return descriptor;
    };
}
function CachePut(options = {}) {
    return function (target, propertyKey, descriptor) {
        const originalMethod = descriptor.value;
        const className = target.constructor.name;
        const namespace = options.namespace || className;
        descriptor.value = async function (...args) {
            const result = await originalMethod.apply(this, args);
            const key = options.keyGenerator
                ? options.keyGenerator(...args)
                : cacheService.generateKey(propertyKey, ...args);
            cacheService.set(key, result, {
                ...options,
                namespace,
            });
            logger.debug(`Updated cache for ${className}.${propertyKey}`);
            return result;
        };
        return descriptor;
    };
}
function CacheableBatch(options = { keyExtractor: (item) => String(item) }) {
    return function (target, propertyKey, descriptor) {
        const originalMethod = descriptor.value;
        const className = target.constructor.name;
        const namespace = options.namespace || className;
        const batchSize = options.batchSize || 100;
        descriptor.value = async function (items) {
            const results = [];
            const uncachedItems = [];
            const uncachedIndices = [];
            items.forEach((item, index) => {
                const key = options.keyExtractor(item);
                const cached = cacheService.get(key, namespace);
                if (cached !== undefined) {
                    results[index] = cached;
                }
                else {
                    uncachedItems.push(item);
                    uncachedIndices.push(index);
                }
            });
            if (uncachedItems.length === 0) {
                logger.debug(`Batch cache hit for all ${items.length} items`);
                return results;
            }
            logger.debug(`Batch cache: ${results.filter(r => r !== undefined).length} hits, ${uncachedItems.length} misses`);
            for (let i = 0; i < uncachedItems.length; i += batchSize) {
                const batch = uncachedItems.slice(i, i + batchSize);
                const batchResults = await originalMethod.call(this, batch);
                batchResults.forEach((result, batchIndex) => {
                    const itemIndex = uncachedIndices[i + batchIndex];
                    const item = uncachedItems[i + batchIndex];
                    const key = options.keyExtractor(item);
                    cacheService.set(key, result, {
                        ...options,
                        namespace,
                    });
                    results[itemIndex] = result;
                });
            }
            return results;
        };
        return descriptor;
    };
}
function CacheStats() {
    return function (target, propertyKey, descriptor) {
        const originalMethod = descriptor.value;
        descriptor.value = function (...args) {
            const stats = cacheService.getStats();
            console.log('📊 Cache Statistics:');
            if (stats instanceof Map) {
                stats.forEach((stat, namespace) => {
                    console.log(`  ${namespace}:`);
                    console.log(`    Hits: ${stat.hits}`);
                    console.log(`    Misses: ${stat.misses}`);
                    console.log(`    Hit Rate: ${stat.hitRate.toFixed(2)}%`);
                    console.log(`    Entries: ${stat.entries}`);
                    console.log(`    Size: ${(stat.size / 1024).toFixed(2)} KB`);
                });
            }
            const size = cacheService.getSize();
            console.log(`  Total Size: ${(size.current / 1024 / 1024).toFixed(2)} MB / ${(size.max / 1024 / 1024).toFixed(2)} MB (${size.usage.toFixed(2)}%)`);
            return originalMethod.apply(this, args);
        };
        return descriptor;
    };
}
//# sourceMappingURL=cache.decorator.js.map