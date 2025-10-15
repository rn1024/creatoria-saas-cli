export declare class FileSystemErrorHandler {
    static safeReadFile(path: string): Promise<string | null>;
    static safeWriteFile(path: string, content: string): Promise<void>;
    static safeCopy(src: string, dest: string): Promise<void>;
    static safeRemove(path: string): Promise<void>;
    static exists(path: string): Promise<boolean>;
}
export declare class JsonErrorHandler {
    static safeParse<T = any>(content: string, source?: string): T;
    static safeReadJson<T = any>(path: string): Promise<T>;
    static safeWriteJson(path: string, data: any, pretty?: boolean): Promise<void>;
}
export declare class ValidationErrorHandler {
    static validateRequired(value: any, fieldName: string): void;
    static validateFormat(value: string, pattern: RegExp, fieldName: string, expected: string): void;
    static validateRange(value: number, min: number, max: number, fieldName: string): void;
}
export declare class ErrorRecovery {
    static withDefault<T>(fn: () => Promise<T>, defaultValue: T, logError?: boolean): Promise<T>;
    static withRetry<T>(fn: () => Promise<T>, maxAttempts?: number, delay?: number): Promise<T>;
    static withTimeout<T>(fn: () => Promise<T>, timeout: number, errorMessage?: string): Promise<T>;
}
