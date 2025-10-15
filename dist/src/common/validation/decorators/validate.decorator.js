"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Validate = Validate;
exports.ValidateString = ValidateString;
exports.ValidateNumber = ValidateNumber;
exports.ValidatePath = ValidatePath;
exports.ValidateEmail = ValidateEmail;
exports.ValidateURL = ValidateURL;
exports.ValidatePort = ValidatePort;
exports.SanitizeInput = SanitizeInput;
const common_1 = require("@nestjs/common");
const string_validator_1 = require("../validators/string.validator");
const number_validator_1 = require("../validators/number.validator");
const path_validator_1 = require("../validators/path.validator");
const base_exception_1 = require("../../exceptions/base.exception");
const error_codes_1 = require("../../constants/error-codes");
function Validate(validator, errorMessage) {
    return function (target, propertyName, descriptor) {
        const method = descriptor.value;
        descriptor.value = async function (...args) {
            for (const arg of args) {
                const result = await validator(arg);
                if (typeof result === 'boolean') {
                    if (!result) {
                        throw new common_1.BadRequestException(errorMessage || 'Validation failed');
                    }
                }
                else {
                    if (!result.valid) {
                        const messages = result.errors.map(e => `${e.field}: ${e.message}`).join(', ');
                        throw new common_1.BadRequestException(errorMessage || messages);
                    }
                }
            }
            return method.apply(this, args);
        };
        return descriptor;
    };
}
function ValidateString(options) {
    return function (target, propertyName, descriptor) {
        const method = descriptor.value;
        descriptor.value = function (...args) {
            const [value] = args;
            if (typeof value !== 'string') {
                throw new base_exception_1.BaseException(error_codes_1.ERROR_CODES.VALIDATION_2001, { field: propertyName, expected: 'string', actual: typeof value });
            }
            if (options.minLength !== undefined || options.maxLength !== undefined) {
                if (!string_validator_1.StringValidator.isLength(value, options.minLength || 0, options.maxLength)) {
                    throw new base_exception_1.BaseException(error_codes_1.ERROR_CODES.VALIDATION_2002, { field: propertyName, min: options.minLength, max: options.maxLength });
                }
            }
            if (options.pattern && !string_validator_1.StringValidator.matches(value, options.pattern)) {
                throw new base_exception_1.BaseException(error_codes_1.ERROR_CODES.VALIDATION_2003, { field: propertyName, pattern: options.pattern.toString() });
            }
            if (options.safe && !string_validator_1.StringValidator.isSafe(value)) {
                throw new base_exception_1.BaseException(error_codes_1.ERROR_CODES.VALIDATION_2004, { field: propertyName });
            }
            return method.apply(this, args);
        };
        return descriptor;
    };
}
function ValidateNumber(options) {
    return function (target, propertyName, descriptor) {
        const method = descriptor.value;
        descriptor.value = function (...args) {
            const [value] = args;
            if (!number_validator_1.NumberValidator.isNumber(value)) {
                throw new base_exception_1.BaseException(error_codes_1.ERROR_CODES.VALIDATION_2001, { field: propertyName, expected: 'number', actual: typeof value });
            }
            const num = Number(value);
            if (options.integer && !number_validator_1.NumberValidator.isInteger(value)) {
                throw new base_exception_1.BaseException(error_codes_1.ERROR_CODES.VALIDATION_2005, { field: propertyName });
            }
            if (options.positive && !number_validator_1.NumberValidator.isPositive(value)) {
                throw new base_exception_1.BaseException(error_codes_1.ERROR_CODES.VALIDATION_2006, { field: propertyName });
            }
            if (options.min !== undefined || options.max !== undefined) {
                if (!number_validator_1.NumberValidator.isInRange(value, options.min || Number.MIN_SAFE_INTEGER, options.max || Number.MAX_SAFE_INTEGER)) {
                    throw new base_exception_1.BaseException(error_codes_1.ERROR_CODES.VALIDATION_2007, { field: propertyName, min: options.min, max: options.max });
                }
            }
            return method.apply(this, args);
        };
        return descriptor;
    };
}
function ValidatePath(options) {
    return function (target, propertyName, descriptor) {
        const method = descriptor.value;
        descriptor.value = async function (...args) {
            const [value] = args;
            if (typeof value !== 'string') {
                throw new base_exception_1.BaseException(error_codes_1.ERROR_CODES.VALIDATION_2001, { field: propertyName, expected: 'string', actual: typeof value });
            }
            if (options.safe && !path_validator_1.PathValidator.isSafePath(value, options.basePath)) {
                throw new base_exception_1.BaseException(error_codes_1.ERROR_CODES.VALIDATION_2008, { field: propertyName, path: value });
            }
            if (options.mustExist && !await path_validator_1.PathValidator.exists(value)) {
                throw new base_exception_1.BaseException(error_codes_1.ERROR_CODES.VALIDATION_2009, { field: propertyName, path: value });
            }
            return method.apply(this, args);
        };
        return descriptor;
    };
}
function ValidateEmail() {
    return function (target, propertyName, descriptor) {
        const method = descriptor.value;
        descriptor.value = function (...args) {
            const [value] = args;
            if (!string_validator_1.StringValidator.isEmail(value)) {
                throw new base_exception_1.BaseException(error_codes_1.ERROR_CODES.VALIDATION_2010, { field: propertyName, value });
            }
            return method.apply(this, args);
        };
        return descriptor;
    };
}
function ValidateURL() {
    return function (target, propertyName, descriptor) {
        const method = descriptor.value;
        descriptor.value = function (...args) {
            const [value] = args;
            if (!string_validator_1.StringValidator.isURL(value)) {
                throw new base_exception_1.BaseException(error_codes_1.ERROR_CODES.VALIDATION_2011, { field: propertyName, value });
            }
            return method.apply(this, args);
        };
        return descriptor;
    };
}
function ValidatePort() {
    return function (target, propertyName, descriptor) {
        const method = descriptor.value;
        descriptor.value = function (...args) {
            const [value] = args;
            if (!number_validator_1.NumberValidator.isPort(value)) {
                throw new base_exception_1.BaseException(error_codes_1.ERROR_CODES.VALIDATION_2012, { field: propertyName, value });
            }
            return method.apply(this, args);
        };
        return descriptor;
    };
}
function SanitizeInput() {
    return function (target, propertyName, descriptor) {
        const method = descriptor.value;
        descriptor.value = function (...args) {
            const sanitizedArgs = args.map(arg => {
                if (typeof arg === 'string') {
                    return string_validator_1.StringValidator.sanitize(arg);
                }
                if (typeof arg === 'number') {
                    return number_validator_1.NumberValidator.sanitize(arg);
                }
                if (typeof arg === 'object' && arg !== null) {
                    return sanitizeObject(arg);
                }
                return arg;
            });
            return method.apply(this, sanitizedArgs);
        };
        return descriptor;
    };
}
function sanitizeObject(obj) {
    if (Array.isArray(obj)) {
        return obj.map(item => {
            if (typeof item === 'string') {
                return string_validator_1.StringValidator.sanitize(item);
            }
            if (typeof item === 'object' && item !== null) {
                return sanitizeObject(item);
            }
            return item;
        });
    }
    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'string') {
            sanitized[key] = string_validator_1.StringValidator.sanitize(value);
        }
        else if (typeof value === 'object' && value !== null) {
            sanitized[key] = sanitizeObject(value);
        }
        else {
            sanitized[key] = value;
        }
    }
    return sanitized;
}
//# sourceMappingURL=validate.decorator.js.map