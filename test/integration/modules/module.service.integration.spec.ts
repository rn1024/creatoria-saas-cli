/**
 * 模块服务集成测试
 */

import { Test, TestingModule } from '@nestjs/testing';
import { ModulesService } from '../../../src/modules/modules.service';
import { LoggerService } from '../../../src/common/logger/logger.service';
import { ConfigService } from '@nestjs/config';
import { TestHelper } from '../../utils/test-helper';
import { MockFactory } from '../../utils/mock-factory';
import { Assertions } from '../../utils/assertions';
import * as fs from 'fs-extra';
import * as path from 'path';

describe('ModulesService Integration', () => {
  let service: ModulesService;
  let testDir: string;
  let mockLogger: jest.Mocked<LoggerService>;
  let mockConfig: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    // 创建测试目录
    testDir = await TestHelper.createTempDir('module-service');
    
    // 创建 Mock 对象
    mockLogger = MockFactory.createMockLogger();
    mockConfig = MockFactory.createMockConfigService({
      modulesPath: path.join(testDir, 'modules'),
      projectRoot: testDir,
    });

    // 创建测试模块
    const module: TestingModule = await TestHelper.createTestingModule(
      {
        providers: [
          ModulesService,
          { provide: LoggerService, useValue: mockLogger },
          { provide: ConfigService, useValue: mockConfig },
        ],
      },
    );

    service = module.get<ModulesService>(ModulesService);
  });

  afterEach(async () => {
    await TestHelper.cleanupTempDir();
    await TestHelper.closeApp();
  });

  describe('模块管理集成', () => {
    it('应该成功添加新模块', async () => {
      // 准备模块源文件
      const sourceDir = path.join(testDir, 'source-module');
      await fs.ensureDir(sourceDir);
      await fs.writeJSON(path.join(sourceDir, 'package.json'), {
        name: 'test-module',
        version: '1.0.0',
        dependencies: {},
      });
      await fs.writeFile(
        path.join(sourceDir, 'index.ts'),
        'export const TestModule = {};',
      );

      // 添加模块
      const result = await service.addModule('test-module', {
        sourcePath: sourceDir,
      });

      // 验证
      expect(result).toBe(true);
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining('添加模块成功'),
        expect.objectContaining({ name: 'test-module' }),
      );

      // 验证模块文件已复制
      const modulePath = path.join(testDir, 'modules', 'test-module');
      expect(await fs.pathExists(modulePath)).toBe(true);
      expect(await fs.pathExists(path.join(modulePath, 'package.json'))).toBe(true);
      expect(await fs.pathExists(path.join(modulePath, 'index.ts'))).toBe(true);
    });

    it('应该拒绝添加重复模块', async () => {
      // 创建现有模块
      const existingModule = path.join(testDir, 'modules', 'existing-module');
      await fs.ensureDir(existingModule);
      await fs.writeJSON(path.join(existingModule, 'package.json'), {
        name: 'existing-module',
        version: '1.0.0',
      });

      // 尝试添加同名模块
      await Assertions.assertThrowsException(
        () => service.addModule('existing-module'),
        'MODULE_ALREADY_EXISTS',
      );
    });

    it('应该成功列出所有模块', async () => {
      // 创建多个模块
      const modules = ['module-a', 'module-b', 'module-c'];
      
      for (const moduleName of modules) {
        const modulePath = path.join(testDir, 'modules', moduleName);
        await fs.ensureDir(modulePath);
        await fs.writeJSON(path.join(modulePath, 'package.json'), {
          name: moduleName,
          version: '1.0.0',
          description: `Test ${moduleName}`,
        });
      }

      // 列出模块
      const list = await service.listModules();

      // 验证
      expect(list).toHaveLength(3);
      expect(list.map(m => m.name).sort()).toEqual(modules.sort());
      
      for (const module of list) {
        expect(module).toHaveProperty('name');
        expect(module).toHaveProperty('version', '1.0.0');
        expect(module).toHaveProperty('path');
        expect(module).toHaveProperty('enabled', true);
      }
    });

    it('应该成功移除模块', async () => {
      // 创建模块
      const modulePath = path.join(testDir, 'modules', 'to-remove');
      await fs.ensureDir(modulePath);
      await fs.writeJSON(path.join(modulePath, 'package.json'), {
        name: 'to-remove',
        version: '1.0.0',
      });

      // 移除模块
      const result = await service.removeModule('to-remove');

      // 验证
      expect(result).toBe(true);
      expect(await fs.pathExists(modulePath)).toBe(false);
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining('移除模块成功'),
        expect.objectContaining({ name: 'to-remove' }),
      );
    });
  });

  describe('依赖检查集成', () => {
    it('应该检测缺失的依赖', async () => {
      // 创建带依赖的模块
      const modulePath = path.join(testDir, 'modules', 'with-deps');
      await fs.ensureDir(modulePath);
      await fs.writeJSON(path.join(modulePath, 'package.json'), {
        name: 'with-deps',
        version: '1.0.0',
        dependencies: {
          'missing-dep': '^1.0.0',
          'another-missing': '^2.0.0',
        },
      });

      // 检查依赖
      const result = await service.checkDependencies('with-deps');

      // 验证
      expect(result.valid).toBe(false);
      expect(result.missing).toContain('missing-dep');
      expect(result.missing).toContain('another-missing');
      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining('模块依赖缺失'),
        expect.any(Object),
      );
    });

    it('应该通过满足的依赖', async () => {
      // 创建依赖模块
      const depModule = path.join(testDir, 'modules', 'dependency');
      await fs.ensureDir(depModule);
      await fs.writeJSON(path.join(depModule, 'package.json'), {
        name: 'dependency',
        version: '1.0.0',
      });

      // 创建主模块
      const mainModule = path.join(testDir, 'modules', 'main');
      await fs.ensureDir(mainModule);
      await fs.writeJSON(path.join(mainModule, 'package.json'), {
        name: 'main',
        version: '1.0.0',
        dependencies: {
          'dependency': '^1.0.0',
        },
      });

      // 检查依赖
      const result = await service.checkDependencies('main');

      // 验证
      expect(result.valid).toBe(true);
      expect(result.missing).toHaveLength(0);
    });
  });

  describe('模块初始化集成', () => {
    it('应该执行模块初始化脚本', async () => {
      // 创建带初始化脚本的模块
      const modulePath = path.join(testDir, 'modules', 'with-init');
      await fs.ensureDir(modulePath);
      await fs.writeJSON(path.join(modulePath, 'package.json'), {
        name: 'with-init',
        version: '1.0.0',
      });
      
      // 创建初始化脚本
      const initScript = `
module.exports = async function(context) {
  const fs = require('fs-extra');
  const path = require('path');
  
  // 创建初始化标记文件
  await fs.writeFile(
    path.join(context.projectRoot, 'init-marker.txt'),
    'initialized'
  );
  
  return { success: true, message: 'Module initialized' };
};
`;
      await fs.writeFile(path.join(modulePath, 'init.js'), initScript);

      // 执行初始化
      const result = await service.initializeModule('with-init');

      // 验证
      expect(result).toBe(true);
      expect(await fs.pathExists(path.join(testDir, 'init-marker.txt'))).toBe(true);
      expect(await fs.readFile(path.join(testDir, 'init-marker.txt'), 'utf8'))
        .toBe('initialized');
    });

    it('应该处理初始化失败', async () => {
      // 创建带错误脚本的模块
      const modulePath = path.join(testDir, 'modules', 'with-error');
      await fs.ensureDir(modulePath);
      await fs.writeJSON(path.join(modulePath, 'package.json'), {
        name: 'with-error',
        version: '1.0.0',
      });
      
      // 创建错误的初始化脚本
      const errorScript = `
module.exports = async function(context) {
  throw new Error('Initialization failed');
};
`;
      await fs.writeFile(path.join(modulePath, 'init.js'), errorScript);

      // 执行初始化
      await Assertions.assertThrowsException(
        () => service.initializeModule('with-error'),
        'MODULE_INITIALIZATION_FAILED',
      );
    });
  });

  describe('模块配置集成', () => {
    it('应该加载模块配置', async () => {
      // 创建带配置的模块
      const modulePath = path.join(testDir, 'modules', 'with-config');
      await fs.ensureDir(modulePath);
      await fs.writeJSON(path.join(modulePath, 'package.json'), {
        name: 'with-config',
        version: '1.0.0',
      });
      
      // 创建配置文件
      const config = {
        enabled: true,
        priority: 10,
        settings: {
          feature1: true,
          feature2: false,
        },
      };
      await fs.writeJSON(path.join(modulePath, 'config.json'), config);

      // 获取模块信息
      const info = await service.getModuleInfo('with-config');

      // 验证
      expect(info).toBeDefined();
      expect(info.name).toBe('with-config');
      expect(info.config).toEqual(config);
    });
  });
});
