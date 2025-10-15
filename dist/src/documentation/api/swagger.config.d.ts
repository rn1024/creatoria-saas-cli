import { INestApplication } from '@nestjs/common';
export interface SwaggerConfig {
    title: string;
    description: string;
    version: string;
    tags?: string[];
    servers?: {
        url: string;
        description: string;
    }[];
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
export declare class SwaggerConfigService {
    private static instance;
    private config;
    private constructor();
    static getInstance(): SwaggerConfigService;
    private loadConfig;
    setupSwagger(app: INestApplication): void;
    private saveDocument;
    getConfig(): SwaggerConfig;
    updateConfig(config: Partial<SwaggerConfig>): void;
}
