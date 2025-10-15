/**
 * 错误处理工具
 */

import * as fs from 'fs-extra';
import { BaseException } from '../exceptions/base.exception';
import { 
  ModuleNotFoundException,
  ModuleCopyFailedException,
  InvalidModuleMetadataException 
} from '../exceptions/module.exception';
import {
  ProjectNotFoundException,
  TemplateNotFoundException,
  BuildFailedException
} from '../exceptions/cli.exception';
import { ErrorCategory, ErrorSeverity } from '../types/error.types';
import { ErrorCodes } from '../constants/error-codes';

/**
 * 文件系统操作错误处理
 */
export class FileSystemErrorHandler {
  /**
   * 安全读取文件
   */
  static async safeReadFile(path: string): Promise<string | null> {
    try {
      return await fs.readFile(path, 'utf8');
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        throw BaseException.fromErrorCode(
          ErrorCodes.FS_FILE_NOT_FOUND,
          { path },
          {
            context: { filePath: path },
            suggestion: 'Check if the file exists and the path is correct',
          }
        );
      }
      
      if (error.code === 'EACCES') {
        throw BaseException.fromErrorCode(
          ErrorCodes.FS_PERMISSION_DENIED,
          { path },
          {
            context: { filePath: path },
            suggestion: 'Check file permissions',
          }
        );
      }

      throw new BaseException(`Failed to read file: ${error.message}`, {
        code: ErrorCodes.FS_READ_FAILED,
        category: ErrorCategory.FILESYSTEM,
        severity: ErrorSeverity.ERROR,
        context: { filePath: path },
        cause: error,
      });
    }
  }

  /**
   * 安全写入文件
   */
  static async safeWriteFile(path: string, content: string): Promise<void> {
    try {
      await fs.ensureDir(require('path').dirname(path));
      await fs.writeFile(path, content, 'utf8');
    } catch (error: any) {
      if (error.code === 'EACCES') {
        throw BaseException.fromErrorCode(
          ErrorCodes.FS_PERMISSION_DENIED,
          { path },
          {
            context: { filePath: path },
            suggestion: 'Check directory permissions',
          }
        );
      }

      if (error.code === 'ENOSPC') {
        throw new BaseException('No space left on device', {
          code: ErrorCodes.FS_WRITE_FAILED,
          category: ErrorCategory.FILESYSTEM,
          severity: ErrorSeverity.FATAL,
          context: { filePath: path },
          suggestion: 'Free up disk space and try again',
        });
      }

      throw new BaseException(`Failed to write file: ${error.message}`, {
        code: ErrorCodes.FS_WRITE_FAILED,
        category: ErrorCategory.FILESYSTEM,
        severity: ErrorSeverity.ERROR,
        context: { filePath: path },
        cause: error,
      });
    }
  }

  /**
   * 安全复制文件/目录
   */
  static async safeCopy(src: string, dest: string): Promise<void> {
    try {
      await fs.copy(src, dest, { overwrite: true });
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        throw BaseException.fromErrorCode(
          ErrorCodes.FS_FILE_NOT_FOUND,
          { path: src },
          {
            context: { filePath: src },
            suggestion: 'Check if the source file/directory exists',
          }
        );
      }

      throw new BaseException(`Failed to copy: ${error.message}`, {
        code: ErrorCodes.FS_WRITE_FAILED,
        category: ErrorCategory.FILESYSTEM,
        severity: ErrorSeverity.ERROR,
        context: { metadata: { source: src, destination: dest } },
        cause: error,
      });
    }
  }

  /**
   * 安全删除文件/目录
   */
  static async safeRemove(path: string): Promise<void> {
    try {
      await fs.remove(path);
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        // 文件不存在，不算错误
        return;
      }

      if (error.code === 'EACCES' || error.code === 'EPERM') {
        throw BaseException.fromErrorCode(
          ErrorCodes.FS_PERMISSION_DENIED,
          { path },
          {
            context: { filePath: path },
            suggestion: 'Check file/directory permissions',
          }
        );
      }

      throw new BaseException(`Failed to remove: ${error.message}`, {
        code: ErrorCodes.FS_DELETE_FAILED,
        category: ErrorCategory.FILESYSTEM,
        severity: ErrorSeverity.ERROR,
        context: { filePath: path },
        cause: error,
      });
    }
  }

  /**
   * 检查文件/目录是否存在
   */
  static async exists(path: string): Promise<boolean> {
    try {
      await fs.access(path);
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * JSON操作错误处理
 */
export class JsonErrorHandler {
  /**
   * 安全解析JSON
   */
  static safeParse<T = any>(content: string, source?: string): T {
    try {
      return JSON.parse(content);
    } catch (error: any) {
      const context = source ? { filePath: source } : undefined;
      
      throw new BaseException(`Invalid JSON format: ${error.message}`, {
        code: ErrorCodes.CONFIG_INVALID_FORMAT,
        category: ErrorCategory.CONFIGURATION,
        severity: ErrorSeverity.ERROR,
        context,
        suggestion: 'Check JSON syntax and ensure proper formatting',
        cause: error,
      });
    }
  }

  /**
   * 安全读取JSON文件
   */
  static async safeReadJson<T = any>(path: string): Promise<T> {
    const content = await FileSystemErrorHandler.safeReadFile(path);
    if (!content) {
      throw new BaseException('File is empty', {
        code: ErrorCodes.CONFIG_INVALID_FORMAT,
        category: ErrorCategory.CONFIGURATION,
        severity: ErrorSeverity.ERROR,
        context: { filePath: path },
      });
    }
    
    return this.safeParse<T>(content, path);
  }

  /**
   * 安全写入JSON文件
   */
  static async safeWriteJson(path: string, data: any, pretty: boolean = true): Promise<void> {
    try {
      const content = pretty 
        ? JSON.stringify(data, null, 2)
        : JSON.stringify(data);
      
      await FileSystemErrorHandler.safeWriteFile(path, content);
    } catch (error: any) {
      if (error instanceof BaseException) {
        throw error;
      }

      throw new BaseException(`Failed to write JSON: ${error.message}`, {
        code: ErrorCodes.CONFIG_SAVE_FAILED,
        category: ErrorCategory.CONFIGURATION,
        severity: ErrorSeverity.ERROR,
        context: { filePath: path },
        cause: error,
      });
    }
  }
}

/**
 * 验证错误处理
 */
export class ValidationErrorHandler {
  /**
   * 验证必需字段
   */
  static validateRequired(value: any, fieldName: string): void {
    if (value === undefined || value === null || value === '') {
      throw BaseException.fromErrorCode(
        ErrorCodes.VAL_REQUIRED_FIELD_MISSING,
        { field: fieldName },
        {
          category: ErrorCategory.VALIDATION,
          severity: ErrorSeverity.ERROR,
        }
      );
    }
  }

  /**
   * 验证字段格式
   */
  static validateFormat(value: string, pattern: RegExp, fieldName: string, expected: string): void {
    if (!pattern.test(value)) {
      throw BaseException.fromErrorCode(
        ErrorCodes.VAL_INVALID_FORMAT,
        { field: fieldName, expected },
        {
          category: ErrorCategory.VALIDATION,
          severity: ErrorSeverity.ERROR,
        }
      );
    }
  }

  /**
   * 验证数值范围
   */
  static validateRange(value: number, min: number, max: number, fieldName: string): void {
    if (value < min || value > max) {
      throw BaseException.fromErrorCode(
        ErrorCodes.VAL_OUT_OF_RANGE,
        { field: fieldName, value },
        {
          category: ErrorCategory.VALIDATION,
          severity: ErrorSeverity.ERROR,
          suggestion: `Value should be between ${min} and ${max}`,
        }
      );
    }
  }
}

/**
 * 错误恢复处理
 */
export class ErrorRecovery {
  /**
   * 带默认值的执行
   */
  static async withDefault<T>(
    fn: () => Promise<T>,
    defaultValue: T,
    logError: boolean = false
  ): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      if (logError) {
        console.error('Error occurred, using default value:', error);
      }
      return defaultValue;
    }
  }

  /**
   * 带重试的执行
   */
  static async withRetry<T>(
    fn: () => Promise<T>,
    maxAttempts: number = 3,
    delay: number = 1000
  ): Promise<T> {
    let lastError: any;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        
        if (attempt < maxAttempts) {
          console.log(`Attempt ${attempt} failed, retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError;
  }

  /**
   * 带超时的执行
   */
  static async withTimeout<T>(
    fn: () => Promise<T>,
    timeout: number,
    errorMessage: string = 'Operation timed out'
  ): Promise<T> {
    return Promise.race([
      fn(),
      new Promise<T>((_, reject) => 
        setTimeout(() => reject(new Error(errorMessage)), timeout)
      ),
    ]);
  }
}