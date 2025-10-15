import { BaseException } from './base.exception';
import { ErrorOptions } from '../types/error.types';
export declare class ModuleException extends BaseException {
    constructor(message: string, options?: ErrorOptions);
}
export declare class ModuleNotFoundException extends ModuleException {
    constructor(moduleName: string, searchPath?: string);
}
export declare class ModuleAlreadyExistsException extends ModuleException {
    constructor(moduleName: string);
}
export declare class ModuleInitializationException extends ModuleException {
    constructor(moduleName: string, error: string);
}
export declare class ModuleDependencyMissingException extends ModuleException {
    constructor(moduleName: string, dependency: string, isModule?: boolean);
}
export declare class CircularDependencyException extends ModuleException {
    constructor(chain: string[]);
}
export declare class InvalidModuleMetadataException extends ModuleException {
    constructor(moduleName: string, error: string);
}
export declare class ModuleCopyFailedException extends ModuleException {
    constructor(moduleName: string, source: string, destination: string, error?: string);
}
export declare class ModuleRegistrationFailedException extends ModuleException {
    constructor(moduleName: string, error: string);
}
export declare class IncompatibleModuleVersionException extends ModuleException {
    constructor(moduleName: string, requiredVersion: string, actualVersion: string);
}
