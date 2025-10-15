import { Injectable } from '@nestjs/common';
import * as fs from 'fs-extra';
import * as path from 'path';
import { DependencyChecker } from '../utils/dependency-checker';
import { AstHelper } from '../utils/ast-helper';
import { 
  InvalidArgumentException,
  ProjectNotFoundException,
  ModuleNotFoundException,
  ModuleAlreadyExistsException,
  ModuleCopyFailedException 
} from '../../common/exceptions';
import { CatchErrors } from '../../common/decorators/catch-errors.decorator';
import { FileSystemErrorHandler, JsonErrorHandler } from '../../common/utils/error-handler';
const chalk = require('chalk');

@Injectable()
export class ModuleAddCommand {
  @CatchErrors({ rethrow: false })
  async run(args: string[], options: any): Promise<void> {
    const moduleName = args[0];
    const skipDependencyCheck = options.skipDeps || false;
    
    if (!moduleName) {
      throw new InvalidArgumentException('module-name', 'Module name is required');
    }
    
    console.log(chalk.blue(`Adding module: ${moduleName}`));
    
    // 1. Check if we're in a Creatoria SaaS project
    const configPath = path.resolve(process.cwd(), 'creatoria.config.json');
    if (!await FileSystemErrorHandler.exists(configPath)) {
      throw new ProjectNotFoundException(process.cwd());
    }
      
    // 2. Setup paths
    const modulesRepoPath = process.env.CREATORIA_MODULES_DIR || 
                           path.resolve(__dirname, '../../../../../creatoria-saas-modules');
    const source = path.join(modulesRepoPath, 'packages', moduleName);
    const target = path.resolve(process.cwd(), 'src/modules', moduleName);
    
    // 3. Check module exists
    if (!await FileSystemErrorHandler.exists(source)) {
      throw new ModuleNotFoundException(moduleName, modulesRepoPath);
    }
    
    // 4. Check if already installed
    if (await FileSystemErrorHandler.exists(target)) {
      throw new ModuleAlreadyExistsException(moduleName);
    }
      
    // 5. Check dependencies
    if (!skipDependencyCheck) {
      console.log(chalk.gray('Checking module dependencies...'));
      const depChecker = new DependencyChecker(process.cwd(), modulesRepoPath);
      await depChecker.initialize();
      
      const checkResult = await depChecker.checkDependencies(moduleName);
      depChecker.printDependencyReport(moduleName, checkResult);
      
      if (!checkResult.valid) {
        if (checkResult.missingModules.length > 0) {
          console.log(chalk.yellow('\n提示: 使用 --skip-deps 参数可以跳过依赖检查'));
        }
        process.exit(1);
      }
    }
    
    // 6. Copy module files
    console.log(chalk.gray(`Copying module files from ${source}...`));
    try {
      await fs.copy(source, target, {
        filter: (src) => {
          // Skip node_modules and other unnecessary files
          const basename = path.basename(src);
          return !basename.includes('node_modules') && 
                 !basename.includes('.git') &&
                 !basename.includes('dist');
        }
      });
    } catch (error: any) {
      throw new ModuleCopyFailedException(moduleName, source, target, error.message);
    }
    console.log(chalk.green(`✅ Module ${moduleName} copied to src/modules/`));
    
    // 7. Update configuration file
    const config = await JsonErrorHandler.safeReadJson(configPath);
      
    if (!config.modules) {
      config.modules = [];
    }
    
    if (!config.modules.includes(moduleName)) {
      config.modules.push(moduleName);
      await JsonErrorHandler.safeWriteJson(configPath, config);
      console.log(chalk.green(`✅ Added ${moduleName} to creatoria.config.json`));
    }
      
    // 8. Automatically register module in app.module.ts
    const appModulePath = path.resolve(process.cwd(), 'src/app.module.ts');
    if (await FileSystemErrorHandler.exists(appModulePath)) {
      const astHelper = new AstHelper();
      const success = await astHelper.addModuleToAppModule(appModulePath, moduleName);
      
      if (!success) {
        // Fall back to manual instructions if AST modification fails
        const moduleClassName = this.capitalize(moduleName) + 'Module';
        const modulePath = `./modules/${moduleName}/${moduleName}.module`;
        
        console.log(chalk.yellow(`
⚠️  Automatic registration failed. Manual steps required:

1. Add import to src/app.module.ts:
   ${chalk.cyan(`import { ${moduleClassName} } from '${modulePath}';`)}
   
2. Add to imports array in @Module decorator:
   ${chalk.cyan(`${moduleClassName},`)}
`));
      }
    } else {
      console.log(chalk.yellow('⚠️  app.module.ts not found. Please manually register the module.'));
    }
    
    // 9. Get package dependencies from module.json
    const moduleJsonPath = path.join(target, 'module.json');
    let hasNpmDependencies = false;
    if (await FileSystemErrorHandler.exists(moduleJsonPath)) {
      const moduleJson = await JsonErrorHandler.safeReadJson(moduleJsonPath);
        if (moduleJson.dependencies && moduleJson.dependencies.packages) {
          const packages = Object.keys(moduleJson.dependencies.packages);
          if (packages.length > 0) {
            hasNpmDependencies = true;
            console.log(chalk.yellow('\n📦 This module requires the following npm packages:'));
            packages.forEach(pkg => {
              console.log(chalk.gray(`   - ${pkg}@${moduleJson.dependencies.packages[pkg]}`));
            });
          }
        }
      }
      
    // 10. Show next steps
    console.log(chalk.green(`
✨ Module ${moduleName} has been successfully added!

Next steps:
${hasNpmDependencies ? chalk.cyan('1. Install dependencies: npm install') : ''}
${hasNpmDependencies ? '2. ' : '1. '}Run the application: ${chalk.cyan('npm run start:dev')}
`));
  }
  
  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}