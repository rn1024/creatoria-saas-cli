/**
 * 模块相关异常类
 */

import { BaseException } from './base.exception';
import { ErrorCategory, ErrorSeverity, ErrorOptions } from '../types/error.types';
import { ErrorCodes } from '../constants/error-codes';

/**
 * 模块异常基类
 */
export class ModuleException extends BaseException {
  constructor(message: string, options: ErrorOptions = {}) {
    super(message, {
      ...options,
      category: options.category || ErrorCategory.BUSINESS,
    });
  }
}

/**
 * 模块未找到异常
 */
export class ModuleNotFoundException extends ModuleException {
  constructor(moduleName: string, searchPath?: string) {
    const message = searchPath
      ? `Module '${moduleName}' not found in ${searchPath}`
      : `Module '${moduleName}' not found`;
    
    super(message, {
      code: ErrorCodes.MODULE_NOT_FOUND,
      severity: ErrorSeverity.ERROR,
      context: { module: moduleName, filePath: searchPath },
      suggestion: 'Check if the module name is correct and the module exists',
    });
  }
}

/**
 * 模块已存在异常
 */
export class ModuleAlreadyExistsException extends ModuleException {
  constructor(moduleName: string) {
    super(`Module '${moduleName}' already exists in the project`, {
      code: ErrorCodes.MODULE_ALREADY_EXISTS,
      severity: ErrorSeverity.WARNING,
      context: { module: moduleName },
      suggestion: `Remove the existing module first or use a different name`,
    });
  }
}

/**
 * 模块初始化失败异常
 */
export class ModuleInitializationException extends ModuleException {
  constructor(moduleName: string, error: string) {
    super(`Failed to initialize module '${moduleName}': ${error}`, {
      code: ErrorCodes.MODULE_INITIALIZATION_FAILED,
      severity: ErrorSeverity.ERROR,
      context: { module: moduleName, metadata: { error } },
      suggestion: 'Check the module initialization script and fix any errors',
    });
  }
}

/**
 * 模块依赖缺失异常
 */
export class ModuleDependencyMissingException extends ModuleException {
  constructor(moduleName: string, dependency: string, isModule: boolean = true) {
    const depType = isModule ? 'module' : 'package';
    super(`Module '${moduleName}' requires ${depType} '${dependency}' which is not installed`, {
      code: ErrorCodes.MODULE_DEPENDENCY_MISSING,
      severity: ErrorSeverity.ERROR,
      context: { 
        module: moduleName, 
        metadata: { dependency, type: depType } 
      },
      suggestion: isModule 
        ? `Install the required module: creatoria module add ${dependency}`
        : `Install the required package: npm install ${dependency}`,
    });
  }
}

/**
 * 循环依赖异常
 */
export class CircularDependencyException extends ModuleException {
  constructor(chain: string[]) {
    const chainStr = chain.join(' -> ');
    super(`Circular dependency detected: ${chainStr}`, {
      code: ErrorCodes.MODULE_CIRCULAR_DEPENDENCY,
      severity: ErrorSeverity.FATAL,
      context: { metadata: { chain } },
      suggestion: 'Review the module dependencies and remove the circular reference',
    });
  }
}

/**
 * 无效模块元数据异常
 */
export class InvalidModuleMetadataException extends ModuleException {
  constructor(moduleName: string, error: string) {
    super(`Invalid metadata for module '${moduleName}': ${error}`, {
      code: ErrorCodes.MODULE_INVALID_METADATA,
      severity: ErrorSeverity.ERROR,
      context: { module: moduleName, metadata: { error } },
      suggestion: 'Check the module.json file and ensure it has valid JSON format',
    });
  }
}

/**
 * 模块复制失败异常
 */
export class ModuleCopyFailedException extends ModuleException {
  constructor(moduleName: string, source: string, destination: string, error?: string) {
    const message = error 
      ? `Failed to copy module '${moduleName}': ${error}`
      : `Failed to copy module '${moduleName}' from ${source} to ${destination}`;
    
    super(message, {
      code: ErrorCodes.MODULE_COPY_FAILED,
      severity: ErrorSeverity.ERROR,
      context: { 
        module: moduleName,
        metadata: { source, destination, error }
      },
      suggestion: 'Check file permissions and ensure the source module exists',
    });
  }
}

/**
 * 模块注册失败异常
 */
export class ModuleRegistrationFailedException extends ModuleException {
  constructor(moduleName: string, error: string) {
    super(`Failed to register module '${moduleName}': ${error}`, {
      code: ErrorCodes.MODULE_REGISTRATION_FAILED,
      severity: ErrorSeverity.ERROR,
      context: { module: moduleName, metadata: { error } },
      suggestion: 'Check the app.module.ts file and ensure it has valid TypeScript syntax',
    });
  }
}

/**
 * 模块版本不兼容异常
 */
export class IncompatibleModuleVersionException extends ModuleException {
  constructor(moduleName: string, requiredVersion: string, actualVersion: string) {
    super(`Module '${moduleName}' version incompatible. Required: ${requiredVersion}, Got: ${actualVersion}`, {
      code: ErrorCodes.MODULE_INCOMPATIBLE_VERSION,
      severity: ErrorSeverity.ERROR,
      context: { 
        module: moduleName,
        metadata: { requiredVersion, actualVersion }
      },
      suggestion: `Update the module to version ${requiredVersion} or higher`,
    });
  }
}