/**
 * 安全命令执行器
 */

import { Injectable } from '@nestjs/common';
import { spawn, exec, execFile } from 'child_process';
import { promisify } from 'util';
import { CommandSecurityService } from './command-security.service';
import { LoggerService } from '../logger/logger.service';
import { BaseException } from '../exceptions/base.exception';
import { ERROR_CODES } from '../constants/error-codes';

const execAsync = promisify(exec);
const execFileAsync = promisify(execFile);

export interface CommandResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  duration: number;
}

export interface CommandOptions {
  cwd?: string;
  env?: Record<string, string>;
  timeout?: number;
  maxBuffer?: number;
  encoding?: BufferEncoding;
  input?: string;
}

@Injectable()
export class SecureCommandExecutor {
  constructor(
    private readonly commandSecurity: CommandSecurityService,
    private readonly logger: LoggerService,
  ) {}

  /**
   * 执行命令（使用execFile，更安全）
   */
  async execute(command: string, args: string[] = [], options: CommandOptions = {}): Promise<CommandResult> {
    const startTime = Date.now();
    
    try {
      // 验证命令
      this.commandSecurity.validateCommand(command);
      
      // 验证和清理参数
      const safeArgs = this.commandSecurity.validateArguments(args);
      
      // 创建安全选项
      const safeOptions = this.commandSecurity.createSafeOptions(options);
      
      // 验证环境变量
      if (options.env) {
        safeOptions.env = {
          ...process.env,
          ...this.commandSecurity.validateEnvironment(options.env),
        };
      }
      
      this.logger.debug('执行安全命令', { command, args: safeArgs });
      
      // 使用execFile执行（不使用shell）
      const result = await execFileAsync(command, safeArgs, safeOptions);
      
      const duration = Date.now() - startTime;
      
      // 记录成功执行
      this.commandSecurity.logCommandExecution(command, safeArgs, 'success');
      
      return {
        stdout: result.stdout,
        stderr: result.stderr,
        exitCode: 0,
        duration,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      
      // 记录失败执行
      this.commandSecurity.logCommandExecution(command, args, 'failure', error);
      
      // 处理错误
      if (error.killed) {
        throw new BaseException(
          ERROR_CODES.NET_TIMEOUT,
          { url: command }
        );
      }
      
      return {
        stdout: error.stdout || '',
        stderr: error.stderr || error.message,
        exitCode: error.code || 1,
        duration,
      };
    }
  }

  /**
   * 执行命令并流式输出
   */
  async executeStream(
    command: string,
    args: string[] = [],
    options: CommandOptions = {},
    onData?: (chunk: string, stream: 'stdout' | 'stderr') => void,
  ): Promise<CommandResult> {
    const startTime = Date.now();
    
    return new Promise((resolve, reject) => {
      try {
        // 验证命令
        this.commandSecurity.validateCommand(command);
        
        // 验证和清理参数
        const safeArgs = this.commandSecurity.validateArguments(args);
        
        // 创建安全选项
        const safeOptions = this.commandSecurity.createSafeOptions(options);
        
        // 验证环境变量
        if (options.env) {
          safeOptions.env = {
            ...process.env,
            ...this.commandSecurity.validateEnvironment(options.env),
          };
        }
        
        this.logger.debug('执行流式命令', { command, args: safeArgs });
        
        // 使用spawn执行
        const child = spawn(command, safeArgs, {
          ...safeOptions,
          shell: false,
        });
        
        let stdout = '';
        let stderr = '';
        let killed = false;
        
        // 设置超时
        let timeoutId: NodeJS.Timeout | undefined;
        if (safeOptions.timeout) {
          timeoutId = setTimeout(() => {
            killed = true;
            child.kill('SIGTERM');
            setTimeout(() => {
              if (!child.killed) {
                child.kill('SIGKILL');
              }
            }, 1000);
          }, safeOptions.timeout);
        }
        
        // 处理stdout
        child.stdout?.on('data', (chunk) => {
          const data = chunk.toString();
          stdout += data;
          
          if (onData) {
            onData(data, 'stdout');
          }
          
          // 检查缓冲区大小
          if (stdout.length > (safeOptions.maxBuffer || 10 * 1024 * 1024)) {
            child.kill('SIGTERM');
            reject(new BaseException(
              ERROR_CODES.SYSTEM_OUT_OF_MEMORY,
              { message: 'Output buffer exceeded' }
            ));
          }
        });
        
        // 处理stderr
        child.stderr?.on('data', (chunk) => {
          const data = chunk.toString();
          stderr += data;
          
          if (onData) {
            onData(data, 'stderr');
          }
          
          // 检查缓冲区大小
          if (stderr.length > (safeOptions.maxBuffer || 10 * 1024 * 1024)) {
            child.kill('SIGTERM');
            reject(new BaseException(
              ERROR_CODES.SYSTEM_OUT_OF_MEMORY,
              { message: 'Error buffer exceeded' }
            ));
          }
        });
        
        // 处理输入
        if (options.input) {
          child.stdin?.write(options.input);
          child.stdin?.end();
        }
        
        // 处理退出
        child.on('close', (code) => {
          if (timeoutId) {
            clearTimeout(timeoutId);
          }
          
          const duration = Date.now() - startTime;
          
          if (killed) {
            this.commandSecurity.logCommandExecution(command, safeArgs, 'failure', 'Timeout');
            reject(new BaseException(
              ERROR_CODES.NET_TIMEOUT,
              { url: command }
            ));
          } else if (code === 0) {
            this.commandSecurity.logCommandExecution(command, safeArgs, 'success');
            resolve({
              stdout,
              stderr,
              exitCode: code || 0,
              duration,
            });
          } else {
            this.commandSecurity.logCommandExecution(command, safeArgs, 'failure', `Exit code: ${code}`);
            resolve({
              stdout,
              stderr,
              exitCode: code || 1,
              duration,
            });
          }
        });
        
        // 处理错误
        child.on('error', (error) => {
          if (timeoutId) {
            clearTimeout(timeoutId);
          }
          
          const duration = Date.now() - startTime;
          this.commandSecurity.logCommandExecution(command, safeArgs, 'failure', error);
          
          reject(new BaseException(
            ERROR_CODES.CLI_BUILD_FAILED,
            { error: error.message }
          ));
        });
      } catch (error) {
        const duration = Date.now() - startTime;
        this.commandSecurity.logCommandExecution(command, args, 'failure', error);
        reject(error);
      }
    });
  }

  /**
   * 执行npm/yarn/pnpm命令
   */
  async executePackageManager(
    pm: 'npm' | 'yarn' | 'pnpm',
    args: string[],
    options: CommandOptions = {},
  ): Promise<CommandResult> {
    // 包管理器白名单参数
    const safePackageManagerArgs = [
      'install', 'i', 'add', 'remove', 'rm', 'uninstall',
      'update', 'upgrade', 'outdated', 'list', 'ls',
      'run', 'test', 'build', 'start', 'dev',
      'publish', 'pack', 'link', 'unlink',
      'audit', 'fix', 'ci', 'prune',
      'init', 'create', 'info', 'view',
    ];
    
    // 验证第一个参数是否在白名单中
    if (args.length > 0 && !safePackageManagerArgs.includes(args[0])) {
      // 检查是否为脚本命令
      if (args[0] !== 'run-script' && args[0] !== 'run') {
        throw new BaseException(
          ERROR_CODES.CLI_INVALID_ARGUMENT,
          { argument: args[0] }
        );
      }
    }
    
    return this.execute(pm, args, options);
  }

  /**
   * 执行git命令
   */
  async executeGit(args: string[], options: CommandOptions = {}): Promise<CommandResult> {
    // Git白名单命令
    const safeGitCommands = [
      'init', 'clone', 'add', 'commit', 'push', 'pull',
      'fetch', 'merge', 'rebase', 'branch', 'checkout',
      'status', 'diff', 'log', 'show', 'tag',
      'stash', 'remote', 'config', 'rev-parse',
    ];
    
    // 验证第一个参数是否在白名单中
    if (args.length > 0 && !safeGitCommands.includes(args[0])) {
      this.logger.warn('尝试执行未授权的git命令', { command: args[0] });
      throw new BaseException(
        ERROR_CODES.CLI_INVALID_ARGUMENT,
        { argument: args[0] }
      );
    }
    
    return this.execute('git', args, options);
  }

  /**
   * 执行带有重试的命令
   */
  async executeWithRetry(
    command: string,
    args: string[] = [],
    options: CommandOptions = {},
    maxRetries: number = 3,
    retryDelay: number = 1000,
  ): Promise<CommandResult> {
    let lastError: any;
    
    for (let i = 0; i <= maxRetries; i++) {
      try {
        const result = await this.execute(command, args, options);
        
        if (result.exitCode === 0) {
          return result;
        }
        
        lastError = new Error(`Command failed with exit code ${result.exitCode}`);
      } catch (error) {
        lastError = error;
      }
      
      if (i < maxRetries) {
        this.logger.debug(`重试命令 (${i + 1}/${maxRetries})`, { command });
        await new Promise(resolve => setTimeout(resolve, retryDelay * (i + 1)));
      }
    }
    
    throw lastError;
  }

  /**
   * 检查命令是否存在
   */
  async commandExists(command: string): Promise<boolean> {
    try {
      const result = await this.execute('which', [command]);
      return result.exitCode === 0;
    } catch {
      // Windows
      try {
        const result = await this.execute('where', [command]);
        return result.exitCode === 0;
      } catch {
        return false;
      }
    }
  }
}
