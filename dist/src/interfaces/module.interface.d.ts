export interface ModuleMetadata {
    name: string;
    displayName: string;
    version: string;
    description: string;
    author: string;
    dependencies?: string[];
    optionalDependencies?: string[];
    permissions?: string[];
    menus?: ModuleMenu[];
    routes?: ModuleRoute;
    database?: ModuleDatabase;
    config?: Record<string, any>;
}
export interface ModuleMenu {
    name: string;
    path: string;
    icon?: string;
    permission?: string;
    children?: ModuleMenu[];
}
export interface ModuleRoute {
    prefix: string;
    middleware?: string[];
}
export interface ModuleDatabase {
    migrations?: string;
    seeds?: string;
    entities?: string;
}
export interface ModuleInfo {
    id: string;
    name: string;
    version: string;
    status: ModuleStatus;
    path: string;
    metadata: ModuleMetadata;
    installedAt: Date;
    updatedAt: Date;
}
export declare enum ModuleStatus {
    INSTALLED = "installed",
    ENABLED = "enabled",
    DISABLED = "disabled",
    ERROR = "error"
}
export interface ModuleRegistry {
    modules: Map<string, ModuleInfo>;
    register(module: ModuleInfo): void;
    unregister(name: string): void;
    get(name: string): ModuleInfo | undefined;
    getAll(): ModuleInfo[];
    isEnabled(name: string): boolean;
}
