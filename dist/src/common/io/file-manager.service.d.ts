export interface FileOperationOptions {
    cache?: boolean;
    cacheTTL?: number;
    parallel?: boolean;
    concurrency?: number;
    encoding?: BufferEncoding;
}
export interface BatchReadResult {
    path: string;
    content?: string;
    error?: Error;
}
export declare class FileManagerService {
    private cache;
    private logger;
    private fileCache;
    constructor();
    batchRead(paths: string[], options?: FileOperationOptions): Promise<BatchReadResult[]>;
    readFile(filePath: string, options?: FileOperationOptions): Promise<string>;
    batchWrite(files: Array<{
        path: string;
        content: string;
    }>, options?: FileOperationOptions): Promise<void>;
    writeFile(filePath: string, content: string, options?: FileOperationOptions): Promise<void>;
    batchCopy(pairs: Array<{
        src: string;
        dest: string;
    }>, options?: {
        parallel?: boolean;
        concurrency?: number;
    }): Promise<void>;
    batchDelete(paths: string[], options?: {
        parallel?: boolean;
        concurrency?: number;
    }): Promise<void>;
    deleteFile(filePath: string): Promise<void>;
    findFiles(directory: string, pattern: RegExp | string, options?: {
        maxDepth?: number;
        excludeDirs?: string[];
    }): Promise<string[]>;
    getDirectorySize(directory: string): Promise<number>;
    cleanOldFiles(directory: string, maxAge: number, options?: {
        dryRun?: boolean;
        excludePatterns?: RegExp[];
    }): Promise<string[]>;
    readJson<T = any>(filePath: string): Promise<T>;
    writeJson(filePath: string, data: any, pretty?: boolean): Promise<void>;
    getCacheStats(): {
        fileCache: number;
        globalStats: any;
    };
    clearCache(): void;
}
