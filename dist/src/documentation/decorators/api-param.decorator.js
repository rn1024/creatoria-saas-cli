"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransformedParam = exports.ValidatedParam = void 0;
exports.ApiPathParam = ApiPathParam;
exports.ApiQueryParam = ApiQueryParam;
exports.ApiPaginationParams = ApiPaginationParams;
exports.ApiFilterParams = ApiFilterParams;
exports.ApiRequestBody = ApiRequestBody;
exports.ApiFileUpload = ApiFileUpload;
exports.ApiMultiFileUpload = ApiMultiFileUpload;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
function ApiPathParam(metadata) {
    return function (target, propertyKey, descriptor) {
        const existingParams = Reflect.getMetadata('api-path-params', target, propertyKey) || [];
        existingParams.push(metadata);
        (0, common_1.SetMetadata)('api-path-params', existingParams)(target, propertyKey, descriptor);
        return (0, swagger_1.ApiParam)({
            name: metadata.name,
            type: metadata.type,
            description: metadata.description,
            required: metadata.required !== false,
            example: metadata.example,
            enum: metadata.enum,
        })(target, propertyKey, descriptor);
    };
}
function ApiQueryParam(metadata) {
    return function (target, propertyKey, descriptor) {
        const existingParams = Reflect.getMetadata('api-query-params', target, propertyKey) || [];
        existingParams.push(metadata);
        (0, common_1.SetMetadata)('api-query-params', existingParams)(target, propertyKey, descriptor);
        return (0, swagger_1.ApiQuery)({
            name: metadata.name,
            type: metadata.type,
            description: metadata.description,
            required: metadata.required || false,
            example: metadata.example,
            enum: metadata.enum,
        })(target, propertyKey, descriptor);
    };
}
function ApiPaginationParams() {
    return function (target, propertyKey, descriptor) {
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
function ApiFilterParams(filters) {
    return function (target, propertyKey, descriptor) {
        filters.forEach(filter => {
            ApiQueryParam({
                ...filter,
                required: false,
            })(target, propertyKey, descriptor);
        });
        return descriptor;
    };
}
function ApiRequestBody(type, options) {
    return function (target, propertyKey, descriptor) {
        const metadata = {
            type,
            description: options?.description || `${type.name} object`,
            required: options?.required !== false,
            examples: options?.examples,
        };
        (0, common_1.SetMetadata)('api-request-body', metadata)(target, propertyKey, descriptor);
        return (0, swagger_1.ApiBody)({
            type,
            description: metadata.description,
            required: metadata.required,
            examples: metadata.examples,
        })(target, propertyKey, descriptor);
    };
}
function ApiFileUpload(options) {
    return function (target, propertyKey, descriptor) {
        const metadata = {
            fieldName: options?.fieldName || 'file',
            description: options?.description || 'File upload',
            maxSize: options?.maxSize,
            allowedMimeTypes: options?.allowedMimeTypes || ['*/*'],
        };
        (0, common_1.SetMetadata)('api-file-upload', metadata)(target, propertyKey, descriptor);
        return (0, swagger_1.ApiBody)({
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
function ApiMultiFileUpload(options) {
    return function (target, propertyKey, descriptor) {
        const metadata = {
            fieldName: options?.fieldName || 'files',
            description: options?.description || 'Multiple file upload',
            maxFiles: options?.maxFiles || 10,
            maxSize: options?.maxSize,
            allowedMimeTypes: options?.allowedMimeTypes || ['*/*'],
        };
        (0, common_1.SetMetadata)('api-multi-file-upload', metadata)(target, propertyKey, descriptor);
        return (0, swagger_1.ApiBody)({
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
exports.ValidatedParam = (0, common_1.createParamDecorator)((data, ctx) => {
    const request = ctx.switchToHttp().getRequest();
    const value = request.params[data.key] || request.query[data.key];
    if (!data.validator(value)) {
        throw new Error(`Invalid parameter: ${data.key}`);
    }
    return value;
});
exports.TransformedParam = (0, common_1.createParamDecorator)((data, ctx) => {
    const request = ctx.switchToHttp().getRequest();
    const value = request.params[data.key] || request.query[data.key];
    return data.transformer(value);
});
//# sourceMappingURL=api-param.decorator.js.map