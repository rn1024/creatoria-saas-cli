/**
 * 懒加载命令装饰器
 */

import { CommandRegistry } from '../core/command-registry';
import { SetMetadata } from '@nestjs/common';

export const LAZY_COMMAND_METADATA = 'lazy_command';

export interface LazyCommandOptions {
  name: string;
  description: string;
  preload?: boolean; // 是否预加载
  priority?: number; // 加载优先级（用于预加载排序）
}

/**
 * 标记命令为懒加载
 */
export function LazyCommand(options: LazyCommandOptions): ClassDecorator {
  return (target: any) => {
    // 设置元数据
    SetMetadata(LAZY_COMMAND_METADATA, options)(target);
    
    // 获取模块路径和类名
    const modulePath = getModulePath(target);
    const className = target.name;
    
    // 注册到命令注册表
    const registry = CommandRegistry.getInstance();
    registry.register(
      options.name,
      options.description,
      modulePath,
      className
    );
    
    // 添加到预加载列表
    if (options.preload) {
      addToPreloadList(options.name, options.priority || 100);
    }
    
    return target;
  };
}

/**
 * 获取模块路径（相对于编译输出目录）
 */
function getModulePath(target: any): string {
  // 这里需要根据实际的文件结构调整
  // 假设命令都在 commands 目录下
  const className = target.name;
  
  // 根据类名推断文件名（假设遵循命名约定）
  const fileName = className
    .replace(/Command$/, '')
    .replace(/([A-Z])/g, '-$1')
    .toLowerCase()
    .substring(1) + '.command';
  
  return `../commands/${fileName}`;
}

// 预加载列表
const preloadList: Array<{ name: string; priority: number }> = [];

/**
 * 添加到预加载列表
 */
function addToPreloadList(name: string, priority: number): void {
  preloadList.push({ name, priority });
  // 按优先级排序（数字越小优先级越高）
  preloadList.sort((a, b) => a.priority - b.priority);
}

/**
 * 获取预加载列表
 */
export function getPreloadList(): string[] {
  return preloadList.map(item => item.name);
}

/**
 * 命令方法装饰器 - 用于标记命令的执行方法
 */
export function CommandHandler(
  options?: {
    validateArgs?: boolean;
    logExecution?: boolean;
  }
): MethodDecorator {
  return (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      const commandName = this.constructor.name;
      
      // 日志记录
      if (options?.logExecution) {
        console.log(`Executing command: ${commandName}.${String(propertyKey)}`);
      }
      
      // 参数验证
      if (options?.validateArgs) {
        // 这里可以添加参数验证逻辑
        if (!args || args.length === 0) {
          throw new Error('Command requires arguments');
        }
      }
      
      // 执行原始方法
      try {
        const result = await originalMethod.apply(this, args);
        return result;
      } catch (error) {
        // 错误处理
        console.error(`Command execution failed: ${commandName}.${String(propertyKey)}`);
        throw error;
      }
    };
    
    return descriptor;
  };
}

/**
 * 命令参数装饰器
 */
export function CommandParam(
  name: string,
  options?: {
    required?: boolean;
    type?: 'string' | 'number' | 'boolean';
    defaultValue?: any;
    description?: string;
  }
): ParameterDecorator {
  return (target: any, propertyKey: string | symbol | undefined, parameterIndex: number) => {
    // 存储参数元数据
    const existingParams = Reflect.getMetadata('command_params', target, propertyKey!) || [];
    existingParams[parameterIndex] = {
      name,
      index: parameterIndex,
      ...options,
    };
    
    Reflect.defineMetadata('command_params', existingParams, target, propertyKey!);
  };
}