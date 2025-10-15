/**
 * Swagger API文档配置
 */

import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';
import * as fs from 'fs-extra';
import * as path from 'path';

export interface SwaggerConfig {
  title: string;
  description: string;
  version: string;
  tags?: string[];
  servers?: { url: string; description: string }[];
  contact?: {
    name: string;
    email?: string;
    url?: string;
  };
  license?: {
    name: string;
    url?: string;
  };
}

export class SwaggerConfigService {
  private static instance: SwaggerConfigService;
  private config: SwaggerConfig;

  private constructor() {
    this.config = this.loadConfig();
  }

  static getInstance(): SwaggerConfigService {
    if (!SwaggerConfigService.instance) {
      SwaggerConfigService.instance = new SwaggerConfigService();
    }
    return SwaggerConfigService.instance;
  }

  /**
   * 加载Swagger配置
   */
  private loadConfig(): SwaggerConfig {
    const defaultConfig: SwaggerConfig = {
      title: 'Creatoria SaaS CLI API',
      description: 'The Creatoria SaaS CLI API documentation',
      version: '1.0.0',
      tags: [
        'Modules',
        'Configuration',
        'Database',
        'Auth',
        'System',
      ],
      servers: [
        {
          url: 'http://localhost:3000',
          description: 'Development server',
        },
        {
          url: 'https://api.creatoria.com',
          description: 'Production server',
        },
      ],
      contact: {
        name: 'Creatoria Team',
        email: 'support@creatoria.com',
        url: 'https://creatoria.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    };

    // 尝试从配置文件加载自定义配置
    const configPath = path.join(process.cwd(), 'swagger.config.json');
    if (fs.existsSync(configPath)) {
      try {
        const customConfig = fs.readJSONSync(configPath);
        return { ...defaultConfig, ...customConfig };
      } catch (error) {
        console.warn('Failed to load swagger.config.json, using defaults');
      }
    }

    return defaultConfig;
  }

  /**
   * 设置Swagger文档
   */
  setupSwagger(app: INestApplication): void {
    const config = new DocumentBuilder()
      .setTitle(this.config.title)
      .setDescription(this.config.description)
      .setVersion(this.config.version);

    // 添加标签
    if (this.config.tags) {
      this.config.tags.forEach(tag => {
        config.addTag(tag);
      });
    }

    // 添加服务器
    if (this.config.servers) {
      this.config.servers.forEach(server => {
        config.addServer(server.url, server.description);
      });
    }

    // 添加联系信息
    if (this.config.contact) {
      config.setContact(
        this.config.contact.name,
        this.config.contact.url,
        this.config.contact.email,
      );
    }

    // 添加许可证
    if (this.config.license) {
      config.setLicense(
        this.config.license.name,
        this.config.license.url,
      );
    }

    // 添加Bearer认证
    config.addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'access-token',
    );

    // 添加API Key认证
    config.addApiKey(
      {
        type: 'apiKey',
        name: 'api-key',
        in: 'header',
      },
      'api-key',
    );

    const document = SwaggerModule.createDocument(app, config.build());
    
    // 设置Swagger UI
    SwaggerModule.setup('api-docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        docExpansion: 'none',
        filter: true,
        showRequestDuration: true,
        syntaxHighlight: {
          activate: true,
          theme: 'monokai',
        },
      },
      customCssUrl: 'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.css',
      customJs: [
        'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-bundle.js',
        'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.js',
      ],
    });

    // 保存文档到文件
    this.saveDocument(document);
  }

  /**
   * 保存API文档到文件
   */
  private saveDocument(document: any): void {
    const docsDir = path.join(process.cwd(), 'docs', 'api');
    fs.ensureDirSync(docsDir);

    // 保存为JSON
    fs.writeJSONSync(
      path.join(docsDir, 'openapi.json'),
      document,
      { spaces: 2 },
    );

    // 保存为YAML
    const yaml = require('js-yaml');
    fs.writeFileSync(
      path.join(docsDir, 'openapi.yaml'),
      yaml.dump(document),
    );

    console.log('API documentation saved to docs/api/');
  }

  /**
   * 获取配置
   */
  getConfig(): SwaggerConfig {
    return this.config;
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<SwaggerConfig>): void {
    this.config = { ...this.config, ...config };
  }
}