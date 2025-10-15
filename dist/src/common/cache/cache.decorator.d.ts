import { CacheOptions } from './cache.service';
export declare function Cacheable(options?: CacheOptions & {
    keyGenerator?: (...args: any[]) => string;
    condition?: (...args: any[]) => boolean;
}): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
export declare function CacheEvict(options?: {
    namespace?: string;
    key?: string;
    keyGenerator?: (...args: any[]) => string;
    allEntries?: boolean;
}): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
export declare function CachePut(options?: CacheOptions & {
    keyGenerator?: (...args: any[]) => string;
}): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
export declare function CacheableBatch(options?: CacheOptions & {
    keyExtractor: (item: any) => string;
    batchSize?: number;
}): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
export declare function CacheStats(): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
