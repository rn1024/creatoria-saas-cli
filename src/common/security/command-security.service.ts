/**
 * 命令安全服务
 */

import { Injectable } from '@nestjs/common';
import { BaseException } from '../exceptions/base.exception';
import { ERROR_CODES } from '../constants/error-codes';
import { LoggerService } from '../logger/logger.service';
import { StringValidator } from '../validation/validators/string.validator';
import { getSecurityConfig } from './security.config';

@Injectable()
export class CommandSecurityService {
  private allowedCommands: Set<string>;
  private blockedCommands: Set<string>;
  private dangerousPatterns: RegExp[];
  
  constructor(
    private readonly logger: LoggerService,
  ) {
    const config = getSecurityConfig();
    this.allowedCommands = new Set(config.commandExecution.allowedCommands);
    this.blockedCommands = new Set(config.commandExecution.blockedCommands);
    this.initializeDangerousPatterns();
  }

  /**
   * 初始化危险模式
   */
  private initializeDangerousPatterns(): void {
    this.dangerousPatterns = [
      // Shell命令注入
      /[;&|`$]/,
      /\$\([^)]+\)/,  // 命令替换 $()
      /`[^`]+`/,       // 命令替换 ``
      /\$\{[^}]+\}/,   // 变量替换 ${}
      
      // 重定向
      />+|<+|>>|<</,
      
      // 管道和后台执行
      /\|\||&&/,
      
      // 路径遍历
      /\.\.\/|\.\.\\/,
      
      // 特殊字符
      /[\x00-\x1f\x7f]/,  // 控制字符
      
      // SQL注入
      /('|(\-\-)|(;)|(\|\|)|(\/\*)|(<>)|(\*\|))/i,
      
      // 危险的命令
      /\b(rm|del|format|shutdown|reboot|kill|killall)\b/i,
    ];
  }

  /**
   * 验证命令
   */
  validateCommand(command: string): void {
    if (!command || typeof command !== 'string') {
      throw new BaseException(
        ERROR_CODES.CLI_INVALID_COMMAND,
        { command }
      );
    }
    
    // 检查命令长度
    const config = getSecurityConfig();
    if (command.length > config.commandExecution.maxCommandLength) {
      throw new BaseException(
        ERROR_CODES.CLI_INVALID_COMMAND,
        { command: command.substring(0, 50) + '...' }
      );
    }
    
    // 提取基础命令
    const baseCommand = this.extractBaseCommand(command);
    
    // 检查黑名单
    if (this.blockedCommands.has(baseCommand)) {
      this.logger.warn('尝试执行被禁止的命令', { command: baseCommand });
      throw new BaseException(
        ERROR_CODES.CLI_INVALID_COMMAND,
        { command: baseCommand }
      );
    }
    
    // 检查白名单（如果启用）
    if (this.allowedCommands.size > 0 && !this.allowedCommands.has(baseCommand)) {
      this.logger.warn('尝试执行未授权的命令', { command: baseCommand });
      throw new BaseException(
        ERROR_CODES.CLI_INVALID_COMMAND,
        { command: baseCommand }
      );
    }
    
    // 检查危险模式
    for (const pattern of this.dangerousPatterns) {
      if (pattern.test(command)) {
        this.logger.warn('检测到危险的命令模式', { command, pattern: pattern.toString() });
        throw new BaseException(
          ERROR_CODES.VALIDATION_2018,
          { errors: [{ field: 'command', message: 'Dangerous pattern detected' }] }
        );
      }
    }
  }

  /**
   * 验证命令参数
   */
  validateArguments(args: string[]): string[] {
    if (!Array.isArray(args)) {
      throw new BaseException(
        ERROR_CODES.CLI_INVALID_ARGUMENT,
        { argument: 'args must be an array' }
      );
    }
    
    const sanitizedArgs: string[] = [];
    
    for (const arg of args) {
      if (typeof arg !== 'string') {
        throw new BaseException(
          ERROR_CODES.CLI_INVALID_ARGUMENT,
          { argument: arg }
        );
      }
      
      // 检查每个参数的危险模式
      for (const pattern of this.dangerousPatterns) {
        if (pattern.test(arg)) {
          this.logger.warn('检测到危险的命令参数', { arg, pattern: pattern.toString() });
          throw new BaseException(
            ERROR_CODES.CLI_INVALID_ARGUMENT,
            { argument: arg }
          );
        }
      }
      
      // 清理和转义参数
      const sanitized = this.sanitizeArgument(arg);
      sanitizedArgs.push(sanitized);
    }
    
    return sanitizedArgs;
  }

  /**
   * 清理命令参数
   */
  private sanitizeArgument(arg: string): string {
    // 移除控制字符
    let sanitized = arg.replace(/[\x00-\x1f\x7f]/g, '');
    
    // 如果启用shell转义
    const config = getSecurityConfig();
    if (config.commandExecution.useShellEscape) {
      sanitized = StringValidator.escapeShell(sanitized);
    }
    
    return sanitized;
  }

  /**
   * 提取基础命令
   */
  private extractBaseCommand(command: string): string {
    // 移除路径和参数，只保留命令名
    const parts = command.trim().split(/\s+/);
    if (parts.length === 0) {
      return '';
    }
    
    // 提取命令名（可能包含路径）
    const cmdPart = parts[0];
    
    // 提取最后的命令名
    const pathSeparators = /[\/\\]/;
    const cmdParts = cmdPart.split(pathSeparators);
    return cmdParts[cmdParts.length - 1];
  }

  /**
   * 创建安全的命令选项
   */
  createSafeOptions(options: any = {}): any {
    const safeOptions: any = {};
    
    // 白名单选项
    const allowedOptions = [
      'cwd', 'env', 'timeout', 'maxBuffer',
      'encoding', 'windowsHide', 'killSignal'
    ];
    
    for (const key of allowedOptions) {
      if (options[key] !== undefined) {
        safeOptions[key] = options[key];
      }
    }
    
    // 禁止shell模式
    safeOptions.shell = false;
    
    // 设置超时
    const config = getSecurityConfig();
    if (!safeOptions.timeout) {
      safeOptions.timeout = config.commandExecution.timeout;
    }
    
    // 限制缓冲区大小
    if (!safeOptions.maxBuffer) {
      safeOptions.maxBuffer = 10 * 1024 * 1024; // 10MB
    }
    
    return safeOptions;
  }

  /**
   * 检查环境变量
   */
  validateEnvironment(env: Record<string, string> = {}): Record<string, string> {
    const safeEnv: Record<string, string> = {};
    
    // 危险的环境变量
    const dangerousEnvVars = [
      'LD_PRELOAD', 'LD_LIBRARY_PATH',
      'DYLD_INSERT_LIBRARIES', 'DYLD_LIBRARY_PATH',
      'PATH', 'PYTHONPATH', 'NODE_PATH',
    ];
    
    for (const [key, value] of Object.entries(env)) {
      // 检查危险的环境变量
      if (dangerousEnvVars.includes(key)) {
        this.logger.warn('尝试设置危险的环境变量', { key });
        continue;
      }
      
      // 验证值
      if (typeof value !== 'string') {
        continue;
      }
      
      // 检查危险模式
      let isSafe = true;
      for (const pattern of this.dangerousPatterns) {
        if (pattern.test(value)) {
          this.logger.warn('环境变量值包含危险模式', { key, value });
          isSafe = false;
          break;
        }
      }
      
      if (isSafe) {
        safeEnv[key] = value;
      }
    }
    
    return safeEnv;
  }

  /**
   * 记录命令执行
   */
  logCommandExecution(command: string, args: string[], result: 'success' | 'failure', error?: any): void {
    const logData = {
      command,
      args: args.length > 10 ? args.slice(0, 10).concat(['...']) : args,
      result,
      timestamp: new Date().toISOString(),
      user: process.env.USER || 'unknown',
      pid: process.pid,
    };
    
    if (error) {
      logData['error'] = error.message || error;
    }
    
    if (result === 'success') {
      this.logger.info('命令执行成功', logData);
    } else {
      this.logger.error('命令执行失败', logData);
    }
  }

  /**
   * 添加允许的命令
   */
  addAllowedCommand(command: string): void {
    this.allowedCommands.add(command);
    this.logger.debug('添加允许的命令', { command });
  }

  /**
   * 添加禁止的命令
   */
  addBlockedCommand(command: string): void {
    this.blockedCommands.add(command);
    this.logger.debug('添加禁止的命令', { command });
  }

  /**
   * 获取命令安全配置
   */
  getCommandSecurityConfig(): {
    allowedCommands: string[];
    blockedCommands: string[];
  } {
    return {
      allowedCommands: Array.from(this.allowedCommands),
      blockedCommands: Array.from(this.blockedCommands),
    };
  }
}
