/**
 * 缓存装饰器
 */

import { CacheService, CacheOptions } from './cache.service';
import { LoggerService } from '../logger/logger.service';

const cacheService = new CacheService();
const logger = new LoggerService('CacheDecorator');

/**
 * 方法缓存装饰器
 */
export function Cacheable(options: CacheOptions & {
  keyGenerator?: (...args: any[]) => string;
  condition?: (...args: any[]) => boolean;
} = {}) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    const className = target.constructor.name;
    const namespace = options.namespace || className;

    descriptor.value = async function (...args: any[]) {
      // 检查条件
      if (options.condition && !options.condition(...args)) {
        return originalMethod.apply(this, args);
      }

      // 生成缓存键
      const key = options.keyGenerator
        ? options.keyGenerator(...args)
        : cacheService.generateKey(propertyKey, ...args);

      // 尝试从缓存获取
      const cached = cacheService.get(key, namespace);
      if (cached !== undefined) {
        logger.debug(`Cache hit for ${className}.${propertyKey}`);
        return cached;
      }

      // 执行原始方法
      logger.debug(`Cache miss for ${className}.${propertyKey}, executing method`);
      const result = await originalMethod.apply(this, args);

      // 存入缓存
      cacheService.set(key, result, {
        ...options,
        namespace,
      });

      return result;
    };

    return descriptor;
  };
}

/**
 * 缓存清除装饰器
 */
export function CacheEvict(options: {
  namespace?: string;
  key?: string;
  keyGenerator?: (...args: any[]) => string;
  allEntries?: boolean;
} = {}) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    const className = target.constructor.name;
    const namespace = options.namespace || className;

    descriptor.value = async function (...args: any[]) {
      // 执行原始方法
      const result = await originalMethod.apply(this, args);

      // 清除缓存
      if (options.allEntries) {
        cacheService.clear(namespace);
        logger.debug(`Cleared all cache entries for namespace: ${namespace}`);
      } else {
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

/**
 * 缓存更新装饰器
 */
export function CachePut(options: CacheOptions & {
  keyGenerator?: (...args: any[]) => string;
} = {}) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    const className = target.constructor.name;
    const namespace = options.namespace || className;

    descriptor.value = async function (...args: any[]) {
      // 执行原始方法
      const result = await originalMethod.apply(this, args);

      // 生成缓存键
      const key = options.keyGenerator
        ? options.keyGenerator(...args)
        : cacheService.generateKey(propertyKey, ...args);

      // 更新缓存
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

/**
 * 批量缓存装饰器
 */
export function CacheableBatch(options: CacheOptions & {
  keyExtractor: (item: any) => string;
  batchSize?: number;
} = { keyExtractor: (item) => String(item) }) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    const className = target.constructor.name;
    const namespace = options.namespace || className;
    const batchSize = options.batchSize || 100;

    descriptor.value = async function (items: any[]): Promise<any[]> {
      const results: any[] = [];
      const uncachedItems: any[] = [];
      const uncachedIndices: number[] = [];

      // 检查缓存
      items.forEach((item, index) => {
        const key = options.keyExtractor(item);
        const cached = cacheService.get(key, namespace);
        
        if (cached !== undefined) {
          results[index] = cached;
        } else {
          uncachedItems.push(item);
          uncachedIndices.push(index);
        }
      });

      // 如果都在缓存中，直接返回
      if (uncachedItems.length === 0) {
        logger.debug(`Batch cache hit for all ${items.length} items`);
        return results;
      }

      logger.debug(`Batch cache: ${results.filter(r => r !== undefined).length} hits, ${uncachedItems.length} misses`);

      // 批量处理未缓存的项
      for (let i = 0; i < uncachedItems.length; i += batchSize) {
        const batch = uncachedItems.slice(i, i + batchSize);
        const batchResults = await originalMethod.call(this, batch);

        // 存入缓存并记录结果
        batchResults.forEach((result: any, batchIndex: number) => {
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

/**
 * 缓存统计装饰器
 */
export function CacheStats() {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
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