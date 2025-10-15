import { Injectable, Logger, DynamicModule, Type } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs-extra';
import * as ts from 'typescript';
const chalk = require('chalk');

interface ModuleMetadata {
  name: string;
  path: string;
  module?: Type<any>;
  lastModified?: Date;
  dependencies?: string[];
}

@Injectable()
export class DynamicModuleLoaderService {
  private readonly logger = new Logger(DynamicModuleLoaderService.name);
  private loadedModules: Map<string, ModuleMetadata> = new Map();
  private moduleRegistry: Map<string, DynamicModule> = new Map();

  /**
   * Load a module dynamically
   */
  async loadModule(moduleName: string, modulePath: string): Promise<DynamicModule | null> {
    try {
      console.log(chalk.blue(`📦 Loading module: ${moduleName}`));

      // Check if module exists
      if (!await fs.pathExists(modulePath)) {
        throw new Error(`Module path not found: ${modulePath}`);
      }

      // Find module file
      const moduleFile = await this.findModuleFile(modulePath);
      if (!moduleFile) {
        throw new Error(`No module file found in ${modulePath}`);
      }

      // Compile TypeScript if needed
      if (moduleFile.endsWith('.ts')) {
        await this.compileTypeScript(moduleFile);
      }

      // Load the module
      const compiledPath = moduleFile.replace('.ts', '.js');
      delete require.cache[require.resolve(compiledPath)];
      const moduleExports = require(compiledPath);

      // Find the module class
      const ModuleClass = this.findModuleClass(moduleExports);
      if (!ModuleClass) {
        throw new Error(`No valid NestJS module found in ${moduleFile}`);
      }

      // Create dynamic module
      const dynamicModule: DynamicModule = {
        module: ModuleClass,
        imports: [],
        providers: [],
        exports: [],
      };

      // Store module metadata
      const metadata: ModuleMetadata = {
        name: moduleName,
        path: modulePath,
        module: ModuleClass,
        lastModified: new Date(),
        dependencies: await this.extractDependencies(moduleFile),
      };

      this.loadedModules.set(moduleName, metadata);
      this.moduleRegistry.set(moduleName, dynamicModule);

      console.log(chalk.green(`✅ Module loaded: ${moduleName}`));
      return dynamicModule;
    } catch (error) {
      console.error(chalk.red(`❌ Failed to load module ${moduleName}:`), error.message);
      return null;
    }
  }

  /**
   * Reload a module
   */
  async reloadModule(moduleName: string): Promise<boolean> {
    try {
      const metadata = this.loadedModules.get(moduleName);
      if (!metadata) {
        console.log(chalk.yellow(`Module ${moduleName} not loaded`));
        return false;
      }

      console.log(chalk.cyan(`♻️  Reloading module: ${moduleName}`));

      // Clear from cache
      this.clearModuleFromCache(metadata.path);

      // Reload the module
      const dynamicModule = await this.loadModule(moduleName, metadata.path);
      if (!dynamicModule) {
        return false;
      }

      // Update registry
      this.moduleRegistry.set(moduleName, dynamicModule);

      console.log(chalk.green(`✅ Module reloaded: ${moduleName}`));
      return true;
    } catch (error) {
      console.error(chalk.red(`❌ Failed to reload module ${moduleName}:`), error.message);
      return false;
    }
  }

  /**
   * Unload a module
   */
  async unloadModule(moduleName: string): Promise<boolean> {
    try {
      const metadata = this.loadedModules.get(moduleName);
      if (!metadata) {
        return false;
      }

      // Clear from cache
      this.clearModuleFromCache(metadata.path);

      // Remove from registries
      this.loadedModules.delete(moduleName);
      this.moduleRegistry.delete(moduleName);

      console.log(chalk.gray(`📤 Module unloaded: ${moduleName}`));
      return true;
    } catch (error) {
      console.error(chalk.red(`❌ Failed to unload module ${moduleName}:`), error.message);
      return false;
    }
  }

  /**
   * Get all loaded modules
   */
  getLoadedModules(): ModuleMetadata[] {
    return Array.from(this.loadedModules.values());
  }

  /**
   * Get a specific module
   */
  getModule(moduleName: string): DynamicModule | undefined {
    return this.moduleRegistry.get(moduleName);
  }

  /**
   * Find the main module file in a directory
   */
  private async findModuleFile(modulePath: string): Promise<string | null> {
    // Common module file patterns
    const patterns = [
      `${path.basename(modulePath)}.module.ts`,
      `${path.basename(modulePath)}.module.js`,
      'index.ts',
      'index.js',
      'module.ts',
      'module.js',
    ];

    for (const pattern of patterns) {
      const filePath = path.join(modulePath, pattern);
      if (await fs.pathExists(filePath)) {
        return filePath;
      }

      // Also check in src subdirectory
      const srcPath = path.join(modulePath, 'src', pattern);
      if (await fs.pathExists(srcPath)) {
        return srcPath;
      }
    }

    return null;
  }

  /**
   * Find the module class from exports
   */
  private findModuleClass(exports: any): Type<any> | null {
    // Check default export
    if (exports.default && this.isNestModule(exports.default)) {
      return exports.default;
    }

    // Check named exports
    for (const key of Object.keys(exports)) {
      if (this.isNestModule(exports[key])) {
        return exports[key];
      }
    }

    return null;
  }

  /**
   * Check if a class is a NestJS module
   */
  private isNestModule(target: any): boolean {
    if (typeof target !== 'function') {
      return false;
    }

    // Check for @Module decorator metadata
    const metadata = Reflect.getMetadata('imports', target);
    return metadata !== undefined;
  }

  /**
   * Compile TypeScript file
   */
  private async compileTypeScript(filePath: string): Promise<void> {
    const source = await fs.readFile(filePath, 'utf8');
    
    const compilerOptions: ts.CompilerOptions = {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      experimentalDecorators: true,
      emitDecoratorMetadata: true,
      esModuleInterop: true,
      skipLibCheck: true,
      strict: false,
    };

    const result = ts.transpileModule(source, {
      compilerOptions,
      fileName: path.basename(filePath),
    });

    const outputPath = filePath.replace('.ts', '.js');
    await fs.writeFile(outputPath, result.outputText);
  }

  /**
   * Extract module dependencies
   */
  private async extractDependencies(moduleFile: string): Promise<string[]> {
    const dependencies: string[] = [];
    
    try {
      const source = await fs.readFile(moduleFile, 'utf8');
      
      // Extract import statements
      const importRegex = /import\s+.*?\s+from\s+['"](.+?)['"]/g;
      let match;
      
      while ((match = importRegex.exec(source)) !== null) {
        const importPath = match[1];
        if (!importPath.startsWith('.') && !importPath.startsWith('@nestjs')) {
          dependencies.push(importPath);
        }
      }
    } catch (error) {
      this.logger.error(`Failed to extract dependencies from ${moduleFile}:`, error);
    }

    return dependencies;
  }

  /**
   * Clear module from Node.js cache
   */
  private clearModuleFromCache(modulePath: string): void {
    Object.keys(require.cache).forEach((key) => {
      if (key.includes(modulePath)) {
        delete require.cache[key];
      }
    });
  }
}