"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GlobalExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
const base_exception_1 = require("../exceptions/base.exception");
const error_types_1 = require("../types/error.types");
const chalk = require('chalk');
let GlobalExceptionFilter = class GlobalExceptionFilter {
    catch(exception, host) {
        if (this.isCliContext()) {
            this.handleCliException(exception);
            return;
        }
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        if (response && response.status) {
            const status = exception instanceof common_1.HttpException
                ? exception.getStatus()
                : 500;
            const errorResponse = this.formatHttpError(exception, request);
            response.status(status).json(errorResponse);
        }
        else {
            this.handleCliException(exception);
        }
    }
    isCliContext() {
        return !process.env.HTTP_SERVER_ENABLED;
    }
    handleCliException(exception) {
        if (exception instanceof base_exception_1.BaseException) {
            this.handleBaseException(exception);
            return;
        }
        if (this.isNodeError(exception)) {
            this.handleNodeError(exception);
            return;
        }
        if (exception instanceof Error) {
            this.handleStandardError(exception);
            return;
        }
        this.handleUnknownError(exception);
    }
    handleBaseException(exception) {
        console.error(exception.toCliOutput());
        if (exception.severity === error_types_1.ErrorSeverity.FATAL) {
            console.error(chalk.red('\n⛔ Fatal error occurred. Exiting...'));
            process.exit(1);
        }
    }
    handleNodeError(error) {
        const errorMessages = {
            ENOENT: 'File or directory not found',
            EACCES: 'Permission denied',
            EEXIST: 'File or directory already exists',
            EISDIR: 'Expected a file but found a directory',
            ENOTDIR: 'Expected a directory but found a file',
            ENOTEMPTY: 'Directory is not empty',
            EMFILE: 'Too many open files',
            ENOSPC: 'No space left on device',
            EPERM: 'Operation not permitted',
        };
        const message = errorMessages[error.code || ''] || error.message;
        console.error(chalk.red(`\n✗ System Error: ${message}`));
        if (error.path) {
            console.error(chalk.gray(`   Path: ${error.path}`));
        }
        if (error.syscall) {
            console.error(chalk.gray(`   Operation: ${error.syscall}`));
        }
        if (process.env.NODE_ENV === 'development' && error.stack) {
            console.error(chalk.gray('\n   Stack trace:'));
            const stackLines = error.stack.split('\n').slice(1, 4);
            stackLines.forEach(line => {
                console.error(chalk.gray(`   ${line.trim()}`));
            });
        }
    }
    handleStandardError(error) {
        console.error(chalk.red(`\n✗ Error: ${error.message}`));
        if (process.env.NODE_ENV === 'development' && error.stack) {
            console.error(chalk.gray('\n   Stack trace:'));
            const stackLines = error.stack.split('\n').slice(1, 4);
            stackLines.forEach(line => {
                console.error(chalk.gray(`   ${line.trim()}`));
            });
        }
    }
    handleUnknownError(error) {
        console.error(chalk.red('\n✗ An unexpected error occurred'));
        if (process.env.NODE_ENV === 'development') {
            console.error(chalk.gray('   Error details:'));
            console.error(chalk.gray(`   ${JSON.stringify(error, null, 2)}`));
        }
    }
    formatHttpError(exception, request) {
        if (exception instanceof base_exception_1.BaseException) {
            return {
                ...exception.toResponse(),
                path: request?.url,
                timestamp: new Date().toISOString(),
            };
        }
        if (exception instanceof common_1.HttpException) {
            const response = exception.getResponse();
            return {
                ...(typeof response === 'object' ? response : { message: response }),
                statusCode: exception.getStatus(),
                path: request?.url,
                timestamp: new Date().toISOString(),
            };
        }
        return {
            message: 'Internal server error',
            statusCode: 500,
            path: request?.url,
            timestamp: new Date().toISOString(),
        };
    }
    isNodeError(error) {
        return error instanceof Error && 'code' in error && 'syscall' in error;
    }
};
exports.GlobalExceptionFilter = GlobalExceptionFilter;
exports.GlobalExceptionFilter = GlobalExceptionFilter = __decorate([
    (0, common_1.Catch)()
], GlobalExceptionFilter);
//# sourceMappingURL=global-exception.filter.js.map