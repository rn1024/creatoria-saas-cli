import { DynamicModule } from '@nestjs/common';
export interface DocumentationModuleOptions {
    enableSwagger?: boolean;
    swaggerPath?: string;
    enableApiDocs?: boolean;
    apiDocsPath?: string;
    generateOnStartup?: boolean;
    autoUpdate?: boolean;
}
export declare class DocumentationModule {
    static forRoot(options?: DocumentationModuleOptions): DynamicModule;
    static forFeature(): DynamicModule;
}
