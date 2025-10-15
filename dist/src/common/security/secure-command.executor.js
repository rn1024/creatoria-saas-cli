"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecureCommandExecutor = void 0;
const common_1 = require("@nestjs/common");
const child_process_1 = require("child_process");
const util_1 = require("util");
const command_security_service_1 = require("./command-security.service");
const logger_service_1 = require("../logger/logger.service");
const base_exception_1 = require("../exceptions/base.exception");
const error_codes_1 = require("../constants/error-codes");
const execAsync = (0, util_1.promisify)(child_process_1.exec);
const execFileAsync = (0, util_1.promisify)(child_process_1.execFile);
let SecureCommandExecutor = class SecureCommandExecutor {
    commandSecurity;
    logger;
    constructor(commandSecurity, logger) {
        this.commandSecurity = commandSecurity;
        this.logger = logger;
    }
    async execute(command, args = [], options = {}) {
        const startTime = Date.now();
        try {
            this.commandSecurity.validateCommand(command);
            const safeArgs = this.commandSecurity.validateArguments(args);
            const safeOptions = this.commandSecurity.createSafeOptions(options);
            if (options.env) {
                safeOptions.env = {
                    ...process.env,
                    ...this.commandSecurity.validateEnvironment(options.env),
                };
            }
            this.logger.debug('执行安全命令', { command, args: safeArgs });
            const result = await execFileAsync(command, safeArgs, safeOptions);
            const duration = Date.now() - startTime;
            this.commandSecurity.logCommandExecution(command, safeArgs, 'success');
            return {
                stdout: result.stdout,
                stderr: result.stderr,
                exitCode: 0,
                duration,
            };
        }
        catch (error) {
            const duration = Date.now() - startTime;
            this.commandSecurity.logCommandExecution(command, args, 'failure', error);
            if (error.killed) {
                throw new base_exception_1.BaseException(error_codes_1.ERROR_CODES.NET_TIMEOUT, { url: command });
            }
            return {
                stdout: error.stdout || '',
                stderr: error.stderr || error.message,
                exitCode: error.code || 1,
                duration,
            };
        }
    }
    async executeStream(command, args = [], options = {}, onData) {
        const startTime = Date.now();
        return new Promise((resolve, reject) => {
            try {
                this.commandSecurity.validateCommand(command);
                const safeArgs = this.commandSecurity.validateArguments(args);
                const safeOptions = this.commandSecurity.createSafeOptions(options);
                if (options.env) {
                    safeOptions.env = {
                        ...process.env,
                        ...this.commandSecurity.validateEnvironment(options.env),
                    };
                }
                this.logger.debug('执行流式命令', { command, args: safeArgs });
                const child = (0, child_process_1.spawn)(command, safeArgs, {
                    ...safeOptions,
                    shell: false,
                });
                let stdout = '';
                let stderr = '';
                let killed = false;
                let timeoutId;
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
                child.stdout?.on('data', (chunk) => {
                    const data = chunk.toString();
                    stdout += data;
                    if (onData) {
                        onData(data, 'stdout');
                    }
                    if (stdout.length > (safeOptions.maxBuffer || 10 * 1024 * 1024)) {
                        child.kill('SIGTERM');
                        reject(new base_exception_1.BaseException(error_codes_1.ERROR_CODES.SYSTEM_OUT_OF_MEMORY, { message: 'Output buffer exceeded' }));
                    }
                });
                child.stderr?.on('data', (chunk) => {
                    const data = chunk.toString();
                    stderr += data;
                    if (onData) {
                        onData(data, 'stderr');
                    }
                    if (stderr.length > (safeOptions.maxBuffer || 10 * 1024 * 1024)) {
                        child.kill('SIGTERM');
                        reject(new base_exception_1.BaseException(error_codes_1.ERROR_CODES.SYSTEM_OUT_OF_MEMORY, { message: 'Error buffer exceeded' }));
                    }
                });
                if (options.input) {
                    child.stdin?.write(options.input);
                    child.stdin?.end();
                }
                child.on('close', (code) => {
                    if (timeoutId) {
                        clearTimeout(timeoutId);
                    }
                    const duration = Date.now() - startTime;
                    if (killed) {
                        this.commandSecurity.logCommandExecution(command, safeArgs, 'failure', 'Timeout');
                        reject(new base_exception_1.BaseException(error_codes_1.ERROR_CODES.NET_TIMEOUT, { url: command }));
                    }
                    else if (code === 0) {
                        this.commandSecurity.logCommandExecution(command, safeArgs, 'success');
                        resolve({
                            stdout,
                            stderr,
                            exitCode: code || 0,
                            duration,
                        });
                    }
                    else {
                        this.commandSecurity.logCommandExecution(command, safeArgs, 'failure', `Exit code: ${code}`);
                        resolve({
                            stdout,
                            stderr,
                            exitCode: code || 1,
                            duration,
                        });
                    }
                });
                child.on('error', (error) => {
                    if (timeoutId) {
                        clearTimeout(timeoutId);
                    }
                    const duration = Date.now() - startTime;
                    this.commandSecurity.logCommandExecution(command, safeArgs, 'failure', error);
                    reject(new base_exception_1.BaseException(error_codes_1.ERROR_CODES.CLI_BUILD_FAILED, { error: error.message }));
                });
            }
            catch (error) {
                const duration = Date.now() - startTime;
                this.commandSecurity.logCommandExecution(command, args, 'failure', error);
                reject(error);
            }
        });
    }
    async executePackageManager(pm, args, options = {}) {
        const safePackageManagerArgs = [
            'install', 'i', 'add', 'remove', 'rm', 'uninstall',
            'update', 'upgrade', 'outdated', 'list', 'ls',
            'run', 'test', 'build', 'start', 'dev',
            'publish', 'pack', 'link', 'unlink',
            'audit', 'fix', 'ci', 'prune',
            'init', 'create', 'info', 'view',
        ];
        if (args.length > 0 && !safePackageManagerArgs.includes(args[0])) {
            if (args[0] !== 'run-script' && args[0] !== 'run') {
                throw new base_exception_1.BaseException(error_codes_1.ERROR_CODES.CLI_INVALID_ARGUMENT, { argument: args[0] });
            }
        }
        return this.execute(pm, args, options);
    }
    async executeGit(args, options = {}) {
        const safeGitCommands = [
            'init', 'clone', 'add', 'commit', 'push', 'pull',
            'fetch', 'merge', 'rebase', 'branch', 'checkout',
            'status', 'diff', 'log', 'show', 'tag',
            'stash', 'remote', 'config', 'rev-parse',
        ];
        if (args.length > 0 && !safeGitCommands.includes(args[0])) {
            this.logger.warn('尝试执行未授权的git命令', { command: args[0] });
            throw new base_exception_1.BaseException(error_codes_1.ERROR_CODES.CLI_INVALID_ARGUMENT, { argument: args[0] });
        }
        return this.execute('git', args, options);
    }
    async executeWithRetry(command, args = [], options = {}, maxRetries = 3, retryDelay = 1000) {
        let lastError;
        for (let i = 0; i <= maxRetries; i++) {
            try {
                const result = await this.execute(command, args, options);
                if (result.exitCode === 0) {
                    return result;
                }
                lastError = new Error(`Command failed with exit code ${result.exitCode}`);
            }
            catch (error) {
                lastError = error;
            }
            if (i < maxRetries) {
                this.logger.debug(`重试命令 (${i + 1}/${maxRetries})`, { command });
                await new Promise(resolve => setTimeout(resolve, retryDelay * (i + 1)));
            }
        }
        throw lastError;
    }
    async commandExists(command) {
        try {
            const result = await this.execute('which', [command]);
            return result.exitCode === 0;
        }
        catch {
            try {
                const result = await this.execute('where', [command]);
                return result.exitCode === 0;
            }
            catch {
                return false;
            }
        }
    }
};
exports.SecureCommandExecutor = SecureCommandExecutor;
exports.SecureCommandExecutor = SecureCommandExecutor = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [command_security_service_1.CommandSecurityService,
        logger_service_1.LoggerService])
], SecureCommandExecutor);
//# sourceMappingURL=secure-command.executor.js.map