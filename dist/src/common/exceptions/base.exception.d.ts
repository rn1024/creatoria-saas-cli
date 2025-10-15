import { ErrorCategory, ErrorSeverity, ErrorContext, ErrorResponse, ErrorOptions } from '../types/error.types';
import { ErrorCode } from '../constants/error-codes';
export declare class BaseException extends Error {
    readonly code: string;
    readonly category: ErrorCategory;
    readonly severity: ErrorSeverity;
    context?: ErrorContext;
    readonly suggestion?: string;
    readonly cause?: Error;
    readonly timestamp: Date;
    constructor(message: string, options?: ErrorOptions);
    static fromErrorCode(code: ErrorCode, params?: Record<string, any>, options?: ErrorOptions): BaseException;
    toResponse(): ErrorResponse;
    toCliOutput(): string;
    private getColorFunction;
    private getSeverityIcon;
    isRecoverable(): boolean;
    log(): void;
}
