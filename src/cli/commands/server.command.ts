import { Injectable, Logger } from '@nestjs/common';
import * as chalk from 'chalk';
import * as fs from 'fs-extra';
import * as path from 'path';
import { spawn, ChildProcess } from 'child_process';
import * as dotenv from 'dotenv';

interface StartOptions {
  port?: number;
  env?: string;
  daemon?: boolean;
  workers?: number;
  pid?: string;
}

interface DevOptions {
  port?: number;
  watch?: boolean;
  watchModules?: boolean;
  debug?: boolean;
  inspect?: number;
}

@Injectable()
export class ServerCommand {
  private readonly logger = new Logger(ServerCommand.name);
  private serverProcess: ChildProcess | null = null;

  /**
   * Start the application in production mode
   */
  async start(options: StartOptions = {}): Promise<void> {
    try {
      console.log(chalk.blue('🚀 Starting Creatoria SaaS Server...'));

      // Load environment variables
      const envFile = options.env ? `.env.${options.env}` : '.env';
      const envPath = path.join(process.cwd(), envFile);
      
      if (await fs.pathExists(envPath)) {
        dotenv.config({ path: envPath });
        console.log(chalk.gray(`Loaded environment from ${envFile}`));
      }

      // Override port if specified
      if (options.port) {
        process.env.PORT = String(options.port);
      }

      // Check if build exists
      const distPath = path.join(process.cwd(), 'dist');
      if (!await fs.pathExists(distPath)) {
        console.log(chalk.yellow('No build found. Building application...'));
        await this.build();
      }

      const port = process.env.PORT || 3000;

      if (options.daemon) {
        // Start with PM2
        await this.startWithPM2(options);
      } else {
        // Start directly
        console.log(chalk.green(`Starting server on port ${port}...`));
        
        this.serverProcess = spawn('node', ['dist/src/main.js'], {
          stdio: 'inherit',
          env: {
            ...process.env,
            NODE_ENV: 'production',
            HTTP_SERVER_ENABLED: 'true',
          },
        });

        this.serverProcess.on('error', (error) => {
          console.error(chalk.red('Failed to start server:'), error);
          process.exit(1);
        });

        this.serverProcess.on('exit', (code) => {
          if (code !== 0) {
            console.error(chalk.red(`Server exited with code ${code}`));
            process.exit(code || 1);
          }
        });

        // Handle graceful shutdown
        process.on('SIGINT', () => this.gracefulShutdown());
        process.on('SIGTERM', () => this.gracefulShutdown());

        console.log(chalk.green(`
✨ Server started successfully!
🌐 URL: http://localhost:${port}
📚 API Docs: http://localhost:${port}/api-docs
🔧 Environment: ${process.env.NODE_ENV || 'production'}
        `));
      }
    } catch (error) {
      console.error(chalk.red('Failed to start server:'), error.message);
      process.exit(1);
    }
  }

  /**
   * Start the application in development mode
   */
  async dev(options: DevOptions = {}): Promise<void> {
    try {
      console.log(chalk.blue('🔧 Starting Creatoria SaaS in development mode...'));

      // Load development environment
      const envPath = path.join(process.cwd(), '.env');
      if (await fs.pathExists(envPath)) {
        dotenv.config({ path: envPath });
      }

      // Override port if specified
      if (options.port) {
        process.env.PORT = String(options.port);
      }

      const port = process.env.PORT || 3000;

      // Build command arguments
      const args = ['run', 'start:dev'];
      
      if (options.debug || options.inspect) {
        const inspectPort = options.inspect || 9229;
        args.push('--', `--inspect=${inspectPort}`);
        console.log(chalk.yellow(`Debug mode enabled on port ${inspectPort}`));
      }

      // Check if package.json exists
      const packageJsonPath = path.join(process.cwd(), 'package.json');
      if (!await fs.pathExists(packageJsonPath)) {
        throw new Error('package.json not found. Are you in a Creatoria project directory?');
      }

      // Detect package manager
      const packageManager = await this.detectPackageManager();
      console.log(chalk.gray(`Using ${packageManager}...`));

      // Start development server
      this.serverProcess = spawn(packageManager, args, {
        stdio: 'inherit',
        env: {
          ...process.env,
          NODE_ENV: 'development',
          HTTP_SERVER_ENABLED: 'true',
        },
      });

      this.serverProcess.on('error', (error) => {
        console.error(chalk.red('Failed to start development server:'), error);
        process.exit(1);
      });

      this.serverProcess.on('exit', (code) => {
        if (code !== 0) {
          console.error(chalk.red(`Development server exited with code ${code}`));
        }
      });

      // Handle graceful shutdown
      process.on('SIGINT', () => this.gracefulShutdown());
      process.on('SIGTERM', () => this.gracefulShutdown());

      console.log(chalk.green(`
🔥 Development server started!
🌐 URL: http://localhost:${port}
📚 API Docs: http://localhost:${port}/api-docs
🔧 Hot Reload: Enabled
${options.debug ? `🐛 Debugger: Listening on port ${options.inspect || 9229}` : ''}

Press Ctrl+C to stop
      `));
    } catch (error) {
      console.error(chalk.red('Failed to start development server:'), error.message);
      process.exit(1);
    }
  }

  /**
   * Stop the running server
   */
  async stop(options: { pid?: string } = {}): Promise<void> {
    try {
      console.log(chalk.yellow('Stopping server...'));

      if (options.pid) {
        // Stop by PID
        process.kill(Number(options.pid), 'SIGTERM');
        console.log(chalk.green('Server stop signal sent'));
      } else if (this.serverProcess) {
        // Stop current process
        this.serverProcess.kill('SIGTERM');
        console.log(chalk.green('Server stopped'));
      } else {
        // Try to stop PM2 process
        await this.stopPM2();
      }
    } catch (error) {
      console.error(chalk.red('Failed to stop server:'), error.message);
      process.exit(1);
    }
  }

