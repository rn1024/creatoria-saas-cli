import { Project, SourceFile, SyntaxKind, Node, CallExpression, ArrayLiteralExpression } from 'ts-morph';
import * as path from 'path';
const chalk = require('chalk');

export class AstHelper {
  private project: Project;

  constructor() {
    this.project = new Project({
      compilerOptions: {
        target: 99, // ESNext
        module: 99, // ESNext
      },
    });
  }

  /**
   * 添加模块到app.module.ts
   */
  async addModuleToAppModule(
    appModulePath: string,
    moduleName: string
  ): Promise<boolean> {
    try {
      // 加载源文件
      const sourceFile = this.project.addSourceFileAtPath(appModulePath);
      
      // 生成模块类名和导入路径
      const moduleClassName = this.capitalize(moduleName) + 'Module';
      const importPath = `./modules/${moduleName}/${moduleName}.module`;
      
      console.log(chalk.gray(`Adding ${moduleClassName} to app.module.ts...`));
      
      // 添加import语句
      this.addImportStatement(sourceFile, moduleClassName, importPath);
      
      // 添加到imports数组
      this.addToImportsArray(sourceFile, moduleClassName);
      
      // 保存文件
      await sourceFile.save();
      
      console.log(chalk.green(`✅ Successfully added ${moduleClassName} to app.module.ts`));
      return true;
    } catch (error) {
      console.error(chalk.red(`Failed to modify app.module.ts: ${error.message}`));
      return false;
    }
  }

  /**
   * 添加import语句
   */
  private addImportStatement(
    sourceFile: SourceFile,
    moduleClassName: string,
    importPath: string
  ): void {
    // 检查是否已存在该import
    const existingImport = sourceFile.getImportDeclaration(
      decl => decl.getModuleSpecifierValue() === importPath
    );
    
    if (existingImport) {
      console.log(chalk.yellow(`Import for ${moduleClassName} already exists`));
      return;
    }
    
    // 找到最后一个import语句的位置
    const imports = sourceFile.getImportDeclarations();
    const lastImport = imports[imports.length - 1];
    
    // 添加新的import语句
    if (lastImport) {
      // 在最后一个import后面添加
      sourceFile.insertStatements(
        lastImport.getChildIndex() + 1,
        `import { ${moduleClassName} } from '${importPath}';`
      );
    } else {
      // 如果没有import，在文件开头添加
      sourceFile.insertStatements(0, `import { ${moduleClassName} } from '${importPath}';`);
    }
  }

  /**
   * 添加模块到imports数组
   */
  private addToImportsArray(
    sourceFile: SourceFile,
    moduleClassName: string
  ): void {
    // 找到@Module装饰器
    const moduleDecorator = this.findModuleDecorator(sourceFile);
    if (!moduleDecorator) {
      throw new Error('@Module decorator not found');
    }
    
    // 获取装饰器的参数对象
    const decoratorArgument = moduleDecorator.getArguments()[0];
    if (!decoratorArgument || !Node.isObjectLiteralExpression(decoratorArgument)) {
      throw new Error('@Module decorator argument is not an object literal');
    }
    
    // 找到imports属性
    const importsProperty = decoratorArgument.getProperty('imports');
    
    if (!importsProperty) {
      // 如果没有imports属性，创建一个
      decoratorArgument.addPropertyAssignment({
        name: 'imports',
        initializer: `[${moduleClassName}]`,
      });
      console.log(chalk.green(`Created imports array with ${moduleClassName}`));
      return;
    }
    
    // 获取imports数组
    if (!Node.isPropertyAssignment(importsProperty)) {
      throw new Error('imports property is not a PropertyAssignment');
    }
    
    const importsArray = importsProperty.getInitializer();
    if (!Node.isArrayLiteralExpression(importsArray)) {
      throw new Error('imports is not an array');
    }
    
    // 检查模块是否已存在
    const elements = importsArray.getElements();
    const moduleExists = elements.some(element => {
      const text = element.getText();
      return text === moduleClassName || text.includes(moduleClassName);
    });
    
    if (moduleExists) {
      console.log(chalk.yellow(`${moduleClassName} already exists in imports array`));
      return;
    }
    
    // 添加模块到数组 - 使用 ts-morph 的内置方法
    importsArray.addElement(moduleClassName);
    
    console.log(chalk.green(`Added ${moduleClassName} to imports array`));
  }

  /**
   * 找到@Module装饰器
   */
  private findModuleDecorator(sourceFile: SourceFile): CallExpression | undefined {
    // 找到所有的类声明
    const classes = sourceFile.getClasses();
    
    for (const classDecl of classes) {
      // 查找@Module装饰器
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

  /**
   * 获取适当的缩进
   */
  private getIndentation(node: Node): string {
    const parent = node.getParent();
    if (!parent) return '  ';
    
    const text = parent.getText();
    const lines = text.split('\n');
    
    // 找到包含内容的第一行的缩进
    for (const line of lines) {
      if (line.trim().length > 0 && !line.trim().startsWith('[') && !line.trim().startsWith(']')) {
        const match = line.match(/^(\s*)/);
        if (match) {
          return match[1];
        }
      }
    }
    
    return '    '; // 默认4个空格
  }

  /**
   * 将字符串首字母大写
   */
  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * 移除模块（用于module remove命令）
   */
  async removeModuleFromAppModule(
    appModulePath: string,
    moduleName: string
  ): Promise<boolean> {
    try {
      const sourceFile = this.project.addSourceFileAtPath(appModulePath);
      const moduleClassName = this.capitalize(moduleName) + 'Module';
      const importPath = `./modules/${moduleName}/${moduleName}.module`;
      
      console.log(chalk.gray(`Removing ${moduleClassName} from app.module.ts...`));
      
      // 移除import语句
      const importToRemove = sourceFile.getImportDeclaration(
        decl => decl.getModuleSpecifierValue() === importPath
      );
      
      if (importToRemove) {
        importToRemove.remove();
        console.log(chalk.green(`Removed import statement for ${moduleClassName}`));
      }
      
      // 从imports数组中移除
      const moduleDecorator = this.findModuleDecorator(sourceFile);
      if (moduleDecorator) {
        const decoratorArgument = moduleDecorator.getArguments()[0];
        if (Node.isObjectLiteralExpression(decoratorArgument)) {
          const importsProperty = decoratorArgument.getProperty('imports');
          if (importsProperty && Node.isPropertyAssignment(importsProperty)) {
            const importsArray = importsProperty.getInitializer();
            if (Node.isArrayLiteralExpression(importsArray)) {
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
    } catch (error) {
      console.error(chalk.red(`Failed to remove module: ${error.message}`));
      return false;
    }
  }
}