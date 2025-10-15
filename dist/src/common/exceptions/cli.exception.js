"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestFailedException = exports.BuildFailedException = exports.TemplateNotFoundException = exports.ProjectNotFoundException = exports.MissingRequiredOptionException = exports.InvalidArgumentException = exports.InvalidCommandException = exports.CliException = void 0;
const base_exception_1 = require("./base.exception");
const error_types_1 = require("../types/error.types");
const error_codes_1 = require("../constants/error-codes");
class CliException extends base_exception_1.BaseException {
    constructor(message, options = {}) {
        super(message, {
            ...options,
            category: options.category || error_types_1.ErrorCategory.BUSINESS,
        });
    }
}
exports.CliException = CliException;
class InvalidCommandException extends CliException {
    constructor(command, suggestion) {
        super(`Invalid command: ${command}`, {
            code: error_codes_1.ErrorCodes.CLI_INVALID_COMMAND,
            severity: error_types_1.ErrorSeverity.ERROR,
            context: { command },
            suggestion: suggestion || 'Run "creatoria --help" to see available commands',
        });
    }
}
exports.InvalidCommandException = InvalidCommandException;
class InvalidArgumentException extends CliException {
    constructor(argument, expected) {
        const message = expected
            ? `Invalid argument: ${argument}. Expected: ${expected}`
            : `Invalid argument: ${argument}`;
        super(message, {
            code: error_codes_1.ErrorCodes.CLI_INVALID_ARGUMENT,
            severity: error_types_1.ErrorSeverity.ERROR,
            context: { argument, expected },
        });
    }
}
exports.InvalidArgumentException = InvalidArgumentException;
class MissingRequiredOptionException extends CliException {
    constructor(option, command) {
        super(`Missing required option: ${option}`, {
            code: error_codes_1.ErrorCodes.CLI_MISSING_REQUIRED_OPTION,
            severity: error_types_1.ErrorSeverity.ERROR,
            context: { option, command },
            suggestion: `Please provide the --${option} option`,
        });
    }
}
exports.MissingRequiredOptionException = MissingRequiredOptionException;
class ProjectNotFoundException extends CliException {
    constructor(projectPath) {
        const message = projectPath
            ? `Project not found at: ${projectPath}`
            : 'Not in a Creatoria SaaS project directory';
        super(message, {
            code: error_codes_1.ErrorCodes.CLI_NOT_IN_PROJECT,
            severity: error_types_1.ErrorSeverity.ERROR,
            context: { filePath: projectPath },
            suggestion: 'Please run this command from your project root directory',
        });
    }
}
exports.ProjectNotFoundException = ProjectNotFoundException;
class TemplateNotFoundException extends CliException {
    constructor(templatePath) {
        super(`Template not found at: ${templatePath}`, {
            code: error_codes_1.ErrorCodes.CLI_TEMPLATE_NOT_FOUND,
            severity: error_types_1.ErrorSeverity.ERROR,
            context: { filePath: templatePath },
            suggestion: 'Set CREATORIA_TEMPLATE_DIR environment variable to the template directory',
        });
    }
}
exports.TemplateNotFoundException = TemplateNotFoundException;
class BuildFailedException extends CliException {
    constructor(error, details) {
        super(`Build failed: ${error}`, {
            code: error_codes_1.ErrorCodes.CLI_BUILD_FAILED,
            severity: error_types_1.ErrorSeverity.ERROR,
            context: { metadata: details },
            suggestion: 'Check the error message above and fix the issues',
        });
    }
}
exports.BuildFailedException = BuildFailedException;
class TestFailedException extends CliException {
    constructor(error, failedTests) {
        super(`Tests failed: ${error}`, {
            code: error_codes_1.ErrorCodes.CLI_TEST_FAILED,
            severity: error_types_1.ErrorSeverity.ERROR,
            context: { metadata: { failedTests } },
            suggestion: 'Fix the failing tests and try again',
        });
    }
}
exports.TestFailedException = TestFailedException;
//# sourceMappingURL=cli.exception.js.map