export declare class HotReloadService {
    private readonly logger;
    private watchers;
    private moduleCache;
    private reloadCallbacks;
    watchModule(modulePath: string, moduleName: string): Promise<void>;
    stopWatching(moduleName: string): Promise<void>;
    stopAll(): Promise<void>;
    registerReloadCallback(moduleName: string, callback: () => Promise<void>): void;
    private reloadModule;
    private clearModuleCache;
    private emitReloadEvent;
    getStatus(): {
        active: string[];
        total: number;
    };
    enableProjectHotReload(): Promise<void>;
}
