import { ErrorContext } from '../types/error.types';
export declare function CatchErrors(options?: {
    rethrow?: boolean;
    context?: ErrorContext;
    fallbackValue?: any;
}): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
export declare function CatchClassErrors(options?: {
    exclude?: string[];
    context?: ErrorContext;
}): <T extends {
    new (...args: any[]): {};
}>(constructor: T) => T;
export declare function Validate(validationFn: (value: any) => boolean | string): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
export declare function Retry(options?: {
    maxAttempts?: number;
    delay?: number;
    backoff?: boolean;
    retryOn?: (error: any) => boolean;
}): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
