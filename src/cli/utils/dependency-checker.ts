import * as fs from 'fs-extra';
import * as path from 'path';
const chalk = require('chalk');

export interface ModuleDependency {
  modules: string[];
  packages: Record<string, string>;
}

export interface ModuleInfo {
  name: string;
  version: string;
  dependencies: ModuleDependency;
}

export class DependencyChecker {
  private installedModules: Set<string> = new Set();
  private moduleRegistry: Map<string, ModuleInfo> = new Map();

  constructor(
    private projectPath: string,
    private modulesRepoPath: string
  ) {}

  /**
   * 初始化：读取已安装的模块和模块注册表
   */
  async initialize(): Promise<void> {
    // 读取项目配置文件，获取已安装的模块
    const configPath = path.join(this.projectPath, 'creatoria.config.json');
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      if (config.modules && Array.isArray(config.modules)) {
        config.modules.forEach((mod: string) => this.installedModules.add(mod));
      }
    }

    // 读取模块注册表
    const registryPath = path.join(this.modulesRepoPath, 'registry.json');
    if (fs.existsSync(registryPath)) {
      const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
      if (registry.modules) {
        for (const [name, info] of Object.entries(registry.modules)) {
          // 读取每个模块的module.json获取详细信息
          const moduleJsonPath = path.join(this.modulesRepoPath, (info as any).path, 'module.json');
          if (fs.existsSync(moduleJsonPath)) {
            const moduleData = JSON.parse(fs.readFileSync(moduleJsonPath, 'utf8'));
            this.moduleRegistry.set(name, {
              name: moduleData.name,
              version: moduleData.version,
              dependencies: moduleData.dependencies || { modules: [], packages: {} }
            });
          }
        }
      }
    }
  }

  /**
   * 检查模块依赖
   */
  async checkDependencies(moduleName: string): Promise<{
    valid: boolean;
    missingModules: string[];
    circularDependency: boolean;
    dependencyChain: string[];
  }> {
    const result = {
      valid: true,
      missingModules: [] as string[],
      circularDependency: false,
      dependencyChain: [] as string[]
    };

    // 获取模块信息
    const moduleInfo = this.moduleRegistry.get(moduleName);
    if (!moduleInfo) {
      console.error(chalk.red(`Module ${moduleName} not found in registry`));
      result.valid = false;
      return result;
    }

    // 检查模块依赖
    const moduleDeps = moduleInfo.dependencies.modules || [];
    for (const dep of moduleDeps) {
      if (!this.installedModules.has(dep)) {
        result.missingModules.push(dep);
      }
    }

    // 检查循环依赖
    const visited = new Set<string>();
    const recursionStack = new Set<string>();
    result.circularDependency = this.hasCircularDependency(
      moduleName,
      visited,
      recursionStack,
      result.dependencyChain
    );

    if (result.missingModules.length > 0 || result.circularDependency) {
      result.valid = false;
    }

    return result;
  }

  /**
   * 检测循环依赖
   */
  private hasCircularDependency(
    moduleName: string,
    visited: Set<string>,
    recursionStack: Set<string>,
    chain: string[]
  ): boolean {
    visited.add(moduleName);
    recursionStack.add(moduleName);
    chain.push(moduleName);

    const moduleInfo = this.moduleRegistry.get(moduleName);
    if (moduleInfo && moduleInfo.dependencies.modules) {
      for (const dep of moduleInfo.dependencies.modules) {
        if (!visited.has(dep)) {
          if (this.hasCircularDependency(dep, visited, recursionStack, chain)) {
            return true;
          }
        } else if (recursionStack.has(dep)) {
          // 发现循环依赖
          chain.push(dep); // 添加循环点
          return true;
        }
      }
    }

    recursionStack.delete(moduleName);
    if (!chain[chain.length - 1].includes('->')) {
      chain.pop(); // 如果没有循环，移除当前节点
    }
    return false;
  }

  /**
   * 获取模块的所有依赖（递归）
   */
  getAllDependencies(moduleName: string): {
    modules: Set<string>;
    packages: Record<string, string>;
  } {
    const allModules = new Set<string>();
    const allPackages: Record<string, string> = {};
    const visited = new Set<string>();

    this.collectDependencies(moduleName, allModules, allPackages, visited);

    return { modules: allModules, packages: allPackages };
  }

  private collectDependencies(
    moduleName: string,
    modules: Set<string>,
    packages: Record<string, string>,
    visited: Set<string>
  ): void {
    if (visited.has(moduleName)) return;
    visited.add(moduleName);

    const moduleInfo = this.moduleRegistry.get(moduleName);
    if (!moduleInfo) return;

    // 添加模块依赖
    if (moduleInfo.dependencies.modules) {
      for (const dep of moduleInfo.dependencies.modules) {
        modules.add(dep);
        this.collectDependencies(dep, modules, packages, visited);
      }
    }

    // 合并包依赖
    if (moduleInfo.dependencies.packages) {
      Object.assign(packages, moduleInfo.dependencies.packages);
    }
  }

  /**
   * 打印依赖检查报告
   */
  printDependencyReport(
    moduleName: string,
    checkResult: {
      valid: boolean;
      missingModules: string[];
      circularDependency: boolean;
      dependencyChain: string[];
    }
  ): void {
    console.log(chalk.blue('\n依赖检查报告:'));
    console.log(chalk.gray('─'.repeat(60)));

    if (checkResult.valid) {
      console.log(chalk.green('✅ 所有依赖检查通过'));
    } else {
      if (checkResult.missingModules.length > 0) {
        console.log(chalk.yellow('⚠️  缺失的依赖模块:'));
        checkResult.missingModules.forEach(mod => {
          console.log(chalk.yellow(`   - ${mod}`));
        });
        console.log(chalk.gray('\n请先安装这些模块:'));
        checkResult.missingModules.forEach(mod => {
          console.log(chalk.cyan(`   creatoria-saas module add ${mod}`));
        });
      }

      if (checkResult.circularDependency) {
        console.log(chalk.red('❌ 检测到循环依赖:'));
        console.log(chalk.red(`   ${checkResult.dependencyChain.join(' → ')}`));
      }
    }

    console.log(chalk.gray('─'.repeat(60)));
  }
}