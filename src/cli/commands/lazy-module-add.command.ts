/**
 * 懒加载版本的模块添加命令
 */

import { LazyCommand, CommandHandler } from '../decorators/lazy-command.decorator';
import { ModuleAddCommand } from './module-add.command';
import { CommandRegistry } from '../core/command-registry';

// 注册命令到注册表
const registry = CommandRegistry.getInstance();
registry.register(
  'module-add',
  'Add a module to the project',
  '../commands/module-add.command',
  'ModuleAddCommand'
);

// 也可以使用装饰器方式
@LazyCommand({
  name: 'module-add-lazy',
  description: 'Add a module to the project (lazy loaded)',
  preload: false,
  priority: 10,
})
export class LazyModuleAddCommand extends ModuleAddCommand {
  @CommandHandler({
    validateArgs: true,
    logExecution: true,
  })
  async run(args: string[], options: any): Promise<void> {
    return super.run(args, options);
  }
}