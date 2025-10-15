export declare enum ErrorCategory {
    SYSTEM = "SYSTEM",
    VALIDATION = "VALIDATION",
    BUSINESS = "BUSINESS",
    PERMISSION = "PERMISSION",
    NETWORK = "NETWORK",
    DEPENDENCY = "DEPENDENCY",
    FILESYSTEM = "FILESYSTEM",
    CONFIGURATION = "CONFIGURATION"
}
export declare enum ErrorSeverity {
    FATAL = "FATAL",
    ERROR = "ERROR",
    WARNING = "WARNING",
    INFO = "INFO"
}
export interface ErrorContext {
    module?: string;
    method?: string;
    filePath?: string;
    command?: string;
    argument?: string;
    expected?: string;
    option?: string;
    metadata?: Record<string, any>;
    userId?: string;
    timestamp?: Date;
}
export interface ErrorResponse {
    code: string;
    message: string;
    category: ErrorCategory;
    severity: ErrorSeverity;
    context?: ErrorContext;
    stack?: string;
    suggestion?: string;
    documentationUrl?: string;
}
export interface ErrorOptions {
    code?: string;
    category?: ErrorCategory;
    severity?: ErrorSeverity;
    context?: ErrorContext;
    suggestion?: string;
    cause?: Error;
}
