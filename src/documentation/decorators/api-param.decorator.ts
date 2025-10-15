/**
 * API参数装饰器
 */

import { SetMetadata, Type, createParamDecorator, ExecutionContext } from '@nestjs/common';
import { ApiParam as SwaggerApiParam, ApiQuery as SwaggerApiQuery, ApiBody as SwaggerApiBody } from '@nestjs/swagger';

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

/**
 * 路径参数装饰器增强
 */
export function ApiPathParam(metadata: ApiParamMetadata) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const existingParams = Reflect.getMetadata('api-path-params', target, propertyKey) || [];
    existingParams.push(metadata);
    
    SetMetadata('api-path-params', existingParams)(target, propertyKey, descriptor);
    
    // 同时应用Swagger装饰器
    return SwaggerApiParam({
      name: metadata.name,
      type: metadata.type,
      description: metadata.description,
      required: metadata.required !== false,
      example: metadata.example,
      enum: metadata.enum,
    })(target, propertyKey, descriptor);
  };
}

/**
 * 查询参数装饰器增强
 */
export function ApiQueryParam(metadata: ApiParamMetadata) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const existingParams = Reflect.getMetadata('api-query-params', target, propertyKey) || [];
    existingParams.push(metadata);
    
    SetMetadata('api-query-params', existingParams)(target, propertyKey, descriptor);
    
    // 同时应用Swagger装饰器
    return SwaggerApiQuery({
      name: metadata.name,
      type: metadata.type,
      description: metadata.description,
      required: metadata.required || false,
      example: metadata.example,
      enum: metadata.enum,
    })(target, propertyKey, descriptor);
  };
}

/**
 * 分页参数装饰器
 */
export function ApiPaginationParams() {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    // 添加标准分页参数
    ApiQueryParam({
      name: 'page',
      type: 'number',
      description: 'Page number',
      required: false,
      example: 1,
      default: 1,
      minimum: 1,
    })(target, propertyKey, descriptor);
    
    ApiQueryParam({
      name: 'limit',
      type: 'number',
      description: 'Items per page',
      required: false,
      example: 10,
      default: 10,
      minimum: 1,
      maximum: 100,
    })(target, propertyKey, descriptor);
    
    ApiQueryParam({
      name: 'sort',
      type: 'string',
      description: 'Sort field',
      required: false,
      example: 'createdAt',
    })(target, propertyKey, descriptor);
    
    ApiQueryParam({
      name: 'order',
      type: 'string',
      description: 'Sort order',
      required: false,
      enum: ['asc', 'desc'],
      default: 'desc',
    })(target, propertyKey, descriptor);
    
    return descriptor;
  };
}

/**
 * 过滤参数装饰器
 */
export function ApiFilterParams(filters: ApiParamMetadata[]) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    filters.forEach(filter => {
      ApiQueryParam({
        ...filter,
        required: false,
      })(target, propertyKey, descriptor);
    });
    
    return descriptor;
  };
}

/**
 * 请求体装饰器增强
 */
export function ApiRequestBody<T>(type: Type<T>, options?: {
  description?: string;
  required?: boolean;
  examples?: Record<string, any>;
}) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const metadata = {
      type,
      description: options?.description || `${type.name} object`,
      required: options?.required !== false,
      examples: options?.examples,
    };
    
    SetMetadata('api-request-body', metadata)(target, propertyKey, descriptor);
    
    // 同时应用Swagger装饰器
    return SwaggerApiBody({
      type,
      description: metadata.description,
      required: metadata.required,
      examples: metadata.examples,
    })(target, propertyKey, descriptor);
  };
}

/**
 * 文件上传装饰器
 */
export function ApiFileUpload(options?: {
  fieldName?: string;
  description?: string;
  maxSize?: number;
  allowedMimeTypes?: string[];
}) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const metadata = {
      fieldName: options?.fieldName || 'file',
      description: options?.description || 'File upload',
      maxSize: options?.maxSize,
      allowedMimeTypes: options?.allowedMimeTypes || ['*/*'],
    };
    
    SetMetadata('api-file-upload', metadata)(target, propertyKey, descriptor);
    
    // 应用Swagger文件上传装饰器
    return SwaggerApiBody({
      description: metadata.description,
      schema: {
        type: 'object',
        properties: {
          [metadata.fieldName]: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    })(target, propertyKey, descriptor);
  };
}

/**
 * 多文件上传装饰器
 */
export function ApiMultiFileUpload(options?: {
  fieldName?: string;
  description?: string;
  maxFiles?: number;
  maxSize?: number;
  allowedMimeTypes?: string[];
}) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const metadata = {
      fieldName: options?.fieldName || 'files',
      description: options?.description || 'Multiple file upload',
      maxFiles: options?.maxFiles || 10,
      maxSize: options?.maxSize,
      allowedMimeTypes: options?.allowedMimeTypes || ['*/*'],
    };
    
    SetMetadata('api-multi-file-upload', metadata)(target, propertyKey, descriptor);
    
    // 应用Swagger多文件上传装饰器
    return SwaggerApiBody({
      description: metadata.description,
      schema: {
        type: 'object',
        properties: {
          [metadata.fieldName]: {
            type: 'array',
            items: {
              type: 'string',
              format: 'binary',
            },
          },
        },
      },
    })(target, propertyKey, descriptor);
  };
}

/**
 * 参数验证装饰器
 */
export const ValidatedParam = createParamDecorator(
  (data: { key: string; validator: (value: any) => boolean }, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const value = request.params[data.key] || request.query[data.key];
    
    if (!data.validator(value)) {
      throw new Error(`Invalid parameter: ${data.key}`);
    }
    
    return value;
  },
);

/**
 * 参数转换装饰器
 */
export const TransformedParam = createParamDecorator(
  (data: { key: string; transformer: (value: any) => any }, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const value = request.params[data.key] || request.query[data.key];
    
    return data.transformer(value);
  },
);