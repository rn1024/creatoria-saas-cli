/**
 * 优化的文件管理服务
 */

import * as fs from 'fs-extra';
import * as path from 'path';
import { Injectable } from '@nestjs/common';
import { CacheService } from '../cache/cache.service';
import { Cacheable, CacheEvict } from '../cache/cache.decorator';
import { LoggerService } from '../logger/logger.service';
import { Performance } from '../decorators/logger.decorator';
import * as pLimit from 'p-limit';

export interface FileOperationOptions {
  cache?: boolean;
  cacheTTL?: number;
  parallel?: boolean;
  concurrency?: number;
  encoding?: BufferEncoding;
}

export interface BatchReadResult {
  path: string;
  content?: string;
  error?: Error;
}

@Injectable()
export class FileManagerService {
  private cache: CacheService;
  private logger = new LoggerService('FileManager');
  private fileCache = new Map<string, { content: string; mtime: number }>();

  constructor() {
    this.cache = new CacheService();
  }

  /**
   * 批量读取文件
   */
  @Performance(100)
  async batchRead(
    paths: string[],
    options: FileOperationOptions = {}
  ): Promise<BatchReadResult[]> {
    const {
      cache = true,
      parallel = true,
      concurrency = 10,
      encoding = 'utf8',
    } = options;

    if (!parallel) {
      // 串行读取
      const results: BatchReadResult[] = [];
      for (const filePath of paths) {
        try {
          const content = await this.readFile(filePath, { cache, encoding });
          results.push({ path: filePath, content });
        } catch (error) {
          results.push({ path: filePath, error: error as Error });
        }
      }
      return results;
    }

    // 并行读取（限制并发数）
    const limit = pLimit(concurrency);
    const tasks = paths.map(filePath =>
      limit(async () => {
        try {
          const content = await this.readFile(filePath, { cache, encoding });
          return { path: filePath, content };
        } catch (error) {
          return { path: filePath, error: error as Error };
        }
      })
    );

    return Promise.all(tasks);
  }

  /**
   * 读取文件（带缓存）
   */
  @Cacheable({
    namespace: 'file-content',
    ttl: 60000, // 1分钟
    keyGenerator: (path: string) => path,
  })
  async readFile(
    filePath: string,
    options: FileOperationOptions = {}
  ): Promise<string> {
    const { encoding = 'utf8', cache = true } = options;

    if (cache) {
      // 检查文件是否修改
      const stats = await fs.stat(filePath);
      const cached = this.fileCache.get(filePath);
      
      if (cached && cached.mtime === stats.mtime.getTime()) {
        this.logger.debug(`File cache hit: ${filePath}`);
        return cached.content;
      }
    }

    // 读取文件
    const content = await fs.readFile(filePath, encoding);
    
    // 更新缓存
    if (cache) {
      const stats = await fs.stat(filePath);
      this.fileCache.set(filePath, {
        content,
        mtime: stats.mtime.getTime(),
      });
    }

    return content;
  }

  /**
   * 批量写入文件
   */
  async batchWrite(
    files: Array<{ path: string; content: string }>,
    options: FileOperationOptions = {}
  ): Promise<void> {
    const { parallel = true, concurrency = 10 } = options;

    if (!parallel) {
      // 串行写入
      for (const file of files) {
        await this.writeFile(file.path, file.content);
      }
      return;
    }

    // 并行写入（限制并发数）
    const limit = pLimit(concurrency);
    const tasks = files.map(file =>
      limit(() => this.writeFile(file.path, file.content))
    );

    await Promise.all(tasks);
  }

  /**
   * 写入文件（清除缓存）
   */
  @CacheEvict({
    namespace: 'file-content',
    keyGenerator: (path: string) => path,
  })
  async writeFile(
    filePath: string,
    content: string,
    options: FileOperationOptions = {}
  ): Promise<void> {
    const { encoding = 'utf8' } = options;
    
    // 确保目录存在
    await fs.ensureDir(path.dirname(filePath));
    
    // 写入文件
    await fs.writeFile(filePath, content, encoding);
    
    // 清除缓存
    this.fileCache.delete(filePath);
  }

