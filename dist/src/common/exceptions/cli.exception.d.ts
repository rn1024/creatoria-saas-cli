import { BaseException } from './base.exception';
import { ErrorOptions } from '../types/error.types';
export declare class CliException extends BaseException {
    constructor(message: string, options?: ErrorOptions);
}
export declare class InvalidCommandException extends CliException {
    constructor(command: string, suggestion?: string);
}
export declare class InvalidArgumentException extends CliException {
    constructor(argument: string, expected?: string);
}
export declare class MissingRequiredOptionException extends CliException {
    constructor(option: string, command?: string);
}
export declare class ProjectNotFoundException extends CliException {
    constructor(projectPath?: string);
}
export declare class TemplateNotFoundException extends CliException {
    constructor(templatePath: string);
}
export declare class BuildFailedException extends CliException {
    constructor(error: string, details?: any);
}
export declare class TestFailedException extends CliException {
    constructor(error: string, failedTests?: number);
}
