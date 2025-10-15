export interface ModuleDependency {
    modules: string[];
    packages: Record<string, string>;
}
export interface ModuleInfo {
    name: string;
    version: string;
    dependencies: ModuleDependency;
}
export declare class DependencyChecker {
    private projectPath;
    private modulesRepoPath;
    private installedModules;
    private moduleRegistry;
    constructor(projectPath: string, modulesRepoPath: string);
    initialize(): Promise<void>;
    checkDependencies(moduleName: string): Promise<{
        valid: boolean;
        missingModules: string[];
        circularDependency: boolean;
        dependencyChain: string[];
    }>;
    private hasCircularDependency;
    getAllDependencies(moduleName: string): {
        modules: Set<string>;
        packages: Record<string, string>;
    };
    private collectDependencies;
    printDependencyReport(moduleName: string, checkResult: {
        valid: boolean;
        missingModules: string[];
        circularDependency: boolean;
        dependencyChain: string[];
    }): void;
}
