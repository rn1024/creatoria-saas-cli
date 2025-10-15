"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IncompatibleModuleVersionException = exports.ModuleRegistrationFailedException = exports.ModuleCopyFailedException = exports.InvalidModuleMetadataException = exports.CircularDependencyException = exports.ModuleDependencyMissingException = exports.ModuleInitializationException = exports.ModuleAlreadyExistsException = exports.ModuleNotFoundException = exports.ModuleException = void 0;
const base_exception_1 = require("./base.exception");
const error_types_1 = require("../types/error.types");
const error_codes_1 = require("../constants/error-codes");
class ModuleException extends base_exception_1.BaseException {
    constructor(message, options = {}) {
        super(message, {
            ...options,
            category: options.category || error_types_1.ErrorCategory.BUSINESS,
        });
    }
}
exports.ModuleException = ModuleException;
class ModuleNotFoundException extends ModuleException {
    constructor(moduleName, searchPath) {
        const message = searchPath
            ? `Module '${moduleName}' not found in ${searchPath}`
            : `Module '${moduleName}' not found`;
        super(message, {
            code: error_codes_1.ErrorCodes.MODULE_NOT_FOUND,
            severity: error_types_1.ErrorSeverity.ERROR,
            context: { module: moduleName, filePath: searchPath },
            suggestion: 'Check if the module name is correct and the module exists',
        });
    }
}
exports.ModuleNotFoundException = ModuleNotFoundException;
class ModuleAlreadyExistsException extends ModuleException {
    constructor(moduleName) {
        super(`Module '${moduleName}' already exists in the project`, {
            code: error_codes_1.ErrorCodes.MODULE_ALREADY_EXISTS,
            severity: error_types_1.ErrorSeverity.WARNING,
            context: { module: moduleName },
            suggestion: `Remove the existing module first or use a different name`,
        });
    }
}
exports.ModuleAlreadyExistsException = ModuleAlreadyExistsException;
class ModuleInitializationException extends ModuleException {
    constructor(moduleName, error) {
        super(`Failed to initialize module '${moduleName}': ${error}`, {
            code: error_codes_1.ErrorCodes.MODULE_INITIALIZATION_FAILED,
            severity: error_types_1.ErrorSeverity.ERROR,
            context: { module: moduleName, metadata: { error } },
            suggestion: 'Check the module initialization script and fix any errors',
        });
    }
}
exports.ModuleInitializationException = ModuleInitializationException;
class ModuleDependencyMissingException extends ModuleException {
    constructor(moduleName, dependency, isModule = true) {
        const depType = isModule ? 'module' : 'package';
        super(`Module '${moduleName}' requires ${depType} '${dependency}' which is not installed`, {
            code: error_codes_1.ErrorCodes.MODULE_DEPENDENCY_MISSING,
            severity: error_types_1.ErrorSeverity.ERROR,
            context: {
                module: moduleName,
                metadata: { dependency, type: depType }
            },
            suggestion: isModule
                ? `Install the required module: creatoria module add ${dependency}`
                : `Install the required package: npm install ${dependency}`,
        });
    }
}
exports.ModuleDependencyMissingException = ModuleDependencyMissingException;
class CircularDependencyException extends ModuleException {
    constructor(chain) {
        const chainStr = chain.join(' -> ');
        super(`Circular dependency detected: ${chainStr}`, {
            code: error_codes_1.ErrorCodes.MODULE_CIRCULAR_DEPENDENCY,
            severity: error_types_1.ErrorSeverity.FATAL,
            context: { metadata: { chain } },
            suggestion: 'Review the module dependencies and remove the circular reference',
        });
    }
}
exports.CircularDependencyException = CircularDependencyException;
class InvalidModuleMetadataException extends ModuleException {
    constructor(moduleName, error) {
        super(`Invalid metadata for module '${moduleName}': ${error}`, {
            code: error_codes_1.ErrorCodes.MODULE_INVALID_METADATA,
            severity: error_types_1.ErrorSeverity.ERROR,
            context: { module: moduleName, metadata: { error } },
            suggestion: 'Check the module.json file and ensure it has valid JSON format',
        });
    }
}
exports.InvalidModuleMetadataException = InvalidModuleMetadataException;
class ModuleCopyFailedException extends ModuleException {
    constructor(moduleName, source, destination, error) {
        const message = error
            ? `Failed to copy module '${moduleName}': ${error}`
            : `Failed to copy module '${moduleName}' from ${source} to ${destination}`;
        super(message, {
            code: error_codes_1.ErrorCodes.MODULE_COPY_FAILED,
            severity: error_types_1.ErrorSeverity.ERROR,
            context: {
                module: moduleName,
                metadata: { source, destination, error }
            },
            suggestion: 'Check file permissions and ensure the source module exists',
        });
    }
}
exports.ModuleCopyFailedException = ModuleCopyFailedException;
class ModuleRegistrationFailedException extends ModuleException {
    constructor(moduleName, error) {
        super(`Failed to register module '${moduleName}': ${error}`, {
            code: error_codes_1.ErrorCodes.MODULE_REGISTRATION_FAILED,
            severity: error_types_1.ErrorSeverity.ERROR,
            context: { module: moduleName, metadata: { error } },
            suggestion: 'Check the app.module.ts file and ensure it has valid TypeScript syntax',
        });
    }
}
exports.ModuleRegistrationFailedException = ModuleRegistrationFailedException;
class IncompatibleModuleVersionException extends ModuleException {
    constructor(moduleName, requiredVersion, actualVersion) {
        super(`Module '${moduleName}' version incompatible. Required: ${requiredVersion}, Got: ${actualVersion}`, {
            code: error_codes_1.ErrorCodes.MODULE_INCOMPATIBLE_VERSION,
            severity: error_types_1.ErrorSeverity.ERROR,
            context: {
                module: moduleName,
                metadata: { requiredVersion, actualVersion }
            },
            suggestion: `Update the module to version ${requiredVersion} or higher`,
        });
    }
}
exports.IncompatibleModuleVersionException = IncompatibleModuleVersionException;
//# sourceMappingURL=module.exception.js.map