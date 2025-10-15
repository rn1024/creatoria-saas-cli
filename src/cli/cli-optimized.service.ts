/**
 * 优化的CLI服务 - 使用懒加载
 */

import { Injectable } from '@nestjs/common';
import { Command } from 'commander';
import { LazyLoader } from './core/lazy-loader';
import { CommandRegistry } from './core/command-registry';
import { LoggerService } from '../common/logger/logger.service';
import { getPreloadList } from './decorators/lazy-command.decorator';
import { Performance } from '../common/decorators/logger.decorator';
const chalk = require('chalk');

@Injectable()
export class OptimizedCliService {
  private program: Command;
  private loader: LazyLoader;
  private registry: CommandRegistry;
  private logger = new LoggerService('CliService');

  constructor() {
    this.program = new Command();
    this.loader = LazyLoader.getInstance();
    this.registry = CommandRegistry.getInstance();
    this.initializeCommands();
  }

  /**
   * 初始化命令（不加载实际实现）
   */
  private initializeCommands(): void {
    const startTime = Date.now();
    
    this.program
      .name('creatoria')
      .description('Creatoria SaaS CLI')
      .version('1.0.0')
      .option('--verbose', 'Enable verbose output')
      .option('--no-color', 'Disable colored output')
      .option('--profile', 'Show performance profiling');

    // 注册命令元数据（不实例化）
    this.registerModuleCommands();
    this.registerDatabaseCommands();
    this.registerConfigCommands();
    this.registerProjectCommands();

    const initTime = Date.now() - startTime;
    this.logger.debug(`Command structure initialized in ${initTime}ms`);
  }

  /**
   * 注册模块相关命令
   */
  private registerModuleCommands(): void {
    const module = this.program.command('module');
    
    // 注册到命令注册表
    this.registry.register(
      'module-add',
      'Add a module to the project',
      '../commands/module-add.command',
      'ModuleAddCommand'
    );

    module
      .command('add <name>')
      .description('Add a module to the project')
      .option('--skip-deps', 'Skip dependency check')
      .action(async (name, options) => {
        await this.executeCommand('module-add', [name], options);
      });

    module
      .command('install [source]')
      .description('Install modules from remote repository')
      .action(async (source) => {
        await this.executeCommand('module-install', [source]);
      });

    module
      .command('list')
      .description('List all installed modules')
      .action(async () => {
        await this.executeCommand('module-list');
      });

    module
      .command('enable <name>')
      .description('Enable a module')
      .action(async (name) => {
        await this.executeCommand('module-enable', [name]);
      });

    module
      .command('disable <name>')
      .description('Disable a module')
      .action(async (name) => {
        await this.executeCommand('module-disable', [name]);
      });

    module
      .command('info <name>')
      .description('Show module information')
      .action(async (name) => {
        await this.executeCommand('module-info', [name]);
      });
  }

  /**
   * 注册数据库相关命令
   */
  private registerDatabaseCommands(): void {
    const db = this.program.command('db');
    
    db
      .command('migrate')
      .description('Run database migrations')
      .option('--module <module>', 'Run migrations for specific module')
      .action(async (options) => {
        await this.executeCommand('db-migrate', [], options);
      });

    db
      .command('seed')
      .description('Run database seeds')
      .option('--module <module>', 'Run seeds for specific module')
      .action(async (options) => {
        await this.executeCommand('db-seed', [], options);
      });

    db
      .command('reset')
      .description('Reset database')
      .action(async () => {
        await this.executeCommand('db-reset');
      });
  }

  /**
   * 注册配置相关命令
   */
  private registerConfigCommands(): void {
    const config = this.program.command('config');
    
    config
      .command('show')
      .description('Show current configuration')
      .action(async () => {
        await this.executeCommand('config-show');
      });

    config
      .command('set <key> <value>')
      .description('Set a configuration value')
      .action(async (key, value) => {
        await this.executeCommand('config-set', [key, value]);
      });
  }

