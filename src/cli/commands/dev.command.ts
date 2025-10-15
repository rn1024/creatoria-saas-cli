import { Injectable } from '@nestjs/common';
import { Command, CommandRunner, Option } from 'nest-commander';
import * as chalk from 'chalk';
import * as path from 'path';
import * as fs from 'fs-extra';
import { spawn } from 'child_process';
import { HotReloadService } from '../services/hot-reload.service';
import { DynamicModuleLoaderService } from '../services/dynamic-module-loader.service';

interface DevOptions {
  port?: string;
  watch?: boolean;
  hotReload?: boolean;
  debug?: boolean;
}

@Command({
  name: 'dev',
  description: 'Start development server with hot reload',
})
@Injectable()
export class DevCommand extends CommandRunner {
  constructor(
    private readonly hotReloadService: HotReloadService,
    private readonly moduleLoader: DynamicModuleLoaderService,
  ) {
    super();
  }

  async run(passedParams: string[], options: DevOptions): Promise<void> {
    try {
      const projectRoot = process.cwd();
      const packageJsonPath = path.join(projectRoot, 'package.json');

      // Check if in a valid project
      if (!await fs.pathExists(packageJsonPath)) {
        console.log(chalk.red('❌ Not in a Creatoria SaaS project directory'));
        return;
      }

      console.log(chalk.blue('\n🚀 Starting development server...\n'));

      // Start the development server
      const port = options.port || process.env.PORT || '3000';
      const env = {
        ...process.env,
        NODE_ENV: 'development',
        PORT: port,
      };

      if (options.debug) {
        env.DEBUG = '*';
      }

      // Determine the dev command
      const packageJson = await fs.readJSON(packageJsonPath);
      const devScript = packageJson.scripts?.['start:dev'] || 'nest start --watch';

      // Start the NestJS development server
      const devProcess = spawn('npm', ['run', 'start:dev'], {
        env,
        stdio: 'inherit',
        shell: true,
      });

      // Enable hot reload if requested
      if (options.hotReload) {
        console.log(chalk.cyan('\n🔥 Hot reload enabled\n'));
        
        // Wait a bit for the server to start
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Enable hot reload for all modules
        await this.hotReloadService.enableProjectHotReload();
        
        // Register reload callbacks
        await this.registerReloadCallbacks();
      }

      // Handle process termination
      process.on('SIGINT', async () => {
        console.log(chalk.yellow('\n\n👋 Shutting down development server...'));
        
        // Stop hot reload watchers
        if (options.hotReload) {
          await this.hotReloadService.stopAll();
        }
        
        // Kill the dev process
        devProcess.kill('SIGTERM');
        
        process.exit(0);
      });

      // Handle dev process errors
      devProcess.on('error', (error) => {
        console.error(chalk.red('❌ Failed to start development server:'), error);
        process.exit(1);
      });

      devProcess.on('exit', (code) => {
        if (code !== 0 && code !== null) {
          console.error(chalk.red(`❌ Development server exited with code ${code}`));
          process.exit(code);
        }
      });

    } catch (error) {
      console.error(chalk.red('❌ Error:'), error.message);
      process.exit(1);
    }
  }

  /**
   * Register reload callbacks for modules
   */
  private async registerReloadCallbacks(): Promise<void> {
    const projectRoot = process.cwd();
    const modulesPath = path.join(projectRoot, 'src', 'modules');
    
    if (!await fs.pathExists(modulesPath)) {
      return;
    }

    const modules = await fs.readdir(modulesPath);
    
    for (const moduleName of modules) {
      const modulePath = path.join(modulesPath, moduleName);
      const stats = await fs.stat(modulePath);
      
      if (stats.isDirectory()) {
        // Register reload callback
        this.hotReloadService.registerReloadCallback(moduleName, async () => {
          console.log(chalk.cyan(`📦 Reloading module: ${moduleName}`));
          
          // Reload the module using dynamic loader
          const success = await this.moduleLoader.reloadModule(moduleName);
          
          if (success) {
            console.log(chalk.green(`✅ Module reloaded: ${moduleName}`));
            
            // Optionally trigger application reload
            this.triggerAppReload();
          } else {
            console.log(chalk.red(`❌ Failed to reload module: ${moduleName}`));
          }
        });
      }
    }
  }

  /**
   * Trigger application reload (for framework integration)
   */
  private triggerAppReload(): void {
    // Send reload signal to the application
    process.emit('app:reload' as any);
    
    // Touch main.ts to trigger NestJS watch mode reload
    const mainPath = path.join(process.cwd(), 'src', 'main.ts');
    if (fs.existsSync(mainPath)) {
      const currentTime = new Date();
      fs.utimesSync(mainPath, currentTime, currentTime);
    }
  }

  @Option({
    flags: '-p, --port <port>',
    description: 'Port to run the server on',
  })
  parsePort(val: string): string {
    return val;
  }

  @Option({
    flags: '-w, --watch',
    description: 'Enable file watching',
    defaultValue: true,
  })
  parseWatch(): boolean {
    return true;
  }

  @Option({
    flags: '-hr, --hot-reload',
    description: 'Enable hot module reload',
    defaultValue: false,
  })
  parseHotReload(): boolean {
    return true;
  }

  @Option({
    flags: '-d, --debug',
    description: 'Enable debug mode',
    defaultValue: false,
  })
  parseDebug(): boolean {
    return true;
  }
}