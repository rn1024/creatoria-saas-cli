import { DynamicModule, Type } from '@nestjs/common';
interface ModuleMetadata {
    name: string;
    path: string;
    module?: Type<any>;
    lastModified?: Date;
    dependencies?: string[];
}
export declare class DynamicModuleLoaderService {
    private readonly logger;
    private loadedModules;
    private moduleRegistry;
    loadModule(moduleName: string, modulePath: string): Promise<DynamicModule | null>;
    reloadModule(moduleName: string): Promise<boolean>;
    unloadModule(moduleName: string): Promise<boolean>;
    getLoadedModules(): ModuleMetadata[];
    getModule(moduleName: string): DynamicModule | undefined;
    private findModuleFile;
    private findModuleClass;
    private isNestModule;
    private compileTypeScript;
    private extractDependencies;
    private clearModuleFromCache;
}
export {};
