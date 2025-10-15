"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CatchErrors = CatchErrors;
exports.CatchClassErrors = CatchClassErrors;
exports.Validate = Validate;
exports.Retry = Retry;
const cli_exception_filter_1 = require("../filters/cli-exception.filter");
const base_exception_1 = require("../exceptions/base.exception");
const error_types_1 = require("../types/error.types");
function CatchErrors(options) {
    return function (target, propertyKey, descriptor) {
        const originalMethod = descriptor.value;
        descriptor.value = async function (...args) {
            try {
                return await originalMethod.apply(this, args);
            }
            catch (error) {
                if (error instanceof base_exception_1.BaseException && options?.context) {
                    error.context = { ...error.context, ...options.context };
                }
                const methodContext = {
                    module: target.constructor.name,
                    method: propertyKey,
                    ...options?.context,
                };
                if (!(error instanceof base_exception_1.BaseException)) {
                    const wrappedError = new base_exception_1.BaseException(error instanceof Error ? error.message : String(error), {
                        category: error_types_1.ErrorCategory.SYSTEM,
                        severity: error_types_1.ErrorSeverity.ERROR,
                        context: methodContext,
                        cause: error instanceof Error ? error : undefined,
                    });
                    if (options?.rethrow) {
                        throw wrappedError;
                    }
                    cli_exception_filter_1.cliExceptionHandler.handle(wrappedError);
                    return options?.fallbackValue;
                }
                error.context = { ...error.context, ...methodContext };
                if (options?.rethrow) {
                    throw error;
                }
                cli_exception_filter_1.cliExceptionHandler.handle(error);
                return options?.fallbackValue;
            }
        };
        return descriptor;
    };
}
function CatchClassErrors(options) {
    return function (constructor) {
        const propertyNames = Object.getOwnPropertyNames(constructor.prototype);
        propertyNames.forEach(propertyName => {
            if (propertyName === 'constructor' ||
                options?.exclude?.includes(propertyName)) {
                return;
            }
            const descriptor = Object.getOwnPropertyDescriptor(constructor.prototype, propertyName);
            if (descriptor && typeof descriptor.value === 'function') {
                const originalMethod = descriptor.value;
                descriptor.value = async function (...args) {
                    try {
                        return await originalMethod.apply(this, args);
                    }
                    catch (error) {
                        const methodContext = {
                            module: constructor.name,
                            method: propertyName,
                            ...options?.context,
                        };
                        if (error instanceof base_exception_1.BaseException) {
                            error.context = { ...error.context, ...methodContext };
                        }
                        else {
                            error = new base_exception_1.BaseException(error instanceof Error ? error.message : String(error), {
                                category: error_types_1.ErrorCategory.SYSTEM,
                                severity: error_types_1.ErrorSeverity.ERROR,
                                context: methodContext,
                                cause: error instanceof Error ? error : undefined,
                            });
                        }
                        cli_exception_filter_1.cliExceptionHandler.handle(error);
                    }
                };
                Object.defineProperty(constructor.prototype, propertyName, descriptor);
            }
        });
        return constructor;
    };
}
function Validate(validationFn) {
    return function (target, propertyKey, descriptor) {
        const originalMethod = descriptor.value;
        descriptor.value = function (...args) {
            const validationResult = validationFn(args);
            if (validationResult === true) {
                return originalMethod.apply(this, args);
            }
            const errorMessage = typeof validationResult === 'string'
                ? validationResult
                : `Validation failed for ${propertyKey}`;
            throw new base_exception_1.BaseException(errorMessage, {
                category: error_types_1.ErrorCategory.VALIDATION,
                severity: error_types_1.ErrorSeverity.ERROR,
                context: {
                    module: target.constructor.name,
                    method: propertyKey,
                    metadata: { arguments: args },
                },
            });
        };
        return descriptor;
    };
}
function Retry(options = {}) {
    const maxAttempts = options.maxAttempts || 3;
    const delay = options.delay || 1000;
    const backoff = options.backoff || false;
    return function (target, propertyKey, descriptor) {
        const originalMethod = descriptor.value;
        descriptor.value = async function (...args) {
            let lastError;
            for (let attempt = 1; attempt <= maxAttempts; attempt++) {
                try {
                    return await originalMethod.apply(this, args);
                }
                catch (error) {
                    lastError = error;
                    if (options.retryOn && !options.retryOn(error)) {
                        throw error;
                    }
                    if (attempt < maxAttempts) {
                        const waitTime = backoff ? delay * attempt : delay;
                        console.log(`Retry attempt ${attempt}/${maxAttempts} after ${waitTime}ms...`);
                        await new Promise(resolve => setTimeout(resolve, waitTime));
                    }
                }
            }
            throw new base_exception_1.BaseException(`Operation failed after ${maxAttempts} attempts: ${lastError?.message || 'Unknown error'}`, {
                category: error_types_1.ErrorCategory.SYSTEM,
                severity: error_types_1.ErrorSeverity.ERROR,
                context: {
                    module: target.constructor.name,
                    method: propertyKey,
                    metadata: {
                        attempts: maxAttempts,
                        lastError: lastError?.message,
                    },
                },
                cause: lastError instanceof Error ? lastError : undefined,
            });
        };
        return descriptor;
    };
}
//# sourceMappingURL=catch-errors.decorator.js.map