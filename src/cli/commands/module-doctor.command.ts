import { Command } from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import * as chalk from 'chalk';

export class ModuleDoctorCommand {
  /**
   * 诊断模块健康状态
   */
  static register(program: Command) {
    program
      .command('module:doctor [module-name]')
      .description('诊断模块健康状态')
      .action(async (moduleName?: string) => {
        console.log('🔍 开始模块健康检查...');
        
        if (moduleName) {
          await this.checkModule(moduleName);
        } else {
          await this.checkAllModules();
        }
      });
  }

  static async checkModule(moduleName: string) {
    const modulePath = path.join(process.cwd(), 'node_modules', `@creatoria-saas/${moduleName}`);
    
    if (!fs.existsSync(modulePath)) {
      console.log(chalk.red(`❌ 模块 ${moduleName} 未安装`));
      return;
    }

    console.log(chalk.green(`\n检查模块: ${moduleName}`));
    
    // 检查必要文件
    const checks = [
      { file: 'module.json', required: true, desc: '模块元数据' },
      { file: 'package.json', required: true, desc: '包配置' },
      { file: 'src/entities', required: true, desc: '实体定义' },
      { file: 'src/dto', required: true, desc: 'DTO定义' },
    ];

    let healthy = true;
    for (const check of checks) {
      const filePath = path.join(modulePath, check.file);
      const exists = fs.existsSync(filePath);
      
      if (exists) {
        console.log(chalk.green(`  ✓ ${check.desc}`));
      } else if (check.required) {
        console.log(chalk.red(`  ✗ ${check.desc} 缺失`));
        healthy = false;
      } else {
        console.log(chalk.yellow(`  ⚠ ${check.desc} 缺失（可选）`));
      }
    }

    // 检查依赖
    await this.checkDependencies(modulePath);

    if (healthy) {
      console.log(chalk.green(`\n✅ 模块 ${moduleName} 状态健康`));
    } else {
      console.log(chalk.red(`\n❌ 模块 ${moduleName} 存在问题，请修复`));
    }
  }

  static async checkAllModules() {
    const packagesPath = path.join(process.cwd(), 'node_modules', '@creatoria-saas');
    
    if (!fs.existsSync(packagesPath)) {
      console.log(chalk.yellow('未发现已安装的模块'));
      return;
    }

    const modules = fs.readdirSync(packagesPath)
      .filter(item => fs.statSync(path.join(packagesPath, item)).isDirectory());

    for (const module of modules) {
      await this.checkModule(module);
    }
  }

  static async checkDependencies(modulePath: string) {
    const moduleJsonPath = path.join(modulePath, 'module.json');
    
    if (!fs.existsSync(moduleJsonPath)) {
      return;
    }

    try {
      const moduleConfig = JSON.parse(fs.readFileSync(moduleJsonPath, 'utf-8'));
      
      if (moduleConfig.dependencies) {
        console.log(chalk.cyan('  依赖检查:'));
        
        // 检查系统依赖
        if (moduleConfig.dependencies.system) {
          for (const dep of moduleConfig.dependencies.system) {
            console.log(chalk.gray(`    - 系统功能: ${dep}`));
          }
        }
        
        // 检查模块依赖
        if (moduleConfig.dependencies.modules) {
          for (const dep of moduleConfig.dependencies.modules) {
            const depPath = path.join(process.cwd(), 'node_modules', `@creatoria-saas/${dep}`);
            if (fs.existsSync(depPath)) {
              console.log(chalk.green(`    ✓ 模块依赖: ${dep}`));
            } else {
              console.log(chalk.red(`    ✗ 模块依赖: ${dep} (未安装)`));
            }
          }
        }
      }
    } catch (error) {
      console.log(chalk.red('  无法读取模块配置'));
    }
  }
}