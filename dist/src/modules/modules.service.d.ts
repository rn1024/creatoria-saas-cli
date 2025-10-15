import { ConfigService } from '@nestjs/config';
export declare class ModulesService {
    private configService;
    private modulesPath;
    private configPath;
    constructor(configService: ConfigService);
    addModule(moduleName: string, options?: any): Promise<boolean>;
    removeModule(moduleName: string): Promise<boolean>;
    listModules(): Promise<string[]>;
    checkDependencies(moduleName: string): Promise<boolean>;
    initializeModule(moduleName: string): Promise<boolean>;
    private updateConfig;
}
