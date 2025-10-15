export declare function Log(options?: {
    message?: string;
    logArgs?: boolean;
    logResult?: boolean;
    logDuration?: boolean;
}): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
export declare function Performance(threshold?: number): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
export declare function CacheLog(): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
export declare function Audit(action: string): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
