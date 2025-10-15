import { ValidationResult } from '../validators/custom.validator';
export declare function Validate(validator: (value: any) => boolean | Promise<boolean> | ValidationResult | Promise<ValidationResult>, errorMessage?: string): (target: any, propertyName: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
export declare function ValidateString(options: {
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    safe?: boolean;
}): (target: any, propertyName: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
export declare function ValidateNumber(options: {
    min?: number;
    max?: number;
    integer?: boolean;
    positive?: boolean;
}): (target: any, propertyName: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
export declare function ValidatePath(options: {
    mustExist?: boolean;
    safe?: boolean;
    basePath?: string;
}): (target: any, propertyName: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
export declare function ValidateEmail(): (target: any, propertyName: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
export declare function ValidateURL(): (target: any, propertyName: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
export declare function ValidatePort(): (target: any, propertyName: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
export declare function SanitizeInput(): (target: any, propertyName: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
