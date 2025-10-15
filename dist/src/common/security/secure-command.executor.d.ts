import { CommandSecurityService } from './command-security.service';
import { LoggerService } from '../logger/logger.service';
export interface CommandResult {
    stdout: string;
    stderr: string;
    exitCode: number;
    duration: number;
}
export interface CommandOptions {
    cwd?: string;
    env?: Record<string, string>;
    timeout?: number;
    maxBuffer?: number;
    encoding?: BufferEncoding;
    input?: string;
}
export declare class SecureCommandExecutor {
    private readonly commandSecurity;
    private readonly logger;
    constructor(commandSecurity: CommandSecurityService, logger: LoggerService);
    execute(command: string, args?: string[], options?: CommandOptions): Promise<CommandResult>;
    executeStream(command: string, args?: string[], options?: CommandOptions, onData?: (chunk: string, stream: 'stdout' | 'stderr') => void): Promise<CommandResult>;
    executePackageManager(pm: 'npm' | 'yarn' | 'pnpm', args: string[], options?: CommandOptions): Promise<CommandResult>;
    executeGit(args: string[], options?: CommandOptions): Promise<CommandResult>;
    executeWithRetry(command: string, args?: string[], options?: CommandOptions, maxRetries?: number, retryDelay?: number): Promise<CommandResult>;
    commandExists(command: string): Promise<boolean>;
}
