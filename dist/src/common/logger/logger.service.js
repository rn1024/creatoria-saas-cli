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
var LoggerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = exports.LoggerService = void 0;
const common_1 = require("@nestjs/common");
const logger_config_1 = require("./logger.config");
const console_transport_1 = require("./transports/console.transport");
const file_transport_1 = require("./transports/file.transport");
let LoggerService = class LoggerService {
    static { LoggerService_1 = this; }
    config;
    context;
    consoleTransport;
    fileTransport;
    static globalInstance;
    constructor(context) {
        this.config = this.loadConfig();
        if (typeof context === 'string') {
            this.context = { module: context };
        }
        else {
            this.context = context;
        }
        this.initializeTransports();
    }
    static getGlobalInstance() {
        if (!LoggerService_1.globalInstance) {
            LoggerService_1.globalInstance = new LoggerService_1('Global');
        }
        return LoggerService_1.globalInstance;
    }
    loadConfig() {
        const config = { ...logger_config_1.defaultLoggerConfig };
        if (process.env.LOG_LEVEL) {
            config.level = (0, logger_config_1.parseLogLevel)(process.env.LOG_LEVEL);
        }
        if (process.env.LOG_FILE) {
            config.filePath = process.env.LOG_FILE;
        }
        if (process.env.LOG_JSON === 'true') {
            config.json = true;
        }
        if (process.env.LOG_NO_COLOR === 'true') {
            config.colors = false;
        }
        return config;
    }
    initializeTransports() {
        if (this.config.console) {
            this.consoleTransport = new console_transport_1.ConsoleTransport(this.config.colors, !this.config.json);
        }
        if (this.config.file && this.config.filePath) {
            this.fileTransport = new file_transport_1.FileTransport(this.config.filePath, this.config.maxFileSize, this.config.maxFiles);
        }
    }
    setContext(context) {
        if (typeof context === 'string') {
            this.context = { module: context };
        }
        else {
            this.context = context;
        }
        return this;
    }
    addContext(context) {
        this.context = { ...this.context, ...context };
        return this;
    }
    debug(message, context) {
        this.log(logger_config_1.LogLevel.DEBUG, message, context);
    }
    info(message, context) {
        this.log(logger_config_1.LogLevel.INFO, message, context);
    }
    warn(message, context) {
        this.log(logger_config_1.LogLevel.WARN, message, context);
    }
    error(message, error, context) {
        const errorObj = typeof error === 'string' ? new Error(error) : error;
        this.log(logger_config_1.LogLevel.ERROR, message, context, errorObj);
    }
    fatal(message, error, context) {
        const errorObj = typeof error === 'string' ? new Error(error) : error;
        this.log(logger_config_1.LogLevel.FATAL, message, context, errorObj);
    }
    log(level, message, context, error) {
        if (level < this.config.level) {
            return;
        }
        const entry = {
            timestamp: new Date(),
            level,
            message,
            context: { ...this.context, ...context },
            error,
        };
        if (this.consoleTransport) {
            this.consoleTransport.write(entry);
        }
        if (this.fileTransport) {
            this.fileTransport.write(entry);
        }
    }
    async time(label, fn, context) {
        const start = Date.now();
        try {
            const result = await fn();
            const duration = Date.now() - start;
            this.debug(`${label} completed`, {
                ...context,
                duration,
            });
            return result;
        }
        catch (error) {
            const duration = Date.now() - start;
            this.error(`${label} failed`, error, {
                ...context,
                duration,
            });
            throw error;
        }
    }
    child(context) {
        const childContext = typeof context === 'string'
            ? { module: context }
            : context;
        return new LoggerService_1({
            ...this.context,
            ...childContext,
        });
    }
    flush() {
        if (this.consoleTransport) {
            this.consoleTransport.flush();
        }
        if (this.fileTransport) {
            this.fileTransport.flush();
        }
    }
    close() {
        this.flush();
        if (this.fileTransport) {
            this.fileTransport.close();
        }
    }
};
exports.LoggerService = LoggerService;
exports.LoggerService = LoggerService = LoggerService_1 = __decorate([
    (0, common_1.Injectable)({ scope: common_1.Scope.TRANSIENT }),
    __metadata("design:paramtypes", [Object])
], LoggerService);
exports.logger = LoggerService.getGlobalInstance();
//# sourceMappingURL=logger.service.js.map