  /**
   * Restart the server
   */
  async restart(options: StartOptions = {}): Promise<void> {
    console.log(chalk.yellow('Restarting server...'));
    await this.stop();
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
    await this.start(options);
  }

  /**
   * Show server status
   */
  async status(): Promise<void> {
    try {
      // Check if PM2 is running
      const pm2Status = await this.getPM2Status();
      if (pm2Status) {
        console.log(chalk.blue('Server Status (PM2):'));
        console.log(pm2Status);
        return;
      }

      // Check if local process is running
      if (this.serverProcess && !this.serverProcess.killed) {
        console.log(chalk.green('✓ Server is running'));
        console.log(`  PID: ${this.serverProcess.pid}`);
      } else {
        console.log(chalk.yellow('⚠ Server is not running'));
      }
    } catch (error) {
      console.error(chalk.red('Failed to get server status:'), error.message);
    }
  }

  /**
   * Build the application
   */
  private async build(): Promise<void> {
    const packageManager = await this.detectPackageManager();
    
    return new Promise((resolve, reject) => {
      const buildProcess = spawn(packageManager, ['run', 'build'], {
        stdio: 'inherit',
      });

      buildProcess.on('error', reject);
      buildProcess.on('exit', (code) => {
        if (code === 0) {
          console.log(chalk.green('✓ Build completed successfully'));
          resolve();
        } else {
          reject(new Error(`Build failed with code ${code}`));
        }
      });
    });
  }

  /**
   * Detect which package manager to use
   */
  private async detectPackageManager(): Promise<string> {
    const cwd = process.cwd();
    
    if (await fs.pathExists(path.join(cwd, 'pnpm-lock.yaml'))) {
      return 'pnpm';
    }
    if (await fs.pathExists(path.join(cwd, 'yarn.lock'))) {
      return 'yarn';
    }
    return 'npm';
  }

  /**
   * Start with PM2 process manager
   */
  private async startWithPM2(options: StartOptions): Promise<void> {
    const pm2Config = {
      name: 'creatoria-saas',
      script: 'dist/src/main.js',
      instances: options.workers || 'max',
      exec_mode: 'cluster',
      env: {
        ...process.env,
        NODE_ENV: 'production',
        HTTP_SERVER_ENABLED: 'true',
      },
      pid_file: options.pid || '.pm2/creatoria.pid',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      error_file: 'logs/error.log',
      out_file: 'logs/out.log',
      merge_logs: true,
      max_memory_restart: '1G',
    };

    // Write PM2 config
    const configPath = path.join(process.cwd(), 'ecosystem.config.js');
    const configContent = `module.exports = {
  apps: [${JSON.stringify(pm2Config, null, 2)}]
};`;
    
    await fs.writeFile(configPath, configContent);

    // Start with PM2
    const pm2Process = spawn('pm2', ['start', 'ecosystem.config.js'], {
      stdio: 'inherit',
    });

    return new Promise((resolve, reject) => {
      pm2Process.on('error', (error) => {
        console.error(chalk.red('PM2 not found. Please install it globally: npm install -g pm2'));
        reject(error);
      });

      pm2Process.on('exit', (code) => {
        if (code === 0) {
          console.log(chalk.green('✓ Server started with PM2'));
          console.log(chalk.gray('Use "pm2 status" to check process status'));
          console.log(chalk.gray('Use "pm2 logs" to view logs'));
          console.log(chalk.gray('Use "pm2 stop creatoria-saas" to stop'));
          resolve();
        } else {
          reject(new Error(`PM2 start failed with code ${code}`));
        }
      });
    });
  }

  /**
   * Stop PM2 process
   */
  private async stopPM2(): Promise<void> {
    return new Promise((resolve, reject) => {
      const pm2Process = spawn('pm2', ['stop', 'creatoria-saas'], {
        stdio: 'inherit',
      });

      pm2Process.on('error', () => {
        console.log(chalk.yellow('PM2 process not found'));
        resolve();
      });

      pm2Process.on('exit', (code) => {
        if (code === 0) {
          console.log(chalk.green('✓ PM2 process stopped'));
        }
        resolve();
      });
    });
  }

  /**
   * Get PM2 status
   */
  private async getPM2Status(): Promise<string | null> {
    return new Promise((resolve) => {
      const pm2Process = spawn('pm2', ['show', 'creatoria-saas']);

      let output = '';
      
      pm2Process.stdout?.on('data', (data) => {
        output += data.toString();
      });

      pm2Process.on('error', () => {
        resolve(null);
      });

      pm2Process.on('exit', (code) => {
        if (code === 0 && output) {
          resolve(output);
        } else {
          resolve(null);
        }
      });
    });
  }

  /**
   * Graceful shutdown
   */
  private gracefulShutdown(): void {
    console.log(chalk.yellow('\nGracefully shutting down...'));
    
    if (this.serverProcess) {
      this.serverProcess.kill('SIGTERM');
      
      // Force kill after 5 seconds
      setTimeout(() => {
        if (this.serverProcess && !this.serverProcess.killed) {
          console.log(chalk.red('Force killing process...'));
          this.serverProcess.kill('SIGKILL');
        }
        process.exit(0);
      }, 5000);
    } else {
      process.exit(0);
    }
  }
}