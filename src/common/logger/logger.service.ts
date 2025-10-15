/**
 * 日志服务
 */

import { Injectable, Scope } from '@nestjs/common';
import {
  LogLevel,
  LogContext,
  LogEntry,
  LoggerConfig,
  defaultLoggerConfig,
  parseLogLevel,
} from './logger.config';
import { ConsoleTransport } from './transports/console.transport';
import { FileTransport } from './transports/file.transport';

@Injectable({ scope: Scope.TRANSIENT })
export class LoggerService {
  private config: LoggerConfig;
  private context?: LogContext;
  private consoleTransport?: ConsoleTransport;
  private fileTransport?: FileTransport;
  private static globalInstance?: LoggerService;

  constructor(context?: string | LogContext) {
    this.config = this.loadConfig();
    
    if (typeof context === 'string') {
      this.context = { module: context };
    } else {
      this.context = context;
    }

    this.initializeTransports();
  }

  /**
   * 获取全局实例
   */
  static getGlobalInstance(): LoggerService {
    if (!LoggerService.globalInstance) {
      LoggerService.globalInstance = new LoggerService('Global');
    }
    return LoggerService.globalInstance;
  }

  /**
   * 加载配置
   */
  private loadConfig(): LoggerConfig {
    const config = { ...defaultLoggerConfig };

    // 从环境变量覆盖配置
    if (process.env.LOG_LEVEL) {
      config.level = parseLogLevel(process.env.LOG_LEVEL);
    }

    if (process.env.LOG_FILE) {
      config.filePath = process.env.LOG_FILE;
    }

    if (process.env.LOG_JSON === 'true') {
      config.json = true;
    }

    if (process.env.LOG_NO_COLOR === 'true') {
      config.colors = false;
    }

    return config;
  }

  /**
   * 初始化传输器
   */
  private initializeTransports(): void {
    if (this.config.console) {
      this.consoleTransport = new ConsoleTransport(
        this.config.colors,
        !this.config.json
      );
    }

    if (this.config.file && this.config.filePath) {
      this.fileTransport = new FileTransport(
        this.config.filePath,
        this.config.maxFileSize,
        this.config.maxFiles
      );
    }
  }

  /**
   * 设置上下文
   */
  setContext(context: string | LogContext): this {
    if (typeof context === 'string') {
      this.context = { module: context };
    } else {
      this.context = context;
    }
    return this;
  }

  /**
   * 添加上下文
   */
  addContext(context: Partial<LogContext>): this {
    this.context = { ...this.context, ...context };
    return this;
  }

  /**
   * 调试日志
   */
  debug(message: string, context?: LogContext): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  /**
   * 信息日志
   */
  info(message: string, context?: LogContext): void {
    this.log(LogLevel.INFO, message, context);
  }

  /**
   * 警告日志
   */
  warn(message: string, context?: LogContext): void {
    this.log(LogLevel.WARN, message, context);
  }

  /**
   * 错误日志
   */
  error(message: string, error?: Error | string, context?: LogContext): void {
    const errorObj = typeof error === 'string' ? new Error(error) : error;
    this.log(LogLevel.ERROR, message, context, errorObj);
  }

  /**
   * 致命错误日志
   */
  fatal(message: string, error?: Error | string, context?: LogContext): void {
    const errorObj = typeof error === 'string' ? new Error(error) : error;
    this.log(LogLevel.FATAL, message, context, errorObj);
  }

  /**
   * 写入日志
   */
  private log(
    level: LogLevel,
    message: string,
    context?: LogContext,
    error?: Error
  ): void {
    // 检查日志级别
    if (level < this.config.level) {
      return;
    }

    // 创建日志条目
    const entry: LogEntry = {
      timestamp: new Date(),
      level,
      message,
      context: { ...this.context, ...context },
      error,
    };

    // 写入传输器
    if (this.consoleTransport) {
      this.consoleTransport.write(entry);
    }

    if (this.fileTransport) {
      this.fileTransport.write(entry);
    }
  }

  /**
   * 记录方法执行时间
   */
  async time<T>(
    label: string,
    fn: () => Promise<T> | T,
    context?: LogContext
  ): Promise<T> {
    const start = Date.now();
    
    try {
      const result = await fn();
      const duration = Date.now() - start;
      
      this.debug(`${label} completed`, {
        ...context,
        duration,
      });
      
      return result;
    } catch (error) {
      const duration = Date.now() - start;
      
      this.error(`${label} failed`, error as Error, {
        ...context,
        duration,
      });
      
      throw error;
    }
  }

  /**
   * 创建子日志器
   */
  child(context: string | LogContext): LoggerService {
    const childContext = typeof context === 'string'
      ? { module: context }
      : context;
    
    return new LoggerService({
      ...this.context,
      ...childContext,
    });
  }

  /**
   * 刷新所有传输器
   */
  flush(): void {
    if (this.consoleTransport) {
      this.consoleTransport.flush();
    }

    if (this.fileTransport) {
      this.fileTransport.flush();
    }
  }

  /**
   * 关闭日志服务
   */
  close(): void {
    this.flush();
    
    if (this.fileTransport) {
      this.fileTransport.close();
    }
  }
}

/**
 * 全局日志实例
 */
export const logger = LoggerService.getGlobalInstance();