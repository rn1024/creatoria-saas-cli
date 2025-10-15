"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiSuccessResponse = ApiSuccessResponse;
exports.ApiErrorResponse = ApiErrorResponse;
exports.ApiPaginatedResponse = ApiPaginatedResponse;
exports.ApiFileResponse = ApiFileResponse;
exports.ApiStandardResponses = ApiStandardResponses;
exports.ApiResponseExample = ApiResponseExample;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
function ApiSuccessResponse(options) {
    return function (target, propertyKey, descriptor) {
        const metadata = {
            status: 200,
            description: 'Successful response',
            ...options,
        };
        (0, common_1.SetMetadata)('api-response-success', metadata)(target, propertyKey, descriptor);
        const swaggerOptions = {
            status: metadata.status,
            description: metadata.description,
            type: metadata.type,
            isArray: metadata.isArray,
        };
        return (0, swagger_1.ApiResponse)(swaggerOptions)(target, propertyKey, descriptor);
    };
}
function ApiErrorResponse(status, description) {
    return function (target, propertyKey, descriptor) {
        const metadata = {
            status,
            description: description || `Error ${status}`,
        };
        const existingErrors = Reflect.getMetadata('api-response-errors', target, propertyKey) || [];
        existingErrors.push(metadata);
        (0, common_1.SetMetadata)('api-response-errors', existingErrors)(target, propertyKey, descriptor);
        return (0, swagger_1.ApiResponse)({
            status,
            description: metadata.description,
        })(target, propertyKey, descriptor);
    };
}
function ApiPaginatedResponse(model) {
    return function (target, propertyKey, descriptor) {
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
        (0, common_1.SetMetadata)('api-response-paginated', metadata)(target, propertyKey, descriptor);
        return (0, swagger_1.ApiResponse)({
            status: 200,
            description: 'Paginated response',
            schema: metadata.schema,
        })(target, propertyKey, descriptor);
    };
}
function ApiFileResponse(mimeType = 'application/octet-stream') {
    return function (target, propertyKey, descriptor) {
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
        (0, common_1.SetMetadata)('api-response-file', metadata)(target, propertyKey, descriptor);
        return (0, swagger_1.ApiResponse)({
            status: 200,
            description: 'File download',
            content: metadata.content,
        })(target, propertyKey, descriptor);
    };
}
function ApiStandardResponses() {
    return function (target, propertyKey, descriptor) {
        ApiSuccessResponse()(target, propertyKey, descriptor);
        ApiErrorResponse(400, 'Bad Request')(target, propertyKey, descriptor);
        ApiErrorResponse(401, 'Unauthorized')(target, propertyKey, descriptor);
        ApiErrorResponse(403, 'Forbidden')(target, propertyKey, descriptor);
        ApiErrorResponse(404, 'Not Found')(target, propertyKey, descriptor);
        ApiErrorResponse(500, 'Internal Server Error')(target, propertyKey, descriptor);
        return descriptor;
    };
}
function ApiResponseExample(name, example) {
    return function (target, propertyKey, descriptor) {
        const existingExamples = Reflect.getMetadata('api-response-examples', target, propertyKey) || {};
        existingExamples[name] = example;
        (0, common_1.SetMetadata)('api-response-examples', existingExamples)(target, propertyKey, descriptor);
        return descriptor;
    };
}
//# sourceMappingURL=api-response.decorator.js.map