import { DependencyManagerService } from '../services/dependency-manager.service';
interface CreateOptions {
    skipInstall?: boolean;
    dbHost?: string;
    dbPort?: number;
    dbDatabase?: string;
    dbUsername?: string;
    dbPassword?: string;
    dbType?: string;
    apiPrefix?: string;
    adminPrefix?: string;
    systemPrefix?: string;
    appPort?: number;
    jwtSecret?: string;
    sessionSecret?: string;
    features?: string[];
    packageManager?: 'npm' | 'yarn' | 'pnpm';
    skipDocker?: boolean;
    redisPort?: number;
    redisPassword?: string;
    rabbitmqUser?: string;
    rabbitmqPassword?: string;
    minioRootUser?: string;
    minioRootPassword?: string;
}
export declare class CreateCommand {
    private readonly dependencyManager;
    constructor(dependencyManager: DependencyManagerService);
    run(args: string[], options?: CreateOptions): Promise<void>;
    private processHandlebarsTemplates;
    private processPackageJson;
    private writeEnv;
    private generateSecret;
    private performHealthCheck;
}
export {};
