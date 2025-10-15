"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorRecovery = exports.ValidationErrorHandler = exports.JsonErrorHandler = exports.FileSystemErrorHandler = void 0;
const fs = __importStar(require("fs-extra"));
const base_exception_1 = require("../exceptions/base.exception");
const error_types_1 = require("../types/error.types");
const error_codes_1 = require("../constants/error-codes");
class FileSystemErrorHandler {
    static async safeReadFile(path) {
        try {
            return await fs.readFile(path, 'utf8');
        }
        catch (error) {
            if (error.code === 'ENOENT') {
                throw base_exception_1.BaseException.fromErrorCode(error_codes_1.ErrorCodes.FS_FILE_NOT_FOUND, { path }, {
                    context: { filePath: path },
                    suggestion: 'Check if the file exists and the path is correct',
                });
            }
            if (error.code === 'EACCES') {
                throw base_exception_1.BaseException.fromErrorCode(error_codes_1.ErrorCodes.FS_PERMISSION_DENIED, { path }, {
                    context: { filePath: path },
                    suggestion: 'Check file permissions',
                });
            }
            throw new base_exception_1.BaseException(`Failed to read file: ${error.message}`, {
                code: error_codes_1.ErrorCodes.FS_READ_FAILED,
                category: error_types_1.ErrorCategory.FILESYSTEM,
                severity: error_types_1.ErrorSeverity.ERROR,
                context: { filePath: path },
                cause: error,
            });
        }
    }
    static async safeWriteFile(path, content) {
        try {
            await fs.ensureDir(require('path').dirname(path));
            await fs.writeFile(path, content, 'utf8');
        }
        catch (error) {
            if (error.code === 'EACCES') {
                throw base_exception_1.BaseException.fromErrorCode(error_codes_1.ErrorCodes.FS_PERMISSION_DENIED, { path }, {
                    context: { filePath: path },
                    suggestion: 'Check directory permissions',
                });
            }
            if (error.code === 'ENOSPC') {
                throw new base_exception_1.BaseException('No space left on device', {
                    code: error_codes_1.ErrorCodes.FS_WRITE_FAILED,
                    category: error_types_1.ErrorCategory.FILESYSTEM,
                    severity: error_types_1.ErrorSeverity.FATAL,
                    context: { filePath: path },
                    suggestion: 'Free up disk space and try again',
                });
            }
            throw new base_exception_1.BaseException(`Failed to write file: ${error.message}`, {
                code: error_codes_1.ErrorCodes.FS_WRITE_FAILED,
                category: error_types_1.ErrorCategory.FILESYSTEM,
                severity: error_types_1.ErrorSeverity.ERROR,
                context: { filePath: path },
                cause: error,
            });
        }
    }
    static async safeCopy(src, dest) {
        try {
            await fs.copy(src, dest, { overwrite: true });
        }
        catch (error) {
            if (error.code === 'ENOENT') {
                throw base_exception_1.BaseException.fromErrorCode(error_codes_1.ErrorCodes.FS_FILE_NOT_FOUND, { path: src }, {
                    context: { filePath: src },
                    suggestion: 'Check if the source file/directory exists',
                });
            }
            throw new base_exception_1.BaseException(`Failed to copy: ${error.message}`, {
                code: error_codes_1.ErrorCodes.FS_WRITE_FAILED,
                category: error_types_1.ErrorCategory.FILESYSTEM,
                severity: error_types_1.ErrorSeverity.ERROR,
                context: { metadata: { source: src, destination: dest } },
                cause: error,
            });
        }
    }
    static async safeRemove(path) {
        try {
            await fs.remove(path);
        }
        catch (error) {
            if (error.code === 'ENOENT') {
                return;
            }
            if (error.code === 'EACCES' || error.code === 'EPERM') {
                throw base_exception_1.BaseException.fromErrorCode(error_codes_1.ErrorCodes.FS_PERMISSION_DENIED, { path }, {
                    context: { filePath: path },
                    suggestion: 'Check file/directory permissions',
                });
            }
            throw new base_exception_1.BaseException(`Failed to remove: ${error.message}`, {
                code: error_codes_1.ErrorCodes.FS_DELETE_FAILED,
                category: error_types_1.ErrorCategory.FILESYSTEM,
                severity: error_types_1.ErrorSeverity.ERROR,
                context: { filePath: path },
                cause: error,
            });
        }
    }
    static async exists(path) {
        try {
            await fs.access(path);
            return true;
        }
        catch {
            return false;
        }
    }
}
exports.FileSystemErrorHandler = FileSystemErrorHandler;
class JsonErrorHandler {
    static safeParse(content, source) {
        try {
            return JSON.parse(content);
        }
        catch (error) {
            const context = source ? { filePath: source } : undefined;
            throw new base_exception_1.BaseException(`Invalid JSON format: ${error.message}`, {
                code: error_codes_1.ErrorCodes.CONFIG_INVALID_FORMAT,
                category: error_types_1.ErrorCategory.CONFIGURATION,
                severity: error_types_1.ErrorSeverity.ERROR,
                context,
                suggestion: 'Check JSON syntax and ensure proper formatting',
                cause: error,
            });
        }
    }
    static async safeReadJson(path) {
        const content = await FileSystemErrorHandler.safeReadFile(path);
        if (!content) {
            throw new base_exception_1.BaseException('File is empty', {
                code: error_codes_1.ErrorCodes.CONFIG_INVALID_FORMAT,
                category: error_types_1.ErrorCategory.CONFIGURATION,
                severity: error_types_1.ErrorSeverity.ERROR,
                context: { filePath: path },
            });
        }
        return this.safeParse(content, path);
    }
    static async safeWriteJson(path, data, pretty = true) {
        try {
            const content = pretty
                ? JSON.stringify(data, null, 2)
                : JSON.stringify(data);
            await FileSystemErrorHandler.safeWriteFile(path, content);
        }
        catch (error) {
            if (error instanceof base_exception_1.BaseException) {
                throw error;
            }
            throw new base_exception_1.BaseException(`Failed to write JSON: ${error.message}`, {
                code: error_codes_1.ErrorCodes.CONFIG_SAVE_FAILED,
                category: error_types_1.ErrorCategory.CONFIGURATION,
                severity: error_types_1.ErrorSeverity.ERROR,
                context: { filePath: path },
                cause: error,
            });
        }
    }
}
exports.JsonErrorHandler = JsonErrorHandler;
class ValidationErrorHandler {
    static validateRequired(value, fieldName) {
        if (value === undefined || value === null || value === '') {
            throw base_exception_1.BaseException.fromErrorCode(error_codes_1.ErrorCodes.VAL_REQUIRED_FIELD_MISSING, { field: fieldName }, {
                category: error_types_1.ErrorCategory.VALIDATION,
                severity: error_types_1.ErrorSeverity.ERROR,
            });
        }
    }
    static validateFormat(value, pattern, fieldName, expected) {
        if (!pattern.test(value)) {
            throw base_exception_1.BaseException.fromErrorCode(error_codes_1.ErrorCodes.VAL_INVALID_FORMAT, { field: fieldName, expected }, {
                category: error_types_1.ErrorCategory.VALIDATION,
                severity: error_types_1.ErrorSeverity.ERROR,
            });
        }
    }
    static validateRange(value, min, max, fieldName) {
        if (value < min || value > max) {
            throw base_exception_1.BaseException.fromErrorCode(error_codes_1.ErrorCodes.VAL_OUT_OF_RANGE, { field: fieldName, value }, {
                category: error_types_1.ErrorCategory.VALIDATION,
                severity: error_types_1.ErrorSeverity.ERROR,
                suggestion: `Value should be between ${min} and ${max}`,
            });
        }
    }
}
exports.ValidationErrorHandler = ValidationErrorHandler;
class ErrorRecovery {
    static async withDefault(fn, defaultValue, logError = false) {
        try {
            return await fn();
        }
        catch (error) {
            if (logError) {
                console.error('Error occurred, using default value:', error);
            }
            return defaultValue;
        }
    }
    static async withRetry(fn, maxAttempts = 3, delay = 1000) {
        let lastError;
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                return await fn();
            }
            catch (error) {
                lastError = error;
                if (attempt < maxAttempts) {
                    console.log(`Attempt ${attempt} failed, retrying in ${delay}ms...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
        }
        throw lastError;
    }
    static async withTimeout(fn, timeout, errorMessage = 'Operation timed out') {
        return Promise.race([
            fn(),
            new Promise((_, reject) => setTimeout(() => reject(new Error(errorMessage)), timeout)),
        ]);
    }
}
exports.ErrorRecovery = ErrorRecovery;
//# sourceMappingURL=error-handler.js.map