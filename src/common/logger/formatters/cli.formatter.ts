/**
 * CLI日志格式化器
 */

import { LogEntry, LogLevel, getLogLevelName } from '../logger.config';
const chalk = require('chalk');

export class CliFormatter {
  private colors = {
    [LogLevel.DEBUG]: chalk.gray,
    [LogLevel.INFO]: chalk.blue,
    [LogLevel.WARN]: chalk.yellow,
    [LogLevel.ERROR]: chalk.red,
    [LogLevel.FATAL]: chalk.bgRed.white,
  };

  private icons = {
    [LogLevel.DEBUG]: '🔍',
    [LogLevel.INFO]: 'ℹ️',
    [LogLevel.WARN]: '⚠️',
    [LogLevel.ERROR]: '❌',
    [LogLevel.FATAL]: '💀',
  };

  constructor(private useColors: boolean = true, private useIcons: boolean = true) {}

  /**
   * 格式化日志条目
   */
  format(entry: LogEntry): string {
    const parts: string[] = [];
    
    // 时间戳
    const timestamp = this.formatTimestamp(entry.timestamp);
    if (timestamp) {
      parts.push(this.useColors ? chalk.gray(timestamp) : timestamp);
    }

    // 级别
    const level = this.formatLevel(entry.level);
    parts.push(level);

    // 上下文
    if (entry.context) {
      const context = this.formatContext(entry.context);
      if (context) {
        parts.push(this.useColors ? chalk.cyan(context) : context);
      }
    }

    // 消息
    parts.push(this.formatMessage(entry.message, entry.level));

    // 标签
    if (entry.tags && entry.tags.length > 0) {
      const tags = entry.tags.map(tag => `#${tag}`).join(' ');
      parts.push(this.useColors ? chalk.magenta(tags) : tags);
    }

    // 错误详情
    let result = parts.join(' ');
    if (entry.error) {
      result += '\n' + this.formatError(entry.error);
    }

    return result;
  }

  /**
   * 格式化时间戳
   */
  private formatTimestamp(timestamp: Date): string {
    const hours = timestamp.getHours().toString().padStart(2, '0');
    const minutes = timestamp.getMinutes().toString().padStart(2, '0');
    const seconds = timestamp.getSeconds().toString().padStart(2, '0');
    const ms = timestamp.getMilliseconds().toString().padStart(3, '0');
    
    return `[${hours}:${minutes}:${seconds}.${ms}]`;
  }

  /**
   * 格式化日志级别
   */
  private formatLevel(level: LogLevel): string {
    const levelName = getLogLevelName(level).padEnd(5);
    const icon = this.useIcons ? this.icons[level] + ' ' : '';
    
    if (this.useColors) {
      const colorFn = this.colors[level];
      return icon + colorFn(levelName);
    }
    
    return icon + levelName;
  }

  /**
   * 格式化上下文
   */
  private formatContext(context: any): string {
    const parts: string[] = [];
    
    if (context.module) {
      parts.push(context.module);
    }
    
    if (context.method) {
      parts.push(context.method);
    }
    
    if (parts.length === 0 && context.metadata) {
      // 如果没有module/method，尝试从metadata中提取有用信息
      if (context.metadata.command) {
        parts.push(context.metadata.command);
      }
    }
    
    return parts.length > 0 ? `[${parts.join('.')}]` : '';
  }

  /**
   * 格式化消息
   */
  private formatMessage(message: string, level: LogLevel): string {
    if (!this.useColors) {
      return message;
    }
    
    const colorFn = this.colors[level];
    return colorFn ? colorFn(message) : message;
  }

  /**
   * 格式化错误
   */
  private formatError(error: Error): string {
    const lines: string[] = [];
    
    // 错误名称和消息
    const errorHeader = `  ${error.name}: ${error.message}`;
    lines.push(this.useColors ? chalk.red(errorHeader) : errorHeader);
    
    // 堆栈跟踪（只在开发环境显示）
    if (process.env.NODE_ENV !== 'production' && error.stack) {
      const stackLines = error.stack.split('\n').slice(1, 4);
      stackLines.forEach(line => {
        const trimmed = line.trim();
        lines.push(this.useColors ? chalk.gray(`  ${trimmed}`) : `  ${trimmed}`);
      });
    }
    
    return lines.join('\n');
  }
}