export declare class AstHelper {
    private project;
    constructor();
    addModuleToAppModule(appModulePath: string, moduleName: string): Promise<boolean>;
    private addImportStatement;
    private addToImportsArray;
    private findModuleDecorator;
    private getIndentation;
    private capitalize;
    removeModuleFromAppModule(appModulePath: string, moduleName: string): Promise<boolean>;
}
