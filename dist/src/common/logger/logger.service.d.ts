import { LogContext } from './logger.config';
export declare class LoggerService {
    private config;
    private context?;
    private consoleTransport?;
    private fileTransport?;
    private static globalInstance?;
    constructor(context?: string | LogContext);
    static getGlobalInstance(): LoggerService;
    private loadConfig;
    private initializeTransports;
    setContext(context: string | LogContext): this;
    addContext(context: Partial<LogContext>): this;
    debug(message: string, context?: LogContext): void;
    info(message: string, context?: LogContext): void;
    warn(message: string, context?: LogContext): void;
    error(message: string, error?: Error | string, context?: LogContext): void;
    fatal(message: string, error?: Error | string, context?: LogContext): void;
    private log;
    time<T>(label: string, fn: () => Promise<T> | T, context?: LogContext): Promise<T>;
    child(context: string | LogContext): LoggerService;
    flush(): void;
    close(): void;
}
export declare const logger: LoggerService;
