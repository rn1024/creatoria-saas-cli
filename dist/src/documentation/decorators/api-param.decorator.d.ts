import { Type } from '@nestjs/common';
export interface ApiParamMetadata {
    name: string;
    type?: Type<any> | string;
    description?: string;
    required?: boolean;
    example?: any;
    enum?: any[];
    default?: any;
    format?: string;
    pattern?: string;
    minimum?: number;
    maximum?: number;
}
export declare function ApiPathParam(metadata: ApiParamMetadata): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => void | TypedPropertyDescriptor<any>;
export declare function ApiQueryParam(metadata: ApiParamMetadata): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => void | TypedPropertyDescriptor<any>;
export declare function ApiPaginationParams(): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
export declare function ApiFilterParams(filters: ApiParamMetadata[]): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
export declare function ApiRequestBody<T>(type: Type<T>, options?: {
    description?: string;
    required?: boolean;
    examples?: Record<string, any>;
}): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => void | TypedPropertyDescriptor<any>;
export declare function ApiFileUpload(options?: {
    fieldName?: string;
    description?: string;
    maxSize?: number;
    allowedMimeTypes?: string[];
}): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => void | TypedPropertyDescriptor<any>;
export declare function ApiMultiFileUpload(options?: {
    fieldName?: string;
    description?: string;
    maxFiles?: number;
    maxSize?: number;
    allowedMimeTypes?: string[];
}): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => void | TypedPropertyDescriptor<any>;
export declare const ValidatedParam: (...dataOrPipes: (import("@nestjs/common").PipeTransform<any, any> | Type<import("@nestjs/common").PipeTransform<any, any>> | {
    key: string;
    validator: (value: any) => boolean;
})[]) => ParameterDecorator;
export declare const TransformedParam: (...dataOrPipes: (import("@nestjs/common").PipeTransform<any, any> | Type<import("@nestjs/common").PipeTransform<any, any>> | {
    key: string;
    transformer: (value: any) => any;
})[]) => ParameterDecorator;
