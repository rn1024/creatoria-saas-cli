export declare class InitCommand {
    run(args: string[], options: any): Promise<void>;
    private runMigrations;
    private runSeeds;
    private runInitScript;
    private promptUser;
}
