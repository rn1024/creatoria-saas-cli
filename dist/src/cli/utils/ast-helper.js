"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AstHelper = void 0;
const ts_morph_1 = require("ts-morph");
const chalk = require('chalk');
class AstHelper {
    project;
    constructor() {
        this.project = new ts_morph_1.Project({
            compilerOptions: {
                target: 99,
                module: 99,
            },
        });
    }
    async addModuleToAppModule(appModulePath, moduleName) {
        try {
            const sourceFile = this.project.addSourceFileAtPath(appModulePath);
            const moduleClassName = this.capitalize(moduleName) + 'Module';
            const importPath = `./modules/${moduleName}/${moduleName}.module`;
            console.log(chalk.gray(`Adding ${moduleClassName} to app.module.ts...`));
            this.addImportStatement(sourceFile, moduleClassName, importPath);
            this.addToImportsArray(sourceFile, moduleClassName);
            await sourceFile.save();
            console.log(chalk.green(`✅ Successfully added ${moduleClassName} to app.module.ts`));
            return true;
        }
        catch (error) {
            console.error(chalk.red(`Failed to modify app.module.ts: ${error.message}`));
            return false;
        }
    }
    addImportStatement(sourceFile, moduleClassName, importPath) {
        const existingImport = sourceFile.getImportDeclaration(decl => decl.getModuleSpecifierValue() === importPath);
        if (existingImport) {
            console.log(chalk.yellow(`Import for ${moduleClassName} already exists`));
            return;
        }
        const imports = sourceFile.getImportDeclarations();
        const lastImport = imports[imports.length - 1];
        if (lastImport) {
            sourceFile.insertStatements(lastImport.getChildIndex() + 1, `import { ${moduleClassName} } from '${importPath}';`);
        }
        else {
            sourceFile.insertStatements(0, `import { ${moduleClassName} } from '${importPath}';`);
        }
    }
    addToImportsArray(sourceFile, moduleClassName) {
        const moduleDecorator = this.findModuleDecorator(sourceFile);
        if (!moduleDecorator) {
            throw new Error('@Module decorator not found');
        }
        const decoratorArgument = moduleDecorator.getArguments()[0];
        if (!decoratorArgument || !ts_morph_1.Node.isObjectLiteralExpression(decoratorArgument)) {
            throw new Error('@Module decorator argument is not an object literal');
        }
        const importsProperty = decoratorArgument.getProperty('imports');
        if (!importsProperty) {
            decoratorArgument.addPropertyAssignment({
                name: 'imports',
                initializer: `[${moduleClassName}]`,
            });
            console.log(chalk.green(`Created imports array with ${moduleClassName}`));
            return;
        }
        if (!ts_morph_1.Node.isPropertyAssignment(importsProperty)) {
            throw new Error('imports property is not a PropertyAssignment');
        }
        const importsArray = importsProperty.getInitializer();
        if (!ts_morph_1.Node.isArrayLiteralExpression(importsArray)) {
            throw new Error('imports is not an array');
        }
        const elements = importsArray.getElements();
        const moduleExists = elements.some(element => {
            const text = element.getText();
            return text === moduleClassName || text.includes(moduleClassName);
        });
        if (moduleExists) {
            console.log(chalk.yellow(`${moduleClassName} already exists in imports array`));
            return;
        }
        importsArray.addElement(moduleClassName);
        console.log(chalk.green(`Added ${moduleClassName} to imports array`));
    }
    findModuleDecorator(sourceFile) {
        const classes = sourceFile.getClasses();
        for (const classDecl of classes) {
            const decorators = classDecl.getDecorators();
            for (const decorator of decorators) {
                const decoratorName = decorator.getName();
                if (decoratorName === 'Module') {
                    const callExpression = decorator.getCallExpression();
                    if (callExpression) {
                        return callExpression;
                    }
                }
            }
        }
        return undefined;
    }
    getIndentation(node) {
        const parent = node.getParent();
        if (!parent)
            return '  ';
        const text = parent.getText();
        const lines = text.split('\n');
        for (const line of lines) {
            if (line.trim().length > 0 && !line.trim().startsWith('[') && !line.trim().startsWith(']')) {
                const match = line.match(/^(\s*)/);
                if (match) {
                    return match[1];
                }
            }
        }
        return '    ';
    }
    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
    async removeModuleFromAppModule(appModulePath, moduleName) {
        try {
            const sourceFile = this.project.addSourceFileAtPath(appModulePath);
            const moduleClassName = this.capitalize(moduleName) + 'Module';
            const importPath = `./modules/${moduleName}/${moduleName}.module`;
            console.log(chalk.gray(`Removing ${moduleClassName} from app.module.ts...`));
            const importToRemove = sourceFile.getImportDeclaration(decl => decl.getModuleSpecifierValue() === importPath);
            if (importToRemove) {
                importToRemove.remove();
                console.log(chalk.green(`Removed import statement for ${moduleClassName}`));
            }
            const moduleDecorator = this.findModuleDecorator(sourceFile);
            if (moduleDecorator) {
                const decoratorArgument = moduleDecorator.getArguments()[0];
                if (ts_morph_1.Node.isObjectLiteralExpression(decoratorArgument)) {
                    const importsProperty = decoratorArgument.getProperty('imports');
                    if (importsProperty && ts_morph_1.Node.isPropertyAssignment(importsProperty)) {
                        const importsArray = importsProperty.getInitializer();
                        if (ts_morph_1.Node.isArrayLiteralExpression(importsArray)) {
                            const elements = importsArray.getElements();
                            const elementToRemove = elements.find(element => {
                                const text = element.getText();
                                return text === moduleClassName || text.includes(moduleClassName);
                            });
                            if (elementToRemove) {
                                const index = elements.indexOf(elementToRemove);
                                importsArray.removeElement(index);
                                console.log(chalk.green(`Removed ${moduleClassName} from imports array`));
                            }
                        }
                    }
                }
            }
            await sourceFile.save();
            console.log(chalk.green(`✅ Successfully removed ${moduleClassName} from app.module.ts`));
            return true;
        }
        catch (error) {
            console.error(chalk.red(`Failed to remove module: ${error.message}`));
            return false;
        }
    }
}
exports.AstHelper = AstHelper;
//# sourceMappingURL=ast-helper.js.map