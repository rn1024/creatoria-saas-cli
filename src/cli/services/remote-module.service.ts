import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs-extra';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
const execAsync = promisify(exec);
const chalk = require('chalk');

interface ModuleRegistry {
  modules: {
    [key: string]: {
      name: string;
      version: string;
      description: string;
      repository: string;
      path?: string;
    };
  };
}

@Injectable()
export class RemoteModuleService {
  private readonly logger = new Logger(RemoteModuleService.name);
  private readonly cacheDir = path.join(process.env.HOME || '', '.creatoria', 'module-cache');
  
  constructor() {
    // Ensure cache directory exists
    fs.ensureDirSync(this.cacheDir);
  }

  /**
   * Fetch module registry from remote source
   */
  async fetchRegistry(): Promise<ModuleRegistry> {
    // For now, use a local registry file
    // In production, this would fetch from a remote URL
    const localRegistryPath = path.join(
      __dirname, 
      '../../../../../creatoria-saas-modules/registry.json'
    );
    
    if (!fs.existsSync(localRegistryPath)) {
      throw new Error('Module registry not found');
    }
    
    return fs.readJson(localRegistryPath);
  }

  /**
   * Fetch a module from remote repository
   */
  async fetchModule(moduleName: string, version?: string): Promise<string> {
    console.log(chalk.blue(`Fetching module ${moduleName}${version ? `@${version}` : ''}...`));
    
    const registry = await this.fetchRegistry();
    const moduleInfo = registry.modules[moduleName];
    
    if (!moduleInfo) {
      throw new Error(`Module ${moduleName} not found in registry`);
    }
    
    // Check cache first
    const cacheKey = `${moduleName}-${version || moduleInfo.version}`;
    const cachedPath = path.join(this.cacheDir, cacheKey);
    
    if (fs.existsSync(cachedPath)) {
      console.log(chalk.gray('Using cached version'));
      return cachedPath;
    }
    
    // Clone or download module
    if (moduleInfo.repository.startsWith('git')) {
      return await this.cloneFromGit(moduleInfo.repository, cachedPath, version);
    } else if (moduleInfo.path) {
      // Local development path
      return await this.copyFromLocal(moduleInfo.path, cachedPath);
    } else {
      throw new Error(`Unsupported repository type for ${moduleName}`);
    }
  }

  /**
   * Clone module from git repository
   */
  private async cloneFromGit(repoUrl: string, targetPath: string, version?: string): Promise<string> {
    console.log(chalk.gray(`Cloning from ${repoUrl}...`));
    
    try {
      // Clone repository
      await execAsync(`git clone ${repoUrl} ${targetPath}`);
      
      // Checkout specific version if provided
      if (version) {
        await execAsync(`git checkout ${version}`, { cwd: targetPath });
      }
      
      // Remove .git directory to save space
      await fs.remove(path.join(targetPath, '.git'));
      
      console.log(chalk.green('Module downloaded successfully'));
      return targetPath;
    } catch (error) {
      await fs.remove(targetPath); // Clean up on failure
      throw new Error(`Failed to clone module: ${error.message}`);
    }
  }

  /**
   * Copy module from local path (for development)
   */
  private async copyFromLocal(sourcePath: string, targetPath: string): Promise<string> {
    console.log(chalk.gray(`Copying from local path ${sourcePath}...`));
    
    const absoluteSource = path.isAbsolute(sourcePath) 
      ? sourcePath 
      : path.join(__dirname, '../../../../../', sourcePath);
    
    if (!fs.existsSync(absoluteSource)) {
      throw new Error(`Local module path not found: ${absoluteSource}`);
    }
    
    await fs.copy(absoluteSource, targetPath, {
      filter: (src) => {
        const basename = path.basename(src);
        return !basename.includes('node_modules') && 
               !basename.includes('.git') &&
               !basename.includes('dist');
      }
    });
    
    console.log(chalk.green('Module copied successfully'));
    return targetPath;
  }

  /**
   * List available remote modules
   */
  async listAvailableModules(): Promise<string[]> {
    const registry = await this.fetchRegistry();
    return Object.keys(registry.modules);
  }

  /**
   * Get module information
   */
  async getModuleInfo(moduleName: string): Promise<any> {
    const registry = await this.fetchRegistry();
    return registry.modules[moduleName];
  }

  /**
   * Clear module cache
   */
  async clearCache(moduleName?: string): Promise<void> {
    if (moduleName) {
      // Clear specific module cache
      const files = await fs.readdir(this.cacheDir);
      const moduleFiles = files.filter(f => f.startsWith(`${moduleName}-`));
      
      for (const file of moduleFiles) {
        await fs.remove(path.join(this.cacheDir, file));
      }
      
      console.log(chalk.green(`Cache cleared for module ${moduleName}`));
    } else {
      // Clear all cache
      await fs.emptyDir(this.cacheDir);
      console.log(chalk.green('Module cache cleared'));
    }
  }

  /**
   * Validate module structure
   */
  async validateModule(modulePath: string): Promise<boolean> {
    const requiredFiles = ['module.json'];
    const requiredDirs = [];
    
    // Check required files
    for (const file of requiredFiles) {
      if (!fs.existsSync(path.join(modulePath, file))) {
        console.log(chalk.red(`Missing required file: ${file}`));
        return false;
      }
    }
    
    // Check required directories
    for (const dir of requiredDirs) {
      if (!fs.existsSync(path.join(modulePath, dir))) {
        console.log(chalk.red(`Missing required directory: ${dir}`));
        return false;
      }
    }
    
    // Validate module.json structure
    try {
      const moduleJson = await fs.readJson(path.join(modulePath, 'module.json'));
      
      if (!moduleJson.name) {
        console.log(chalk.red('module.json missing required field: name'));
        return false;
      }
      
      if (!moduleJson.version) {
        console.log(chalk.red('module.json missing required field: version'));
        return false;
      }
      
      return true;
    } catch (error) {
      console.log(chalk.red(`Invalid module.json: ${error.message}`));
      return false;
    }
  }
}