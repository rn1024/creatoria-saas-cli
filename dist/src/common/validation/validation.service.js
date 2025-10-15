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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationService = void 0;
const common_1 = require("@nestjs/common");
const string_validator_1 = require("./validators/string.validator");
const number_validator_1 = require("./validators/number.validator");
const path_validator_1 = require("./validators/path.validator");
const custom_validator_1 = require("./validators/custom.validator");
const logger_service_1 = require("../logger/logger.service");
const base_exception_1 = require("../exceptions/base.exception");
const error_codes_1 = require("../constants/error-codes");
let ValidationService = class ValidationService {
    logger;
    constructor(logger) {
        this.logger = logger;
    }
    validateString(value, options = {}) {
        if (options.required && !string_validator_1.StringValidator.isNotEmpty(value)) {
            throw new base_exception_1.BaseException(error_codes_1.ERROR_CODES.VALIDATION_2000, { field: 'string' });
        }
        if (value === undefined || value === null) {
            if (!options.required)
                return;
        }
        if (typeof value !== 'string') {
            throw new base_exception_1.BaseException(error_codes_1.ERROR_CODES.VALIDATION_2001, { expected: 'string', actual: typeof value });
        }
        if (options.minLength !== undefined || options.maxLength !== undefined) {
            if (!string_validator_1.StringValidator.isLength(value, options.minLength || 0, options.maxLength)) {
                throw new base_exception_1.BaseException(error_codes_1.ERROR_CODES.VALIDATION_2002, { min: options.minLength, max: options.maxLength });
            }
        }
        if (options.pattern && !string_validator_1.StringValidator.matches(value, options.pattern)) {
            throw new base_exception_1.BaseException(error_codes_1.ERROR_CODES.VALIDATION_2003, { pattern: options.pattern.toString() });
        }
        if (options.safe && !string_validator_1.StringValidator.isSafe(value)) {
            throw new base_exception_1.BaseException(error_codes_1.ERROR_CODES.VALIDATION_2004, { value });
        }
    }
    validateNumber(value, options = {}) {
        if (options.required && (value === undefined || value === null)) {
            throw new base_exception_1.BaseException(error_codes_1.ERROR_CODES.VALIDATION_2000, { field: 'number' });
        }
        if (value === undefined || value === null) {
            if (!options.required)
                return;
        }
        if (!number_validator_1.NumberValidator.isNumber(value)) {
            throw new base_exception_1.BaseException(error_codes_1.ERROR_CODES.VALIDATION_2001, { expected: 'number', actual: typeof value });
        }
        if (options.integer && !number_validator_1.NumberValidator.isInteger(value)) {
            throw new base_exception_1.BaseException(error_codes_1.ERROR_CODES.VALIDATION_2005, { value });
        }
        if (options.positive && !number_validator_1.NumberValidator.isPositive(value)) {
            throw new base_exception_1.BaseException(error_codes_1.ERROR_CODES.VALIDATION_2006, { value });
        }
        if (options.min !== undefined || options.max !== undefined) {
            if (!number_validator_1.NumberValidator.isInRange(value, options.min || Number.MIN_SAFE_INTEGER, options.max || Number.MAX_SAFE_INTEGER)) {
                throw new base_exception_1.BaseException(error_codes_1.ERROR_CODES.VALIDATION_2007, { value, min: options.min, max: options.max });
            }
        }
    }
    async validatePath(value, options = {}) {
        if (options.required && !value) {
            throw new base_exception_1.BaseException(error_codes_1.ERROR_CODES.VALIDATION_2000, { field: 'path' });
        }
        if (!value && !options.required) {
            return;
        }
        if (typeof value !== 'string') {
            throw new base_exception_1.BaseException(error_codes_1.ERROR_CODES.VALIDATION_2001, { expected: 'string', actual: typeof value });
        }
        if (options.safe && !path_validator_1.PathValidator.isSafePath(value, options.basePath)) {
            throw new base_exception_1.BaseException(error_codes_1.ERROR_CODES.VALIDATION_2008, { path: value });
        }
        if (options.mustExist && !await path_validator_1.PathValidator.exists(value)) {
            throw new base_exception_1.BaseException(error_codes_1.ERROR_CODES.VALIDATION_2009, { path: value });
        }
    }
    validateEmail(value) {
        if (!string_validator_1.StringValidator.isEmail(value)) {
            throw new base_exception_1.BaseException(error_codes_1.ERROR_CODES.VALIDATION_2010, { value });
        }
    }
    validateURL(value) {
        if (!string_validator_1.StringValidator.isURL(value)) {
            throw new base_exception_1.BaseException(error_codes_1.ERROR_CODES.VALIDATION_2011, { value });
        }
    }
    validatePort(value) {
        if (!number_validator_1.NumberValidator.isPort(value)) {
            throw new base_exception_1.BaseException(error_codes_1.ERROR_CODES.VALIDATION_2012, { value });
        }
    }
    validateModuleName(value) {
        const result = custom_validator_1.CustomValidator.validateModuleName(value);
        if (!result.valid) {
            throw new base_exception_1.BaseException(error_codes_1.ERROR_CODES.VALIDATION_2013, { errors: result.errors });
        }
    }
    validateProjectName(value) {
        const result = custom_validator_1.CustomValidator.validateProjectName(value);
        if (!result.valid) {
            throw new base_exception_1.BaseException(error_codes_1.ERROR_CODES.VALIDATION_2014, { errors: result.errors });
        }
    }
    validateDatabaseConfig(config) {
        const result = custom_validator_1.CustomValidator.validateDatabaseConfig(config);
        if (!result.valid) {
            throw new base_exception_1.BaseException(error_codes_1.ERROR_CODES.VALIDATION_2015, { errors: result.errors });
        }
    }
    validateApiConfig(config) {
        const result = custom_validator_1.CustomValidator.validateApiConfig(config);
        if (!result.valid) {
            throw new base_exception_1.BaseException(error_codes_1.ERROR_CODES.VALIDATION_2016, { errors: result.errors });
        }
    }
    async validateFileUpload(file, options) {
        const result = await custom_validator_1.CustomValidator.validateFileUpload(file, options);
        if (!result.valid) {
            throw new base_exception_1.BaseException(error_codes_1.ERROR_CODES.VALIDATION_2017, { errors: result.errors });
        }
    }
    validateCliArgs(args) {
        const result = custom_validator_1.CustomValidator.validateCliArgs(args);
        if (!result.valid) {
            this.logger.warn('检测到危险的CLI参数', { args, errors: result.errors });
            throw new base_exception_1.BaseException(error_codes_1.ERROR_CODES.VALIDATION_2018, { errors: result.errors });
        }
    }
    async validateWithSchema(data, schema) {
        const result = await custom_validator_1.CustomValidator.validateWithSchema(data, schema);
        if (!result.valid) {
            throw new base_exception_1.BaseException(error_codes_1.ERROR_CODES.VALIDATION_2019, { errors: result.errors });
        }
    }
    sanitizeString(value) {
        return string_validator_1.StringValidator.sanitize(value);
    }
    sanitizeNumber(value) {
        return number_validator_1.NumberValidator.sanitize(value);
    }
    sanitizePath(value) {
        return path_validator_1.PathValidator.sanitize(value);
    }
    escapeHtml(value) {
        return string_validator_1.StringValidator.escapeHtml(value);
    }
    escapeShell(value) {
        return string_validator_1.StringValidator.escapeShell(value);
    }
    async batchValidate(validations) {
        const errors = [];
        for (const validation of validations) {
            try {
                await validation.validator(validation.value);
            }
            catch (error) {
                if (error instanceof base_exception_1.BaseException) {
                    errors.push({
                        field: validation.field,
                        message: error.message
                    });
                }
                else {
                    errors.push({
                        field: validation.field,
                        message: error.message || '验证失败'
                    });
                }
            }
        }
        return {
            valid: errors.length === 0,
            errors
        };
    }
    createValidationChain() {
        const validations = [];
        const errors = [];
        const chain = {
            addValidation: (field, validator) => {
                validations.push(async () => {
                    try {
                        await validator();
                    }
                    catch (error) {
                        errors.push({
                            field,
                            message: error.message || '验证失败'
                        });
                    }
                });
                return chain;
            },
            validate: async () => {
                for (const validation of validations) {
                    await validation();
                }
                return {
                    valid: errors.length === 0,
                    errors
                };
            }
        };
        return chain;
    }
};
exports.ValidationService = ValidationService;
exports.ValidationService = ValidationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [logger_service_1.LoggerService])
], ValidationService);
//# sourceMappingURL=validation.service.js.map