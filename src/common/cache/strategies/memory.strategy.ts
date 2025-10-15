/**
 * 内存缓存策略
 */

import { LRUCache } from 'lru-cache';

export interface MemoryCacheOptions {
  max?: number; // 最大条目数
  maxSize?: number; // 最大字节数
  ttl?: number; // 默认TTL（毫秒）
  updateAgeOnGet?: boolean; // 获取时是否更新年龄
  updateAgeOnHas?: boolean; // 检查时是否更新年龄
}

export class MemoryCacheStrategy<T = any> {
  private cache: LRUCache<string, T>;
  private hits: number = 0;
  private misses: number = 0;

  constructor(options: MemoryCacheOptions = {}) {
    this.cache = new LRUCache<string, T>({
      max: options.max || 1000,
      maxSize: options.maxSize || 50 * 1024 * 1024, // 50MB
      ttl: options.ttl || 1000 * 60 * 60, // 1小时
      updateAgeOnGet: options.updateAgeOnGet ?? true,
      updateAgeOnHas: options.updateAgeOnHas ?? false,
      sizeCalculation: (value: T) => {
        return this.calculateSize(value);
      },
    });
  }

  /**
   * 获取缓存
   */
  get(key: string): T | undefined {
    const value = this.cache.get(key);
    if (value !== undefined) {
      this.hits++;
    } else {
      this.misses++;
    }
    return value;
  }

  /**
   * 设置缓存
   */
  set(key: string, value: T, ttl?: number): void {
    const options = ttl ? { ttl } : undefined;
    this.cache.set(key, value, options);
  }

  /**
   * 删除缓存
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * 检查是否存在
   */
  has(key: string): boolean {
    return this.cache.has(key);
  }

  /**
   * 清空缓存
   */
  clear(): void {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
  }

  /**
   * 获取所有键
   */
  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * 获取缓存大小
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * 获取统计信息
   */
  getStats(): {
    hits: number;
    misses: number;
    hitRate: number;
    size: number;
    calculatedSize: number;
  } {
    const total = this.hits + this.misses;
    return {
      hits: this.hits,
      misses: this.misses,
      hitRate: total > 0 ? (this.hits / total) * 100 : 0,
      size: this.cache.size,
      calculatedSize: this.cache.calculatedSize || 0,
    };
  }

  /**
   * 计算对象大小
   */
  private calculateSize(obj: T): number {
    if (obj === null || obj === undefined) {
      return 1;
    }

    if (typeof obj === 'string') {
      return (obj as string).length * 2;
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

    // 对于对象和数组，使用JSON序列化估算
    try {
      return JSON.stringify(obj).length * 2;
    } catch {
      return 1024; // 默认1KB
    }
  }

  /**
   * 修剪缓存
   */
  prune(): void {
    this.cache.purgeStale();
  }
}