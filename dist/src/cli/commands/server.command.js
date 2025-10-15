"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var ServerCommand_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServerCommand = void 0;
const common_1 = require("@nestjs/common");
const chalk = __importStar(require("chalk"));
const fs = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
const child_process_1 = require("child_process");
const dotenv = __importStar(require("dotenv"));
let ServerCommand = ServerCommand_1 = class ServerCommand {
    logger = new common_1.Logger(ServerCommand_1.name);
    serverProcess = null;
    async start(options = {}) {
        try {
            console.log(chalk.blue('🚀 Starting Creatoria SaaS Server...'));
            const envFile = options.env ? `.env.${options.env}` : '.env';
            const envPath = path.join(process.cwd(), envFile);
            if (await fs.pathExists(envPath)) {
                dotenv.config({ path: envPath });
                console.log(chalk.gray(`Loaded environment from ${envFile}`));
            }
            if (options.port) {
                process.env.PORT = String(options.port);
            }
            const distPath = path.join(process.cwd(), 'dist');
            if (!await fs.pathExists(distPath)) {
                console.log(chalk.yellow('No build found. Building application...'));
                await this.build();
            }
            const port = process.env.PORT || 3000;
            if (options.daemon) {
                await this.startWithPM2(options);
            }
            else {
                console.log(chalk.green(`Starting server on port ${port}...`));
                this.serverProcess = (0, child_process_1.spawn)('node', ['dist/src/main.js'], {
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
                process.on('SIGINT', () => this.gracefulShutdown());
                process.on('SIGTERM', () => this.gracefulShutdown());
                console.log(chalk.green(`
✨ Server started successfully!
🌐 URL: http://localhost:${port}
📚 API Docs: http://localhost:${port}/api-docs
🔧 Environment: ${process.env.NODE_ENV || 'production'}
        `));
            }
        }
        catch (error) {
            console.error(chalk.red('Failed to start server:'), error.message);
            process.exit(1);
        }
    }
    async dev(options = {}) {
        try {
            console.log(chalk.blue('🔧 Starting Creatoria SaaS in development mode...'));
            const envPath = path.join(process.cwd(), '.env');
            if (await fs.pathExists(envPath)) {
                dotenv.config({ path: envPath });
            }
            if (options.port) {
                process.env.PORT = String(options.port);
            }
            const port = process.env.PORT || 3000;
            const args = ['run', 'start:dev'];
            if (options.debug || options.inspect) {
                const inspectPort = options.inspect || 9229;
                args.push('--', `--inspect=${inspectPort}`);
                console.log(chalk.yellow(`Debug mode enabled on port ${inspectPort}`));
            }
            const packageJsonPath = path.join(process.cwd(), 'package.json');
            if (!await fs.pathExists(packageJsonPath)) {
                throw new Error('package.json not found. Are you in a Creatoria project directory?');
            }
            const packageManager = await this.detectPackageManager();
            console.log(chalk.gray(`Using ${packageManager}...`));
            this.serverProcess = (0, child_process_1.spawn)(packageManager, args, {
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
        }
        catch (error) {
            console.error(chalk.red('Failed to start development server:'), error.message);
            process.exit(1);
        }
    }
    async stop(options = {}) {
        try {
            console.log(chalk.yellow('Stopping server...'));
            if (options.pid) {
                process.kill(Number(options.pid), 'SIGTERM');
                console.log(chalk.green('Server stop signal sent'));
            }
            else if (this.serverProcess) {
                this.serverProcess.kill('SIGTERM');
                console.log(chalk.green('Server stopped'));
            }
            else {
                await this.stopPM2();
            }
        }
        catch (error) {
            console.error(chalk.red('Failed to stop server:'), error.message);
            process.exit(1);
        }
    }
    async restart(options = {}) {
        console.log(chalk.yellow('Restarting server...'));
        await this.stop();
        await new Promise(resolve => setTimeout(resolve, 1000));
        await this.start(options);
    }
    async status() {
        try {
            const pm2Status = await this.getPM2Status();
            if (pm2Status) {
                console.log(chalk.blue('Server Status (PM2):'));
                console.log(pm2Status);
                return;
            }
            if (this.serverProcess && !this.serverProcess.killed) {
                console.log(chalk.green('✓ Server is running'));
                console.log(`  PID: ${this.serverProcess.pid}`);
            }
            else {
                console.log(chalk.yellow('⚠ Server is not running'));
            }
        }
        catch (error) {
            console.error(chalk.red('Failed to get server status:'), error.message);
        }
    }
    async build() {
        const packageManager = await this.detectPackageManager();
        return new Promise((resolve, reject) => {
            const buildProcess = (0, child_process_1.spawn)(packageManager, ['run', 'build'], {
                stdio: 'inherit',
            });
            buildProcess.on('error', reject);
            buildProcess.on('exit', (code) => {
                if (code === 0) {
                    console.log(chalk.green('✓ Build completed successfully'));
                    resolve();
                }
                else {
                    reject(new Error(`Build failed with code ${code}`));
                }
            });
        });
    }
    async detectPackageManager() {
        const cwd = process.cwd();
        if (await fs.pathExists(path.join(cwd, 'pnpm-lock.yaml'))) {
            return 'pnpm';
        }
        if (await fs.pathExists(path.join(cwd, 'yarn.lock'))) {
            return 'yarn';
        }
        return 'npm';
    }
    async startWithPM2(options) {
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
        const configPath = path.join(process.cwd(), 'ecosystem.config.js');
        const configContent = `module.exports = {
  apps: [${JSON.stringify(pm2Config, null, 2)}]
};`;
        await fs.writeFile(configPath, configContent);
        const pm2Process = (0, child_process_1.spawn)('pm2', ['start', 'ecosystem.config.js'], {
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
                }
                else {
                    reject(new Error(`PM2 start failed with code ${code}`));
                }
            });
        });
    }
    async stopPM2() {
        return new Promise((resolve, reject) => {
            const pm2Process = (0, child_process_1.spawn)('pm2', ['stop', 'creatoria-saas'], {
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
    async getPM2Status() {
        return new Promise((resolve) => {
            const pm2Process = (0, child_process_1.spawn)('pm2', ['show', 'creatoria-saas']);
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
                }
                else {
                    resolve(null);
                }
            });
        });
    }
    gracefulShutdown() {
        console.log(chalk.yellow('\nGracefully shutting down...'));
        if (this.serverProcess) {
            this.serverProcess.kill('SIGTERM');
            setTimeout(() => {
                if (this.serverProcess && !this.serverProcess.killed) {
                    console.log(chalk.red('Force killing process...'));
                    this.serverProcess.kill('SIGKILL');
                }
                process.exit(0);
            }, 5000);
        }
        else {
            process.exit(0);
        }
    }
};
exports.ServerCommand = ServerCommand;
exports.ServerCommand = ServerCommand = ServerCommand_1 = __decorate([
    (0, common_1.Injectable)()
], ServerCommand);
//# sourceMappingURL=server.command.js.map