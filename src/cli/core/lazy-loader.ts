/**
 * 命令懒加载器
 */

import { Type } from '@nestjs/common';
import { CommandRegistry } from './command-registry';
import { LoggerService } from '../../common/logger/logger.service';
import { Performance } from '../../common/decorators/logger.decorator';
import { BaseException } from '../../common/exceptions/base.exception';
import { ErrorCategory, ErrorSeverity } from '../../common/types/error.types';
import * as path from 'path';

export class LazyLoader {
  private static instance: LazyLoader;
  private registry: CommandRegistry;
  private logger = new LoggerService('LazyLoader');
  private cache: Map<string, any> = new Map();

  private constructor() {
    this.registry = CommandRegistry.getInstance();
  }

  /**
   * 获取单例实例
   */
  static getInstance(): LazyLoader {
    if (!LazyLoader.instance) {
      LazyLoader.instance = new LazyLoader();
    }
    return LazyLoader.instance;
  }

  /**
   * 懒加载命令
   */
  @Performance(100) // 警告超过100ms的加载
  async loadCommand(name: string): Promise<any> {
    // 检查缓存
    if (this.cache.has(name)) {
      this.logger.debug(`Loading command from cache: ${name}`);
      return this.cache.get(name);
    }

    const metadata = this.registry.getCommand(name);
    if (!metadata) {
      throw new BaseException(`Command '${name}' not found`, {
        code: 'CLI_4000',
        category: ErrorCategory.BUSINESS,
        severity: ErrorSeverity.ERROR,
      });
    }

    // 如果已有实例，直接返回
    if (metadata.instance) {
      this.cache.set(name, metadata.instance);
      return metadata.instance;
    }

    // 动态加载模块
    if (!metadata.modulePath || !metadata.className) {
      throw new BaseException(`Command '${name}' missing module information`, {
        code: 'CLI_4001',
        category: ErrorCategory.CONFIGURATION,
        severity: ErrorSeverity.ERROR,
      });
    }

    const startTime = Date.now();

    try {
      // 动态导入模块
      const module = await this.dynamicImport(metadata.modulePath);
      
      // 获取命令类
      const CommandClass = module[metadata.className];
      if (!CommandClass) {
        throw new Error(`Class '${metadata.className}' not found in module`);
      }

      // 创建实例
      const instance = new CommandClass();
      
      const loadTime = Date.now() - startTime;
      
      // 更新注册表
      this.registry.updateInstance(name, instance, loadTime);
      
      // 缓存实例
      this.cache.set(name, instance);
      
      this.logger.info(`Lazy loaded command: ${name} (${loadTime}ms)`);
      
      return instance;
    } catch (error) {
      const loadTime = Date.now() - startTime;
      
      throw new BaseException(`Failed to load command '${name}'`, {
        code: 'CLI_4002',
        category: ErrorCategory.SYSTEM,
        severity: ErrorSeverity.ERROR,
        context: {
          module: 'LazyLoader',
          method: 'loadCommand',
          metadata: {
            command: name,
            modulePath: metadata.modulePath,
            className: metadata.className,
            loadTime,
          },
        },
        cause: error as Error,
      });
    }
  }

  /**
   * 动态导入模块
   */
  private async dynamicImport(modulePath: string): Promise<any> {
    // 处理相对路径
    if (modulePath.startsWith('.')) {
      modulePath = path.resolve(__dirname, modulePath);
    }

    try {
      // 使用动态import
      const module = await import(modulePath);
      return module;
    } catch (error) {
      // 尝试require（用于CommonJS模块）
      try {
        return require(modulePath);
      } catch (requireError) {
        throw error; // 抛出原始import错误
      }
    }
  }

  /**
   * 预加载命令
   */
  async preloadCommands(names: string[]): Promise<void> {
    this.logger.info(`Preloading ${names.length} commands`);
    
    const startTime = Date.now();
    const results = await Promise.allSettled(
      names.map(name => this.loadCommand(name))
    );
    
    const loadTime = Date.now() - startTime;
    const succeeded = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;
    
    this.logger.info(`Preloading complete: ${succeeded} succeeded, ${failed} failed (${loadTime}ms)`);
    
    // 记录失败的命令
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        this.logger.error(`Failed to preload command '${names[index]}'`, result.reason);
      }
    });
  }

  /**
   * 清除缓存
   */
  clearCache(): void {
    this.cache.clear();
    this.logger.debug('Command cache cleared');
  }

  /**
   * 获取缓存统计
   */
  getCacheStats(): {
    size: number;
    commands: string[];
  } {
    return {
      size: this.cache.size,
      commands: Array.from(this.cache.keys()),
    };
  }

  /**
   * 热重载命令
   */
  async reloadCommand(name: string): Promise<any> {
    // 清除缓存
    this.cache.delete(name);
    
    // 清除require缓存（如果是CommonJS模块）
    const metadata = this.registry.getCommand(name);
    if (metadata?.modulePath) {
      const resolvedPath = path.resolve(__dirname, metadata.modulePath);
      delete require.cache[require.resolve(resolvedPath)];
    }
    
    // 重新加载
    return this.loadCommand(name);
  }
}