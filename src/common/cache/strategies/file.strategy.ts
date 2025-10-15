/**
 * 文件缓存策略
 */

import * as fs from 'fs-extra';
import * as path from 'path';
import * as crypto from 'crypto';
import { LoggerService } from '../../logger/logger.service';

export interface FileCacheOptions {
  cacheDir?: string;
  ttl?: number;
  maxSize?: number;
  compression?: boolean;
}

export interface FileCacheEntry<T> {
  value: T;
  expires: number;
  created: number;
  hash: string;
}

export class FileCacheStrategy<T = any> {
  private cacheDir: string;
  private ttl: number;
  private maxSize: number;
  private logger = new LoggerService('FileCacheStrategy');
  private index: Map<string, { file: string; expires: number }> = new Map();

  constructor(options: FileCacheOptions = {}) {
    this.cacheDir = options.cacheDir || path.join(process.cwd(), '.cache');
    this.ttl = options.ttl || 1000 * 60 * 60 * 24; // 24小时
    this.maxSize = options.maxSize || 100 * 1024 * 1024; // 100MB
    
    this.initializeCacheDir();
    this.loadIndex();
  }

  /**
   * 初始化缓存目录
   */
  private initializeCacheDir(): void {
    try {
      fs.ensureDirSync(this.cacheDir);
    } catch (error) {
      this.logger.error('Failed to create cache directory', error as Error);
    }
  }

  /**
   * 加载索引
   */
  private loadIndex(): void {
    const indexPath = path.join(this.cacheDir, 'index.json');
    
    try {
      if (fs.existsSync(indexPath)) {
        const data = fs.readJsonSync(indexPath);
        this.index = new Map(Object.entries(data));
        this.cleanExpired();
      }
    } catch (error) {
      this.logger.error('Failed to load cache index', error as Error);
    }
  }

  /**
   * 保存索引
   */
  private saveIndex(): void {
    const indexPath = path.join(this.cacheDir, 'index.json');
    
    try {
      const data = Object.fromEntries(this.index);
      fs.writeJsonSync(indexPath, data, { spaces: 2 });
    } catch (error) {
      this.logger.error('Failed to save cache index', error as Error);
    }
  }

  /**
   * 获取缓存
   */
  async get(key: string): Promise<T | undefined> {
    const indexEntry = this.index.get(key);
    
    if (!indexEntry) {
      return undefined;
    }

    // 检查是否过期
    if (Date.now() > indexEntry.expires) {
      await this.delete(key);
      return undefined;
    }

    const filePath = path.join(this.cacheDir, indexEntry.file);
    
    try {
      const entry: FileCacheEntry<T> = await fs.readJson(filePath);
      
      // 验证数据完整性
      const hash = this.calculateHash(entry.value);
      if (hash !== entry.hash) {
        this.logger.warn(`Cache corruption detected for key: ${key}`);
        await this.delete(key);
        return undefined;
      }

      return entry.value;
    } catch (error) {
      this.logger.error(`Failed to read cache file for key: ${key}`, error as Error);
      await this.delete(key);
      return undefined;
    }
  }

  /**
   * 设置缓存
   */
  async set(key: string, value: T, ttl?: number): Promise<void> {
    const fileName = this.generateFileName(key);
    const filePath = path.join(this.cacheDir, fileName);
    const expires = Date.now() + (ttl || this.ttl);
    
    const entry: FileCacheEntry<T> = {
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
      
      // 检查缓存大小
      await this.checkSize();
    } catch (error) {
      this.logger.error(`Failed to write cache for key: ${key}`, error as Error);
    }
  }

  /**
   * 删除缓存
   */
  async delete(key: string): Promise<boolean> {
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
    } catch (error) {
      this.logger.error(`Failed to delete cache for key: ${key}`, error as Error);
      return false;
    }
  }

  /**
   * 清空缓存
   */
  async clear(): Promise<void> {
    try {
      const files = await fs.readdir(this.cacheDir);
      
      for (const file of files) {
        if (file !== 'index.json') {
          await fs.remove(path.join(this.cacheDir, file));
        }
      }
      
      this.index.clear();
      this.saveIndex();
    } catch (error) {
      this.logger.error('Failed to clear cache', error as Error);
    }
  }

  /**
   * 清理过期缓存
   */
  private async cleanExpired(): Promise<void> {
    const now = Date.now();
    const toDelete: string[] = [];
    
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

  /**
   * 检查缓存大小
   */
  private async checkSize(): Promise<void> {
    try {
      const files = await fs.readdir(this.cacheDir);
      let totalSize = 0;
      const fileSizes: Array<{ file: string; size: number; key?: string }> = [];
      
      for (const file of files) {
        if (file !== 'index.json') {
          const filePath = path.join(this.cacheDir, file);
          const stats = await fs.stat(filePath);
          totalSize += stats.size;
          
          // 找到对应的key
          let key: string | undefined;
          for (const [k, v] of this.index) {
            if (v.file === file) {
              key = k;
              break;
            }
          }
          
          fileSizes.push({ file, size: stats.size, key });
        }
      }
      
      // 如果超过最大大小，删除最旧的文件
      if (totalSize > this.maxSize) {
        // 按文件大小排序（删除大文件优先）
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
    } catch (error) {
      this.logger.error('Failed to check cache size', error as Error);
    }
  }

  /**
   * 生成文件名
   */
  private generateFileName(key: string): string {
    const hash = crypto.createHash('md5').update(key).digest('hex');
    return `${hash}.json`;
  }

  /**
   * 计算哈希
   */
  private calculateHash(value: T): string {
    const data = JSON.stringify(value);
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * 获取统计信息
   */
  async getStats(): Promise<{
    entries: number;
    totalSize: number;
    oldestEntry?: Date;
    newestEntry?: Date;
  }> {
    const files = await fs.readdir(this.cacheDir);
    let totalSize = 0;
    let oldest: number | undefined;
    let newest: number | undefined;
    
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