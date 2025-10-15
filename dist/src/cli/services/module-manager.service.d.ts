export interface ModuleConfig {
    name: string;
    version: string;
    description: string;
    type?: 'core' | 'business' | 'extension';
    dependencies?: {
        system?: string[];
        modules?: string[];
    };
    entities?: string[];
    apis?: string[];
    permissions?: string[];
}
export declare class ModuleManagerService {
    private projectPath;
    private modulesPath;
    constructor(projectPath?: string);
    installModule(moduleName: string, version?: string): Promise<void>;
    uninstallModule(moduleName: string): Promise<void>;
    listModules(): Promise<ModuleConfig[]>;
    private getModuleConfig;
    private checkDependencies;
    private registerModule;
    private unregisterModule;
    private findDependents;
    private toPascalCase;
}
