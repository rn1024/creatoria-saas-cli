interface ModuleRegistry {
    modules: {
        [key: string]: {
            name: string;
            version: string;
            description: string;
            repository: string;
            path?: string;
        };
    };
}
export declare class RemoteModuleService {
    private readonly logger;
    private readonly cacheDir;
    constructor();
    fetchRegistry(): Promise<ModuleRegistry>;
    fetchModule(moduleName: string, version?: string): Promise<string>;
    private cloneFromGit;
    private copyFromLocal;
    listAvailableModules(): Promise<string[]>;
    getModuleInfo(moduleName: string): Promise<any>;
    clearCache(moduleName?: string): Promise<void>;
    validateModule(modulePath: string): Promise<boolean>;
}
export {};
