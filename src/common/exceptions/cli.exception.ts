/**
 * CLI相关异常类
 */

import { BaseException } from './base.exception';
import { ErrorCategory, ErrorSeverity, ErrorOptions } from '../types/error.types';
import { ErrorCodes } from '../constants/error-codes';

/**
 * CLI异常基类
 */
export class CliException extends BaseException {
  constructor(message: string, options: ErrorOptions = {}) {
    super(message, {
      ...options,
      category: options.category || ErrorCategory.BUSINESS,
    });
  }
}

/**
 * 无效命令异常
 */
export class InvalidCommandException extends CliException {
  constructor(command: string, suggestion?: string) {
    super(`Invalid command: ${command}`, {
      code: ErrorCodes.CLI_INVALID_COMMAND,
      severity: ErrorSeverity.ERROR,
      context: { command },
      suggestion: suggestion || 'Run "creatoria --help" to see available commands',
    });
  }
}

/**
 * 无效参数异常
 */
export class InvalidArgumentException extends CliException {
  constructor(argument: string, expected?: string) {
    const message = expected 
      ? `Invalid argument: ${argument}. Expected: ${expected}`
      : `Invalid argument: ${argument}`;
    
    super(message, {
      code: ErrorCodes.CLI_INVALID_ARGUMENT,
      severity: ErrorSeverity.ERROR,
      context: { argument, expected },
    });
  }
}

/**
 * 缺少必需选项异常
 */
export class MissingRequiredOptionException extends CliException {
  constructor(option: string, command?: string) {
    super(`Missing required option: ${option}`, {
      code: ErrorCodes.CLI_MISSING_REQUIRED_OPTION,
      severity: ErrorSeverity.ERROR,
      context: { option, command },
      suggestion: `Please provide the --${option} option`,
    });
  }
}

/**
 * 项目未找到异常
 */
export class ProjectNotFoundException extends CliException {
  constructor(projectPath?: string) {
    const message = projectPath 
      ? `Project not found at: ${projectPath}`
      : 'Not in a Creatoria SaaS project directory';
    
    super(message, {
      code: ErrorCodes.CLI_NOT_IN_PROJECT,
      severity: ErrorSeverity.ERROR,
      context: { filePath: projectPath },
      suggestion: 'Please run this command from your project root directory',
    });
  }
}

/**
 * 模板未找到异常
 */
export class TemplateNotFoundException extends CliException {
  constructor(templatePath: string) {
    super(`Template not found at: ${templatePath}`, {
      code: ErrorCodes.CLI_TEMPLATE_NOT_FOUND,
      severity: ErrorSeverity.ERROR,
      context: { filePath: templatePath },
      suggestion: 'Set CREATORIA_TEMPLATE_DIR environment variable to the template directory',
    });
  }
}

/**
 * 构建失败异常
 */
export class BuildFailedException extends CliException {
  constructor(error: string, details?: any) {
    super(`Build failed: ${error}`, {
      code: ErrorCodes.CLI_BUILD_FAILED,
      severity: ErrorSeverity.ERROR,
      context: { metadata: details },
      suggestion: 'Check the error message above and fix the issues',
    });
  }
}

/**
 * 测试失败异常
 */
export class TestFailedException extends CliException {
  constructor(error: string, failedTests?: number) {
    super(`Tests failed: ${error}`, {
      code: ErrorCodes.CLI_TEST_FAILED,
      severity: ErrorSeverity.ERROR,
      context: { metadata: { failedTests } },
      suggestion: 'Fix the failing tests and try again',
    });
  }
}