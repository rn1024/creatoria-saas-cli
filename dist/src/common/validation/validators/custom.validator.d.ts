export interface ValidationRule {
    validator: (value: any) => boolean | Promise<boolean>;
    message: string;
}
export interface ValidationSchema {
    [field: string]: ValidationRule[];
}
export interface ValidationResult {
    valid: boolean;
    errors: {
        field: string;
        message: string;
    }[];
}
export declare class CustomValidator {
    private static rules;
    static registerRule(name: string, rule: ValidationRule): void;
    static getRule(name: string): ValidationRule | undefined;
    static validateModuleName(value: string): ValidationResult;
    static validateProjectName(value: string): ValidationResult;
    static validateDatabaseConfig(config: any): ValidationResult;
    static validateApiConfig(config: any): ValidationResult;
    static validateFileUpload(file: {
        path: string;
        size: number;
        mimetype: string;
    }, options?: {
        maxSize?: number;
        allowedTypes?: string[];
        allowedExtensions?: string[];
    }): Promise<ValidationResult>;
    static validateCliArgs(args: string[]): ValidationResult;
    static validateWithSchema(data: any, schema: ValidationSchema): Promise<ValidationResult>;
    static combine(...validators: Array<(value: any) => ValidationResult>): (value: any) => ValidationResult;
}
