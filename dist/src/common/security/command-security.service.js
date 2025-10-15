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
exports.CommandSecurityService = void 0;
const common_1 = require("@nestjs/common");
const base_exception_1 = require("../exceptions/base.exception");
const error_codes_1 = require("../constants/error-codes");
const logger_service_1 = require("../logger/logger.service");
const string_validator_1 = require("../validation/validators/string.validator");
const security_config_1 = require("./security.config");
let CommandSecurityService = class CommandSecurityService {
    logger;
    allowedCommands;
    blockedCommands;
    dangerousPatterns;
    constructor(logger) {
        this.logger = logger;
        const config = (0, security_config_1.getSecurityConfig)();
        this.allowedCommands = new Set(config.commandExecution.allowedCommands);
        this.blockedCommands = new Set(config.commandExecution.blockedCommands);
        this.initializeDangerousPatterns();
    }
    initializeDangerousPatterns() {
        this.dangerousPatterns = [
            /[;&|`$]/,
            /\$\([^)]+\)/,
            /`[^`]+`/,
            /\$\{[^}]+\}/,
            />+|<+|>>|<</,
            /\|\||&&/,
            /\.\.\/|\.\.\\/,
            /[\x00-\x1f\x7f]/,
            /('|(\-\-)|(;)|(\|\|)|(\/\*)|(<>)|(\*\|))/i,
            /\b(rm|del|format|shutdown|reboot|kill|killall)\b/i,
        ];
    }
    validateCommand(command) {
        if (!command || typeof command !== 'string') {
            throw new base_exception_1.BaseException(error_codes_1.ERROR_CODES.CLI_INVALID_COMMAND, { command });
        }
        const config = (0, security_config_1.getSecurityConfig)();
        if (command.length > config.commandExecution.maxCommandLength) {
            throw new base_exception_1.BaseException(error_codes_1.ERROR_CODES.CLI_INVALID_COMMAND, { command: command.substring(0, 50) + '...' });
        }
        const baseCommand = this.extractBaseCommand(command);
        if (this.blockedCommands.has(baseCommand)) {
            this.logger.warn('尝试执行被禁止的命令', { command: baseCommand });
            throw new base_exception_1.BaseException(error_codes_1.ERROR_CODES.CLI_INVALID_COMMAND, { command: baseCommand });
        }
        if (this.allowedCommands.size > 0 && !this.allowedCommands.has(baseCommand)) {
            this.logger.warn('尝试执行未授权的命令', { command: baseCommand });
            throw new base_exception_1.BaseException(error_codes_1.ERROR_CODES.CLI_INVALID_COMMAND, { command: baseCommand });
        }
        for (const pattern of this.dangerousPatterns) {
            if (pattern.test(command)) {
                this.logger.warn('检测到危险的命令模式', { command, pattern: pattern.toString() });
                throw new base_exception_1.BaseException(error_codes_1.ERROR_CODES.VALIDATION_2018, { errors: [{ field: 'command', message: 'Dangerous pattern detected' }] });
            }
        }
    }
    validateArguments(args) {
        if (!Array.isArray(args)) {
            throw new base_exception_1.BaseException(error_codes_1.ERROR_CODES.CLI_INVALID_ARGUMENT, { argument: 'args must be an array' });
        }
        const sanitizedArgs = [];
        for (const arg of args) {
            if (typeof arg !== 'string') {
                throw new base_exception_1.BaseException(error_codes_1.ERROR_CODES.CLI_INVALID_ARGUMENT, { argument: arg });
            }
            for (const pattern of this.dangerousPatterns) {
                if (pattern.test(arg)) {
                    this.logger.warn('检测到危险的命令参数', { arg, pattern: pattern.toString() });
                    throw new base_exception_1.BaseException(error_codes_1.ERROR_CODES.CLI_INVALID_ARGUMENT, { argument: arg });
                }
            }
            const sanitized = this.sanitizeArgument(arg);
            sanitizedArgs.push(sanitized);
        }
        return sanitizedArgs;
    }
    sanitizeArgument(arg) {
        let sanitized = arg.replace(/[\x00-\x1f\x7f]/g, '');
        const config = (0, security_config_1.getSecurityConfig)();
        if (config.commandExecution.useShellEscape) {
            sanitized = string_validator_1.StringValidator.escapeShell(sanitized);
        }
        return sanitized;
    }
    extractBaseCommand(command) {
        const parts = command.trim().split(/\s+/);
        if (parts.length === 0) {
            return '';
        }
        const cmdPart = parts[0];
        const pathSeparators = /[\/\\]/;
        const cmdParts = cmdPart.split(pathSeparators);
        return cmdParts[cmdParts.length - 1];
    }
    createSafeOptions(options = {}) {
        const safeOptions = {};
        const allowedOptions = [
            'cwd', 'env', 'timeout', 'maxBuffer',
            'encoding', 'windowsHide', 'killSignal'
        ];
        for (const key of allowedOptions) {
            if (options[key] !== undefined) {
                safeOptions[key] = options[key];
            }
        }
        safeOptions.shell = false;
        const config = (0, security_config_1.getSecurityConfig)();
        if (!safeOptions.timeout) {
            safeOptions.timeout = config.commandExecution.timeout;
        }
        if (!safeOptions.maxBuffer) {
            safeOptions.maxBuffer = 10 * 1024 * 1024;
        }
        return safeOptions;
    }
    validateEnvironment(env = {}) {
        const safeEnv = {};
        const dangerousEnvVars = [
            'LD_PRELOAD', 'LD_LIBRARY_PATH',
            'DYLD_INSERT_LIBRARIES', 'DYLD_LIBRARY_PATH',
            'PATH', 'PYTHONPATH', 'NODE_PATH',
        ];
        for (const [key, value] of Object.entries(env)) {
            if (dangerousEnvVars.includes(key)) {
                this.logger.warn('尝试设置危险的环境变量', { key });
                continue;
            }
            if (typeof value !== 'string') {
                continue;
            }
            let isSafe = true;
            for (const pattern of this.dangerousPatterns) {
                if (pattern.test(value)) {
                    this.logger.warn('环境变量值包含危险模式', { key, value });
                    isSafe = false;
                    break;
                }
            }
            if (isSafe) {
                safeEnv[key] = value;
            }
        }
        return safeEnv;
    }
    logCommandExecution(command, args, result, error) {
        const logData = {
            command,
            args: args.length > 10 ? args.slice(0, 10).concat(['...']) : args,
            result,
            timestamp: new Date().toISOString(),
            user: process.env.USER || 'unknown',
            pid: process.pid,
        };
        if (error) {
            logData['error'] = error.message || error;
        }
        if (result === 'success') {
            this.logger.info('命令执行成功', logData);
        }
        else {
            this.logger.error('命令执行失败', logData);
        }
    }
    addAllowedCommand(command) {
        this.allowedCommands.add(command);
        this.logger.debug('添加允许的命令', { command });
    }
    addBlockedCommand(command) {
        this.blockedCommands.add(command);
        this.logger.debug('添加禁止的命令', { command });
    }
    getCommandSecurityConfig() {
        return {
            allowedCommands: Array.from(this.allowedCommands),
            blockedCommands: Array.from(this.blockedCommands),
        };
    }
};
exports.CommandSecurityService = CommandSecurityService;
exports.CommandSecurityService = CommandSecurityService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [logger_service_1.LoggerService])
], CommandSecurityService);
//# sourceMappingURL=command-security.service.js.map