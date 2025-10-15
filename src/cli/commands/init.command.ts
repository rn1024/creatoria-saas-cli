import { Injectable } from '@nestjs/common';
import * as fs from 'fs-extra';
import * as path from 'path';
import { spawn } from 'child_process';
const chalk = require('chalk');

interface ModuleInitInfo {
  name: string;
  priority: number;
  script: string;
  path: string;
}

@Injectable()
export class InitCommand {
  async run(args: string[], options: any): Promise<void> {
    const skipDb = options.skipDb || false;
    const skipSeed = options.skipSeed || false;
    const specificModules = options.modules ? options.modules.split(',') : null;
    
    console.log(chalk.blue('🚀 Initializing Creatoria SaaS project...'));
    
    try {
      // 1. Check if we're in a Creatoria SaaS project
      const configPath = path.resolve(process.cwd(), 'creatoria.config.json');
      if (!fs.existsSync(configPath)) {
        throw new Error('Not in a Creatoria SaaS project directory. Please run this command from your project root.');
      }
      
      // 2. Read configuration
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      
      if (config.database && config.database.initialized) {
        const answer = await this.promptUser('Project already initialized. Reinitialize? (y/N): ');
        if (answer.toLowerCase() !== 'y') {
          console.log(chalk.yellow('Initialization cancelled.'));
          return;
        }
      }
      
      // 3. Get installed modules
      const installedModules = config.modules || [];
      if (installedModules.length === 0) {
        console.log(chalk.yellow('No modules installed. Nothing to initialize.'));
        return;
      }
      
      // 4. Filter modules if specific ones requested
      const modulesToInit = specificModules 
        ? installedModules.filter((m: string) => specificModules.includes(m))
        : installedModules;
      
      console.log(chalk.gray(`Found ${modulesToInit.length} module(s) to initialize: ${modulesToInit.join(', ')}`));
      
      // 5. Collect module init info
      const moduleInitInfos: ModuleInitInfo[] = [];
      
      for (const moduleName of modulesToInit) {
        const modulePath = path.resolve(process.cwd(), 'src/modules', moduleName);
        const moduleJsonPath = path.join(modulePath, 'module.json');
        
        if (fs.existsSync(moduleJsonPath)) {
          const moduleJson = JSON.parse(fs.readFileSync(moduleJsonPath, 'utf8'));
          
          if (moduleJson.init) {
            const initScriptPath = path.join(modulePath, moduleJson.init.script || 'init.js');
            
            if (fs.existsSync(initScriptPath)) {
              moduleInitInfos.push({
                name: moduleName,
                priority: moduleJson.init.priority || 100,
                script: initScriptPath,
                path: modulePath
              });
            } else {
              console.log(chalk.yellow(`⚠️  Init script not found for ${moduleName}: ${initScriptPath}`));
            }
          }
        }
      }
      
      // 6. Sort by priority (lower number = higher priority = runs first)
      moduleInitInfos.sort((a, b) => a.priority - b.priority);
      
      console.log(chalk.blue('\n📋 Initialization order:'));
      moduleInitInfos.forEach((info, index) => {
        console.log(chalk.gray(`  ${index + 1}. ${info.name} (priority: ${info.priority})`));
      });
      
      // 7. Execute initialization scripts
      console.log(chalk.blue('\n🔧 Running initialization scripts...'));
      
      for (const moduleInfo of moduleInitInfos) {
        console.log(chalk.cyan(`\n▶ Initializing ${moduleInfo.name}...`));
        
        try {
          // Check if migrations should be run
          if (!skipDb) {
            await this.runMigrations(moduleInfo);
          }
          
          // Check if seeds should be run
          if (!skipSeed) {
            await this.runSeeds(moduleInfo);
          }
          
          // Run init script
          await this.runInitScript(moduleInfo);
          
          console.log(chalk.green(`✅ ${moduleInfo.name} initialized successfully`));
        } catch (error) {
          console.error(chalk.red(`❌ Failed to initialize ${moduleInfo.name}:`), error.message);
          
          // Ask whether to continue
          const answer = await this.promptUser('Continue with other modules? (Y/n): ');
          if (answer.toLowerCase() === 'n') {
            throw new Error('Initialization aborted by user');
          }
        }
      }
      
      // 8. Update configuration
      config.database = config.database || {};
      config.database.initialized = true;
      config.database.initializedAt = new Date().toISOString();
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
      
      console.log(chalk.green('\n✨ Initialization complete!'));
      console.log(chalk.gray('Your project is ready to use.'));
      
    } catch (error) {
      console.error(chalk.red('Initialization failed:'), error.message);
      process.exit(1);
    }
  }
  
