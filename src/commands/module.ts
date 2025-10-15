import { Command } from 'commander';
import * as path from 'path';
import * as fs from 'fs-extra';
import * as chalk from 'chalk';

export const moduleCommand = new Command('module')
  .description('Manage project modules');

moduleCommand
  .command('list')
  .description('List all installed modules')
  .action(listModules);

moduleCommand
  .command('add <module-name>')
  .description('Add a new module to the project')
  .action(addModule);

async function listModules() {
  try {
    const modulesDir = path.join(process.cwd(), 'src', 'modules');

    if (!fs.existsSync(modulesDir)) {
      console.log(chalk.yellow('No modules directory found'));
      return;
    }

    const modules = fs.readdirSync(modulesDir).filter(item => {
      const itemPath = path.join(modulesDir, item);
      return fs.statSync(itemPath).isDirectory();
    });

    if (modules.length === 0) {
      console.log(chalk.yellow('No modules found'));
      return;
    }

    console.log(chalk.cyan('\nInstalled modules:'));
    modules.forEach(module => {
      console.log(chalk.green(`  ✓ ${module}`));
    });
    console.log('');

  } catch (error: any) {
    console.error(chalk.red('Error listing modules:'), error.message);
    process.exit(1);
  }
}

async function addModule(moduleName: string) {
  try {
    console.log(chalk.yellow('\n⚠️  Module generation is not yet implemented in v0.2.0'));
    console.log(chalk.gray('This feature will be added in a future release\n'));
  } catch (error: any) {
    console.error(chalk.red('Error adding module:'), error.message);
    process.exit(1);
  }
}
