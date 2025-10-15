/**
 * 日志配置
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  FATAL = 4,
  OFF = 5,
}

export interface LogContext {
  // 模块名称
  module?: string;
  // 方法名称
  method?: string;
  // 用户ID
  userId?: string;
  // 请求ID
  requestId?: string;
  // 追踪ID
  traceId?: string;
  // 执行时间（毫秒）
  duration?: number;
  // 额外元数据
  metadata?: Record<string, any>;
}

export interface LogEntry {
  // 时间戳
  timestamp: Date;
  // 日志级别
  level: LogLevel;
  // 日志消息
  message: string;
  // 上下文信息
  context?: LogContext;
  // 错误对象
  error?: Error;
  // 标签
  tags?: string[];
}

export interface LoggerConfig {
  // 最小日志级别
  level: LogLevel;
  // 是否启用彩色输出
  colors: boolean;
  // 是否启用时间戳
  timestamp: boolean;
  // 是否启用上下文
  context: boolean;
  // 日志文件路径
  filePath?: string;
  // 最大文件大小（字节）
  maxFileSize?: number;
  // 最大文件数量
  maxFiles?: number;
  // 是否启用JSON格式
  json: boolean;
  // 是否启用控制台输出
  console: boolean;
  // 是否启用文件输出
  file: boolean;
}

export const defaultLoggerConfig: LoggerConfig = {
  level: process.env.NODE_ENV === 'production' ? LogLevel.INFO : LogLevel.DEBUG,
  colors: process.env.NODE_ENV !== 'production',
  timestamp: true,
  context: true,
  json: process.env.NODE_ENV === 'production',
  console: true,
  file: process.env.NODE_ENV === 'production',
  filePath: 'logs/creatoria.log',
  maxFileSize: 10 * 1024 * 1024, // 10MB
  maxFiles: 5,
};

/**
 * 获取日志级别名称
 */
export function getLogLevelName(level: LogLevel): string {
  switch (level) {
    case LogLevel.DEBUG:
      return 'DEBUG';
    case LogLevel.INFO:
      return 'INFO';
    case LogLevel.WARN:
      return 'WARN';
    case LogLevel.ERROR:
      return 'ERROR';
    case LogLevel.FATAL:
      return 'FATAL';
    default:
      return 'UNKNOWN';
  }
}

/**
 * 解析日志级别
 */
export function parseLogLevel(level: string): LogLevel {
  switch (level.toUpperCase()) {
    case 'DEBUG':
      return LogLevel.DEBUG;
    case 'INFO':
      return LogLevel.INFO;
    case 'WARN':
    case 'WARNING':
      return LogLevel.WARN;
    case 'ERROR':
      return LogLevel.ERROR;
    case 'FATAL':
      return LogLevel.FATAL;
    case 'OFF':
      return LogLevel.OFF;
    default:
      return LogLevel.INFO;
  }
}