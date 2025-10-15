"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiDocGenerator = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const fs = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
let ApiDocGenerator = class ApiDocGenerator {
    modulesContainer;
    documentation;
    metadataScanner;
    constructor(modulesContainer) {
        this.modulesContainer = modulesContainer;
        this.metadataScanner = new core_1.MetadataScanner();
        this.documentation = {
            title: 'Creatoria SaaS CLI API',
            version: '1.0.0',
            description: 'API documentation',
            basePath: '/api',
            endpoints: [],
            models: new Map(),
            generated: new Date(),
        };
    }
    async generate() {
        this.scanControllers();
        this.extractModels();
        await this.saveDocumentation();
        return this.documentation;
    }
    scanControllers() {
        const modules = [...this.modulesContainer.values()];
        modules.forEach(module => {
            const controllers = [...module.controllers.values()];
            controllers.forEach(controller => {
                this.scanController(controller);
            });
        });
    }
    scanController(wrapper) {
        const { instance, metatype } = wrapper;
        if (!instance || !metatype) {
            return;
        }
        const prototype = Object.getPrototypeOf(instance);
        const controllerPath = Reflect.getMetadata('path', metatype) || '';
        const controllerName = metatype.name;
        this.metadataScanner.scanFromPrototype(instance, prototype, (methodName) => {
            const method = prototype[methodName];
            const httpMethod = this.getHttpMethod(method);
            const routePath = Reflect.getMetadata('path', method) || '';
            if (httpMethod) {
                const endpoint = this.createEndpoint(controllerName, controllerPath, methodName, httpMethod, routePath, method);
                this.documentation.endpoints.push(endpoint);
            }
        });
    }
    getHttpMethod(method) {
        const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'];
        for (const httpMethod of methods) {
            if (Reflect.hasMetadata(`path-method:${httpMethod}`, method)) {
                return httpMethod;
            }
        }
        return null;
    }
    createEndpoint(controllerName, controllerPath, methodName, httpMethod, routePath, method) {
        const fullPath = this.joinPaths(controllerPath, routePath);
        const summary = Reflect.getMetadata('swagger/apiOperation', method);
        const parameters = this.extractParameters(method);
        const responses = this.extractResponses(method);
        const tags = Reflect.getMetadata('swagger/apiUseTags', method) || [controllerName];
        const deprecated = Reflect.getMetadata('deprecated', method) || false;
        const security = this.extractSecurity(method);
        return {
            method: httpMethod,
            path: fullPath,
            controller: controllerName,
            handler: methodName,
            description: summary?.summary || `${httpMethod} ${fullPath}`,
            parameters,
            responses,
            tags,
            deprecated,
            security,
        };
    }
    extractParameters(method) {
        const parameters = [];
        const pathParams = Reflect.getMetadata('swagger/apiParam', method) || [];
        pathParams.forEach((param) => {
            parameters.push({
                name: param.name,
                in: 'path',
                type: param.type || 'string',
                required: param.required !== false,
                description: param.description,
                example: param.example,
            });
        });
        const queryParams = Reflect.getMetadata('swagger/apiQuery', method) || [];
        queryParams.forEach((param) => {
            parameters.push({
                name: param.name,
                in: 'query',
                type: param.type || 'string',
                required: param.required || false,
                description: param.description,
                example: param.example,
            });
        });
        const bodyParam = Reflect.getMetadata('swagger/apiBody', method);
        if (bodyParam) {
            parameters.push({
                name: 'body',
                in: 'body',
                type: bodyParam.type || 'object',
                required: bodyParam.required !== false,
                description: bodyParam.description,
                schema: bodyParam.schema,
            });
        }
        const headerParams = Reflect.getMetadata('swagger/apiHeaders', method) || [];
        headerParams.forEach((param) => {
            parameters.push({
                name: param.name,
                in: 'header',
                type: param.type || 'string',
                required: param.required || false,
                description: param.description,
                example: param.example,
            });
        });
        return parameters;
    }
    extractResponses(method) {
        const responses = [];
        const apiResponses = Reflect.getMetadata('swagger/apiResponse', method) || [];
        apiResponses.forEach((response) => {
            responses.push({
                status: response.status,
                description: response.description || `Status ${response.status}`,
                schema: response.type,
                examples: response.examples,
            });
        });
        if (responses.length === 0) {
            responses.push({
                status: 200,
                description: 'Successful response',
            });
            responses.push({
                status: 400,
                description: 'Bad request',
            });
            responses.push({
                status: 500,
                description: 'Internal server error',
            });
        }
        return responses;
    }
    extractSecurity(method) {
        const security = [];
        if (Reflect.hasMetadata('swagger/apiBearerAuth', method)) {
            security.push('bearer');
        }
        if (Reflect.hasMetadata('swagger/apiSecurity', method)) {
            const securities = Reflect.getMetadata('swagger/apiSecurity', method);
            security.push(...securities);
        }
        return security;
    }
    extractModels() {
        this.documentation.endpoints.forEach(endpoint => {
            endpoint.parameters?.forEach(param => {
                if (param.schema) {
                    this.addModel(param.schema);
                }
            });
            endpoint.responses?.forEach(response => {
                if (response.schema) {
                    this.addModel(response.schema);
                }
            });
        });
    }
    addModel(schema) {
        if (typeof schema === 'function' && schema.name) {
            const modelName = schema.name;
            if (!this.documentation.models.has(modelName)) {
                const properties = this.extractModelProperties(schema);
                this.documentation.models.set(modelName, {
                    name: modelName,
                    properties,
                });
            }
        }
    }
    extractModelProperties(schema) {
        const metadata = Reflect.getMetadata('swagger/apiModelProperties', schema) || {};
        return metadata;
    }
    async saveDocumentation() {
        const docsDir = path.join(process.cwd(), 'docs', 'api');
        await fs.ensureDir(docsDir);
        const jsonPath = path.join(docsDir, 'api-documentation.json');
        await fs.writeJSON(jsonPath, this.documentation, { spaces: 2 });
        const markdownPath = path.join(docsDir, 'API.md');
        const markdown = this.generateMarkdown();
        await fs.writeFile(markdownPath, markdown);
        const htmlPath = path.join(docsDir, 'api.html');
        const html = this.generateHtml();
        await fs.writeFile(htmlPath, html);
    }
    generateMarkdown() {
        const lines = [];
        lines.push(`# ${this.documentation.title}`);
        lines.push('');
        lines.push(`Version: ${this.documentation.version}`);
        lines.push('');
        lines.push(this.documentation.description);
        lines.push('');
        lines.push(`Base Path: ${this.documentation.basePath}`);
        lines.push('');
        lines.push(`Generated: ${this.documentation.generated.toISOString()}`);
        lines.push('');
        lines.push('## Endpoints');
        lines.push('');
        const endpointsByTag = new Map();
        this.documentation.endpoints.forEach(endpoint => {
            const tags = endpoint.tags || ['Other'];
            tags.forEach(tag => {
                if (!endpointsByTag.has(tag)) {
                    endpointsByTag.set(tag, []);
                }
                endpointsByTag.get(tag).push(endpoint);
            });
        });
        endpointsByTag.forEach((endpoints, tag) => {
            lines.push(`### ${tag}`);
            lines.push('');
            endpoints.forEach(endpoint => {
                lines.push(`#### ${endpoint.method} ${endpoint.path}`);
                lines.push('');
                if (endpoint.deprecated) {
                    lines.push('**⚠️ DEPRECATED**');
                    lines.push('');
                }
                lines.push(endpoint.description || 'No description');
                lines.push('');
                if (endpoint.parameters && endpoint.parameters.length > 0) {
                    lines.push('**Parameters:**');
                    lines.push('');
                    lines.push('| Name | In | Type | Required | Description |');
                    lines.push('|------|-----|------|----------|-------------|');
                    endpoint.parameters.forEach(param => {
                        lines.push(`| ${param.name} | ${param.in} | ${param.type} | ${param.required ? 'Yes' : 'No'} | ${param.description || '-'} |`);
                    });
                    lines.push('');
                }
                if (endpoint.responses && endpoint.responses.length > 0) {
                    lines.push('**Responses:**');
                    lines.push('');
                    lines.push('| Status | Description |');
                    lines.push('|--------|-------------|');
                    endpoint.responses.forEach(response => {
                        lines.push(`| ${response.status} | ${response.description} |`);
                    });
                    lines.push('');
                }
                if (endpoint.security && endpoint.security.length > 0) {
                    lines.push('**Security:**');
                    lines.push(`- ${endpoint.security.join(', ')}`);
                    lines.push('');
                }
                lines.push('---');
                lines.push('');
            });
        });
        if (this.documentation.models.size > 0) {
            lines.push('## Models');
            lines.push('');
            this.documentation.models.forEach((model, name) => {
                lines.push(`### ${name}`);
                lines.push('');
                lines.push('| Property | Type | Description |');
                lines.push('|----------|------|-------------|');
                Object.entries(model.properties).forEach(([prop, details]) => {
                    lines.push(`| ${prop} | ${details.type || 'any'} | ${details.description || '-'} |`);
                });
                lines.push('');
            });
        }
        return lines.join('\n');
    }
    generateHtml() {
        const markdown = this.generateMarkdown();
        const marked = require('marked');
        const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${this.documentation.title}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      line-height: 1.6;
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
      background: #f5f5f5;
    }
    h1, h2, h3, h4 {
      color: #333;
      margin-top: 2rem;
    }
    h1 {
      border-bottom: 3px solid #007bff;
      padding-bottom: 0.5rem;
    }
    h2 {
      border-bottom: 2px solid #dee2e6;
      padding-bottom: 0.3rem;
    }
    h3 {
      color: #495057;
    }
    h4 {
      color: #6c757d;
      font-family: monospace;
      background: #fff;
      padding: 0.5rem;
      border-left: 4px solid #007bff;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      background: #fff;
      margin: 1rem 0;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    th {
      background: #007bff;
      color: white;
      padding: 0.75rem;
      text-align: left;
    }
    td {
      padding: 0.75rem;
      border-bottom: 1px solid #dee2e6;
    }
    tr:hover {
      background: #f8f9fa;
    }
    code {
      background: #f8f9fa;
      padding: 0.2rem 0.4rem;
      border-radius: 3px;
      font-family: monospace;
    }
    pre {
      background: #282c34;
      color: #abb2bf;
      padding: 1rem;
      border-radius: 5px;
      overflow-x: auto;
    }
    hr {
      border: none;
      border-top: 1px solid #dee2e6;
      margin: 2rem 0;
    }
    .deprecated {
      background: #fff3cd;
      color: #856404;
      padding: 0.5rem;
      border-radius: 3px;
      margin: 0.5rem 0;
    }
  </style>
</head>
<body>
  ${marked.parse(markdown)}
</body>
</html>
    `;
        return html;
    }
    joinPaths(...paths) {
        return '/' + paths
            .filter(p => p)
            .map(p => p.replace(/^\/|\/$/g, ''))
            .join('/');
    }
};
exports.ApiDocGenerator = ApiDocGenerator;
exports.ApiDocGenerator = ApiDocGenerator = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.ModulesContainer])
], ApiDocGenerator);
//# sourceMappingURL=api-doc.generator.js.map