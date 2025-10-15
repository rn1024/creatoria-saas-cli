/**
 * 错误处理装饰器
 */

import { cliExceptionHandler } from '../filters/cli-exception.filter';
import { BaseException } from '../exceptions/base.exception';
import { ErrorCategory, ErrorSeverity, ErrorContext } from '../types/error.types';

/**
 * 方法错误捕获装饰器
 */
export function CatchErrors(options?: {
  rethrow?: boolean;
  context?: ErrorContext;
  fallbackValue?: any;
}) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      try {
        return await originalMethod.apply(this, args);
      } catch (error) {
        // 添加上下文信息
        if (error instanceof BaseException && options?.context) {
          error.context = { ...error.context, ...options.context };
        }

        // 记录方法信息
        const methodContext: ErrorContext = {
          module: target.constructor.name,
          method: propertyKey,
          ...options?.context,
        };

        // 如果不是BaseException，包装成BaseException
        if (!(error instanceof BaseException)) {
          const wrappedError = new BaseException(
            error instanceof Error ? error.message : String(error),
            {
              category: ErrorCategory.SYSTEM,
              severity: ErrorSeverity.ERROR,
              context: methodContext,
              cause: error instanceof Error ? error : undefined,
            }
          );
          
          if (options?.rethrow) {
            throw wrappedError;
          }
          
          cliExceptionHandler.handle(wrappedError);
          return options?.fallbackValue;
        }

        // 更新错误上下文
        error.context = { ...error.context, ...methodContext };

        if (options?.rethrow) {
          throw error;
        }

        cliExceptionHandler.handle(error);
        return options?.fallbackValue;
      }
    };

    return descriptor;
  };
}

/**
 * 类错误捕获装饰器
 */
export function CatchClassErrors(options?: {
  exclude?: string[];
  context?: ErrorContext;
}) {
  return function <T extends { new(...args: any[]): {} }>(constructor: T) {
    const propertyNames = Object.getOwnPropertyNames(constructor.prototype);
    
    propertyNames.forEach(propertyName => {
      // 跳过构造函数和指定的方法
      if (propertyName === 'constructor' || 
          options?.exclude?.includes(propertyName)) {
        return;
      }

      const descriptor = Object.getOwnPropertyDescriptor(
        constructor.prototype,
        propertyName
      );

      if (descriptor && typeof descriptor.value === 'function') {
        const originalMethod = descriptor.value;

        descriptor.value = async function (...args: any[]) {
          try {
            return await originalMethod.apply(this, args);
          } catch (error) {
            const methodContext: ErrorContext = {
              module: constructor.name,
              method: propertyName,
              ...options?.context,
            };

            if (error instanceof BaseException) {
              error.context = { ...error.context, ...methodContext };
            } else {
              error = new BaseException(
                error instanceof Error ? error.message : String(error),
                {
                  category: ErrorCategory.SYSTEM,
                  severity: ErrorSeverity.ERROR,
                  context: methodContext,
                  cause: error instanceof Error ? error : undefined,
                }
              );
            }

            cliExceptionHandler.handle(error);
          }
        };

        Object.defineProperty(constructor.prototype, propertyName, descriptor);
      }
    });

    return constructor;
  };
}

/**
 * 验证装饰器
 */
export function Validate(validationFn: (value: any) => boolean | string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
      const validationResult = validationFn(args);
      
      if (validationResult === true) {
        return originalMethod.apply(this, args);
      }

      const errorMessage = typeof validationResult === 'string' 
        ? validationResult 
        : `Validation failed for ${propertyKey}`;

      throw new BaseException(errorMessage, {
        category: ErrorCategory.VALIDATION,
        severity: ErrorSeverity.ERROR,
        context: {
          module: target.constructor.name,
          method: propertyKey,
          metadata: { arguments: args },
        },
      });
    };

    return descriptor;
  };
}

/**
 * 重试装饰器
 */
export function Retry(options: {
  maxAttempts?: number;
  delay?: number;
  backoff?: boolean;
  retryOn?: (error: any) => boolean;
} = {}) {
  const maxAttempts = options.maxAttempts || 3;
  const delay = options.delay || 1000;
  const backoff = options.backoff || false;

  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      let lastError: any;
      
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          return await originalMethod.apply(this, args);
        } catch (error) {
          lastError = error;
          
          // 检查是否应该重试
          if (options.retryOn && !options.retryOn(error)) {
            throw error;
          }

          // 如果不是最后一次尝试，等待后重试
          if (attempt < maxAttempts) {
            const waitTime = backoff ? delay * attempt : delay;
            console.log(`Retry attempt ${attempt}/${maxAttempts} after ${waitTime}ms...`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
          }
        }
      }

      // 所有重试都失败了
      throw new BaseException(
        `Operation failed after ${maxAttempts} attempts: ${lastError?.message || 'Unknown error'}`,
        {
          category: ErrorCategory.SYSTEM,
          severity: ErrorSeverity.ERROR,
          context: {
            module: target.constructor.name,
            method: propertyKey,
            metadata: { 
              attempts: maxAttempts,
              lastError: lastError?.message,
            },
          },
          cause: lastError instanceof Error ? lastError : undefined,
        }
      );
    };

    return descriptor;
  };
}