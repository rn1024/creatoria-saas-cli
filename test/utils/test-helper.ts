/**
 * 测试辅助工具
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as fs from 'fs-extra';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

export class TestHelper {
  private static testDir: string;
  private static app: INestApplication;
  private static module: TestingModule;

  /**
   * 创建测试模块
   */
  static async createTestingModule(
    metadata: any,
    overrides?: any[],
  ): Promise<TestingModule> {
    const moduleBuilder = Test.createTestingModule(metadata);
    
    if (overrides) {
      for (const override of overrides) {
        if (override.provide && override.useValue) {
          moduleBuilder.overrideProvider(override.provide).useValue(override.useValue);
        }
      }
    }
    
    this.module = await moduleBuilder.compile();
    return this.module;
  }

  /**
   * 创建测试应用
   */
  static async createTestingApp(
    metadata: any,
    overrides?: any[],
  ): Promise<INestApplication> {
    const module = await this.createTestingModule(metadata, overrides);
    this.app = module.createNestApplication();
    await this.app.init();
    return this.app;
  }

  /**
   * 关闭测试应用
   */
  static async closeApp(): Promise<void> {
    if (this.app) {
      await this.app.close();
      this.app = null;
    }
    if (this.module) {
      await this.module.close();
      this.module = null;
    }
  }

  /**
   * 创建临时测试目录
   */
  static async createTempDir(prefix: string = 'test'): Promise<string> {
    const tempRoot = path.join(process.cwd(), 'temp', 'test');
    await fs.ensureDir(tempRoot);
    
    this.testDir = path.join(tempRoot, `${prefix}_${Date.now()}_${uuidv4()}`);
    await fs.ensureDir(this.testDir);
    
    return this.testDir;
  }

  /**
   * 清理测试目录
   */
  static async cleanupTempDir(): Promise<void> {
    if (this.testDir && await fs.pathExists(this.testDir)) {
      await fs.remove(this.testDir);
      this.testDir = null;
    }
  }

  /**
   * 创建测试文件
   */
  static async createTestFile(
    filename: string,
    content: string,
    dir?: string,
  ): Promise<string> {
    const targetDir = dir || this.testDir || await this.createTempDir();
    const filepath = path.join(targetDir, filename);
    
    await fs.ensureDir(path.dirname(filepath));
    await fs.writeFile(filepath, content);
    
    return filepath;
  }

  /**
   * 创建测试配置文件
   */
  static async createTestConfig(config: any, dir?: string): Promise<string> {
    const targetDir = dir || this.testDir || await this.createTempDir();
    const configPath = path.join(targetDir, 'config.json');
    
    await fs.writeJSON(configPath, config, { spaces: 2 });
    
    return configPath;
  }

  /**
   * 等待条件满足
   */
  static async waitFor(
    condition: () => boolean | Promise<boolean>,
    timeout: number = 5000,
    interval: number = 100,
  ): Promise<void> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      if (await condition()) {
        return;
      }
      await this.sleep(interval);
    }
    
    throw new Error('Timeout waiting for condition');
  }

  /**
   * 等待指定时间
   */
  static sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 生成随机数据
   */
  static generateRandomData(type: 'string' | 'number' | 'email' | 'url' | 'uuid'): any {
    switch (type) {
      case 'string':
        return Math.random().toString(36).substring(7);
      case 'number':
        return Math.floor(Math.random() * 10000);
      case 'email':
        return `test_${Math.random().toString(36).substring(7)}@example.com`;
      case 'url':
        return `https://example.com/${Math.random().toString(36).substring(7)}`;
      case 'uuid':
        return uuidv4();
      default:
        return null;
    }
  }

  /**
   * 创建测试数据库
   */
  static async createTestDatabase(name?: string): Promise<any> {
    const dbName = name || `test_${Date.now()}`;
    
    return {
      type: 'sqlite',
      database: `:memory:`,
      dropSchema: true,
      synchronize: true,
      logging: false,
    };
  }

  /**
   * 模拟网络请求
   */
  static mockHttpRequest(options: {
    method?: string;
    url?: string;
    headers?: any;
    body?: any;
    query?: any;
    params?: any;
  } = {}): any {
    return {
      method: options.method || 'GET',
      url: options.url || '/',
      headers: options.headers || {},
      body: options.body || {},
      query: options.query || {},
      params: options.params || {},
      ip: '127.0.0.1',
      get: (header: string) => options.headers?.[header],
    };
  }

  /**
   * 模拟网络响应
   */
  static mockHttpResponse(): any {
    const response = {
      statusCode: 200,
      headers: {},
      body: null,
      status: jest.fn().mockImplementation((code: number) => {
        response.statusCode = code;
        return response;
      }),
      json: jest.fn().mockImplementation((data: any) => {
        response.body = data;
        return response;
      }),
      send: jest.fn().mockImplementation((data: any) => {
        response.body = data;
        return response;
      }),
      header: jest.fn().mockImplementation((key: string, value: string) => {
        response.headers[key] = value;
        return response;
      }),
      redirect: jest.fn(),
    };
    
    return response;
  }

  /**
   * 捕获控制台输出
   */
  static captureConsoleOutput(
    fn: () => void | Promise<void>,
  ): { stdout: string[]; stderr: string[] } {
    const stdout: string[] = [];
    const stderr: string[] = [];
    
    const originalLog = console.log;
    const originalError = console.error;
    
    console.log = (...args: any[]) => {
      stdout.push(args.join(' '));
    };
    
    console.error = (...args: any[]) => {
      stderr.push(args.join(' '));
    };
    
    try {
      const result = fn();
      if (result instanceof Promise) {
        return result.then(() => {
          console.log = originalLog;
          console.error = originalError;
          return { stdout, stderr };
        });
      }
    } finally {
      console.log = originalLog;
      console.error = originalError;
    }
    
    return { stdout, stderr };
  }

  /**
   * 测试性能
   */
  static async measurePerformance(
    fn: () => void | Promise<void>,
  ): Promise<{ duration: number; memory: number }> {
    const startMemory = process.memoryUsage().heapUsed;
    const startTime = process.hrtime.bigint();
    
    await fn();
    
    const endTime = process.hrtime.bigint();
    const endMemory = process.memoryUsage().heapUsed;
    
    return {
      duration: Number(endTime - startTime) / 1000000, // 转换为毫秒
      memory: endMemory - startMemory,
    };
  }

  /**
   * 获取测试文件路径
   */
  static getTestFilePath(filename: string): string {
    return path.join(__dirname, '..', 'fixtures', filename);
  }

  /**
   * 加载测试固定数据
   */
  static async loadFixture(name: string): Promise<any> {
    const fixturePath = this.getTestFilePath(`${name}.json`);
    return fs.readJSON(fixturePath);
  }
}
