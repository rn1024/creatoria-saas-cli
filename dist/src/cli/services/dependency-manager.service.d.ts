export interface PackageDependencies {
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
}
export declare class DependencyManagerService {
    private readonly featureDependencies;
    mergeDependencies(features: string[]): PackageDependencies;
    updatePackageJson(projectPath: string, features: string[]): Promise<void>;
    getRequiredDependencies(features: string[]): string[];
}
