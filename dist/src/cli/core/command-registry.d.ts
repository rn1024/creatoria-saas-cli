export interface CommandMetadata {
    name: string;
    description: string;
    modulePath?: string;
    className?: string;
    instance?: any;
    loaded: boolean;
    loadTime?: number;
}
export declare class CommandRegistry {
    private static instance;
    private commands;
    private logger;
    private constructor();
    static getInstance(): CommandRegistry;
    register(name: string, description: string, modulePath?: string, className?: string): void;
    registerInstance(name: string, description: string, instance: any): void;
    getCommand(name: string): CommandMetadata | undefined;
    getAllCommands(): CommandMetadata[];
    getLoadedCommands(): CommandMetadata[];
    updateInstance(name: string, instance: any, loadTime: number): void;
    clear(): void;
    getStats(): {
        total: number;
        loaded: number;
        totalLoadTime: number;
        averageLoadTime: number;
    };
}
