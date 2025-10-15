/**
 * 文档模块
 */

import { Module, DynamicModule, Global } from '@nestjs/common';
import { ApiDocGenerator } from './api/api-doc.generator';
import { SwaggerConfigService } from './api/swagger.config';
import { DocumentationService } from './documentation.service';
import { DocumentationController } from './documentation.controller';

export interface DocumentationModuleOptions {
  enableSwagger?: boolean;
  swaggerPath?: string;
  enableApiDocs?: boolean;
  apiDocsPath?: string;
  generateOnStartup?: boolean;
  autoUpdate?: boolean;
}

@Global()
@Module({})
export class DocumentationModule {
  static forRoot(options: DocumentationModuleOptions = {}): DynamicModule {
    const providers = [
      ApiDocGenerator,
      SwaggerConfigService,
      DocumentationService,
      {
        provide: 'DOCUMENTATION_OPTIONS',
        useValue: {
          enableSwagger: options.enableSwagger !== false,
          swaggerPath: options.swaggerPath || 'api-docs',
          enableApiDocs: options.enableApiDocs !== false,
          apiDocsPath: options.apiDocsPath || 'docs',
          generateOnStartup: options.generateOnStartup !== false,
          autoUpdate: options.autoUpdate || false,
        },
      },
    ];

    const controllers = options.enableApiDocs !== false 
      ? [DocumentationController] 
      : [];

    return {
      module: DocumentationModule,
      providers,
      controllers,
      exports: [
        ApiDocGenerator,
        SwaggerConfigService,
        DocumentationService,
      ],
    };
  }

  static forFeature(): DynamicModule {
    return {
      module: DocumentationModule,
      imports: [],
      exports: [],
    };
  }
}