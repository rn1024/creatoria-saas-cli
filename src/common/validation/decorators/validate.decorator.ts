/**
 * 验证装饰器
 */

import { BadRequestException } from '@nestjs/common';
import { StringValidator } from '../validators/string.validator';
import { NumberValidator } from '../validators/number.validator';
import { PathValidator } from '../validators/path.validator';
import { CustomValidator, ValidationResult } from '../validators/custom.validator';
import { BaseException } from '../../exceptions/base.exception';
import { ERROR_CODES } from '../../constants/error-codes';

/**
 * 参数验证装饰器
 */
export function Validate(
  validator: (value: any) => boolean | Promise<boolean> | ValidationResult | Promise<ValidationResult>,
  errorMessage?: string
) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      for (const arg of args) {
        const result = await validator(arg);
        
        if (typeof result === 'boolean') {
          if (!result) {
            throw new BadRequestException(errorMessage || 'Validation failed');
          }
        } else {
          if (!result.valid) {
            const messages = result.errors.map(e => `${e.field}: ${e.message}`).join(', ');
            throw new BadRequestException(errorMessage || messages);
          }
        }
      }
      
      return method.apply(this, args);
    };
    
    return descriptor;
  };
}

/**
 * 字符串验证装饰器
 */
export function ValidateString(options: {
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  safe?: boolean;
}) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    
    descriptor.value = function (...args: any[]) {
      const [value] = args;
      
      if (typeof value !== 'string') {
        throw new BaseException(
          ERROR_CODES.VALIDATION_2001,
          { field: propertyName, expected: 'string', actual: typeof value }
        );
      }
      
      if (options.minLength !== undefined || options.maxLength !== undefined) {
        if (!StringValidator.isLength(value, options.minLength || 0, options.maxLength)) {
          throw new BaseException(
            ERROR_CODES.VALIDATION_2002,
            { field: propertyName, min: options.minLength, max: options.maxLength }
          );
        }
      }
      
      if (options.pattern && !StringValidator.matches(value, options.pattern)) {
        throw new BaseException(
          ERROR_CODES.VALIDATION_2003,
          { field: propertyName, pattern: options.pattern.toString() }
        );
      }
      
      if (options.safe && !StringValidator.isSafe(value)) {
        throw new BaseException(
          ERROR_CODES.VALIDATION_2004,
          { field: propertyName }
        );
      }
      
      return method.apply(this, args);
    };
    
    return descriptor;
  };
}

/**
 * 数字验证装饰器
 */
export function ValidateNumber(options: {
  min?: number;
  max?: number;
  integer?: boolean;
  positive?: boolean;
}) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    
    descriptor.value = function (...args: any[]) {
      const [value] = args;
      
      if (!NumberValidator.isNumber(value)) {
        throw new BaseException(
          ERROR_CODES.VALIDATION_2001,
          { field: propertyName, expected: 'number', actual: typeof value }
        );
      }
      
      const num = Number(value);
      
      if (options.integer && !NumberValidator.isInteger(value)) {
        throw new BaseException(
          ERROR_CODES.VALIDATION_2005,
          { field: propertyName }
        );
      }
      
      if (options.positive && !NumberValidator.isPositive(value)) {
        throw new BaseException(
          ERROR_CODES.VALIDATION_2006,
          { field: propertyName }
        );
      }
      
      if (options.min !== undefined || options.max !== undefined) {
        if (!NumberValidator.isInRange(value, options.min || Number.MIN_SAFE_INTEGER, options.max || Number.MAX_SAFE_INTEGER)) {
          throw new BaseException(
            ERROR_CODES.VALIDATION_2007,
            { field: propertyName, min: options.min, max: options.max }
          );
        }
      }
      
      return method.apply(this, args);
    };
    
    return descriptor;
  };
}

/**
 * 路径验证装饰器
 */
export function ValidatePath(options: {
  mustExist?: boolean;
  safe?: boolean;
  basePath?: string;
}) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      const [value] = args;
      
      if (typeof value !== 'string') {
        throw new BaseException(
          ERROR_CODES.VALIDATION_2001,
          { field: propertyName, expected: 'string', actual: typeof value }
        );
      }
      
      if (options.safe && !PathValidator.isSafePath(value, options.basePath)) {
        throw new BaseException(
          ERROR_CODES.VALIDATION_2008,
          { field: propertyName, path: value }
        );
      }
      
      if (options.mustExist && !await PathValidator.exists(value)) {
        throw new BaseException(
          ERROR_CODES.VALIDATION_2009,
          { field: propertyName, path: value }
        );
      }
      
      return method.apply(this, args);
    };
    
    return descriptor;
  };
}

/**
 * 邮箱验证装饰器
 */
export function ValidateEmail() {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    
    descriptor.value = function (...args: any[]) {
      const [value] = args;
      
      if (!StringValidator.isEmail(value)) {
        throw new BaseException(
          ERROR_CODES.VALIDATION_2010,
          { field: propertyName, value }
        );
      }
      
      return method.apply(this, args);
    };
    
    return descriptor;
  };
}

/**
 * URL验证装饰器
 */
export function ValidateURL() {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    
    descriptor.value = function (...args: any[]) {
      const [value] = args;
      
      if (!StringValidator.isURL(value)) {
        throw new BaseException(
          ERROR_CODES.VALIDATION_2011,
          { field: propertyName, value }
        );
      }
      
      return method.apply(this, args);
    };
    
    return descriptor;
  };
}

/**
 * 端口验证装饰器
 */
export function ValidatePort() {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    
    descriptor.value = function (...args: any[]) {
      const [value] = args;
      
      if (!NumberValidator.isPort(value)) {
        throw new BaseException(
          ERROR_CODES.VALIDATION_2012,
          { field: propertyName, value }
        );
      }
      
      return method.apply(this, args);
    };
    
    return descriptor;
  };
}

/**
 * 清理输入装饰器
 */
export function SanitizeInput() {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    
    descriptor.value = function (...args: any[]) {
      const sanitizedArgs = args.map(arg => {
        if (typeof arg === 'string') {
          return StringValidator.sanitize(arg);
        }
        if (typeof arg === 'number') {
          return NumberValidator.sanitize(arg);
        }
        if (typeof arg === 'object' && arg !== null) {
          // 递归清理对象
          return sanitizeObject(arg);
        }
        return arg;
      });
      
      return method.apply(this, sanitizedArgs);
    };
    
    return descriptor;
  };
}

/**
 * 递归清理对象
 */
function sanitizeObject(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(item => {
      if (typeof item === 'string') {
        return StringValidator.sanitize(item);
      }
      if (typeof item === 'object' && item !== null) {
        return sanitizeObject(item);
      }
      return item;
    });
  }
  
  const sanitized: any = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = StringValidator.sanitize(value);
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
}
