/**
 * 完整工作流E2E测试
 */

import { TestHelper } from '../utils/test-helper';
import { Assertions } from '../utils/assertions';
import * as path from 'path';
import * as fs from 'fs-extra';
import { spawn } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(require('child_process').exec);

describe('Complete Workflow E2E', () => {
  let testDir: string;
  let cliPath: string;

  beforeAll(async () => {
    // 构建CLI
    await execAsync('npm run build');
    cliPath = path.join(process.cwd(), 'dist', 'src', 'main.js');
  });

  beforeEach(async () => {
    testDir = await TestHelper.createTempDir('e2e-workflow');
    process.chdir(testDir);
  });

  afterEach(async () => {
    process.chdir(process.cwd());
    await TestHelper.cleanupTempDir();
  });

  describe('项目创建到部署全流程', () => {
    it('应该完成从创建到运行的完整流程', async () => {
      const projectName = 'e2e-project';
      const projectPath = path.join(testDir, projectName);

      // Step 1: 创建项目
      console.log('Step 1: Creating project...');
      const createResult = await runCli(['create', projectName, '--skip-install']);
      expect(createResult.exitCode).toBe(0);
      expect(await fs.pathExists(projectPath)).toBe(true);

      // 切换到项目目录
      process.chdir(projectPath);

      // Step 2: 初始化项目
      console.log('Step 2: Initializing project...');
      const initResult = await runCli(['init', '--skip-install']);
      expect(initResult.exitCode).toBe(0);
      expect(await fs.pathExists(path.join(projectPath, '.creatoria'))).toBe(true);

      // Step 3: 添加模块
      console.log('Step 3: Adding modules...');
      
      // 创建测试模块
      const moduleSource = await createTestModule('test-module');
      const addModuleResult = await runCli([
        'module', 'add', 'test-module',
        '--source', moduleSource,
        '--skip-install',
      ]);
      expect(addModuleResult.exitCode).toBe(0);
      expect(await fs.pathExists(path.join(projectPath, 'modules', 'test-module'))).toBe(true);

      // Step 4: 配置项目
      console.log('Step 4: Configuring project...');
      const configResult = await runCli([
        'config', 'set', 'app.name',
        '--value', 'E2E Test App',
      ]);
      expect(configResult.exitCode).toBe(0);

      // 验证配置
      const validateResult = await runCli(['config', 'validate']);
      expect(validateResult.exitCode).toBe(0);

      // Step 5: 构建项目
      console.log('Step 5: Building project...');
      const buildResult = await runCli(['build']);
      expect(buildResult.exitCode).toBe(0);
      expect(await fs.pathExists(path.join(projectPath, 'dist'))).toBe(true);

      // Step 6: 运行测试
      console.log('Step 6: Running tests...');
      const testResult = await runCli(['test']);
      expect(testResult.exitCode).toBe(0);

      // Step 7: 启动应用（测试模式）
      console.log('Step 7: Starting application...');
      const startProcess = spawn('node', [cliPath, 'start'], {
        env: { ...process.env, NODE_ENV: 'test', PORT: '0' },
        detached: false,
      });

      // 等待应用启动
      await TestHelper.waitFor(
        () => startProcess.pid !== undefined,
        5000,
      );

      // 停止应用
      startProcess.kill();

      console.log('Complete workflow finished successfully!');
    }, 60000); // 60秒超时

    it('应该处理多模块依赖场景', async () => {
      const projectName = 'multi-module-project';
      const projectPath = path.join(testDir, projectName);

      // 创建项目
      await runCli(['create', projectName, '--skip-install']);
      process.chdir(projectPath);
      await runCli(['init', '--skip-install']);

      // 创建互相依赖的模块
      const moduleA = await createTestModule('module-a', {
        dependencies: {},
      });
      const moduleB = await createTestModule('module-b', {
        dependencies: { 'module-a': '^1.0.0' },
      });
      const moduleC = await createTestModule('module-c', {
        dependencies: { 'module-b': '^1.0.0' },
      });

      // 按顺序添加模块
      await runCli(['module', 'add', 'module-a', '--source', moduleA, '--skip-install']);
      await runCli(['module', 'add', 'module-b', '--source', moduleB, '--skip-install']);
      await runCli(['module', 'add', 'module-c', '--source', moduleC, '--skip-install']);

      // 验证依赖
      const listResult = await runCli(['module', 'list']);
      expect(listResult.stdout).toContain('module-a');
      expect(listResult.stdout).toContain('module-b');
      expect(listResult.stdout).toContain('module-c');

      // 检查依赖
      const checkResult = await runCli(['module', 'check', 'module-c']);
      expect(checkResult.exitCode).toBe(0);
    });
  });

  describe('错误恢复流程', () => {
    it('应该从初始化失败中恢复', async () => {
      const projectName = 'recovery-project';
      const projectPath = path.join(testDir, projectName);

      // 创建项目
      await runCli(['create', projectName, '--skip-install']);
      process.chdir(projectPath);

      // 损坏配置文件
      await fs.writeFile(
        path.join(projectPath, 'package.json'),
        'invalid json',
      );

      // 初始化应该失败
      const failedInit = await runCli(['init', '--skip-install']);
      expect(failedInit.exitCode).not.toBe(0);

      // 修复配置文件
      await fs.writeJSON(path.join(projectPath, 'package.json'), {
        name: projectName,
        version: '1.0.0',
      });

      // 重新初始化应该成功
      const successInit = await runCli(['init', '--skip-install', '--force']);
      expect(successInit.exitCode).toBe(0);
    });

    it('应该处理模块冲突', async () => {
      const projectName = 'conflict-project';
      const projectPath = path.join(testDir, projectName);

      await runCli(['create', projectName, '--skip-install']);
      process.chdir(projectPath);
      await runCli(['init', '--skip-install']);

      // 添加模块
      const module1 = await createTestModule('conflict-module', { version: '1.0.0' });
      await runCli(['module', 'add', 'conflict-module', '--source', module1, '--skip-install']);

      // 尝试添加同名模块
      const module2 = await createTestModule('conflict-module', { version: '2.0.0' });
      const conflictResult = await runCli([
        'module', 'add', 'conflict-module',
        '--source', module2,
        '--skip-install',
      ]);
      expect(conflictResult.exitCode).not.toBe(0);
      expect(conflictResult.stderr).toContain('already exists');

      // 强制替换
      const forceResult = await runCli([
        'module', 'add', 'conflict-module',
        '--source', module2,
        '--force',
        '--skip-install',
      ]);
      expect(forceResult.exitCode).toBe(0);

      // 验证版本
      const packageJson = await fs.readJSON(
        path.join(projectPath, 'modules', 'conflict-module', 'package.json'),
      );
      expect(packageJson.version).toBe('2.0.0');
    });
  });

  describe('配置迁移流程', () => {
    it('应该支持配置导出和导入', async () => {
      const project1 = 'export-project';
      const project2 = 'import-project';
      const configFile = path.join(testDir, 'config-backup.json');

      // 创建第一个项目并配置
      await runCli(['create', project1, '--skip-install']);
      process.chdir(path.join(testDir, project1));
      await runCli(['init', '--skip-install']);
      await runCli(['config', 'set', 'app.name', '--value', 'Original App']);
      await runCli(['config', 'set', 'app.port', '--value', '4000']);

      // 导出配置
      await runCli(['config', 'export', '--output', configFile]);
      expect(await fs.pathExists(configFile)).toBe(true);

      // 创建第二个项目
      process.chdir(testDir);
      await runCli(['create', project2, '--skip-install']);
      process.chdir(path.join(testDir, project2));
      await runCli(['init', '--skip-install']);

      // 导入配置
      await runCli(['config', 'import', '--input', configFile]);

      // 验证配置
      const config = await fs.readJSON(
        path.join(testDir, project2, '.creatoria', 'config.json'),
      );
      expect(config.app.name).toBe('Original App');
      expect(config.app.port).toBe(4000);
    });
  });

  // 辅助函数
  async function runCli(args: string[]): Promise<{
    stdout: string;
    stderr: string;
    exitCode: number;
  }> {
    return new Promise((resolve) => {
      const child = spawn('node', [cliPath, ...args], {
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
        resolve({
          stdout,
          stderr,
          exitCode: code || 0,
        });
      });
    });
  }

  async function createTestModule(
    name: string,
    options: any = {},
  ): Promise<string> {
    const moduleDir = path.join(testDir, 'test-modules', name);
    await fs.ensureDir(moduleDir);
    
    await fs.writeJSON(path.join(moduleDir, 'package.json'), {
      name,
      version: options.version || '1.0.0',
      description: `Test module ${name}`,
      dependencies: options.dependencies || {},
    });
    
    await fs.writeFile(
      path.join(moduleDir, 'index.ts'),
      `export const ${name.replace(/-/g, '_')} = { name: '${name}' };`,
    );
    
    if (options.hasInit) {
      await fs.writeFile(
        path.join(moduleDir, 'init.js'),
        `module.exports = async () => ({ success: true });`,
      );
    }
    
    return moduleDir;
  }
});
