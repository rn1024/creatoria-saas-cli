export interface FileCacheOptions {
    cacheDir?: string;
    ttl?: number;
    maxSize?: number;
    compression?: boolean;
}
export interface FileCacheEntry<T> {
    value: T;
    expires: number;
    created: number;
    hash: string;
}
export declare class FileCacheStrategy<T = any> {
    private cacheDir;
    private ttl;
    private maxSize;
    private logger;
    private index;
    constructor(options?: FileCacheOptions);
    private initializeCacheDir;
    private loadIndex;
    private saveIndex;
    get(key: string): Promise<T | undefined>;
    set(key: string, value: T, ttl?: number): Promise<void>;
    delete(key: string): Promise<boolean>;
    clear(): Promise<void>;
    private cleanExpired;
    private checkSize;
    private generateFileName;
    private calculateHash;
    getStats(): Promise<{
        entries: number;
        totalSize: number;
        oldestEntry?: Date;
        newestEntry?: Date;
    }>;
}
