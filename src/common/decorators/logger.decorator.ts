/**
 * 日志装饰器
 */

import { LoggerService } from '../logger/logger.service';
import { LogContext } from '../logger/logger.config';

/**
 * 方法日志装饰器
 */
export function Log(options?: {
  message?: string;
  logArgs?: boolean;
  logResult?: boolean;
  logDuration?: boolean;
}) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    const className = target.constructor.name;

    descriptor.value = async function (...args: any[]) {
      const logger = new LoggerService(className);
      const context: LogContext = {
        module: className,
        method: propertyKey,
      };

      // 记录方法调用
      const message = options?.message || `Calling ${propertyKey}`;
      
      if (options?.logArgs) {
        context.metadata = { arguments: args };
      }

      logger.debug(message, context);

      const start = Date.now();

      try {
        const result = await originalMethod.apply(this, args);
        
        // 记录成功
        const duration = Date.now() - start;
        const successContext: LogContext = { ...context };
        
        if (options?.logDuration) {
          successContext.duration = duration;
        }
        
        if (options?.logResult) {
          successContext.metadata = {
            ...successContext.metadata,
            result: result,
          };
        }

        logger.debug(`${propertyKey} completed`, successContext);
        
        return result;
      } catch (error) {
        // 记录错误
        const duration = Date.now() - start;
        logger.error(
          `${propertyKey} failed`,
          error as Error,
          { ...context, duration }
        );
        throw error;
      }
    };

    return descriptor;
  };
}

/**
 * 性能日志装饰器
 */
export function Performance(threshold: number = 1000) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    const className = target.constructor.name;

    descriptor.value = async function (...args: any[]) {
      const logger = new LoggerService(className);
      const start = Date.now();

      try {
        const result = await originalMethod.apply(this, args);
        const duration = Date.now() - start;

        if (duration > threshold) {
          logger.warn(`Slow operation: ${propertyKey}`, {
            module: className,
            method: propertyKey,
            duration,
            metadata: { threshold },
          });
        }

        return result;
      } catch (error) {
        const duration = Date.now() - start;
        logger.error(`${propertyKey} failed`, error as Error, {
          module: className,
          method: propertyKey,
          duration,
        });
        throw error;
      }
    };

    return descriptor;
  };
}

/**
 * 缓存日志装饰器
 */
export function CacheLog() {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    const className = target.constructor.name;
    const cache = new Map<string, any>();

    descriptor.value = async function (...args: any[]) {
      const logger = new LoggerService(className);
      const cacheKey = JSON.stringify(args);

      // 检查缓存
      if (cache.has(cacheKey)) {
        logger.debug(`Cache hit: ${propertyKey}`, {
          module: className,
          method: propertyKey,
          metadata: { cacheKey },
        });
        return cache.get(cacheKey);
      }

      // 执行方法
      logger.debug(`Cache miss: ${propertyKey}`, {
        module: className,
        method: propertyKey,
        metadata: { cacheKey },
      });

      try {
        const result = await originalMethod.apply(this, args);
        cache.set(cacheKey, result);
        return result;
      } catch (error) {
        logger.error(`${propertyKey} failed`, error as Error, {
          module: className,
          method: propertyKey,
        });
        throw error;
      }
    };

    return descriptor;
  };
}

/**
 * 审计日志装饰器
 */
export function Audit(action: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    const className = target.constructor.name;

    descriptor.value = async function (...args: any[]) {
      const logger = new LoggerService('AUDIT');
      
      // 记录审计日志
      logger.info(`Action: ${action}`, {
        module: className,
        method: propertyKey,
        metadata: {
          timestamp: new Date().toISOString(),
          action,
          arguments: args,
        },
      });

      try {
        const result = await originalMethod.apply(this, args);
        
        logger.info(`Action completed: ${action}`, {
          module: className,
          method: propertyKey,
          metadata: {
            timestamp: new Date().toISOString(),
            action,
            success: true,
          },
        });
        
        return result;
      } catch (error) {
        logger.error(`Action failed: ${action}`, error as Error, {
          module: className,
          method: propertyKey,
          metadata: {
            timestamp: new Date().toISOString(),
            action,
            success: false,
          },
        });
        throw error;
      }
    };

    return descriptor;
  };
}