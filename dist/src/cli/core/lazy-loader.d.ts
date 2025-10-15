export declare class LazyLoader {
    private static instance;
    private registry;
    private logger;
    private cache;
    private constructor();
    static getInstance(): LazyLoader;
    loadCommand(name: string): Promise<any>;
    private dynamicImport;
    preloadCommands(names: string[]): Promise<void>;
    clearCache(): void;
    getCacheStats(): {
        size: number;
        commands: string[];
    };
    reloadCommand(name: string): Promise<any>;
}