  /**
   * 注册项目相关命令
   */
  private registerProjectCommands(): void {
    // Create命令
    this.program
      .command('create <name>')
      .description('Create a new project from the Creatoria template')
      .option('--skip-install', 'Skip running npm install')
      .option('--db-host <host>', 'Database host')
      .option('--db-port <port>', 'Database port')
      .option('--db-database <name>', 'Database name')
      .option('--db-username <username>', 'Database username')
      .option('--db-password <password>', 'Database password')
      .action(async (name, options) => {
        await this.executeCommand('create', [name], options);
      });

    // Init命令
    this.registry.register(
      'init',
      'Initialize the project',
      '../commands/init.command',
      'InitCommand'
    );

    this.program
      .command('init')
      .description('Initialize the project and run module initialization scripts')
      .option('--skip-db', 'Skip database migrations')
      .option('--skip-seed', 'Skip seed data')
      .option('--modules <modules>', 'Only initialize specific modules (comma-separated)')
      .action(async (options) => {
        await this.executeCommand('init', [], options);
      });

    // Start命令
    this.program
      .command('start')
      .description('Start the application')
      .option('-p, --port <port>', 'Port to listen on')
      .option('-e, --env <env>', 'Environment (development, production)')
      .action(async (options) => {
        await this.executeCommand('start', [], options);
      });

    // Dev命令
    this.program
      .command('dev')
      .description('Start the application in development mode')
      .option('--watch-modules', 'Watch for module changes')
      .action(async (options) => {
        await this.executeCommand('dev', [], options);
      });
  }

  /**
   * 执行命令（懒加载）
   */
  @Performance(50)
  private async executeCommand(
    commandName: string,
    args: any[] = [],
    options: any = {}
  ): Promise<void> {
    const startTime = Date.now();
    
    try {
      // 懒加载命令
      const command = await this.loader.loadCommand(commandName);
      
      if (!command || typeof command.run !== 'function') {
        throw new Error(`Command '${commandName}' does not have a run method`);
      }

      const loadTime = Date.now() - startTime;
      this.logger.debug(`Command '${commandName}' loaded in ${loadTime}ms`);

      // 执行命令
      const execStartTime = Date.now();
      await command.run(args, options);
      
      const execTime = Date.now() - execStartTime;
      this.logger.debug(`Command '${commandName}' executed in ${execTime}ms`);

      // 显示性能信息（如果启用）
      if (this.program.opts().profile) {
        this.showPerformanceInfo(commandName, loadTime, execTime);
      }
    } catch (error) {
      this.logger.error(`Failed to execute command '${commandName}'`, error as Error);
      throw error;
    }
  }

  /**
   * 运行CLI
   */
  async run(): Promise<void> {
    const startTime = Date.now();

    // 预加载高优先级命令（如果需要）
    if (process.env.PRELOAD_COMMANDS === 'true') {
      const preloadList = getPreloadList();
      if (preloadList.length > 0) {
        await this.loader.preloadCommands(preloadList);
      }
    }

    // 解析命令行参数
    await this.program.parseAsync(process.argv);

    const totalTime = Date.now() - startTime;
    
    // 显示总体性能信息
    if (this.program.opts().profile) {
      this.showOverallPerformance(totalTime);
    }
  }

  /**
   * 显示性能信息
   */
  private showPerformanceInfo(
    commandName: string,
    loadTime: number,
    execTime: number
  ): void {
    console.log(chalk.gray('\n📊 Performance Profile:'));
    console.log(chalk.gray(`   Command: ${commandName}`));
    console.log(chalk.gray(`   Load time: ${loadTime}ms`));
    console.log(chalk.gray(`   Execution time: ${execTime}ms`));
    console.log(chalk.gray(`   Total time: ${loadTime + execTime}ms`));
  }

  /**
   * 显示总体性能信息
   */
  private showOverallPerformance(totalTime: number): void {
    const stats = this.registry.getStats();
    const cacheStats = this.loader.getCacheStats();

    console.log(chalk.gray('\n📊 Overall Performance:'));
    console.log(chalk.gray(`   Total execution time: ${totalTime}ms`));
    console.log(chalk.gray(`   Commands registered: ${stats.total}`));
    console.log(chalk.gray(`   Commands loaded: ${stats.loaded}`));
    console.log(chalk.gray(`   Average load time: ${stats.averageLoadTime.toFixed(2)}ms`));
    console.log(chalk.gray(`   Commands cached: ${cacheStats.size}`));
    
    if (stats.loaded > 0) {
      console.log(chalk.gray(`   Loaded commands: ${cacheStats.commands.join(', ')}`));
    }
  }
}