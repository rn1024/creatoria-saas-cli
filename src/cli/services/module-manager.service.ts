import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import chalk from 'chalk';

export interface ModuleConfig {
  name: string;
  version: string;
  description: string;
  type?: 'core' | 'business' | 'extension';
  dependencies?: {
    system?: string[];
    modules?: string[];
  };
  entities?: string[];
  apis?: string[];
  permissions?: string[];
}

export class ModuleManagerService {
  private projectPath: string;
  private modulesPath: string;

  constructor(projectPath: string = process.cwd()) {
    this.projectPath = projectPath;
    this.modulesPath = path.join(projectPath, 'node_modules', '@creatoria-saas');
  }

  /**
   * 安装模块
   */
  async installModule(moduleName: string, version?: string): Promise<void> {
    console.log(chalk.blue(`📦 安装模块: ${moduleName}${version ? `@${version}` : ''}`));
    
    try {
      // 安装npm包
      const packageName = `@creatoria-saas/${moduleName}${version ? `@${version}` : ''}`;
      execSync(`pnpm add ${packageName}`, { cwd: this.projectPath, stdio: 'inherit' });
      
      // 读取模块配置
      const moduleConfig = await this.getModuleConfig(moduleName);
      
      // 检查依赖
      await this.checkDependencies(moduleConfig);
      
      // 注册模块到项目
      await this.registerModule(moduleName, moduleConfig);
      
      console.log(chalk.green(`✅ 模块 ${moduleName} 安装成功`));
    } catch (error) {
      console.error(chalk.red(`❌ 模块安装失败: ${error.message}`));
      throw error;
    }
  }

  /**
   * 卸载模块
   */
  async uninstallModule(moduleName: string): Promise<void> {
    console.log(chalk.blue(`🗑  卸载模块: ${moduleName}`));
    
    try {
      // 检查是否有其他模块依赖此模块
      const dependents = await this.findDependents(moduleName);
      if (dependents.length > 0) {
        throw new Error(`以下模块依赖 ${moduleName}: ${dependents.join(', ')}`);
      }
      
      // 从项目中注销模块
      await this.unregisterModule(moduleName);
      
      // 卸载npm包
      execSync(`pnpm remove @creatoria-saas/${moduleName}`, { 
        cwd: this.projectPath, 
        stdio: 'inherit' 
      });
      
      console.log(chalk.green(`✅ 模块 ${moduleName} 卸载成功`));
    } catch (error) {
      console.error(chalk.red(`❌ 模块卸载失败: ${error.message}`));
      throw error;
    }
  }

  /**
   * 列出已安装的模块
   */
  async listModules(): Promise<ModuleConfig[]> {
    const modules: ModuleConfig[] = [];
    
    if (!fs.existsSync(this.modulesPath)) {
      return modules;
    }
    
    const items = fs.readdirSync(this.modulesPath);
    for (const item of items) {
      const modulePath = path.join(this.modulesPath, item);
      if (fs.statSync(modulePath).isDirectory()) {
        try {
          const config = await this.getModuleConfig(item);
          modules.push(config);
        } catch (error) {
          // 忽略无效模块
        }
      }
    }
    
    return modules;
  }

  /**
   * 获取模块配置
   */
  private async getModuleConfig(moduleName: string): Promise<ModuleConfig> {
    const modulePath = path.join(this.modulesPath, moduleName);
    const configPath = path.join(modulePath, 'module.json');
    
    if (!fs.existsSync(configPath)) {
      throw new Error(`模块 ${moduleName} 缺少 module.json 配置文件`);
    }
    
    return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  }

  /**
   * 检查模块依赖
   */
  private async checkDependencies(config: ModuleConfig): Promise<void> {
    if (!config.dependencies) {
      return;
    }
    
    // 检查模块依赖
    if (config.dependencies.modules) {
      for (const dep of config.dependencies.modules) {
        const depPath = path.join(this.modulesPath, dep);
        if (!fs.existsSync(depPath)) {
          throw new Error(`缺少依赖模块: ${dep}，请先安装`);
        }
      }
    }
  }

  /**
   * 注册模块到项目
   */
  private async registerModule(moduleName: string, config: ModuleConfig): Promise<void> {
    const appModulePath = path.join(this.projectPath, 'src', 'app.module.ts');
    
    if (!fs.existsSync(appModulePath)) {
      console.log(chalk.yellow('⚠️  未找到 app.module.ts，跳过自动注册'));
      return;
    }
    
    // 这里可以实现自动注册逻辑
    // 暂时只输出提示
    console.log(chalk.cyan(`
请手动在 app.module.ts 中注册模块:

import { ${this.toPascalCase(moduleName)}Module } from '@creatoria-saas/${moduleName}';

@Module({
  imports: [
    // ...
    ${this.toPascalCase(moduleName)}Module,
  ],
})
export class AppModule {}
    `));
  }

  /**
   * 从项目中注销模块
   */
  private async unregisterModule(moduleName: string): Promise<void> {
    console.log(chalk.cyan(`请手动从 app.module.ts 中移除 ${this.toPascalCase(moduleName)}Module`));
  }

  /**
   * 查找依赖指定模块的其他模块
   */
  private async findDependents(moduleName: string): Promise<string[]> {
    const dependents: string[] = [];
    const modules = await this.listModules();
    
    for (const module of modules) {
      if (module.dependencies?.modules?.includes(moduleName)) {
        dependents.push(module.name);
      }
    }
    
    return dependents;
  }

  /**
   * 转换为帕斯卡命名
   */
  private toPascalCase(str: string): string {
    return str.replace(/(^|[-_])(\w)/g, (_, __, char) => char.toUpperCase());
  }
}