  /**
   * 批量复制文件
   */
  async batchCopy(
    pairs: Array<{ src: string; dest: string }>,
    options: { parallel?: boolean; concurrency?: number } = {}
  ): Promise<void> {
    const { parallel = true, concurrency = 10 } = options;

    if (!parallel) {
      for (const { src, dest } of pairs) {
        await fs.copy(src, dest);
      }
      return;
    }

    const limit = pLimit(concurrency);
    const tasks = pairs.map(({ src, dest }) =>
      limit(() => fs.copy(src, dest))
    );

    await Promise.all(tasks);
  }

  /**
   * 批量删除文件
   */
  async batchDelete(
    paths: string[],
    options: { parallel?: boolean; concurrency?: number } = {}
  ): Promise<void> {
    const { parallel = true, concurrency = 10 } = options;

    if (!parallel) {
      for (const filePath of paths) {
        await this.deleteFile(filePath);
      }
      return;
    }

    const limit = pLimit(concurrency);
    const tasks = paths.map(filePath =>
      limit(() => this.deleteFile(filePath))
    );

    await Promise.all(tasks);
  }

  /**
   * 删除文件（清除缓存）
   */
  @CacheEvict({
    namespace: 'file-content',
    keyGenerator: (path: string) => path,
  })
  async deleteFile(filePath: string): Promise<void> {
    await fs.remove(filePath);
    this.fileCache.delete(filePath);
  }

  /**
   * 递归查找文件
   */
  @Cacheable({
    namespace: 'file-search',
    ttl: 30000, // 30秒
  })
  async findFiles(
    directory: string,
    pattern: RegExp | string,
    options: { maxDepth?: number; excludeDirs?: string[] } = {}
  ): Promise<string[]> {
    const { maxDepth = 10, excludeDirs = ['node_modules', '.git', 'dist'] } = options;
    const results: string[] = [];

    async function search(dir: string, depth: number) {
      if (depth > maxDepth) return;

      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      const tasks = entries.map(async (entry) => {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          if (!excludeDirs.includes(entry.name)) {
            await search(fullPath, depth + 1);
          }
        } else if (entry.isFile()) {
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

  /**
   * 获取目录大小
   */
  @Cacheable({
    namespace: 'dir-size',
    ttl: 60000,
  })
  async getDirectorySize(directory: string): Promise<number> {
    let totalSize = 0;

    async function calculateSize(dir: string) {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      const tasks = entries.map(async (entry) => {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          await calculateSize(fullPath);
        } else if (entry.isFile()) {
          const stats = await fs.stat(fullPath);
          totalSize += stats.size;
        }
      });

      await Promise.all(tasks);
    }

    await calculateSize(directory);
    return totalSize;
  }

  /**
   * 清理旧文件
   */
  async cleanOldFiles(
    directory: string,
    maxAge: number,
    options: { dryRun?: boolean; excludePatterns?: RegExp[] } = {}
  ): Promise<string[]> {
    const { dryRun = false, excludePatterns = [] } = options;
    const now = Date.now();
    const filesToDelete: string[] = [];

    async function scan(dir: string) {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      const tasks = entries.map(async (entry) => {
        const fullPath = path.join(dir, entry.name);
        
        // 检查排除模式
        const excluded = excludePatterns.some(pattern => pattern.test(fullPath));
        if (excluded) return;
        
        if (entry.isDirectory()) {
          await scan(fullPath);
        } else if (entry.isFile()) {
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

  /**
   * 优化的JSON读取
   */
  @Cacheable({
    namespace: 'json-content',
    ttl: 60000,
  })
  async readJson<T = any>(filePath: string): Promise<T> {
    const content = await this.readFile(filePath);
    return JSON.parse(content);
  }

  /**
   * 优化的JSON写入
   */
  @CacheEvict({
    namespace: 'json-content',
    keyGenerator: (path: string) => path,
  })
  async writeJson(filePath: string, data: any, pretty: boolean = true): Promise<void> {
    const content = pretty
      ? JSON.stringify(data, null, 2)
      : JSON.stringify(data);
    
    await this.writeFile(filePath, content);
  }

  /**
   * 获取缓存统计
   */
  getCacheStats(): {
    fileCache: number;
    globalStats: any;
  } {
    return {
      fileCache: this.fileCache.size,
      globalStats: this.cache.getStats(),
    };
  }

  /**
   * 清理缓存
   */
  clearCache(): void {
    this.fileCache.clear();
    this.cache.clear('file-content');
    this.cache.clear('file-search');
    this.cache.clear('dir-size');
    this.cache.clear('json-content');
    this.logger.info('File cache cleared');
  }
}