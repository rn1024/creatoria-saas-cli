"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseException = void 0;
const error_types_1 = require("../types/error.types");
const error_codes_1 = require("../constants/error-codes");
const chalk = require('chalk');
class BaseException extends Error {
    code;
    category;
    severity;
    context;
    suggestion;
    cause;
    timestamp;
    constructor(message, options = {}) {
        super(message);
        this.name = this.constructor.name;
        this.code = options.code || 'UNKNOWN';
        this.category = options.category || error_types_1.ErrorCategory.SYSTEM;
        this.severity = options.severity || error_types_1.ErrorSeverity.ERROR;
        this.context = options.context;
        this.suggestion = options.suggestion;
        this.cause = options.cause;
        this.timestamp = new Date();
        Object.setPrototypeOf(this, new.target.prototype);
        Error.captureStackTrace(this, this.constructor);
    }
    static fromErrorCode(code, params, options = {}) {
        const message = (0, error_codes_1.formatErrorMessage)(code, params);
        return new BaseException(message, {
            ...options,
            code,
        });
    }
    toResponse() {
        return {
            code: this.code,
            message: this.message,
            category: this.category,
            severity: this.severity,
            context: this.context,
            suggestion: this.suggestion,
            stack: process.env.NODE_ENV === 'development' ? this.stack : undefined,
        };
    }
    toCliOutput() {
        const lines = [];
        const colorFn = this.getColorFunction();
        lines.push(colorFn(`\n${this.getSeverityIcon()} ${this.name}: ${this.message}`));
        if (this.code !== 'UNKNOWN') {
            lines.push(chalk.gray(`   Code: ${this.code}`));
        }
        if (this.context) {
            if (this.context.module) {
                lines.push(chalk.gray(`   Module: ${this.context.module}`));
            }
            if (this.context.method) {
                lines.push(chalk.gray(`   Method: ${this.context.method}`));
            }
            if (this.context.filePath) {
                lines.push(chalk.gray(`   File: ${this.context.filePath}`));
            }
            if (this.context.command) {
                lines.push(chalk.gray(`   Command: ${this.context.command}`));
            }
        }
        if (this.suggestion) {
            lines.push(chalk.cyan(`\n   💡 Suggestion: ${this.suggestion}`));
        }
        if (this.cause && this.cause.message) {
            lines.push(chalk.gray(`\n   Caused by: ${this.cause.message}`));
        }
        if (process.env.NODE_ENV === 'development' && this.stack) {
            lines.push(chalk.gray('\n   Stack trace:'));
            const stackLines = this.stack.split('\n').slice(1, 4);
            stackLines.forEach(line => {
                lines.push(chalk.gray(`   ${line.trim()}`));
            });
        }
        return lines.join('\n');
    }
    getColorFunction() {
        switch (this.severity) {
            case error_types_1.ErrorSeverity.FATAL:
                return chalk.red;
            case error_types_1.ErrorSeverity.ERROR:
                return chalk.red;
            case error_types_1.ErrorSeverity.WARNING:
                return chalk.yellow;
            case error_types_1.ErrorSeverity.INFO:
                return chalk.blue;
            default:
                return chalk.white;
        }
    }
    getSeverityIcon() {
        switch (this.severity) {
            case error_types_1.ErrorSeverity.FATAL:
                return '❌';
            case error_types_1.ErrorSeverity.ERROR:
                return '✗';
            case error_types_1.ErrorSeverity.WARNING:
                return '⚠️';
            case error_types_1.ErrorSeverity.INFO:
                return 'ℹ️';
            default:
                return '•';
        }
    }
    isRecoverable() {
        return this.severity !== error_types_1.ErrorSeverity.FATAL;
    }
    log() {
        console.error(this.toCliOutput());
    }
}
exports.BaseException = BaseException;
//# sourceMappingURL=base.exception.js.map