/**
 * 验证服务
 */

import { Injectable } from '@nestjs/common';
import { StringValidator } from './validators/string.validator';
import { NumberValidator } from './validators/number.validator';
import { PathValidator } from './validators/path.validator';
import { CustomValidator, ValidationResult, ValidationSchema } from './validators/custom.validator';
import { LoggerService } from '../logger/logger.service';
import { BaseException } from '../exceptions/base.exception';
import { ERROR_CODES } from '../constants/error-codes';

@Injectable()
export class ValidationService {
  constructor(
    private readonly logger: LoggerService,
  ) {}

  /**
   * 验证字符串
   */
  validateString(value: any, options: {
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    safe?: boolean;
    required?: boolean;
  } = {}): void {
    if (options.required && !StringValidator.isNotEmpty(value)) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_2000,
        { field: 'string' }
      );
    }
    
    if (value === undefined || value === null) {
      if (!options.required) return;
    }
    
    if (typeof value !== 'string') {
      throw new BaseException(
        ERROR_CODES.VALIDATION_2001,
        { expected: 'string', actual: typeof value }
      );
    }
    
    if (options.minLength !== undefined || options.maxLength !== undefined) {
      if (!StringValidator.isLength(value, options.minLength || 0, options.maxLength)) {
        throw new BaseException(
          ERROR_CODES.VALIDATION_2002,
          { min: options.minLength, max: options.maxLength }
        );
      }
    }
    
    if (options.pattern && !StringValidator.matches(value, options.pattern)) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_2003,
        { pattern: options.pattern.toString() }
      );
    }
    
    if (options.safe && !StringValidator.isSafe(value)) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_2004,
        { value }
      );
    }
  }

  /**
   * 验证数字
   */
  validateNumber(value: any, options: {
    min?: number;
    max?: number;
    integer?: boolean;
    positive?: boolean;
    required?: boolean;
  } = {}): void {
    if (options.required && (value === undefined || value === null)) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_2000,
        { field: 'number' }
      );
    }
    
    if (value === undefined || value === null) {
      if (!options.required) return;
    }
    
    if (!NumberValidator.isNumber(value)) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_2001,
        { expected: 'number', actual: typeof value }
      );
    }
    
    if (options.integer && !NumberValidator.isInteger(value)) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_2005,
        { value }
      );
    }
    
    if (options.positive && !NumberValidator.isPositive(value)) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_2006,
        { value }
      );
    }
    
    if (options.min !== undefined || options.max !== undefined) {
      if (!NumberValidator.isInRange(value, options.min || Number.MIN_SAFE_INTEGER, options.max || Number.MAX_SAFE_INTEGER)) {
        throw new BaseException(
          ERROR_CODES.VALIDATION_2007,
          { value, min: options.min, max: options.max }
        );
      }
    }
  }

  /**
   * 验证路径
   */
  async validatePath(value: any, options: {
    mustExist?: boolean;
    safe?: boolean;
    basePath?: string;
    required?: boolean;
  } = {}): Promise<void> {
    if (options.required && !value) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_2000,
        { field: 'path' }
      );
    }
    
    if (!value && !options.required) {
      return;
    }
    
    if (typeof value !== 'string') {
      throw new BaseException(
        ERROR_CODES.VALIDATION_2001,
        { expected: 'string', actual: typeof value }
      );
    }
    
    if (options.safe && !PathValidator.isSafePath(value, options.basePath)) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_2008,
        { path: value }
      );
    }
    
    if (options.mustExist && !await PathValidator.exists(value)) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_2009,
        { path: value }
      );
    }
  }

  /**
   * 验证邮箱
   */
  validateEmail(value: any): void {
    if (!StringValidator.isEmail(value)) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_2010,
        { value }
      );
    }
  }

  /**
   * 验证URL
   */
  validateURL(value: any): void {
    if (!StringValidator.isURL(value)) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_2011,
        { value }
      );
    }
  }

  /**
   * 验证端口
   */
  validatePort(value: any): void {
    if (!NumberValidator.isPort(value)) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_2012,
        { value }
      );
    }
  }

  /**
   * 验证模块名
   */
  validateModuleName(value: string): void {
    const result = CustomValidator.validateModuleName(value);
    if (!result.valid) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_2013,
        { errors: result.errors }
      );
    }
  }

  /**
   * 验证项目名
   */
  validateProjectName(value: string): void {
    const result = CustomValidator.validateProjectName(value);
    if (!result.valid) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_2014,
        { errors: result.errors }
      );
    }
  }

  /**
   * 验证数据库配置
   */
  validateDatabaseConfig(config: any): void {
    const result = CustomValidator.validateDatabaseConfig(config);
    if (!result.valid) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_2015,
        { errors: result.errors }
      );
    }
  }

  /**
   * 验证API配置
   */
  validateApiConfig(config: any): void {
    const result = CustomValidator.validateApiConfig(config);
    if (!result.valid) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_2016,
        { errors: result.errors }
      );
    }
  }

  /**
   * 验证文件上传
   */
  async validateFileUpload(file: {
    path: string;
    size: number;
    mimetype: string;
  }, options?: {
    maxSize?: number;
    allowedTypes?: string[];
    allowedExtensions?: string[];
  }): Promise<void> {
    const result = await CustomValidator.validateFileUpload(file, options);
    if (!result.valid) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_2017,
        { errors: result.errors }
      );
    }
  }

  /**
   * 验证CLI参数
   */
  validateCliArgs(args: string[]): void {
    const result = CustomValidator.validateCliArgs(args);
    if (!result.valid) {
      this.logger.warn('检测到危险的CLI参数', { args, errors: result.errors });
      throw new BaseException(
        ERROR_CODES.VALIDATION_2018,
        { errors: result.errors }
      );
    }
  }

  /**
   * 使用schema验证
   */
  async validateWithSchema(data: any, schema: ValidationSchema): Promise<void> {
    const result = await CustomValidator.validateWithSchema(data, schema);
    if (!result.valid) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_2019,
        { errors: result.errors }
      );
    }
  }

  /**
   * 清理字符串
   */
  sanitizeString(value: string): string {
    return StringValidator.sanitize(value);
  }

  /**
   * 清理数字
   */
  sanitizeNumber(value: any): number | null {
    return NumberValidator.sanitize(value);
  }

  /**
   * 清理路径
   */
  sanitizePath(value: string): string {
    return PathValidator.sanitize(value);
  }

  /**
   * 转义HTML
   */
  escapeHtml(value: string): string {
    return StringValidator.escapeHtml(value);
  }

  /**
   * 转义Shell命令
   */
  escapeShell(value: string): string {
    return StringValidator.escapeShell(value);
  }

  /**
   * 批量验证
   */
  async batchValidate(validations: Array<{
    value: any;
    validator: (value: any) => void | Promise<void>;
    field: string;
  }>): Promise<ValidationResult> {
    const errors: { field: string; message: string }[] = [];
    
    for (const validation of validations) {
      try {
        await validation.validator(validation.value);
      } catch (error) {
        if (error instanceof BaseException) {
          errors.push({
            field: validation.field,
            message: error.message
          });
        } else {
          errors.push({
            field: validation.field,
            message: error.message || '验证失败'
          });
        }
      }
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * 创建验证链
   */
  createValidationChain() {
    const validations: Array<() => void | Promise<void>> = [];
    const errors: { field: string; message: string }[] = [];
    
    const chain = {
      addValidation: (field: string, validator: () => void | Promise<void>) => {
        validations.push(async () => {
          try {
            await validator();
          } catch (error) {
            errors.push({
              field,
              message: error.message || '验证失败'
            });
          }
        });
        return chain;
      },
      
      validate: async (): Promise<ValidationResult> => {
        for (const validation of validations) {
          await validation();
        }
        
        return {
          valid: errors.length === 0,
          errors
        };
      }
    };
    
    return chain;
  }
}
