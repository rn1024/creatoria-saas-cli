import { LoggerService } from '../logger/logger.service';
export declare class CommandSecurityService {
    private readonly logger;
    private allowedCommands;
    private blockedCommands;
    private dangerousPatterns;
    constructor(logger: LoggerService);
    private initializeDangerousPatterns;
    validateCommand(command: string): void;
    validateArguments(args: string[]): string[];
    private sanitizeArgument;
    private extractBaseCommand;
    createSafeOptions(options?: any): any;
    validateEnvironment(env?: Record<string, string>): Record<string, string>;
    logCommandExecution(command: string, args: string[], result: 'success' | 'failure', error?: any): void;
    addAllowedCommand(command: string): void;
    addBlockedCommand(command: string): void;
    getCommandSecurityConfig(): {
        allowedCommands: string[];
        blockedCommands: string[];
    };
}
