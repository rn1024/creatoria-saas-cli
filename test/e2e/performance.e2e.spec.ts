/**
 * 性能基准E2E测试
 */

import { TestHelper } from '../utils/test-helper';
import * as path from 'path';
import * as fs from 'fs-extra';
import { spawn } from 'child_process';

describe('Performance Benchmarks E2E', () => {
  let testDir: string;
  let cliPath: string;
  let cliOptimizedPath: string;

  beforeAll(async () => {
    // 构建CLI
    const { exec } = require('child_process');
    const { promisify } = require('util');
    const execAsync = promisify(exec);
    
    await execAsync('npm run build');
    cliPath = path.join(process.cwd(), 'dist', 'src', 'main.js');
    cliOptimizedPath = path.join(process.cwd(), 'dist', 'src', 'main-optimized.js');
  });

  beforeEach(async () => {
    testDir = await TestHelper.createTempDir('e2e-performance');
  });

  afterEach(async () => {
    await TestHelper.cleanupTempDir();
  });

  describe('启动性能测试', () => {
    it('应该在可接受时间内启动CLI', async () => {
      const measurements: number[] = [];
      const iterations = 5;

      for (let i = 0; i < iterations; i++) {
        const startTime = Date.now();
        const result = await runCliCommand(['--version']);
        const duration = Date.now() - startTime;
        
        expect(result.exitCode).toBe(0);
        measurements.push(duration);
      }

      const avgTime = measurements.reduce((a, b) => a + b, 0) / measurements.length;
      const maxTime = Math.max(...measurements);
      const minTime = Math.min(...measurements);

      console.log(`启动性能统计:`);
      console.log(`  平均时间: ${avgTime.toFixed(2)}ms`);
      console.log(`  最小时间: ${minTime}ms`);
      console.log(`  最大时间: ${maxTime}ms`);

      // 性能断言
      expect(avgTime).toBeLessThan(2000); // 平均启动时间小于2秒
      expect(maxTime).toBeLessThan(3000); // 最大启动时间小于3秒
    });

    it('应该比较普通版和优化版性能', async () => {
      if (!await fs.pathExists(cliOptimizedPath)) {
        console.log('Optimized version not found, skipping comparison');
        return;
      }

      const normalTimes: number[] = [];
      const optimizedTimes: number[] = [];
      const iterations = 3;

      // 测试普通版
      for (let i = 0; i < iterations; i++) {
        const startTime = Date.now();
        await runCliCommand(['--help'], cliPath);
        normalTimes.push(Date.now() - startTime);
      }

      // 测试优化版
      for (let i = 0; i < iterations; i++) {
        const startTime = Date.now();
        await runCliCommand(['--help'], cliOptimizedPath);
        optimizedTimes.push(Date.now() - startTime);
      }

      const avgNormal = normalTimes.reduce((a, b) => a + b, 0) / normalTimes.length;
      const avgOptimized = optimizedTimes.reduce((a, b) => a + b, 0) / optimizedTimes.length;
      const improvement = ((avgNormal - avgOptimized) / avgNormal * 100).toFixed(1);

      console.log(`版本性能对比:`);
      console.log(`  普通版: ${avgNormal.toFixed(2)}ms`);
      console.log(`  优化版: ${avgOptimized.toFixed(2)}ms`);
      console.log(`  性能提升: ${improvement}%`);

      // 优化版应该更快
      expect(avgOptimized).toBeLessThanOrEqual(avgNormal);
    });
  });

  describe('命令执行性能', () => {
    it('应该快速列出模块', async () => {
      const projectPath = path.join(testDir, 'perf-project');
      
      // 创建项目和多个模块
      await createProjectWithModules(projectPath, 10);
      process.chdir(projectPath);

      // 测试列出模块的性能
      const startTime = Date.now();
      const result = await runCliCommand(['module', 'list']);
      const duration = Date.now() - startTime;

      expect(result.exitCode).toBe(0);
      expect(duration).toBeLessThan(1000); // 列出10个模块应该小于1秒
      
      console.log(`列出${10}个模块耗时: ${duration}ms`);
    });

    it('应该高效处理大量配置', async () => {
      const projectPath = path.join(testDir, 'config-project');
      await createProjectWithConfig(projectPath, 100);
      process.chdir(projectPath);

      // 测试读取配置的性能
      const startTime = Date.now();
      const result = await runCliCommand(['config', 'show']);
      const duration = Date.now() - startTime;

      expect(result.exitCode).toBe(0);
      expect(duration).toBeLessThan(500); // 读取100个配置项应该小于500ms
      
      console.log(`读取${100}个配置项耗时: ${duration}ms`);
    });
  });

  describe('文件操作性能', () => {
    it('应该高效复制大模块', async () => {
      const projectPath = path.join(testDir, 'copy-project');
      const largeModulePath = await createLargeModule('large-module', 100); // 100个文件
      
      await createProject(projectPath);
      process.chdir(projectPath);

      // 测试复制大模块的性能
      const startTime = Date.now();
      const result = await runCliCommand([
        'module', 'add', 'large-module',
        '--source', largeModulePath,
        '--skip-install',
      ]);
      const duration = Date.now() - startTime;

      expect(result.exitCode).toBe(0);
      expect(duration).toBeLessThan(5000); // 复制100个文件应该小于5秒
      
      console.log(`复制包含${100}个文件的模块耗时: ${duration}ms`);
    });

    it('应该并行处理多个模块操作', async () => {
      const projectPath = path.join(testDir, 'parallel-project');
      await createProject(projectPath);
      process.chdir(projectPath);

      // 创建多个小模块
      const moduleCount = 5;
      const modules: string[] = [];
      
      for (let i = 0; i < moduleCount; i++) {
        const modulePath = await createTestModule(`module-${i}`);
        modules.push(modulePath);
      }

      // 串行添加模块（基准）
      const serialStartTime = Date.now();
      for (const modulePath of modules) {
        const moduleName = path.basename(modulePath);
        await runCliCommand([
          'module', 'add', moduleName,
          '--source', modulePath,
          '--skip-install',
        ]);
      }
      const serialDuration = Date.now() - serialStartTime;

      // 清理模块
      for (let i = 0; i < moduleCount; i++) {
        await fs.remove(path.join(projectPath, 'modules', `module-${i}`));
      }

      // 并行添加模块（如果支持）
      const parallelStartTime = Date.now();
      const promises = modules.map((modulePath) => {
        const moduleName = path.basename(modulePath);
        return runCliCommand([
          'module', 'add', moduleName,
          '--source', modulePath,
          '--skip-install',
        ]);
      });
      await Promise.all(promises);
      const parallelDuration = Date.now() - parallelStartTime;

      console.log(`模块操作性能:`);
      console.log(`  串行添加${moduleCount}个模块: ${serialDuration}ms`);
      console.log(`  并行添加${moduleCount}个模块: ${parallelDuration}ms`);
      
      // 并行应该更快或至少不慢
      expect(parallelDuration).toBeLessThanOrEqual(serialDuration * 1.2);
    });
  });

  describe('内存使用测试', () => {
    it('应该保持合理的内存使用', async () => {
      const projectPath = path.join(testDir, 'memory-project');
      await createProject(projectPath);
      process.chdir(projectPath);

      // 记录初始内存
      const initialMemory = process.memoryUsage().heapUsed;
      
      // 执行多个操作
      const operations = [
        ['config', 'show'],
        ['module', 'list'],
        ['config', 'validate'],
        ['--help'],
        ['--version'],
      ];

      for (const op of operations) {
        await runCliCommand(op);
      }

      // 强制垃圾回收
      if (global.gc) {
        global.gc();
      }

      // 记录结束内存
      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = (finalMemory - initialMemory) / 1024 / 1024; // MB

      console.log(`内存使用:`);
      console.log(`  初始: ${(initialMemory / 1024 / 1024).toFixed(2)}MB`);
      console.log(`  结束: ${(finalMemory / 1024 / 1024).toFixed(2)}MB`);
      console.log(`  增加: ${memoryIncrease.toFixed(2)}MB`);

      // 内存增加应该在合理范围内
      expect(memoryIncrease).toBeLessThan(50); // 小于50MB
    });
  });

  describe('并发性能测试', () => {
    it('应该处理并发命令执行', async () => {
      const projectPath = path.join(testDir, 'concurrent-project');
      await createProject(projectPath);
      process.chdir(projectPath);

      const concurrentCommands = [
        ['config', 'show'],
        ['module', 'list'],
        ['--version'],
        ['--help'],
      ];

      // 并发执行命令
      const startTime = Date.now();
      const results = await Promise.all(
        concurrentCommands.map(cmd => runCliCommand(cmd)),
      );
      const duration = Date.now() - startTime;

      // 验证所有命令都成功
      results.forEach(result => {
        expect(result.exitCode).toBe(0);
      });

      console.log(`并发执行${concurrentCommands.length}个命令耗时: ${duration}ms`);
      
      // 并发执行应该在合理时间内
      expect(duration).toBeLessThan(3000);
    });
  });

  // 辅助函数
  async function runCliCommand(
    args: string[],
    customCliPath?: string,
  ): Promise<{ stdout: string; stderr: string; exitCode: number }> {
    return new Promise((resolve) => {
      const child = spawn('node', [customCliPath || cliPath, ...args], {
        env: { ...process.env, NODE_ENV: 'test' },
      });

      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('close', (code) => {
        resolve({ stdout, stderr, exitCode: code || 0 });
      });
    });
  }

  async function createProject(projectPath: string): Promise<void> {
    await fs.ensureDir(projectPath);
    await fs.writeJSON(path.join(projectPath, 'package.json'), {
      name: path.basename(projectPath),
      version: '1.0.0',
    });
    await fs.ensureDir(path.join(projectPath, '.creatoria'));
    await fs.writeJSON(path.join(projectPath, '.creatoria', 'config.json'), {
      version: '1.0.0',
      modules: [],
    });
    await fs.ensureDir(path.join(projectPath, 'modules'));
  }

  async function createProjectWithModules(
    projectPath: string,
    moduleCount: number,
  ): Promise<void> {
    await createProject(projectPath);
    
    const modules: string[] = [];
    for (let i = 0; i < moduleCount; i++) {
      const moduleName = `module-${i}`;
      const modulePath = path.join(projectPath, 'modules', moduleName);
      await fs.ensureDir(modulePath);
      await fs.writeJSON(path.join(modulePath, 'package.json'), {
        name: moduleName,
        version: '1.0.0',
      });
      modules.push(moduleName);
    }
    
    const config = await fs.readJSON(path.join(projectPath, '.creatoria', 'config.json'));
    config.modules = modules;
    await fs.writeJSON(path.join(projectPath, '.creatoria', 'config.json'), config);
  }

  async function createProjectWithConfig(
    projectPath: string,
    configCount: number,
  ): Promise<void> {
    await createProject(projectPath);
    
    const config: any = {
      version: '1.0.0',
      modules: [],
    };
    
    for (let i = 0; i < configCount; i++) {
      config[`config_${i}`] = {
        value: `value_${i}`,
        enabled: i % 2 === 0,
        priority: i,
      };
    }
    
    await fs.writeJSON(path.join(projectPath, '.creatoria', 'config.json'), config);
  }

  async function createTestModule(name: string): Promise<string> {
    const modulePath = path.join(testDir, 'test-modules', name);
    await fs.ensureDir(modulePath);
    await fs.writeJSON(path.join(modulePath, 'package.json'), {
      name,
      version: '1.0.0',
    });
    await fs.writeFile(path.join(modulePath, 'index.ts'), 'export {};');
    return modulePath;
  }

  async function createLargeModule(
    name: string,
    fileCount: number,
  ): Promise<string> {
    const modulePath = await createTestModule(name);
    
    // 创建多个文件
    for (let i = 0; i < fileCount; i++) {
      const content = `export const file${i} = '${Math.random().toString(36).repeat(100)}';`;
      await fs.writeFile(path.join(modulePath, `file-${i}.ts`), content);
    }
    
    return modulePath;
  }
});
