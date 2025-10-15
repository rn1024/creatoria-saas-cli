import { Type } from '@nestjs/common';
export interface ApiResponseMetadata {
    status: number;
    description?: string;
    type?: Type<any> | string;
    isArray?: boolean;
    examples?: Record<string, any>;
}
export declare function ApiSuccessResponse(options?: Partial<ApiResponseMetadata>): (target: any, propertyKey?: string, descriptor?: PropertyDescriptor) => void | TypedPropertyDescriptor<any>;
export declare function ApiErrorResponse(status: number, description?: string): (target: any, propertyKey?: string, descriptor?: PropertyDescriptor) => void | TypedPropertyDescriptor<any>;
export declare function ApiPaginatedResponse<T>(model: Type<T>): (target: any, propertyKey?: string, descriptor?: PropertyDescriptor) => void | TypedPropertyDescriptor<any>;
export declare function ApiFileResponse(mimeType?: string): (target: any, propertyKey?: string, descriptor?: PropertyDescriptor) => void | TypedPropertyDescriptor<any>;
export declare function ApiStandardResponses(): (target: any, propertyKey?: string, descriptor?: PropertyDescriptor) => PropertyDescriptor | undefined;
export declare function ApiResponseExample(name: string, example: any): (target: any, propertyKey?: string, descriptor?: PropertyDescriptor) => PropertyDescriptor | undefined;
