/**
 * 全局异常过滤器
 */

import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { BaseException } from '../exceptions/base.exception';
import { ErrorSeverity } from '../types/error.types';
const chalk = require('chalk');

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    // CLI模式下的异常处理
    if (this.isCliContext()) {
      this.handleCliException(exception);
      return;
    }

    // HTTP模式下的异常处理（如果有API服务）
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    if (response && response.status) {
      const status = exception instanceof HttpException
        ? exception.getStatus()
        : 500;

      const errorResponse = this.formatHttpError(exception, request);
      response.status(status).json(errorResponse);
    } else {
      // 非HTTP上下文，使用CLI处理
      this.handleCliException(exception);
    }
  }

  /**
   * 判断是否为CLI上下文
   */
  private isCliContext(): boolean {
    // 在CLI模式下，通常没有HTTP上下文
    return !process.env.HTTP_SERVER_ENABLED;
  }

  /**
   * 处理CLI异常
   */
  private handleCliException(exception: unknown): void {
    // 处理自定义异常
    if (exception instanceof BaseException) {
      this.handleBaseException(exception);
      return;
    }

    // 处理Node.js系统错误
    if (this.isNodeError(exception)) {
      this.handleNodeError(exception as NodeJS.ErrnoException);
      return;
    }

    // 处理标准错误
    if (exception instanceof Error) {
      this.handleStandardError(exception);
      return;
    }

    // 处理未知错误
    this.handleUnknownError(exception);
  }

  /**
   * 处理基础异常
   */
  private handleBaseException(exception: BaseException): void {
    // 输出格式化的错误信息
    console.error(exception.toCliOutput());

    // 根据严重程度决定是否退出
    if (exception.severity === ErrorSeverity.FATAL) {
      console.error(chalk.red('\n⛔ Fatal error occurred. Exiting...'));
      process.exit(1);
    }
  }

  /**
   * 处理Node.js系统错误
   */
  private handleNodeError(error: NodeJS.ErrnoException): void {
    const errorMessages: Record<string, string> = {
      ENOENT: 'File or directory not found',
      EACCES: 'Permission denied',
      EEXIST: 'File or directory already exists',
      EISDIR: 'Expected a file but found a directory',
      ENOTDIR: 'Expected a directory but found a file',
      ENOTEMPTY: 'Directory is not empty',
      EMFILE: 'Too many open files',
      ENOSPC: 'No space left on device',
      EPERM: 'Operation not permitted',
    };

    const message = errorMessages[error.code || ''] || error.message;
    
    console.error(chalk.red(`\n✗ System Error: ${message}`));
    
    if (error.path) {
      console.error(chalk.gray(`   Path: ${error.path}`));
    }
    
    if (error.syscall) {
      console.error(chalk.gray(`   Operation: ${error.syscall}`));
    }

    if (process.env.NODE_ENV === 'development' && error.stack) {
      console.error(chalk.gray('\n   Stack trace:'));
      const stackLines = error.stack.split('\n').slice(1, 4);
      stackLines.forEach(line => {
        console.error(chalk.gray(`   ${line.trim()}`));
      });
    }
  }

  /**
   * 处理标准错误
   */
  private handleStandardError(error: Error): void {
    console.error(chalk.red(`\n✗ Error: ${error.message}`));
    
    if (process.env.NODE_ENV === 'development' && error.stack) {
      console.error(chalk.gray('\n   Stack trace:'));
      const stackLines = error.stack.split('\n').slice(1, 4);
      stackLines.forEach(line => {
        console.error(chalk.gray(`   ${line.trim()}`));
      });
    }
  }

  /**
   * 处理未知错误
   */
  private handleUnknownError(error: unknown): void {
    console.error(chalk.red('\n✗ An unexpected error occurred'));
    
    if (process.env.NODE_ENV === 'development') {
      console.error(chalk.gray('   Error details:'));
      console.error(chalk.gray(`   ${JSON.stringify(error, null, 2)}`));
    }
  }

  /**
   * 格式化HTTP错误响应
   */
  private formatHttpError(exception: unknown, request: any): any {
    if (exception instanceof BaseException) {
      return {
        ...exception.toResponse(),
        path: request?.url,
        timestamp: new Date().toISOString(),
      };
    }

    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      return {
        ...(typeof response === 'object' ? response : { message: response }),
        statusCode: exception.getStatus(),
        path: request?.url,
        timestamp: new Date().toISOString(),
      };
    }

    return {
      message: 'Internal server error',
      statusCode: 500,
      path: request?.url,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * 判断是否为Node.js错误
   */
  private isNodeError(error: unknown): error is NodeJS.ErrnoException {
    return error instanceof Error && 'code' in error && 'syscall' in error;
  }
}