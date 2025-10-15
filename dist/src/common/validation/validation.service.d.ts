import { ValidationResult, ValidationSchema } from './validators/custom.validator';
import { LoggerService } from '../logger/logger.service';
export declare class ValidationService {
    private readonly logger;
    constructor(logger: LoggerService);
    validateString(value: any, options?: {
        minLength?: number;
        maxLength?: number;
        pattern?: RegExp;
        safe?: boolean;
        required?: boolean;
    }): void;
    validateNumber(value: any, options?: {
        min?: number;
        max?: number;
        integer?: boolean;
        positive?: boolean;
        required?: boolean;
    }): void;
    validatePath(value: any, options?: {
        mustExist?: boolean;
        safe?: boolean;
        basePath?: string;
        required?: boolean;
    }): Promise<void>;
    validateEmail(value: any): void;
    validateURL(value: any): void;
    validatePort(value: any): void;
    validateModuleName(value: string): void;
    validateProjectName(value: string): void;
    validateDatabaseConfig(config: any): void;
    validateApiConfig(config: any): void;
    validateFileUpload(file: {
        path: string;
        size: number;
        mimetype: string;
    }, options?: {
        maxSize?: number;
        allowedTypes?: string[];
        allowedExtensions?: string[];
    }): Promise<void>;
    validateCliArgs(args: string[]): void;
    validateWithSchema(data: any, schema: ValidationSchema): Promise<void>;
    sanitizeString(value: string): string;
    sanitizeNumber(value: any): number | null;
    sanitizePath(value: string): string;
    escapeHtml(value: string): string;
    escapeShell(value: string): string;
    batchValidate(validations: Array<{
        value: any;
        validator: (value: any) => void | Promise<void>;
        field: string;
    }>): Promise<ValidationResult>;
    createValidationChain(): {
        addValidation: (field: string, validator: () => void | Promise<void>) => any;
        validate: () => Promise<ValidationResult>;
    };
}
