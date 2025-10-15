import { Injectable, Logger } from '@nestjs/common';
const chalk = require('chalk');
import * as fs from 'fs-extra';
import * as path from 'path';
import { ConfigService } from '../../config/config.service';

@Injectable()
export class ModuleCommand {
  private readonly logger = new Logger(ModuleCommand.name);

  constructor(
    private configService: ConfigService,
  ) {}

  async install(source?: string): Promise<void> {
    console.log(chalk.yellow('Module install command is deprecated. Use "module add <name>" instead.'));
  }

  async list(): Promise<void> {
    try {
      // Read from creatoria.config.json
      const configPath = path.resolve(process.cwd(), 'creatoria.config.json');
      if (!fs.existsSync(configPath)) {
        console.log(chalk.yellow('Not in a Creatoria SaaS project directory.'));
        return;
      }
      
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      const modules = config.modules || [];
      
      if (modules.length === 0) {
        console.log(chalk.yellow('No modules installed'));
        return;
      }

      console.log(chalk.blue('\nInstalled Modules:\n'));
      console.log(chalk.gray('─'.repeat(60)));
      
      for (const moduleName of modules) {
        console.log(`${chalk.green('●')} ${chalk.white(moduleName)}`);
      }
      
      console.log(chalk.gray('─'.repeat(60)));
      console.log(chalk.gray(`\nTotal: ${modules.length} modules`));
    } catch (error) {
      console.error(chalk.red('Failed to list modules:'), error.message);
    }
  }

  async enable(name: string): Promise<void> {
    console.log(chalk.yellow('Module enable/disable is not supported with static modules.'));
  }

  async disable(name: string): Promise<void> {
    console.log(chalk.yellow('Module enable/disable is not supported with static modules.'));
  }

  async info(name: string): Promise<void> {
    try {
      const modulePath = path.resolve(process.cwd(), 'src/modules', name);
      if (!fs.existsSync(modulePath)) {
        console.log(chalk.red(`Module ${name} not found`));
        return;
      }

      console.log(chalk.blue(`\nModule Information: ${name}\n`));
      console.log(chalk.gray('─'.repeat(60)));
      console.log(`${chalk.cyan('Name:')}         ${name}`);
      console.log(`${chalk.cyan('Path:')}         ${modulePath}`);
      console.log(chalk.gray('─'.repeat(60)));
    } catch (error) {
      console.error(chalk.red('Failed to get module info:'), error.message);
    }
  }

  // Methods for integration tests
  async runAdd(args: string[], options: any): Promise<void> {
    const moduleName = args[0];
    const source = options.source;
    const skipInstall = options.skipInstall;
    
    if (!moduleName) {
      throw new Error('Module name is required');
    }
    
    if (!source || !await fs.pathExists(source)) {
      throw new Error('Valid source path is required');
    }
    
    const modulePath = path.join(process.cwd(), 'modules', moduleName);
    
    if (await fs.pathExists(modulePath) && !options.force) {
      throw new Error(`Module ${moduleName} already exists`);
    }
    
    await fs.copy(source, modulePath);
    
    const configPath = path.join(process.cwd(), '.creatoria', 'config.json');
    const config = await fs.readJSON(configPath);
    if (!config.modules.includes(moduleName)) {
      config.modules.push(moduleName);
      await fs.writeJSON(configPath, config, { spaces: 2 });
    }
    
    if (!skipInstall) {
      console.log('Installing module dependencies...');
    }
  }
  
  async runList(args: string[], options: any): Promise<void> {
    await this.list();
  }
  
  async runRemove(args: string[], options: any): Promise<void> {
    const moduleName = args[0];
    
    if (!moduleName) {
      throw new Error('Module name is required');
    }
    
    const modulePath = path.join(process.cwd(), 'modules', moduleName);
    
    if (!await fs.pathExists(modulePath)) {
      throw new Error(`Module ${moduleName} does not exist`);
    }
    
    if (!options.force) {
      console.log('Use --force to confirm removal');
      return;
    }
    
    await fs.remove(modulePath);
    
    const configPath = path.join(process.cwd(), '.creatoria', 'config.json');
    const config = await fs.readJSON(configPath);
    config.modules = config.modules.filter((m: string) => m !== moduleName);
    await fs.writeJSON(configPath, config, { spaces: 2 });
  }
}