interface DockerOptions {
    service?: string;
    detach?: boolean;
    build?: boolean;
    force?: boolean;
    tail?: number;
}
export declare class DockerCommand {
    private readonly logger;
    build(options?: DockerOptions): Promise<void>;
    up(options?: DockerOptions): Promise<void>;
    down(options?: DockerOptions): Promise<void>;
    restart(options?: DockerOptions): Promise<void>;
    logs(options?: DockerOptions): Promise<void>;
    ps(options?: DockerOptions): Promise<void>;
    exec(service: string, command: string[], options?: {
        user?: string;
    }): Promise<void>;
    pull(options?: DockerOptions): Promise<void>;
    init(): Promise<void>;
    private findComposeFile;
    private runDockerCompose;
    private checkDockerInstalled;
    private createDefaultComposeFile;
    private createDefaultDockerfile;
    private createDefaultDockerignore;
}
export {};