  /**
   * Run database migrations for a module
   */
  private async runMigrations(moduleInfo: ModuleInitInfo): Promise<void> {
    const migrationsPath = path.join(moduleInfo.path, 'migrations');
    
    if (!fs.existsSync(migrationsPath)) {
      console.log(chalk.gray(`  No migrations found for ${moduleInfo.name}`));
      return;
    }
    
    const migrationFiles = fs.readdirSync(migrationsPath)
      .filter(f => f.endsWith('.sql'))
      .sort();
    
    if (migrationFiles.length === 0) {
      console.log(chalk.gray(`  No migration files found for ${moduleInfo.name}`));
      return;
    }
    
    console.log(chalk.gray(`  Running ${migrationFiles.length} migration(s)...`));
    
    for (const file of migrationFiles) {
      const filePath = path.join(migrationsPath, file);
      console.log(chalk.gray(`    - ${file}`));
      // TODO: Execute SQL file against database
      // This would require database connection configuration
      // For now, we'll just log that it would be executed
      console.log(chalk.yellow(`    ⚠️  Migration execution not implemented yet`));
    }
  }
  
  /**
   * Run seed data for a module
   */
  private async runSeeds(moduleInfo: ModuleInitInfo): Promise<void> {
    const seedsPath = path.join(moduleInfo.path, 'seeds');
    
    if (!fs.existsSync(seedsPath)) {
      console.log(chalk.gray(`  No seeds found for ${moduleInfo.name}`));
      return;
    }
    
    const seedFiles = fs.readdirSync(seedsPath)
      .filter(f => f.endsWith('.sql') || f.endsWith('.js'))
      .sort();
    
    if (seedFiles.length === 0) {
      console.log(chalk.gray(`  No seed files found for ${moduleInfo.name}`));
      return;
    }
    
    console.log(chalk.gray(`  Running ${seedFiles.length} seed file(s)...`));
    
    for (const file of seedFiles) {
      const filePath = path.join(seedsPath, file);
      console.log(chalk.gray(`    - ${file}`));
      
      if (file.endsWith('.js')) {
        // Execute JavaScript seed file
        try {
          const seedModule = require(filePath);
          if (typeof seedModule.run === 'function') {
            await seedModule.run();
            console.log(chalk.green(`    ✓ ${file} executed`));
          } else {
            console.log(chalk.yellow(`    ⚠️  ${file} does not export a run function`));
          }
        } catch (error) {
          console.error(chalk.red(`    ✗ ${file} failed:`), error.message);
        }
      } else {
        // SQL file
        console.log(chalk.yellow(`    ⚠️  SQL seed execution not implemented yet`));
      }
    }
  }
  
  /**
   * Run module initialization script
   */
  private async runInitScript(moduleInfo: ModuleInitInfo): Promise<void> {
    if (!fs.existsSync(moduleInfo.script)) {
      console.log(chalk.gray(`  No init script found at ${moduleInfo.script}`));
      return;
    }
    
    console.log(chalk.gray(`  Running init script...`));
    
    return new Promise((resolve, reject) => {
      const child = spawn('node', [moduleInfo.script], {
        cwd: moduleInfo.path,
        stdio: 'inherit'
      });
      
      child.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Init script exited with code ${code}`));
        }
      });
      
      child.on('error', (error) => {
        reject(error);
      });
    });
  }
  
  /**
   * Simple prompt utility
   */
  private promptUser(question: string): Promise<string> {
    return new Promise((resolve) => {
      process.stdout.write(chalk.cyan(question));
      process.stdin.once('data', (data) => {
        resolve(data.toString().trim());
      });
    });
  }
}