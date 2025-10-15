/**
 * CLI命令集成测试
 */

import { Test, TestingModule } from '@nestjs/testing';
import { CliService } from '../../../src/cli/cli.service';
import { CreateCommand } from '../../../src/cli/commands/create.command';
import { InitCommand } from '../../../src/cli/commands/init.command';
import { ModuleCommand } from '../../../src/cli/commands/module.command';
import { ConfigCommand } from '../../../src/cli/commands/config.command';
import { LoggerService } from '../../../src/common/logger/logger.service';
import { TestHelper } from '../../utils/test-helper';
import { MockFactory } from '../../utils/mock-factory';
import { Assertions } from '../../utils/assertions';
import * as path from 'path';
import * as fs from 'fs-extra';

describe('CLI Commands Integration', () => {
  let testDir: string;
  let mockLogger: jest.Mocked<LoggerService>;

  beforeEach(async () => {
    testDir = await TestHelper.createTempDir('cli-commands');
    mockLogger = MockFactory.createMockLogger();
    
    // 切换到测试目录
    process.chdir(testDir);
  });

  afterEach(async () => {
    await TestHelper.cleanupTempDir();
  });

  describe('Create Command', () => {
    let createCommand: CreateCommand;

    beforeEach(() => {
      createCommand = new CreateCommand();
      (createCommand as any).logger = mockLogger;
    });

    it('应该创建新项目', async () => {
      const projectName = 'test-project';
      const projectPath = path.join(testDir, projectName);

      // 执行创建命令
      await createCommand.run([projectName], {
        skipInstall: true,
        dbHost: 'localhost',
        dbPort: 5432,
        dbDatabase: 'testdb',
        dbUsername: 'testuser',
        dbPassword: 'testpass',
      });

      // 验证项目结构
      expect(await fs.pathExists(projectPath)).toBe(true);
      expect(await fs.pathExists(path.join(projectPath, 'package.json'))).toBe(true);
      expect(await fs.pathExists(path.join(projectPath, '.env'))).toBe(true);
      expect(await fs.pathExists(path.join(projectPath, 'src'))).toBe(true);
      expect(await fs.pathExists(path.join(projectPath, 'modules'))).toBe(true);

      // 验证package.json
      const packageJson = await fs.readJSON(path.join(projectPath, 'package.json'));
      expect(packageJson.name).toBe(projectName);
      expect(packageJson.scripts).toHaveProperty('start');
      expect(packageJson.scripts).toHaveProperty('build');
      expect(packageJson.scripts).toHaveProperty('test');

      // 验证.env文件
      const envContent = await fs.readFile(path.join(projectPath, '.env'), 'utf8');
      expect(envContent).toContain('DB_HOST=localhost');
      expect(envContent).toContain('DB_PORT=5432');
      expect(envContent).toContain('DB_DATABASE=testdb');
      expect(envContent).toContain('DB_USERNAME=testuser');
    });

    it('应该拒绝创建重复项目', async () => {
      const projectName = 'existing-project';
      const projectPath = path.join(testDir, projectName);
      
      // 创建现有目录
      await fs.ensureDir(projectPath);
      await fs.writeFile(path.join(projectPath, 'file.txt'), 'existing');

      // 尝试创建
      await Assertions.assertPromiseRejected(
        createCommand.run([projectName], { skipInstall: true }),
        /already exists/,
      );
    });
  });

  describe('Init Command', () => {
    let initCommand: InitCommand;

    beforeEach(async () => {
      initCommand = new InitCommand();
      (initCommand as any).logger = mockLogger;
      
      // 创建基本项目结构
      await fs.writeJSON(path.join(testDir, 'package.json'), {
        name: 'test-project',
        version: '1.0.0',
      });
    });

    it('应该初始化项目', async () => {
      // 执行初始化
      await initCommand.run([], {
        force: false,
        skipInstall: true,
      });

      // 验证初始化结果
      expect(await fs.pathExists(path.join(testDir, '.creatoria'))).toBe(true);
      expect(await fs.pathExists(path.join(testDir, 'modules'))).toBe(true);
      expect(await fs.pathExists(path.join(testDir, 'config'))).toBe(true);
      
      // 验证配置文件
      const config = await fs.readJSON(path.join(testDir, '.creatoria', 'config.json'));
      expect(config).toHaveProperty('version');
      expect(config).toHaveProperty('modules');
      expect(config).toHaveProperty('initialized', true);
    });

    it('应该处理重复初始化', async () => {
      // 第一次初始化
      await initCommand.run([], { skipInstall: true });
      
      // 第二次初始化（不强制）
      await Assertions.assertPromiseRejected(
        initCommand.run([], { force: false, skipInstall: true }),
        /already initialized/,
      );
      
      // 强制重新初始化
      await initCommand.run([], { force: true, skipInstall: true });
      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining('重新初始化'),
      );
    });
  });

  describe('Module Command', () => {
    let moduleCommand: ModuleCommand;

    beforeEach(async () => {
      moduleCommand = new ModuleCommand();
      (moduleCommand as any).logger = mockLogger;
      
      // 创建项目结构
      await fs.writeJSON(path.join(testDir, 'package.json'), {
        name: 'test-project',
        version: '1.0.0',
      });
      await fs.ensureDir(path.join(testDir, 'modules'));
      await fs.writeJSON(path.join(testDir, '.creatoria', 'config.json'), {
        version: '1.0.0',
        modules: [],
      });
    });

    it('应该添加模块', async () => {
      const moduleName = 'test-module';
      
      // 创建模块源
      const sourceDir = path.join(testDir, 'module-source');
      await fs.ensureDir(sourceDir);
      await fs.writeJSON(path.join(sourceDir, 'package.json'), {
        name: moduleName,
        version: '1.0.0',
      });
      await fs.writeFile(path.join(sourceDir, 'index.ts'), 'export {}');

      // 添加模块
      await moduleCommand.runAdd([moduleName], {
        source: sourceDir,
        skipInstall: true,
      });

      // 验证
      const modulePath = path.join(testDir, 'modules', moduleName);
      expect(await fs.pathExists(modulePath)).toBe(true);
      expect(await fs.pathExists(path.join(modulePath, 'package.json'))).toBe(true);
      
      // 验证配置更新
      const config = await fs.readJSON(path.join(testDir, '.creatoria', 'config.json'));
      expect(config.modules).toContain(moduleName);
    });

    it('应该列出模块', async () => {
      // 创建多个模块
      const modules = ['module-a', 'module-b', 'module-c'];
      
      for (const mod of modules) {
        const modPath = path.join(testDir, 'modules', mod);
        await fs.ensureDir(modPath);
        await fs.writeJSON(path.join(modPath, 'package.json'), {
          name: mod,
          version: '1.0.0',
          description: `Test ${mod}`,
        });
      }
      
      // 更新配置
      await fs.writeJSON(path.join(testDir, '.creatoria', 'config.json'), {
        version: '1.0.0',
        modules,
      });

      // 捕获输出
      const output = await TestHelper.captureConsoleOutput(async () => {
        await moduleCommand.runList([], {});
      });

      // 验证输出
      for (const mod of modules) {
        expect(output.stdout.some(line => line.includes(mod))).toBe(true);
      }
    });

    it('应该移除模块', async () => {
      const moduleName = 'to-remove';
      const modulePath = path.join(testDir, 'modules', moduleName);
      
      // 创建模块
      await fs.ensureDir(modulePath);
      await fs.writeJSON(path.join(modulePath, 'package.json'), {
        name: moduleName,
        version: '1.0.0',
      });
      
      // 更新配置
      await fs.writeJSON(path.join(testDir, '.creatoria', 'config.json'), {
        version: '1.0.0',
        modules: [moduleName],
      });

      // 移除模块
      await moduleCommand.runRemove([moduleName], { force: true });

      // 验证
      expect(await fs.pathExists(modulePath)).toBe(false);
      
      const config = await fs.readJSON(path.join(testDir, '.creatoria', 'config.json'));
      expect(config.modules).not.toContain(moduleName);
    });
  });

  describe('Config Command', () => {
    let configCommand: ConfigCommand;

    beforeEach(async () => {
      configCommand = new ConfigCommand();
      (configCommand as any).logger = mockLogger;
      
      // 创建配置文件
      const config = {
        version: '1.0.0',
        app: {
          name: 'test-app',
          port: 3000,
          env: 'development',
        },
        database: {
          host: 'localhost',
          port: 5432,
          name: 'testdb',
        },
        features: {
          auth: true,
          logging: true,
          caching: false,
        },
      };
      
      await fs.ensureDir(path.join(testDir, '.creatoria'));
      await fs.writeJSON(path.join(testDir, '.creatoria', 'config.json'), config);
    });

    it('应该显示配置', async () => {
      const output = await TestHelper.captureConsoleOutput(async () => {
        await configCommand.runShow([], {});
      });

      // 验证输出包含配置信息
      expect(output.stdout.some(line => line.includes('test-app'))).toBe(true);
      expect(output.stdout.some(line => line.includes('3000'))).toBe(true);
      expect(output.stdout.some(line => line.includes('localhost'))).toBe(true);
    });

    it('应该获取特定配置值', async () => {
      const output = await TestHelper.captureConsoleOutput(async () => {
        await configCommand.runGet(['app.name'], {});
      });

      expect(output.stdout.some(line => line.includes('test-app'))).toBe(true);
    });

    it('应该设置配置值', async () => {
      // 设置新值
      await configCommand.runSet(['app.port'], { value: '4000' });

      // 验证
      const config = await fs.readJSON(path.join(testDir, '.creatoria', 'config.json'));
      expect(config.app.port).toBe(4000);
    });

    it('应该验证配置', async () => {
      // 正确的配置
      const validOutput = await TestHelper.captureConsoleOutput(async () => {
        await configCommand.runValidate([], {});
      });
      expect(validOutput.stdout.some(line => line.includes('有效') || line.includes('valid'))).toBe(true);

      // 错误的配置
      await fs.writeJSON(path.join(testDir, '.creatoria', 'config.json'), {
        // 缺少必要字段
        app: {},
      });

      await Assertions.assertPromiseRejected(
        configCommand.runValidate([], {}),
        /Invalid configuration|validation failed/,
      );
    });
  });

  describe('CLI命令链集成', () => {
    it('应该支持命令链式执行', async () => {
      const createCmd = new CreateCommand();
      const initCmd = new InitCommand();
      const moduleCmd = new ModuleCommand();
      
      (createCmd as any).logger = mockLogger;
      (initCmd as any).logger = mockLogger;
      (moduleCmd as any).logger = mockLogger;

      const projectName = 'chain-test';
      const projectPath = path.join(testDir, projectName);

      // 1. 创建项目
      await createCmd.run([projectName], { skipInstall: true });
      
      // 2. 切换到项目目录
      process.chdir(projectPath);
      
      // 3. 初始化
      await initCmd.run([], { skipInstall: true });
      
      // 4. 添加模块
      const moduleSource = path.join(testDir, 'test-module');
      await fs.ensureDir(moduleSource);
      await fs.writeJSON(path.join(moduleSource, 'package.json'), {
        name: 'test-module',
        version: '1.0.0',
      });
      
      await moduleCmd.runAdd(['test-module'], {
        source: moduleSource,
        skipInstall: true,
      });

      // 验证最终状态
      expect(await fs.pathExists(path.join(projectPath, 'package.json'))).toBe(true);
      expect(await fs.pathExists(path.join(projectPath, '.creatoria', 'config.json'))).toBe(true);
      expect(await fs.pathExists(path.join(projectPath, 'modules', 'test-module'))).toBe(true);
      
      const config = await fs.readJSON(path.join(projectPath, '.creatoria', 'config.json'));
      expect(config.modules).toContain('test-module');
    });
  });
});
