/**
 * 命令注册表
 */

import { Type } from '@nestjs/common';
import { LoggerService } from '../../common/logger/logger.service';

export interface CommandMetadata {
  name: string;
  description: string;
  modulePath?: string;
  className?: string;
  instance?: any;
  loaded: boolean;
  loadTime?: number;
}

export class CommandRegistry {
  private static instance: CommandRegistry;
  private commands: Map<string, CommandMetadata> = new Map();
  private logger = new LoggerService('CommandRegistry');

  private constructor() {}

  /**
   * 获取单例实例
   */
  static getInstance(): CommandRegistry {
    if (!CommandRegistry.instance) {
      CommandRegistry.instance = new CommandRegistry();
    }
    return CommandRegistry.instance;
  }

  /**
   * 注册命令
   */
  register(
    name: string,
    description: string,
    modulePath?: string,
    className?: string
  ): void {
    if (this.commands.has(name)) {
      this.logger.warn(`Command '${name}' already registered, overwriting`);
    }

    this.commands.set(name, {
      name,
      description,
      modulePath,
      className,
      loaded: false,
    });

    this.logger.debug(`Registered command: ${name}`, {
      metadata: { modulePath, className },
    });
  }

  /**
   * 注册已实例化的命令
   */
  registerInstance(name: string, description: string, instance: any): void {
    this.commands.set(name, {
      name,
      description,
      instance,
      loaded: true,
      loadTime: 0,
    });

    this.logger.debug(`Registered command instance: ${name}`);
  }

  /**
   * 获取命令元数据
   */
  getCommand(name: string): CommandMetadata | undefined {
    return this.commands.get(name);
  }

  /**
   * 获取所有命令
   */
  getAllCommands(): CommandMetadata[] {
    return Array.from(this.commands.values());
  }

  /**
   * 获取已加载的命令
   */
  getLoadedCommands(): CommandMetadata[] {
    return Array.from(this.commands.values()).filter(cmd => cmd.loaded);
  }

  /**
   * 更新命令实例
   */
  updateInstance(name: string, instance: any, loadTime: number): void {
    const command = this.commands.get(name);
    if (command) {
      command.instance = instance;
      command.loaded = true;
      command.loadTime = loadTime;
      
      this.logger.debug(`Loaded command: ${name}`, {
        metadata: { loadTime: `${loadTime}ms` },
      });
    }
  }

  /**
   * 清除所有注册
   */
  clear(): void {
    this.commands.clear();
  }

  /**
   * 获取统计信息
   */
  getStats(): {
    total: number;
    loaded: number;
    totalLoadTime: number;
    averageLoadTime: number;
  } {
    const commands = Array.from(this.commands.values());
    const loaded = commands.filter(cmd => cmd.loaded);
    const totalLoadTime = loaded.reduce((sum, cmd) => sum + (cmd.loadTime || 0), 0);

    return {
      total: commands.length,
      loaded: loaded.length,
      totalLoadTime,
      averageLoadTime: loaded.length > 0 ? totalLoadTime / loaded.length : 0,
    };
  }
}