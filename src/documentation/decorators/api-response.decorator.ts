/**
 * API响应装饰器
 */

import { SetMetadata, Type } from '@nestjs/common';
import { ApiResponse as SwaggerApiResponse, ApiResponseOptions } from '@nestjs/swagger';

export interface ApiResponseMetadata {
  status: number;
  description?: string;
  type?: Type<any> | string;
  isArray?: boolean;
  examples?: Record<string, any>;
}

/**
 * 成功响应装饰器
 */
export function ApiSuccessResponse(options?: Partial<ApiResponseMetadata>) {
  return function (target: any, propertyKey?: string, descriptor?: PropertyDescriptor) {
    const metadata: ApiResponseMetadata = {
      status: 200,
      description: 'Successful response',
      ...options,
    };

    SetMetadata('api-response-success', metadata)(target, propertyKey!, descriptor!);
    
    // 同时应用Swagger装饰器
    const swaggerOptions: ApiResponseOptions = {
      status: metadata.status,
      description: metadata.description,
      type: metadata.type,
      isArray: metadata.isArray,
    };
    
    return SwaggerApiResponse(swaggerOptions)(target, propertyKey!, descriptor!);
  };
}

/**
 * 错误响应装饰器
 */
export function ApiErrorResponse(status: number, description?: string) {
  return function (target: any, propertyKey?: string, descriptor?: PropertyDescriptor) {
    const metadata: ApiResponseMetadata = {
      status,
      description: description || `Error ${status}`,
    };

    const existingErrors = Reflect.getMetadata('api-response-errors', target, propertyKey!) || [];
    existingErrors.push(metadata);
    
    SetMetadata('api-response-errors', existingErrors)(target, propertyKey!, descriptor!);
    
    // 同时应用Swagger装饰器
    return SwaggerApiResponse({
      status,
      description: metadata.description,
    })(target, propertyKey!, descriptor!);
  };
}

/**
 * 分页响应装饰器
 */
export function ApiPaginatedResponse<T>(model: Type<T>) {
  return function (target: any, propertyKey?: string, descriptor?: PropertyDescriptor) {
    const metadata = {
      status: 200,
      description: 'Paginated response',
      schema: {
        type: 'object',
        properties: {
          data: {
            type: 'array',
            items: { $ref: `#/components/schemas/${model.name}` },
          },
          meta: {
            type: 'object',
            properties: {
              total: { type: 'number', example: 100 },
              page: { type: 'number', example: 1 },
              limit: { type: 'number', example: 10 },
              totalPages: { type: 'number', example: 10 },
            },
          },
        },
      },
    };

    SetMetadata('api-response-paginated', metadata)(target, propertyKey!, descriptor!);
    
    return SwaggerApiResponse({
      status: 200,
      description: 'Paginated response',
      schema: metadata.schema,
    })(target, propertyKey!, descriptor!);
  };
}

/**
 * 文件响应装饰器
 */
export function ApiFileResponse(mimeType: string = 'application/octet-stream') {
  return function (target: any, propertyKey?: string, descriptor?: PropertyDescriptor) {
    const metadata = {
      status: 200,
      description: 'File download',
      content: {
        [mimeType]: {
          schema: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    };

    SetMetadata('api-response-file', metadata)(target, propertyKey!, descriptor!);
    
    return SwaggerApiResponse({
      status: 200,
      description: 'File download',
      content: metadata.content,
    })(target, propertyKey!, descriptor!);
  };
}

/**
 * 标准响应装饰器组合
 */
export function ApiStandardResponses() {
  return function (target: any, propertyKey?: string, descriptor?: PropertyDescriptor) {
    // 应用多个响应装饰器
    ApiSuccessResponse()(target, propertyKey!, descriptor!);
    ApiErrorResponse(400, 'Bad Request')(target, propertyKey!, descriptor!);
    ApiErrorResponse(401, 'Unauthorized')(target, propertyKey!, descriptor!);
    ApiErrorResponse(403, 'Forbidden')(target, propertyKey!, descriptor!);
    ApiErrorResponse(404, 'Not Found')(target, propertyKey!, descriptor!);
    ApiErrorResponse(500, 'Internal Server Error')(target, propertyKey!, descriptor!);
    
    return descriptor;
  };
}

/**
 * 创建响应示例装饰器
 */
export function ApiResponseExample(name: string, example: any) {
  return function (target: any, propertyKey?: string, descriptor?: PropertyDescriptor) {
    const existingExamples = Reflect.getMetadata('api-response-examples', target, propertyKey!) || {};
    existingExamples[name] = example;
    
    SetMetadata('api-response-examples', existingExamples)(target, propertyKey!, descriptor!);
    
    return descriptor;
  };
}