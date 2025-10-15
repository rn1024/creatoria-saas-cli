import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs-extra';
import * as path from 'path';

@Injectable()
export class ModulesService {
  private modulesPath: string;
  private configPath: string;

  constructor(private configService: ConfigService) {
    this.modulesPath = path.join(process.cwd(), 'modules');
    this.configPath = path.join(process.cwd(), '.creatoria', 'config.json');
  }

  async addModule(moduleName: string, options: any = {}): Promise<boolean> {
    const modulePath = path.join(this.modulesPath, moduleName);
    const sourcePath = options.sourcePath;

    if (!sourcePath || !await fs.pathExists(sourcePath)) {
      throw new Error('Source path does not exist');
    }

    if (await fs.pathExists(modulePath) && !options.force) {
      throw new Error(`Module ${moduleName} already exists`);
    }

    await fs.copy(sourcePath, modulePath);
    await this.updateConfig('add', moduleName);
    return true;
  }

  async removeModule(moduleName: string): Promise<boolean> {
    const modulePath = path.join(this.modulesPath, moduleName);
    
    if (!await fs.pathExists(modulePath)) {
      throw new Error(`Module ${moduleName} does not exist`);
    }

    await fs.remove(modulePath);
    await this.updateConfig('remove', moduleName);
    return true;
  }

  async listModules(): Promise<string[]> {
    if (!await fs.pathExists(this.configPath)) {
      return [];
    }

    const config = await fs.readJSON(this.configPath);
    return config.modules || [];
  }

  async checkDependencies(moduleName: string): Promise<boolean> {
    const modulePath = path.join(this.modulesPath, moduleName);
    const packageJsonPath = path.join(modulePath, 'package.json');

    if (!await fs.pathExists(packageJsonPath)) {
      return false;
    }

    const packageJson = await fs.readJSON(packageJsonPath);
    const dependencies = packageJson.dependencies || {};
    
    for (const dep of Object.keys(dependencies)) {
      if (dep.startsWith('module-')) {
        const depPath = path.join(this.modulesPath, dep);
        if (!await fs.pathExists(depPath)) {
          return false;
        }
      }
    }
    
    return true;
  }

  async initializeModule(moduleName: string): Promise<boolean> {
    const modulePath = path.join(this.modulesPath, moduleName);
    const initFile = path.join(modulePath, 'init.js');

    if (await fs.pathExists(initFile)) {
      const init = require(initFile);
      if (typeof init === 'function') {
        await init();
      }
    }

    return true;
  }

  private async updateConfig(action: 'add' | 'remove', moduleName: string): Promise<void> {
    await fs.ensureDir(path.dirname(this.configPath));
    
    let config = { modules: [] };
    if (await fs.pathExists(this.configPath)) {
      config = await fs.readJSON(this.configPath);
    }

    if (action === 'add' && !config.modules.includes(moduleName)) {
      config.modules.push(moduleName);
    } else if (action === 'remove') {
      config.modules = config.modules.filter((m: string) => m !== moduleName);
    }

    await fs.writeJSON(this.configPath, config, { spaces: 2 });
  }
}