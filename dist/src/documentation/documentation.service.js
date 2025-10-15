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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentationService = void 0;
const common_1 = require("@nestjs/common");
const api_doc_generator_1 = require("./api/api-doc.generator");
const swagger_config_1 = require("./api/swagger.config");
const fs = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
const doc_interface_1 = require("./interfaces/doc.interface");
let DocumentationService = class DocumentationService {
    apiDocGenerator;
    swaggerConfig;
    options;
    documentation = null;
    docsPath;
    constructor(apiDocGenerator, swaggerConfig, options) {
        this.apiDocGenerator = apiDocGenerator;
        this.swaggerConfig = swaggerConfig;
        this.options = options;
        this.docsPath = path.join(process.cwd(), 'docs');
    }
    async onModuleInit() {
        if (this.options.generateOnStartup) {
            await this.generateAllDocumentation();
        }
    }
    async generateAllDocumentation() {
        console.log('Generating documentation...');
        await fs.ensureDir(this.docsPath);
        await fs.ensureDir(path.join(this.docsPath, 'api'));
        await fs.ensureDir(path.join(this.docsPath, 'guides'));
        await fs.ensureDir(path.join(this.docsPath, 'references'));
        await this.generateApiDocumentation();
        await this.generateUserGuide();
        await this.generateDeveloperGuide();
        await this.generateConfigReference();
        console.log('Documentation generated successfully');
    }
    async generateApiDocumentation() {
        const doc = await this.apiDocGenerator.generate();
        await this.exportDocumentation(doc_interface_1.DocumentFormat.JSON);
        await this.exportDocumentation(doc_interface_1.DocumentFormat.YAML);
        await this.exportDocumentation(doc_interface_1.DocumentFormat.HTML);
        await this.exportDocumentation(doc_interface_1.DocumentFormat.MARKDOWN);
    }
    async exportDocumentation(format) {
        if (!this.documentation) {
            this.documentation = await this.apiDocGenerator.generate();
        }
        let content;
        let filename;
        switch (format) {
            case doc_interface_1.DocumentFormat.JSON:
                content = JSON.stringify(this.documentation, null, 2);
                filename = 'api-documentation.json';
                break;
            case doc_interface_1.DocumentFormat.YAML:
                const yaml = require('js-yaml');
                content = yaml.dump(this.documentation);
                filename = 'api-documentation.yaml';
                break;
            case doc_interface_1.DocumentFormat.HTML:
                content = this.generateHtmlDocumentation();
                filename = 'api-documentation.html';
                break;
            case doc_interface_1.DocumentFormat.MARKDOWN:
                content = this.generateMarkdownDocumentation();
                filename = 'API.md';
                break;
            case doc_interface_1.DocumentFormat.POSTMAN:
                content = this.generatePostmanCollection();
                filename = 'postman-collection.json';
                break;
            case doc_interface_1.DocumentFormat.OPENAPI:
                content = this.generateOpenApiSpec();
                filename = 'openapi.json';
                break;
            default:
                throw new Error(`Unsupported format: ${format}`);
        }
        const filePath = path.join(this.docsPath, 'api', filename);
        await fs.writeFile(filePath, content);
        return filePath;
    }
    generateHtmlDocumentation() {
        const template = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${this.documentation?.title}</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.25.0/themes/prism-tomorrow.min.css" rel="stylesheet">
    <style>
        body { padding-top: 60px; }
        .sidebar { position: fixed; top: 60px; bottom: 0; left: 0; z-index: 100; padding: 0; box-shadow: inset -1px 0 0 rgba(0, 0, 0, .1); }
        .sidebar-sticky { position: sticky; top: 0; height: calc(100vh - 60px); padding-top: .5rem; overflow-x: hidden; overflow-y: auto; }
        .sidebar .nav-link { color: #333; }
        .sidebar .nav-link.active { color: #007bff; }
        .endpoint { margin-bottom: 2rem; padding: 1rem; border: 1px solid #dee2e6; border-radius: .25rem; }
        .method { display: inline-block; padding: .25rem .5rem; border-radius: .25rem; font-weight: bold; color: white; margin-right: .5rem; }
        .method-get { background-color: #28a745; }
        .method-post { background-color: #007bff; }
        .method-put { background-color: #ffc107; }
        .method-delete { background-color: #dc3545; }
        .method-patch { background-color: #17a2b8; }
        pre { background-color: #f8f9fa; padding: 1rem; border-radius: .25rem; }
        .parameter { margin: .5rem 0; padding: .5rem; background-color: #f8f9fa; border-left: 3px solid #007bff; }
        .response { margin: .5rem 0; padding: .5rem; background-color: #f8f9fa; border-left: 3px solid #28a745; }
    </style>
</head>
<body>
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark fixed-top">
        <div class="container-fluid">
            <a class="navbar-brand" href="#">${this.documentation?.title}</a>
            <span class="navbar-text">
                Version: ${this.documentation?.version}
            </span>
        </div>
    </nav>

    <div class="container-fluid">
        <div class="row">
            <nav class="col-md-3 col-lg-2 d-md-block bg-light sidebar">
                <div class="sidebar-sticky">
                    <h6 class="sidebar-heading d-flex justify-content-between align-items-center px-3 mt-4 mb-1 text-muted">
                        <span>Endpoints</span>
                    </h6>
                    <ul class="nav flex-column">
                        ${this.generateEndpointNav()}
                    </ul>
                </div>
            </nav>

            <main role="main" class="col-md-9 ml-sm-auto col-lg-10 px-md-4">
                <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
                    <h1 class="h2">API Documentation</h1>
                </div>

                <div class="api-description mb-4">
                    <p>${this.documentation?.description}</p>
                    <p><strong>Base URL:</strong> <code>${this.documentation?.basePath}</code></p>
                    <p><strong>Generated:</strong> ${this.documentation?.generated}</p>
                </div>

                <div class="endpoints">
                    ${this.generateEndpointDocs()}
                </div>
            </main>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.25.0/prism.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.25.0/components/prism-json.min.js"></script>
</body>
</html>
    `;
        return template;
    }
    generateEndpointNav() {
        if (!this.documentation?.endpoints) {
            return '';
        }
        return this.documentation.endpoints
            .map(endpoint => `
        <li class="nav-item">
            <a class="nav-link" href="#${this.getEndpointId(endpoint)}">
                <span class="method method-${endpoint.method.toLowerCase()}">${endpoint.method}</span>
                ${endpoint.path}
            </a>
        </li>
      `)
            .join('');
    }
    generateEndpointDocs() {
        if (!this.documentation?.endpoints) {
            return '';
        }
        return this.documentation.endpoints
            .map(endpoint => `
        <div class="endpoint" id="${this.getEndpointId(endpoint)}">
            <h3>
                <span class="method method-${endpoint.method.toLowerCase()}">${endpoint.method}</span>
                <code>${endpoint.path}</code>
            </h3>
            <p>${endpoint.description || 'No description'}</p>
            
            ${this.generateParametersDocs(endpoint.parameters)}
            ${this.generateResponsesDocs(endpoint.responses)}
        </div>
      `)
            .join('');
    }
    generateParametersDocs(parameters) {
        if (!parameters || parameters.length === 0) {
            return '';
        }
        return `
      <h4>Parameters</h4>
      ${parameters.map(param => `
        <div class="parameter">
          <strong>${param.name}</strong> (${param.in})
          ${param.required ? '<span class="badge bg-danger">Required</span>' : ''}
          <br>
          <small>${param.description || 'No description'}</small>
          ${param.example ? `<br><code>Example: ${param.example}</code>` : ''}
        </div>
      `).join('')}
    `;
    }
    generateResponsesDocs(responses) {
        if (!responses || responses.length === 0) {
            return '';
        }
        return `
      <h4>Responses</h4>
      ${responses.map(response => `
        <div class="response">
          <strong>Status ${response.status}</strong>
          <br>
          <small>${response.description}</small>
        </div>
      `).join('')}
    `;
    }
    getEndpointId(endpoint) {
        return `${endpoint.method}-${endpoint.path}`.replace(/[^a-zA-Z0-9]/g, '-');
    }
    generateMarkdownDocumentation() {
        const lines = [];
        lines.push(`# ${this.documentation?.title}`);
        lines.push('');
        lines.push(`Version: ${this.documentation?.version}`);
        lines.push('');
        lines.push(this.documentation?.description || '');
        lines.push('');
        lines.push(`**Base URL:** ${this.documentation?.basePath}`);
        lines.push('');
        lines.push(`**Generated:** ${this.documentation?.generated}`);
        lines.push('');
        lines.push('## Endpoints');
        lines.push('');
        this.documentation?.endpoints.forEach(endpoint => {
            lines.push(`### ${endpoint.method} ${endpoint.path}`);
            lines.push('');
            lines.push(endpoint.description || 'No description');
            lines.push('');
            if (endpoint.parameters && endpoint.parameters.length > 0) {
                lines.push('#### Parameters');
                lines.push('');
                lines.push('| Name | In | Type | Required | Description |');
                lines.push('|------|----|------|----------|-------------|');
                endpoint.parameters.forEach(param => {
                    lines.push(`| ${param.name} | ${param.in} | ${param.type} | ${param.required ? 'Yes' : 'No'} | ${param.description || '-'} |`);
                });
                lines.push('');
            }
            if (endpoint.responses && endpoint.responses.length > 0) {
                lines.push('#### Responses');
                lines.push('');
                lines.push('| Status | Description |');
                lines.push('|--------|-------------|');
                endpoint.responses.forEach(response => {
                    lines.push(`| ${response.status} | ${response.description} |`);
                });
                lines.push('');
            }
            lines.push('---');
            lines.push('');
        });
        return lines.join('\n');
    }
    generatePostmanCollection() {
        const collection = {
            info: {
                name: this.documentation?.title,
                description: this.documentation?.description,
                version: this.documentation?.version,
                schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
            },
            item: this.documentation?.endpoints.map(endpoint => ({
                name: `${endpoint.method} ${endpoint.path}`,
                request: {
                    method: endpoint.method,
                    header: [],
                    url: {
                        raw: `{{baseUrl}}${endpoint.path}`,
                        host: ['{{baseUrl}}'],
                        path: endpoint.path.split('/').filter(p => p),
                    },
                    description: endpoint.description,
                },
                response: [],
            })),
            variable: [
                {
                    key: 'baseUrl',
                    value: 'http://localhost:3000',
                    type: 'string',
                },
            ],
        };
        return JSON.stringify(collection, null, 2);
    }
    generateOpenApiSpec() {
        const spec = {
            openapi: '3.0.0',
            info: {
                title: this.documentation?.title,
                version: this.documentation?.version,
                description: this.documentation?.description,
            },
            servers: [
                {
                    url: this.documentation?.basePath,
                },
            ],
            paths: this.generateOpenApiPaths(),
            components: {
                schemas: this.generateOpenApiSchemas(),
            },
        };
        return JSON.stringify(spec, null, 2);
    }
    generateOpenApiPaths() {
        const paths = {};
        this.documentation?.endpoints.forEach(endpoint => {
            if (!paths[endpoint.path]) {
                paths[endpoint.path] = {};
            }
            paths[endpoint.path][endpoint.method.toLowerCase()] = {
                summary: endpoint.description,
                operationId: `${endpoint.controller}_${endpoint.handler}`,
                tags: endpoint.tags,
                parameters: endpoint.parameters?.map(param => ({
                    name: param.name,
                    in: param.in,
                    required: param.required,
                    description: param.description,
                    schema: {
                        type: param.type || 'string',
                    },
                })),
                responses: this.generateOpenApiResponses(endpoint.responses),
            };
        });
        return paths;
    }
    generateOpenApiResponses(responses) {
        const apiResponses = {};
        if (!responses || responses.length === 0) {
            apiResponses['200'] = {
                description: 'Successful response',
            };
        }
        else {
            responses.forEach(response => {
                apiResponses[response.status.toString()] = {
                    description: response.description,
                };
            });
        }
        return apiResponses;
    }
    generateOpenApiSchemas() {
        const schemas = {};
        this.documentation?.models?.forEach((model, name) => {
            schemas[name] = {
                type: 'object',
                properties: Object.fromEntries(model.properties),
                required: model.required,
            };
        });
        return schemas;
    }
    async generateUserGuide() {
        const guidePath = path.join(this.docsPath, 'guides', 'user-guide.md');
        const content = `# Creatoria SaaS CLI 用户指南

## 快速开始

### 安装

\`\`\`bash
npm install -g creatoria-saas-cli
\`\`\`

### 创建新项目

\`\`\`bash
creatoria-saas create my-project
cd my-project
\`\`\`

### 初始化项目

\`\`\`bash
creatoria-saas init
\`\`\`

## 命令参考

### create - 创建新项目

\`\`\`bash
creatoria-saas create <project-name> [options]
\`\`\`

选项：
- \`--skip-install\` - 跳过依赖安装
- \`--template <name>\` - 使用指定模板

### init - 初始化项目

\`\`\`bash
creatoria-saas init [options]
\`\`\`

选项：
- \`--force\` - 强制重新初始化
- \`--skip-install\` - 跳过依赖安装

### module - 模块管理

\`\`\`bash
# 添加模块
creatoria-saas module add <module-name>

# 列出模块
creatoria-saas module list

# 移除模块
creatoria-saas module remove <module-name>

# 模块信息
creatoria-saas module info <module-name>
\`\`\`

### config - 配置管理

\`\`\`bash
# 显示配置
creatoria-saas config show

# 获取配置值
creatoria-saas config get <key>

# 设置配置值
creatoria-saas config set <key> <value>

# 验证配置
creatoria-saas config validate
\`\`\`

## 配置文件

项目配置存储在 \`.creatoria/config.json\` 文件中。

示例配置：

\`\`\`json
{
  "version": "1.0.0",
  "modules": ["auth", "database", "api"],
  "app": {
    "name": "my-app",
    "port": 3000
  }
}
\`\`\`

## 模块系统

模块是独立的功能单元，可以独立开发、测试和部署。

### 模块结构

\`\`\`
modules/
├── auth/
│   ├── package.json
│   ├── index.ts
│   └── ...
├── database/
│   ├── package.json
│   ├── index.ts
│   └── ...
└── api/
    ├── package.json
    ├── index.ts
    └── ...
\`\`\`

## 最佳实践

1. **模块化设计** - 将功能拆分为独立模块
2. **配置管理** - 使用环境变量和配置文件
3. **版本控制** - 使用语义化版本
4. **测试** - 编写单元测试和集成测试
5. **文档** - 保持文档更新

## 故障排查

### 常见问题

**Q: 初始化失败**
A: 检查项目目录是否已存在配置文件，使用 \`--force\` 强制重新初始化。

**Q: 模块安装失败**
A: 检查网络连接和模块源是否可用。

**Q: 配置验证失败**
A: 检查配置文件格式是否正确，必填字段是否完整。

## 获取帮助

- 查看命令帮助：\`creatoria-saas --help\`
- 查看具体命令帮助：\`creatoria-saas <command> --help\`
- 访问官方文档：https://docs.creatoria.com
- 提交问题：https://github.com/creatoria/cli/issues
`;
        await fs.writeFile(guidePath, content);
    }
    async generateDeveloperGuide() {
        const guidePath = path.join(this.docsPath, 'guides', 'developer-guide.md');
        const content = `# Creatoria SaaS CLI 开发者指南

## 架构概述

Creatoria SaaS CLI 基于 NestJS 框架构建，采用模块化架构设计。

### 核心模块

- **CLI Module** - 命令行接口
- **Config Module** - 配置管理
- **Module Loader** - 模块加载器
- **Documentation Module** - 文档生成
- **Security Module** - 安全功能

## 开发环境设置

### 克隆项目

\`\`\`bash
git clone https://github.com/creatoria/cli.git
cd cli
npm install
\`\`\`

### 开发模式

\`\`\`bash
npm run start:dev
\`\`\`

### 构建

\`\`\`bash
npm run build
\`\`\`

### 测试

\`\`\`bash
# 单元测试
npm run test

# 集成测试
npm run test:integration

# E2E测试
npm run test:e2e

# 测试覆盖率
npm run test:cov
\`\`\`

## 创建新命令

### 1. 创建命令类

\`\`\`typescript
import { Injectable } from '@nestjs/common';

@Injectable()
export class MyCommand {
  async run(args: string[], options: any): Promise<void> {
    // 命令实现
  }
}
\`\`\`

### 2. 注册命令

\`\`\`typescript
import { Command } from 'commander';

const program = new Command();

program
  .command('my-command')
  .description('My custom command')
  .action(async (options) => {
    const command = new MyCommand();
    await command.run([], options);
  });
\`\`\`

## 创建新模块

### 1. 模块结构

\`\`\`
src/modules/my-module/
├── my-module.module.ts
├── my-module.service.ts
├── my-module.controller.ts
├── dto/
├── entities/
└── interfaces/
\`\`\`

### 2. 模块定义

\`\`\`typescript
import { Module } from '@nestjs/common';

@Module({
  imports: [],
  controllers: [MyModuleController],
  providers: [MyModuleService],
  exports: [MyModuleService],
})
export class MyModule {}
\`\`\`

## API开发

### 创建控制器

\`\`\`typescript
import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('my-module')
@Controller('my-module')
export class MyModuleController {
  @Get()
  @ApiOperation({ summary: 'Get all items' })
  async findAll() {
    // 实现
  }

  @Post()
  @ApiOperation({ summary: 'Create item' })
  async create(@Body() dto: CreateDto) {
    // 实现
  }
}
\`\`\`

## 测试编写

### 单元测试

\`\`\`typescript
describe('MyService', () => {
  let service: MyService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [MyService],
    }).compile();

    service = module.get<MyService>(MyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
\`\`\`

### 集成测试

\`\`\`typescript
describe('MyModule Integration', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [MyModule],
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });

  it('should handle requests', () => {
    return request(app.getHttpServer())
      .get('/my-module')
      .expect(200);
  });
});
\`\`\`

## 贡献指南

### 提交规范

使用语义化提交信息：

- \`feat:\` 新功能
- \`fix:\` 修复bug
- \`docs:\` 文档更新
- \`style:\` 代码格式
- \`refactor:\` 重构
- \`test:\` 测试相关
- \`chore:\` 构建或辅助工具

### Pull Request流程

1. Fork项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建Pull Request

## 发布流程

1. 更新版本号
2. 更新CHANGELOG
3. 创建标签
4. 推送到仓库
5. 发布到npm
`;
        await fs.writeFile(guidePath, content);
    }
    async generateConfigReference() {
        const referencePath = path.join(this.docsPath, 'references', 'config-reference.md');
        const content = `# 配置参考

## 环境变量

| 变量名 | 描述 | 默认值 | 必需 |
|--------|------|--------|------|
| NODE_ENV | 运行环境 | development | 否 |
| PORT | 服务端口 | 3000 | 否 |
| DB_HOST | 数据库主机 | localhost | 是 |
| DB_PORT | 数据库端口 | 5432 | 是 |
| DB_DATABASE | 数据库名称 | - | 是 |
| DB_USERNAME | 数据库用户名 | - | 是 |
| DB_PASSWORD | 数据库密码 | - | 是 |
| REDIS_HOST | Redis主机 | localhost | 否 |
| REDIS_PORT | Redis端口 | 6379 | 否 |
| JWT_SECRET | JWT密钥 | - | 是 |
| JWT_EXPIRES_IN | JWT过期时间 | 1d | 否 |

## 配置文件

### .creatoria/config.json

\`\`\`json
{
  "version": "1.0.0",
  "modules": [],
  "app": {
    "name": "string",
    "port": "number",
    "prefix": "string"
  },
  "database": {
    "type": "postgres|mysql|sqlite",
    "synchronize": "boolean",
    "logging": "boolean"
  },
  "redis": {
    "enabled": "boolean",
    "ttl": "number"
  },
  "swagger": {
    "enabled": "boolean",
    "path": "string"
  },
  "security": {
    "cors": {
      "enabled": "boolean",
      "origin": "string|array"
    },
    "rateLimit": {
      "enabled": "boolean",
      "max": "number",
      "windowMs": "number"
    }
  }
}
\`\`\`

## 模块配置

每个模块可以有自己的配置文件。

### modules/<module-name>/config.json

\`\`\`json
{
  "enabled": true,
  "priority": 0,
  "dependencies": [],
  "settings": {}
}
\`\`\`

## CLI配置

### .creatoriarc

\`\`\`json
{
  "defaultTemplate": "default",
  "packageManager": "npm",
  "autoUpdate": true,
  "telemetry": false
}
\`\`\`

## 示例配置

### 开发环境

\`\`\`env
NODE_ENV=development
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_DATABASE=creatoria_dev
DB_USERNAME=dev_user
DB_PASSWORD=dev_password
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=dev_secret_key
JWT_EXPIRES_IN=7d
\`\`\`

### 生产环境

\`\`\`env
NODE_ENV=production
PORT=8080
DB_HOST=db.production.com
DB_PORT=5432
DB_DATABASE=creatoria_prod
DB_USERNAME=prod_user
DB_PASSWORD=\${DB_PASSWORD}
REDIS_HOST=redis.production.com
REDIS_PORT=6379
JWT_SECRET=\${JWT_SECRET}
JWT_EXPIRES_IN=1d
\`\`\`

## 配置优先级

配置按以下优先级加载（高到低）：

1. 命令行参数
2. 环境变量
3. .env文件
4. 配置文件
5. 默认值
`;
        await fs.writeFile(referencePath, content);
    }
};
exports.DocumentationService = DocumentationService;
exports.DocumentationService = DocumentationService = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, common_1.Inject)('DOCUMENTATION_OPTIONS')),
    __metadata("design:paramtypes", [api_doc_generator_1.ApiDocGenerator,
        swagger_config_1.SwaggerConfigService, Object])
], DocumentationService);
//# sourceMappingURL=documentation.service.js.map