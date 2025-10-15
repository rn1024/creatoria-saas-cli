export declare class CliExceptionHandler {
    private static instance;
    private exitOnError;
    private verboseMode;
    private constructor();
    static getInstance(): CliExceptionHandler;
    setExitOnError(exit: boolean): void;
    setVerboseMode(verbose: boolean): void;
    handle(error: unknown): void;
    handleAsync<T>(fn: () => Promise<T>): Promise<T | undefined>;
    wrapCommand<T extends (...args: any[]) => any>(handler: T): (...args: Parameters<T>) => Promise<ReturnType<T> | void>;
    private setupProcessHandlers;
    private handleBaseException;
    private handleError;
    private handleUnknown;
    private clearProgress;
    private cleanup;
    private exitWithError;
}
export declare const cliExceptionHandler: CliExceptionHandler;
