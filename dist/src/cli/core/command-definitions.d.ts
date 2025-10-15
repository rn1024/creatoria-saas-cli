export interface CommandDefinition {
    name: string;
    description: string;
    modulePath: string;
    className: string;
    preload?: boolean;
    priority?: number;
}
export declare const COMMAND_DEFINITIONS: CommandDefinition[];
export declare function registerAllCommands(): void;
export declare function getPreloadCommands(): string[];
