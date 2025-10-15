interface StartOptions {
    port?: number;
    env?: string;
    daemon?: boolean;
    workers?: number;
    pid?: string;
}
interface DevOptions {
    port?: number;
    watch?: boolean;
    watchModules?: boolean;
    debug?: boolean;
    inspect?: number;
}
export declare class ServerCommand {
    private readonly logger;
    private serverProcess;
    start(options?: StartOptions): Promise<void>;
    dev(options?: DevOptions): Promise<void>;
    stop(options?: {
        pid?: string;
    }): Promise<void>;
    restart(options?: StartOptions): Promise<void>;
    status(): Promise<void>;
    private build;
    private detectPackageManager;
    private startWithPM2;
    private stopPM2;
    private getPM2Status;
    private gracefulShutdown;
}
export {};
