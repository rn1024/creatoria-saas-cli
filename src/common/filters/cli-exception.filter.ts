/**
 * CLI专用异常过滤器
 */

import { BaseException } from '../exceptions/base.exception';
import { ErrorSeverity } from '../types/error.types';
const chalk = require('chalk');

export class CliExceptionHandler {
  private static instance: CliExceptionHandler;
  private exitOnError: boolean = true;
  private verboseMode: boolean = false;

  private constructor() {
    this.setupProcessHandlers();
  }

  /**
   * 获取单例实例
   */
  static getInstance(): CliExceptionHandler {
    if (!CliExceptionHandler.instance) {
      CliExceptionHandler.instance = new CliExceptionHandler();
    }
    return CliExceptionHandler.instance;
  }

  /**
   * 设置是否在错误时退出
   */
  setExitOnError(exit: boolean): void {
    this.exitOnError = exit;
  }

  /**
   * 设置详细模式
   */
  setVerboseMode(verbose: boolean): void {
    this.verboseMode = verbose;
  }

  /**
   * 处理异常
   */
  handle(error: unknown): void {
    // 清除可能的进度指示器
    this.clearProgress();

    // 处理不同类型的错误
    if (error instanceof BaseException) {
      this.handleBaseException(error);
    } else if (error instanceof Error) {
      this.handleError(error);
    } else {
      this.handleUnknown(error);
    }
  }

  /**
   * 处理异步函数
   */
  async handleAsync<T>(fn: () => Promise<T>): Promise<T | undefined> {
    try {
      return await fn();
    } catch (error) {
      this.handle(error);
      return undefined;
    }
  }

  /**
   * 包装命令处理器
   */
  wrapCommand<T extends (...args: any[]) => any>(
    handler: T
  ): (...args: Parameters<T>) => Promise<ReturnType<T> | void> {
    return async (...args: Parameters<T>) => {
      try {
        return await handler(...args);
      } catch (error) {
        this.handle(error);
      }
    };
  }

  /**
   * 设置进程级错误处理
   */
  private setupProcessHandlers(): void {
    // 未捕获的异常
    process.on('uncaughtException', (error: Error) => {
      console.error(chalk.red('\n⛔ Uncaught Exception:'));
      this.handleError(error);
      process.exit(1);
    });

    // 未处理的Promise拒绝
    process.on('unhandledRejection', (reason: unknown, promise: Promise<any>) => {
      console.error(chalk.red('\n⛔ Unhandled Promise Rejection:'));
      this.handle(reason);
      if (this.exitOnError) {
        process.exit(1);
      }
    });

    // 进程警告
    process.on('warning', (warning: Error) => {
      console.warn(chalk.yellow('\n⚠️  Warning:'));
      console.warn(chalk.yellow(`   ${warning.name}: ${warning.message}`));
      if (this.verboseMode && warning.stack) {
        console.warn(chalk.gray(warning.stack));
      }
    });

    // 优雅退出
    process.on('SIGINT', () => {
      console.log(chalk.yellow('\n\n👋 Interrupted by user'));
      this.cleanup();
      process.exit(0);
    });

    process.on('SIGTERM', () => {
      console.log(chalk.yellow('\n\n🛑 Termination signal received'));
      this.cleanup();
      process.exit(0);
    });
  }

  /**
   * 处理BaseException
   */
  private handleBaseException(exception: BaseException): void {
    // 输出错误信息
    exception.log();

    // 显示错误恢复建议
    if (exception.suggestion && !exception.isRecoverable()) {
      console.log(chalk.cyan(`\n💡 Tip: ${exception.suggestion}`));
    }

    // 根据严重程度决定是否退出
    if (exception.severity === ErrorSeverity.FATAL || 
        (this.exitOnError && exception.severity === ErrorSeverity.ERROR)) {
      this.exitWithError(exception.severity === ErrorSeverity.FATAL ? 1 : 2);
    }
  }

  /**
   * 处理标准Error
   */
  private handleError(error: Error): void {
    console.error(chalk.red(`\n✗ ${error.name}: ${error.message}`));

    // 特殊处理某些错误类型
    if (error.name === 'SyntaxError') {
      console.error(chalk.yellow('   This might be a configuration or code syntax issue.'));
    } else if (error.name === 'TypeError') {
      console.error(chalk.yellow('   This might be a type mismatch or null reference issue.'));
    }

    // 在详细模式或开发环境下显示堆栈
    if ((this.verboseMode || process.env.NODE_ENV === 'development') && error.stack) {
      console.error(chalk.gray('\n   Stack trace:'));
      const stackLines = error.stack.split('\n').slice(1);
      stackLines.forEach(line => {
        console.error(chalk.gray(`   ${line.trim()}`));
      });
    }

    if (this.exitOnError) {
      this.exitWithError(1);
    }
  }

  /**
   * 处理未知错误
   */
  private handleUnknown(error: unknown): void {
    console.error(chalk.red('\n✗ An unexpected error occurred'));
    
    if (this.verboseMode || process.env.NODE_ENV === 'development') {
      console.error(chalk.gray('   Error details:'));
      try {
        console.error(chalk.gray(`   ${JSON.stringify(error, null, 2)}`));
      } catch {
        console.error(chalk.gray(`   ${String(error)}`));
      }
    }

    if (this.exitOnError) {
      this.exitWithError(1);
    }
  }

  /**
   * 清除进度指示器
   */
  private clearProgress(): void {
    // 清除可能存在的进度条或spinner
    if (process.stdout.clearLine) {
      process.stdout.clearLine(0);
      process.stdout.cursorTo(0);
    }
  }

  /**
   * 清理资源
   */
  private cleanup(): void {
    // 这里可以添加清理逻辑，如关闭数据库连接等
    this.clearProgress();
  }

  /**
   * 退出程序
   */
  private exitWithError(code: number = 1): void {
    this.cleanup();
    
    // 显示帮助信息
    if (code !== 0) {
      console.log(chalk.gray('\nFor more information, run with --verbose flag'));
      console.log(chalk.gray('Report issues at: https://github.com/creatoria/cli/issues'));
    }
    
    process.exit(code);
  }
}

// 导出单例实例
export const cliExceptionHandler = CliExceptionHandler.getInstance();