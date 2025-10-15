export declare class StartupOptimizer {
    private static timings;
    private static startTime;
    static mark(name: string): void;
    static measure(name: string, startMark: string, endMark: string): number;
    static lazyImport<T = any>(modulePath: string): () => Promise<T>;
    static lazyRequire<T = any>(modulePath: string): () => T;
    static loadConfig(configPath: string): Promise<any>;
    static parallelInit(tasks: Array<() => Promise<any>>): Promise<any[]>;
    static getReport(): string;
    static printReport(): void;
}
