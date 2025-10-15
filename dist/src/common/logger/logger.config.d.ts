export declare enum LogLevel {
    DEBUG = 0,
    INFO = 1,
    WARN = 2,
    ERROR = 3,
    FATAL = 4,
    OFF = 5
}
export interface LogContext {
    module?: string;
    method?: string;
    userId?: string;
    requestId?: string;
    traceId?: string;
    duration?: number;
    metadata?: Record<string, any>;
}
export interface LogEntry {
    timestamp: Date;
    level: LogLevel;
    message: string;
    context?: LogContext;
    error?: Error;
    tags?: string[];
}
export interface LoggerConfig {
    level: LogLevel;
    colors: boolean;
    timestamp: boolean;
    context: boolean;
    filePath?: string;
    maxFileSize?: number;
    maxFiles?: number;
    json: boolean;
    console: boolean;
    file: boolean;
}
export declare const defaultLoggerConfig: LoggerConfig;
export declare function getLogLevelName(level: LogLevel): string;
export declare function parseLogLevel(level: string): LogLevel;
