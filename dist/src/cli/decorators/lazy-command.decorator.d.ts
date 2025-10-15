export declare const LAZY_COMMAND_METADATA = "lazy_command";
export interface LazyCommandOptions {
    name: string;
    description: string;
    preload?: boolean;
    priority?: number;
}
export declare function LazyCommand(options: LazyCommandOptions): ClassDecorator;
export declare function getPreloadList(): string[];
export declare function CommandHandler(options?: {
    validateArgs?: boolean;
    logExecution?: boolean;
}): MethodDecorator;
export declare function CommandParam(name: string, options?: {
    required?: boolean;
    type?: 'string' | 'number' | 'boolean';
    defaultValue?: any;
    description?: string;
}): ParameterDecorator;
