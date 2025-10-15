export interface MemoryCacheOptions {
    max?: number;
    maxSize?: number;
    ttl?: number;
    updateAgeOnGet?: boolean;
    updateAgeOnHas?: boolean;
}
export declare class MemoryCacheStrategy<T = any> {
    private cache;
    private hits;
    private misses;
    constructor(options?: MemoryCacheOptions);
    get(key: string): T | undefined;
    set(key: string, value: T, ttl?: number): void;
    delete(key: string): boolean;
    has(key: string): boolean;
    clear(): void;
    keys(): string[];
    size(): number;
    getStats(): {
        hits: number;
        misses: number;
        hitRate: number;
        size: number;
        calculatedSize: number;
    };
    private calculateSize;
    prune(): void;
}
