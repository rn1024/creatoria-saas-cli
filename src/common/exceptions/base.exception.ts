/**
 * 基础异常类
 */

import { 
  ErrorCategory, 
  ErrorSeverity, 
  ErrorContext, 
  ErrorResponse,
  ErrorOptions 
} from '../types/error.types';
import { ErrorCode, formatErrorMessage } from '../constants/error-codes';
const chalk = require('chalk');

export class BaseException extends Error {
  public readonly code: string;
  public readonly category: ErrorCategory;
  public readonly severity: ErrorSeverity;
  public context?: ErrorContext;  // Make context mutable
  public readonly suggestion?: string;
  public readonly cause?: Error;
  public readonly timestamp: Date;

  constructor(
    message: string,
    options: ErrorOptions = {}
  ) {
    super(message);
    
    this.name = this.constructor.name;
    this.code = options.code || 'UNKNOWN';
    this.category = options.category || ErrorCategory.SYSTEM;
    this.severity = options.severity || ErrorSeverity.ERROR;
    this.context = options.context;
    this.suggestion = options.suggestion;
    this.cause = options.cause;
    this.timestamp = new Date();
    
    // 保持原型链
    Object.setPrototypeOf(this, new.target.prototype);
    
    // 捕获堆栈跟踪
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * 从错误代码创建异常
   */
  static fromErrorCode(
    code: ErrorCode,
    params?: Record<string, any>,
    options: ErrorOptions = {}
  ): BaseException {
    const message = formatErrorMessage(code, params);
    return new BaseException(message, {
      ...options,
      code,
    });
  }

  /**
   * 转换为错误响应对象
   */
  toResponse(): ErrorResponse {
    return {
      code: this.code,
      message: this.message,
      category: this.category,
      severity: this.severity,
      context: this.context,
      suggestion: this.suggestion,
      stack: process.env.NODE_ENV === 'development' ? this.stack : undefined,
    };
  }

  /**
   * 格式化错误消息用于CLI输出
   */
  toCliOutput(): string {
    const lines: string[] = [];
    
    // 根据严重程度选择颜色
    const colorFn = this.getColorFunction();
    
    // 错误标题
    lines.push(colorFn(`\n${this.getSeverityIcon()} ${this.name}: ${this.message}`));
    
    // 错误代码
    if (this.code !== 'UNKNOWN') {
      lines.push(chalk.gray(`   Code: ${this.code}`));
    }
    
    // 上下文信息
    if (this.context) {
      if (this.context.module) {
        lines.push(chalk.gray(`   Module: ${this.context.module}`));
      }
      if (this.context.method) {
        lines.push(chalk.gray(`   Method: ${this.context.method}`));
      }
      if (this.context.filePath) {
        lines.push(chalk.gray(`   File: ${this.context.filePath}`));
      }
      if (this.context.command) {
        lines.push(chalk.gray(`   Command: ${this.context.command}`));
      }
    }
    
    // 建议
    if (this.suggestion) {
      lines.push(chalk.cyan(`\n   💡 Suggestion: ${this.suggestion}`));
    }
    
    // 原因
    if (this.cause && this.cause.message) {
      lines.push(chalk.gray(`\n   Caused by: ${this.cause.message}`));
    }
    
    // 开发环境显示堆栈
    if (process.env.NODE_ENV === 'development' && this.stack) {
      lines.push(chalk.gray('\n   Stack trace:'));
      const stackLines = this.stack.split('\n').slice(1, 4);
      stackLines.forEach(line => {
        lines.push(chalk.gray(`   ${line.trim()}`));
      });
    }
    
    return lines.join('\n');
  }

  /**
   * 获取严重程度对应的颜色函数
   */
  private getColorFunction() {
    switch (this.severity) {
      case ErrorSeverity.FATAL:
        return chalk.red;
      case ErrorSeverity.ERROR:
        return chalk.red;
      case ErrorSeverity.WARNING:
        return chalk.yellow;
      case ErrorSeverity.INFO:
        return chalk.blue;
      default:
        return chalk.white;
    }
  }

  /**
   * 获取严重程度对应的图标
   */
  private getSeverityIcon(): string {
    switch (this.severity) {
      case ErrorSeverity.FATAL:
        return '❌';
      case ErrorSeverity.ERROR:
        return '✗';
      case ErrorSeverity.WARNING:
        return '⚠️';
      case ErrorSeverity.INFO:
        return 'ℹ️';
      default:
        return '•';
    }
  }

  /**
   * 判断是否为可恢复错误
   */
  isRecoverable(): boolean {
    return this.severity !== ErrorSeverity.FATAL;
  }

  /**
   * 记录错误到日志
   */
  log(): void {
    console.error(this.toCliOutput());
  }
}