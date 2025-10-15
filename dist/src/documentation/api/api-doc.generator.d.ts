import { ModulesContainer } from '@nestjs/core';
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
export declare class ApiDocGenerator {
    private readonly modulesContainer;
    private documentation;
    private metadataScanner;
    constructor(modulesContainer: ModulesContainer);
    generate(): Promise<ApiDocumentation>;
    private scanControllers;
    private scanController;
    private getHttpMethod;
    private createEndpoint;
    private extractParameters;
    private extractResponses;
    private extractSecurity;
    private extractModels;
    private addModel;
    private extractModelProperties;
    private saveDocumentation;
    private generateMarkdown;
    private generateHtml;
    private joinPaths;
}
