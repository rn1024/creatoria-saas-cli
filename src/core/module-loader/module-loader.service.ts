import { Injectable, Logger } from '@nestjs/common';
import { DynamicModule, Type } from '@nestjs/common';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as simpleGit from 'simple-git';
import { ConfigService } from '../../config/config.service';
import { ModuleInfo, ModuleMetadata, ModuleStatus } from '../../interfaces/module.interface';

@Injectable()
export class ModuleLoaderService {
  private readonly logger = new Logger(ModuleLoaderService.name);
  private readonly git = simpleGit.default();
  private modules: Map<string, ModuleInfo> = new Map();

  constructor(private configService: ConfigService) {}

  async loadModules(): Promise<Type<any>[]> {
    const enabledModules = this.configService.modules.enabled;
    const loadedModules: Type<any>[] = [];

    for (const moduleName of enabledModules) {
      try {
        const module = await this.loadModule(moduleName);
        if (module) {
          loadedModules.push(module);
        }
      } catch (error) {
        this.logger.error(`Failed to load module ${moduleName}:`, error);
      }
    }

    return loadedModules;
  }

  async installModule(moduleSource: string): Promise<void> {
    const installPath = this.configService.modules.installPath;
    
    // Parse module source (e.g., github:creatoria/creatoria-saas-modules)
    const [protocol, repo] = moduleSource.split(':');
    
    if (protocol === 'github') {
      const gitUrl = `https://github.com/${repo}.git`;
      const targetPath = path.join(installPath, 'remote');
      
      this.logger.log(`Installing modules from ${gitUrl}...`);
      
      // Clone or pull the repository
      if (await fs.pathExists(targetPath)) {
        await this.git.cwd(targetPath).pull();
      } else {
        await this.git.clone(gitUrl, targetPath);
      }
      
      // Install dependencies
      const { exec } = require('child_process');
      await new Promise((resolve, reject) => {
        exec('npm install', { cwd: targetPath }, (error: any) => {
          if (error) reject(error);
          else resolve(true);
        });
      });
      
      // Build modules
      await new Promise((resolve, reject) => {
        exec('npm run build', { cwd: targetPath }, (error: any) => {
          if (error) reject(error);
          else resolve(true);
        });
      });
      
      this.logger.log('Modules installed successfully');
    }
  }

  private async loadModule(moduleName: string): Promise<Type<any> | null> {
    const modulePath = path.join(
      this.configService.modules.installPath,
      'remote',
      'packages',
      moduleName,
    );

    if (!await fs.pathExists(modulePath)) {
      this.logger.warn(`Module ${moduleName} not found at ${modulePath}`);
      return null;
    }

    // Load module metadata
    const metadataPath = path.join(modulePath, 'module.json');
    let metadata: ModuleMetadata;
    
    if (await fs.pathExists(metadataPath)) {
      metadata = await fs.readJson(metadataPath);
    } else {
      // Default metadata if module.json doesn't exist
      metadata = {
        name: moduleName,
        displayName: moduleName,
        version: '1.0.0',
        description: `${moduleName} module`,
        author: 'Creatoria Team',
      };
    }

    // Register module info
    const moduleInfo: ModuleInfo = {
      id: `${moduleName}-${metadata.version}`,
      name: moduleName,
      version: metadata.version,
      status: ModuleStatus.ENABLED,
      path: modulePath,
      metadata,
      installedAt: new Date(),
      updatedAt: new Date(),
    };
    
    this.modules.set(moduleName, moduleInfo);

    // Load the module class
    try {
      const moduleFile = path.join(modulePath, 'dist', 'src', `${moduleName}.module.js`);
      if (await fs.pathExists(moduleFile)) {
        const moduleExports = require(moduleFile);
        const ModuleClass = moduleExports[Object.keys(moduleExports)[0]];
        
        this.logger.log(`Loaded module: ${moduleName} v${metadata.version}`);
        return ModuleClass;
      }
    } catch (error) {
      this.logger.error(`Failed to load module class for ${moduleName}:`, error);
    }

    return null;
  }

  async enableModule(moduleName: string): Promise<void> {
    const moduleInfo = this.modules.get(moduleName);
    if (moduleInfo) {
      moduleInfo.status = ModuleStatus.ENABLED;
      this.modules.set(moduleName, moduleInfo);
      this.logger.log(`Module ${moduleName} enabled`);
    }
  }

  async disableModule(moduleName: string): Promise<void> {
    const moduleInfo = this.modules.get(moduleName);
    if (moduleInfo) {
      moduleInfo.status = ModuleStatus.DISABLED;
      this.modules.set(moduleName, moduleInfo);
      this.logger.log(`Module ${moduleName} disabled`);
    }
  }

  getModuleInfo(moduleName: string): ModuleInfo | undefined {
    return this.modules.get(moduleName);
  }

  getAllModules(): ModuleInfo[] {
    return Array.from(this.modules.values());
  }

  isModuleEnabled(moduleName: string): boolean {
    const moduleInfo = this.modules.get(moduleName);
    return moduleInfo?.status === ModuleStatus.ENABLED;
  }
}