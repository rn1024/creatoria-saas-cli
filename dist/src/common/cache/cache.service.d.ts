export interface CacheOptions {
    ttl?: number;
    maxSize?: number;
    namespace?: string;
}
export interface CacheEntry<T> {
    value: T;
    expires: number;
    size: number;
    hits: number;
    created: Date;
    lastAccessed: Date;
}
export interface CacheStats {
    hits: number;
    misses: number;
    size: number;
    entries: number;
    hitRate: number;
}
export declare class CacheService {
    private static instance;
    private caches;
    private stats;
    private logger;
    private globalMaxSize;
    private currentSize;
    constructor();
    get<T>(key: string, namespace?: string): T | undefined;
    set<T>(key: string, value: T, options?: CacheOptions): void;
    delete(key: string, namespace?: string): boolean;
    clear(namespace?: string): void;
    getOrSet<T>(key: string, factory: () => Promise<T> | T, options?: CacheOptions): Promise<T>;
    generateKey(...parts: any[]): string;
    getStats(namespace?: string): CacheStats | Map<string, CacheStats>;
    getSize(): {
        current: number;
        max: number;
        usage: number;
    };
    cleanup(): void;
    private getNamespaceCache;
    private getNamespaceStats;
    private calculateSize;
    private evict;
}
