export declare class OptimizedCliService {
    private program;
    private loader;
    private registry;
    private logger;
    constructor();
    private initializeCommands;
    private registerModuleCommands;
    private registerDatabaseCommands;
    private registerConfigCommands;
    private registerProjectCommands;
    private executeCommand;
    run(): Promise<void>;
    private showPerformanceInfo;
    private showOverallPerformance;
}
