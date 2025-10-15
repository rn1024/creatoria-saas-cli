"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cliExceptionHandler = exports.CliExceptionHandler = void 0;
const base_exception_1 = require("../exceptions/base.exception");
const error_types_1 = require("../types/error.types");
const chalk = require('chalk');
class CliExceptionHandler {
    static instance;
    exitOnError = true;
    verboseMode = false;
    constructor() {
        this.setupProcessHandlers();
    }
    static getInstance() {
        if (!CliExceptionHandler.instance) {
            CliExceptionHandler.instance = new CliExceptionHandler();
        }
        return CliExceptionHandler.instance;
    }
    setExitOnError(exit) {
        this.exitOnError = exit;
    }
    setVerboseMode(verbose) {
        this.verboseMode = verbose;
    }
    handle(error) {
        this.clearProgress();
        if (error instanceof base_exception_1.BaseException) {
            this.handleBaseException(error);
        }
        else if (error instanceof Error) {
            this.handleError(error);
        }
        else {
            this.handleUnknown(error);
        }
    }
    async handleAsync(fn) {
        try {
            return await fn();
        }
        catch (error) {
            this.handle(error);
            return undefined;
        }
    }
    wrapCommand(handler) {
        return async (...args) => {
            try {
                return await handler(...args);
            }
            catch (error) {
                this.handle(error);
            }
        };
    }
    setupProcessHandlers() {
        process.on('uncaughtException', (error) => {
            console.error(chalk.red('\n⛔ Uncaught Exception:'));
            this.handleError(error);
            process.exit(1);
        });
        process.on('unhandledRejection', (reason, promise) => {
            console.error(chalk.red('\n⛔ Unhandled Promise Rejection:'));
            this.handle(reason);
            if (this.exitOnError) {
                process.exit(1);
            }
        });
        process.on('warning', (warning) => {
            console.warn(chalk.yellow('\n⚠️  Warning:'));
            console.warn(chalk.yellow(`   ${warning.name}: ${warning.message}`));
            if (this.verboseMode && warning.stack) {
                console.warn(chalk.gray(warning.stack));
            }
        });
        process.on('SIGINT', () => {
            console.log(chalk.yellow('\n\n👋 Interrupted by user'));
            this.cleanup();
            process.exit(0);
        });
        process.on('SIGTERM', () => {
            console.log(chalk.yellow('\n\n🛑 Termination signal received'));
            this.cleanup();
            process.exit(0);
        });
    }
    handleBaseException(exception) {
        exception.log();
        if (exception.suggestion && !exception.isRecoverable()) {
            console.log(chalk.cyan(`\n💡 Tip: ${exception.suggestion}`));
        }
        if (exception.severity === error_types_1.ErrorSeverity.FATAL ||
            (this.exitOnError && exception.severity === error_types_1.ErrorSeverity.ERROR)) {
            this.exitWithError(exception.severity === error_types_1.ErrorSeverity.FATAL ? 1 : 2);
        }
    }
    handleError(error) {
        console.error(chalk.red(`\n✗ ${error.name}: ${error.message}`));
        if (error.name === 'SyntaxError') {
            console.error(chalk.yellow('   This might be a configuration or code syntax issue.'));
        }
        else if (error.name === 'TypeError') {
            console.error(chalk.yellow('   This might be a type mismatch or null reference issue.'));
        }
        if ((this.verboseMode || process.env.NODE_ENV === 'development') && error.stack) {
            console.error(chalk.gray('\n   Stack trace:'));
            const stackLines = error.stack.split('\n').slice(1);
            stackLines.forEach(line => {
                console.error(chalk.gray(`   ${line.trim()}`));
            });
        }
        if (this.exitOnError) {
            this.exitWithError(1);
        }
    }
    handleUnknown(error) {
        console.error(chalk.red('\n✗ An unexpected error occurred'));
        if (this.verboseMode || process.env.NODE_ENV === 'development') {
            console.error(chalk.gray('   Error details:'));
            try {
                console.error(chalk.gray(`   ${JSON.stringify(error, null, 2)}`));
            }
            catch {
                console.error(chalk.gray(`   ${String(error)}`));
            }
        }
        if (this.exitOnError) {
            this.exitWithError(1);
        }
    }
    clearProgress() {
        if (process.stdout.clearLine) {
            process.stdout.clearLine(0);
            process.stdout.cursorTo(0);
        }
    }
    cleanup() {
        this.clearProgress();
    }
    exitWithError(code = 1) {
        this.cleanup();
        if (code !== 0) {
            console.log(chalk.gray('\nFor more information, run with --verbose flag'));
            console.log(chalk.gray('Report issues at: https://github.com/creatoria/cli/issues'));
        }
        process.exit(code);
    }
}
exports.CliExceptionHandler = CliExceptionHandler;
exports.cliExceptionHandler = CliExceptionHandler.getInstance();
//# sourceMappingURL=cli-exception.filter.js.map