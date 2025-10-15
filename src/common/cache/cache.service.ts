/**
 * 缓存服务
 */

import { Injectable } from '@nestjs/common';
import { LoggerService } from '../logger/logger.service';
import * as crypto from 'crypto';

export interface CacheOptions {
  ttl?: number; // 生存时间（毫秒）
  maxSize?: number; // 最大缓存大小
  namespace?: string; // 命名空间
}

export interface CacheEntry<T> {
  value: T;
  expires: number;
  size: number;
  hits: number;
  created: Date;
  lastAccessed: Date;
}

export interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  entries: number;
  hitRate: number;
}

@Injectable()
export class CacheService {
  private static instance: CacheService;
  private caches: Map<string, Map<string, CacheEntry<any>>> = new Map();
  private stats: Map<string, CacheStats> = new Map();
  private logger = new LoggerService('CacheService');
  private globalMaxSize: number = 100 * 1024 * 1024; // 100MB
  private currentSize: number = 0;

  constructor() {
    if (CacheService.instance) {
      return CacheService.instance;
    }
    CacheService.instance = this;
  }

  /**
   * 获取缓存
   */
  get<T>(
    key: string,
    namespace: string = 'default'
  ): T | undefined {
    const cache = this.getNamespaceCache(namespace);
    const entry = cache.get(key);
    
    // 更新统计
    const stats = this.getNamespaceStats(namespace);
    
    if (!entry) {
      stats.misses++;
      this.logger.debug(`Cache miss: ${namespace}:${key}`);
      return undefined;
    }

    // 检查是否过期
    if (entry.expires > 0 && Date.now() > entry.expires) {
      this.delete(key, namespace);
      stats.misses++;
      this.logger.debug(`Cache expired: ${namespace}:${key}`);
      return undefined;
    }

    // 更新访问信息
    entry.hits++;
    entry.lastAccessed = new Date();
    stats.hits++;
    
    this.logger.debug(`Cache hit: ${namespace}:${key} (hits: ${entry.hits})`);
    return entry.value;
  }

  /**
   * 设置缓存
   */
  set<T>(
    key: string,
    value: T,
    options: CacheOptions = {}
  ): void {
    const namespace = options.namespace || 'default';
    const ttl = options.ttl || 0;
    const cache = this.getNamespaceCache(namespace);
    
    // 计算大小
    const size = this.calculateSize(value);
    
    // 检查全局大小限制
    if (this.currentSize + size > this.globalMaxSize) {
      this.evict(size);
    }
    
    // 创建缓存条目
    const entry: CacheEntry<T> = {
      value,
      expires: ttl > 0 ? Date.now() + ttl : 0,
      size,
      hits: 0,
      created: new Date(),
      lastAccessed: new Date(),
    };
    
    // 如果已存在，先减去旧的大小
    const oldEntry = cache.get(key);
    if (oldEntry) {
      this.currentSize -= oldEntry.size;
    }
    
    // 设置新值
    cache.set(key, entry);
    this.currentSize += size;
    
    // 更新统计
    const stats = this.getNamespaceStats(namespace);
    stats.entries = cache.size;
    stats.size += size;
    
    this.logger.debug(`Cache set: ${namespace}:${key} (size: ${size}, ttl: ${ttl})`);
  }

  /**
   * 删除缓存
   */
  delete(key: string, namespace: string = 'default'): boolean {
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

  /**
   * 清空命名空间
   */
  clear(namespace?: string): void {
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
    } else {
      // 清空所有缓存
      this.caches.clear();
      this.stats.clear();
      this.currentSize = 0;
      this.logger.info('All caches cleared');
    }
  }

  /**
   * 获取或设置缓存
   */
  async getOrSet<T>(
    key: string,
    factory: () => Promise<T> | T,
    options: CacheOptions = {}
  ): Promise<T> {
    const namespace = options.namespace || 'default';
    const cached = this.get<T>(key, namespace);
    
    if (cached !== undefined) {
      return cached;
    }
    
    const value = await factory();
    this.set(key, value, options);
    return value;
  }

  /**
   * 生成缓存键
   */
  generateKey(...parts: any[]): string {
    const data = JSON.stringify(parts);
    return crypto.createHash('md5').update(data).digest('hex');
  }

  /**
   * 获取统计信息
   */
  getStats(namespace?: string): CacheStats | Map<string, CacheStats> {
    if (namespace) {
      return this.getNamespaceStats(namespace);
    }
    return new Map(this.stats);
  }

  /**
   * 获取缓存大小
   */
  getSize(): { current: number; max: number; usage: number } {
    return {
      current: this.currentSize,
      max: this.globalMaxSize,
      usage: (this.currentSize / this.globalMaxSize) * 100,
    };
  }

  /**
   * 清理过期缓存
   */
  cleanup(): void {
    const now = Date.now();
    let cleaned = 0;
    
    this.caches.forEach((cache, namespace) => {
      const toDelete: string[] = [];
      
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

  /**
   * 获取命名空间缓存
   */
  private getNamespaceCache(namespace: string): Map<string, CacheEntry<any>> {
    if (!this.caches.has(namespace)) {
      this.caches.set(namespace, new Map());
    }
    return this.caches.get(namespace)!;
  }

  /**
   * 获取命名空间统计
   */
  private getNamespaceStats(namespace: string): CacheStats {
    if (!this.stats.has(namespace)) {
      this.stats.set(namespace, {
        hits: 0,
        misses: 0,
        size: 0,
        entries: 0,
        hitRate: 0,
      });
    }
    
    const stats = this.stats.get(namespace)!;
    const total = stats.hits + stats.misses;
    stats.hitRate = total > 0 ? (stats.hits / total) * 100 : 0;
    
    return stats;
  }

  /**
   * 计算对象大小（估算）
   */
  private calculateSize(obj: any): number {
    if (obj === null || obj === undefined) {
      return 0;
    }
    
    if (typeof obj === 'string') {
      return obj.length * 2; // UTF-16
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
    
    // 对象或数组，序列化后估算
    try {
      const json = JSON.stringify(obj);
      return json.length * 2;
    } catch {
      return 1024; // 默认1KB
    }
  }

  /**
   * 缓存淘汰（LRU）
   */
  private evict(requiredSize: number): void {
    const entries: Array<{
      namespace: string;
      key: string;
      entry: CacheEntry<any>;
    }> = [];
    
    // 收集所有缓存条目
    this.caches.forEach((cache, namespace) => {
      cache.forEach((entry, key) => {
        entries.push({ namespace, key, entry });
      });
    });
    
    // 按最后访问时间排序（LRU）
    entries.sort((a, b) => 
      a.entry.lastAccessed.getTime() - b.entry.lastAccessed.getTime()
    );
    
    // 淘汰直到有足够空间
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
}