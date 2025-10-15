/**
 * 命令定义 - 用于懒加载注册
 */

import { CommandRegistry } from './command-registry';

export interface CommandDefinition {
  name: string;
  description: string;
  modulePath: string;
  className: string;
  preload?: boolean;
  priority?: number;
}

// 所有命令定义
export const COMMAND_DEFINITIONS: CommandDefinition[] = [
  // 模块命令
  {
    name: 'module-add',
    description: 'Add a module to the project',
    modulePath: '../commands/module-add.command',
    className: 'ModuleAddCommand',
    preload: false,
    priority: 20,
  },
  {
    name: 'module-install',
    description: 'Install modules from remote repository',
    modulePath: '../commands/module.command',
    className: 'ModuleCommand',
  },
  {
    name: 'module-list',
    description: 'List all installed modules',
    modulePath: '../commands/module.command',
    className: 'ModuleCommand',
  },
  {
    name: 'module-enable',
    description: 'Enable a module',
    modulePath: '../commands/module.command',
    className: 'ModuleCommand',
  },
  {
    name: 'module-disable',
    description: 'Disable a module',
    modulePath: '../commands/module.command',
    className: 'ModuleCommand',
  },
  {
    name: 'module-info',
    description: 'Show module information',
    modulePath: '../commands/module.command',
    className: 'ModuleCommand',
  },
  
  // 数据库命令
  {
    name: 'db-migrate',
    description: 'Run database migrations',
    modulePath: '../commands/database.command',
    className: 'DatabaseCommand',
  },
  {
    name: 'db-seed',
    description: 'Run database seeds',
    modulePath: '../commands/database.command',
    className: 'DatabaseCommand',
  },
  {
    name: 'db-reset',
    description: 'Reset database',
    modulePath: '../commands/database.command',
    className: 'DatabaseCommand',
  },
  
  // 配置命令
  {
    name: 'config-show',
    description: 'Show current configuration',
    modulePath: '../commands/config.command',
    className: 'ConfigCommand',
  },
  {
    name: 'config-set',
    description: 'Set a configuration value',
    modulePath: '../commands/config.command',
    className: 'ConfigCommand',
  },
  
  // 项目命令
  {
    name: 'create',
    description: 'Create a new project',
    modulePath: '../commands/create.command',
    className: 'CreateCommand',
    preload: true, // 常用命令，预加载
    priority: 1,
  },
  {
    name: 'init',
    description: 'Initialize the project',
    modulePath: '../commands/init.command',
    className: 'InitCommand',
    preload: true,
    priority: 2,
  },
];

/**
 * 注册所有命令定义
 */
export function registerAllCommands(): void {
  const registry = CommandRegistry.getInstance();
  
  COMMAND_DEFINITIONS.forEach(def => {
    registry.register(
      def.name,
      def.description,
      def.modulePath,
      def.className
    );
  });
}

/**
 * 获取预加载命令列表
 */
export function getPreloadCommands(): string[] {
  return COMMAND_DEFINITIONS
    .filter(def => def.preload)
    .sort((a, b) => (a.priority || 100) - (b.priority || 100))
    .map(def => def.name);
}