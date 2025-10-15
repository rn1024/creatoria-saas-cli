import { Injectable, Logger } from '@nestjs/common';
import * as chokidar from 'chokidar';
import * as path from 'path';
import * as fs from 'fs-extra';
const chalk = require('chalk');

@Injectable()
export class HotReloadService {
  private readonly logger = new Logger(HotReloadService.name);
  private watchers: Map<string, chokidar.FSWatcher> = new Map();
  private moduleCache: Map<string, any> = new Map();
  private reloadCallbacks: Map<string, () => Promise<void>> = new Map();

  /**
   * Start watching a module for changes
   */
  async watchModule(modulePath: string, moduleName: string): Promise<void> {
    // Stop existing watcher if present
    if (this.watchers.has(moduleName)) {
      await this.stopWatching(moduleName);
    }

    console.log(chalk.blue(`🔄 Watching module: ${moduleName}`));

    // Create watcher for module files
    const watcher = chokidar.watch(modulePath, {
      ignored: [
        /(^|[\/\\])\../, // ignore dotfiles
        /node_modules/,
        /dist/,
        /coverage/,
        /\.spec\.ts$/,
        /\.test\.ts$/,
      ],
      persistent: true,
      ignoreInitial: true,
      awaitWriteFinish: {
        stabilityThreshold: 300,
        pollInterval: 100,
      },
    });

    // Handle file changes
    watcher
      .on('change', async (filePath) => {
        console.log(chalk.yellow(`📝 File changed: ${path.relative(modulePath, filePath)}`));
        await this.reloadModule(moduleName);
      })
      .on('add', async (filePath) => {
        console.log(chalk.green(`➕ File added: ${path.relative(modulePath, filePath)}`));
        await this.reloadModule(moduleName);
      })
      .on('unlink', async (filePath) => {
        console.log(chalk.red(`➖ File removed: ${path.relative(modulePath, filePath)}`));
        await this.reloadModule(moduleName);
      })
      .on('error', (error) => {
        console.error(chalk.red(`❌ Watcher error for ${moduleName}:`), error);
      });

    this.watchers.set(moduleName, watcher);
  }

  /**
   * Stop watching a module
   */
  async stopWatching(moduleName: string): Promise<void> {
    const watcher = this.watchers.get(moduleName);
    if (watcher) {
      await watcher.close();
      this.watchers.delete(moduleName);
      console.log(chalk.gray(`⏹️  Stopped watching: ${moduleName}`));
    }
  }

  /**
   * Stop all watchers
   */
  async stopAll(): Promise<void> {
    for (const [moduleName, watcher] of this.watchers.entries()) {
      await watcher.close();
      console.log(chalk.gray(`⏹️  Stopped watching: ${moduleName}`));
    }
    this.watchers.clear();
  }

  /**
   * Register a reload callback for a module
   */
  registerReloadCallback(moduleName: string, callback: () => Promise<void>): void {
    this.reloadCallbacks.set(moduleName, callback);
  }

  /**
   * Reload a specific module
   */
  private async reloadModule(moduleName: string): Promise<void> {
    try {
      console.log(chalk.cyan(`♻️  Reloading module: ${moduleName}`));

      // Clear module from Node.js require cache
      this.clearModuleCache(moduleName);

      // Execute registered callback if exists
      const callback = this.reloadCallbacks.get(moduleName);
      if (callback) {
        await callback();
      }

      // Emit reload event (for framework integration)
      this.emitReloadEvent(moduleName);

      console.log(chalk.green(`✅ Module reloaded: ${moduleName}`));
    } catch (error) {
      console.error(chalk.red(`❌ Failed to reload module ${moduleName}:`), error.message);
    }
  }

  /**
   * Clear module from Node.js require cache
   */
  private clearModuleCache(moduleName: string): void {
    const projectRoot = process.cwd();
    const modulePattern = path.join(projectRoot, 'src', 'modules', moduleName);
    
    // Clear all cached modules matching the pattern
    Object.keys(require.cache).forEach((key) => {
      if (key.includes(modulePattern)) {
        delete require.cache[key];
      }
    });

    // Clear from our internal cache
    this.moduleCache.delete(moduleName);
  }

  /**
   * Emit reload event for framework integration
   */
  private emitReloadEvent(moduleName: string): void {
    // This can be integrated with NestJS or other frameworks
    // to trigger module recompilation
    process.emit('module:reload' as any, moduleName);
  }

  /**
   * Get watcher status
   */
  getStatus(): { active: string[]; total: number } {
    return {
      active: Array.from(this.watchers.keys()),
      total: this.watchers.size,
    };
  }

  /**
   * Enable hot reload for all modules in a project
   */
  async enableProjectHotReload(): Promise<void> {
    const projectRoot = process.cwd();
    const modulesPath = path.join(projectRoot, 'src', 'modules');
    
    if (!await fs.pathExists(modulesPath)) {
      console.log(chalk.yellow('No modules directory found'));
      return;
    }

    const modules = await fs.readdir(modulesPath);
    
    for (const moduleName of modules) {
      const modulePath = path.join(modulesPath, moduleName);
      const stats = await fs.stat(modulePath);
      
      if (stats.isDirectory()) {
        await this.watchModule(modulePath, moduleName);
      }
    }

    console.log(chalk.green(`\n✨ Hot reload enabled for ${modules.length} modules`));
    console.log(chalk.gray('Press Ctrl+C to stop watching\n'));
  }
}