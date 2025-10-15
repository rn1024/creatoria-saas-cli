/**
 * API文档生成器
 */

import { Injectable } from '@nestjs/common';
import { MetadataScanner, ModulesContainer } from '@nestjs/core';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import * as fs from 'fs-extra';
import * as path from 'path';

export interface ApiEndpoint {
  method: string;
  path: string;
  controller: string;
  handler: string;
  description?: string;
  parameters?: ApiParameter[];
  responses?: ApiResponse[];
  tags?: string[];
  deprecated?: boolean;
  security?: string[];
}

export interface ApiParameter {
  name: string;
  in: 'query' | 'path' | 'body' | 'header';
  type: string;
  required?: boolean;
  description?: string;
  example?: any;
  schema?: any;
}

export interface ApiResponse {
  status: number;
  description: string;
  schema?: any;
  examples?: any;
}

export interface ApiDocumentation {
  title: string;
  version: string;
  description: string;
  basePath: string;
  endpoints: ApiEndpoint[];
  models: Map<string, any>;
  generated: Date;
}

@Injectable()
export class ApiDocGenerator {
  private documentation: ApiDocumentation;
  private metadataScanner: MetadataScanner;

  constructor(
    private readonly modulesContainer: ModulesContainer,
  ) {
    this.metadataScanner = new MetadataScanner();
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

  /**
   * 生成API文档
   */
  async generate(): Promise<ApiDocumentation> {
    this.scanControllers();
    this.extractModels();
    await this.saveDocumentation();
    return this.documentation;
  }

  /**
   * 扫描所有控制器
   */
  private scanControllers(): void {
    const modules = [...this.modulesContainer.values()];
    
    modules.forEach(module => {
      const controllers = [...module.controllers.values()];
      
      controllers.forEach(controller => {
        this.scanController(controller);
      });
    });
  }

  /**
   * 扫描单个控制器
   */
  private scanController(wrapper: InstanceWrapper): void {
    const { instance, metatype } = wrapper;
    
    if (!instance || !metatype) {
      return;
    }

    const prototype = Object.getPrototypeOf(instance);
    const controllerPath = Reflect.getMetadata('path', metatype) || '';
    const controllerName = metatype.name;

    // 扫描所有方法
    this.metadataScanner.scanFromPrototype(
      instance,
      prototype,
      (methodName: string) => {
        const method = prototype[methodName];
        const httpMethod = this.getHttpMethod(method);
        const routePath = Reflect.getMetadata('path', method) || '';
        
        if (httpMethod) {
          const endpoint = this.createEndpoint(
            controllerName,
            controllerPath,
            methodName,
            httpMethod,
            routePath,
            method,
          );
          
          this.documentation.endpoints.push(endpoint);
        }
      },
    );
  }

  /**
   * 获取HTTP方法
   */
  private getHttpMethod(method: Function): string | null {
    const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'];
    
    for (const httpMethod of methods) {
      if (Reflect.hasMetadata(`path-method:${httpMethod}`, method)) {
        return httpMethod;
      }
    }
    
    return null;
  }

  /**
   * 创建端点文档
   */
  private createEndpoint(
    controllerName: string,
    controllerPath: string,
    methodName: string,
    httpMethod: string,
    routePath: string,
    method: Function,
  ): ApiEndpoint {
    const fullPath = this.joinPaths(controllerPath, routePath);
    
    // 获取方法元数据
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

  /**
   * 提取参数信息
   */
  private extractParameters(method: Function): ApiParameter[] {
    const parameters: ApiParameter[] = [];
    
    // 获取路径参数
    const pathParams = Reflect.getMetadata('swagger/apiParam', method) || [];
    pathParams.forEach((param: any) => {
      parameters.push({
        name: param.name,
        in: 'path',
        type: param.type || 'string',
        required: param.required !== false,
        description: param.description,
        example: param.example,
      });
    });

    // 获取查询参数
    const queryParams = Reflect.getMetadata('swagger/apiQuery', method) || [];
    queryParams.forEach((param: any) => {
      parameters.push({
        name: param.name,
        in: 'query',
        type: param.type || 'string',
        required: param.required || false,
        description: param.description,
        example: param.example,
      });
    });

    // 获取请求体
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

    // 获取请求头
    const headerParams = Reflect.getMetadata('swagger/apiHeaders', method) || [];
    headerParams.forEach((param: any) => {
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

  /**
   * 提取响应信息
   */
  private extractResponses(method: Function): ApiResponse[] {
    const responses: ApiResponse[] = [];
    const apiResponses = Reflect.getMetadata('swagger/apiResponse', method) || [];
    
    apiResponses.forEach((response: any) => {
      responses.push({
        status: response.status,
        description: response.description || `Status ${response.status}`,
        schema: response.type,
        examples: response.examples,
      });
    });

    // 添加默认响应
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

  /**
   * 提取安全要求
   */
  private extractSecurity(method: Function): string[] {
    const security: string[] = [];
    
    if (Reflect.hasMetadata('swagger/apiBearerAuth', method)) {
      security.push('bearer');
    }
    
    if (Reflect.hasMetadata('swagger/apiSecurity', method)) {
      const securities = Reflect.getMetadata('swagger/apiSecurity', method);
      security.push(...securities);
    }
    
    return security;
  }

  /**
   * 提取模型定义
   */
  private extractModels(): void {
    // 从端点参数和响应中提取模型
    this.documentation.endpoints.forEach(endpoint => {
      // 处理参数中的模型
      endpoint.parameters?.forEach(param => {
        if (param.schema) {
          this.addModel(param.schema);
        }
      });

      // 处理响应中的模型
      endpoint.responses?.forEach(response => {
        if (response.schema) {
          this.addModel(response.schema);
        }
      });
    });
  }

  /**
   * 添加模型定义
   */
  private addModel(schema: any): void {
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

  /**
   * 提取模型属性
   */
  private extractModelProperties(schema: Function): any {
    const metadata = Reflect.getMetadata('swagger/apiModelProperties', schema) || {};
    return metadata;
  }

  /**
   * 保存文档到文件
   */
  private async saveDocumentation(): Promise<void> {
    const docsDir = path.join(process.cwd(), 'docs', 'api');
    await fs.ensureDir(docsDir);

    // 保存为JSON
    const jsonPath = path.join(docsDir, 'api-documentation.json');
    await fs.writeJSON(jsonPath, this.documentation, { spaces: 2 });

    // 生成Markdown文档
    const markdownPath = path.join(docsDir, 'API.md');
    const markdown = this.generateMarkdown();
    await fs.writeFile(markdownPath, markdown);

    // 生成HTML文档
    const htmlPath = path.join(docsDir, 'api.html');
    const html = this.generateHtml();
    await fs.writeFile(htmlPath, html);
  }

  /**
   * 生成Markdown文档
   */
  private generateMarkdown(): string {
    const lines: string[] = [];
    
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

    // 按标签分组
    const endpointsByTag = new Map<string, ApiEndpoint[]>();
    
    this.documentation.endpoints.forEach(endpoint => {
      const tags = endpoint.tags || ['Other'];
      tags.forEach(tag => {
        if (!endpointsByTag.has(tag)) {
          endpointsByTag.set(tag, []);
        }
        endpointsByTag.get(tag)!.push(endpoint);
      });
    });

    // 生成每个标签的文档
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
            lines.push(
              `| ${param.name} | ${param.in} | ${param.type} | ${param.required ? 'Yes' : 'No'} | ${param.description || '-'} |`
            );
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

    // 添加模型文档
    if (this.documentation.models.size > 0) {
      lines.push('## Models');
      lines.push('');
      
      this.documentation.models.forEach((model, name) => {
        lines.push(`### ${name}`);
        lines.push('');
        lines.push('| Property | Type | Description |');
        lines.push('|----------|------|-------------|');
        
        Object.entries(model.properties).forEach(([prop, details]: [string, any]) => {
          lines.push(`| ${prop} | ${details.type || 'any'} | ${details.description || '-'} |`);
        });
        
        lines.push('');
      });
    }

    return lines.join('\n');
  }

  /**
   * 生成HTML文档
   */
  private generateHtml(): string {
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

  /**
   * 连接路径
   */
  private joinPaths(...paths: string[]): string {
    return '/' + paths
      .filter(p => p)
      .map(p => p.replace(/^\/|\/$/g, ''))
      .join('/');
  }
}