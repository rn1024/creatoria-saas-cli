/**
 * Mock对象工厂
 */

import { LoggerService } from '../../src/common/logger/logger.service';
import { ConfigService } from '@nestjs/config';

export class MockFactory {
  /**
   * 创建Mock LoggerService
   */
  static createMockLogger(): jest.Mocked<LoggerService> {
    return {
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      fatal: jest.fn(),
      log: jest.fn(),
      setContext: jest.fn(),
      flush: jest.fn(),
    } as any;
  }

  /**
   * 创建Mock ConfigService
   */
  static createMockConfigService(config: Record<string, any> = {}): jest.Mocked<ConfigService> {
    return {
      get: jest.fn().mockImplementation((key: string, defaultValue?: any) => {
        const keys = key.split('.');
        let value = config;
        
        for (const k of keys) {
          value = value?.[k];
          if (value === undefined) {
            return defaultValue;
          }
        }
        
        return value;
      }),
      getOrThrow: jest.fn().mockImplementation((key: string) => {
        const value = config[key];
        if (value === undefined) {
          throw new Error(`Configuration key "${key}" does not exist`);
        }
        return value;
      }),
    } as any;
  }

  /**
   * 创建Mock Repository
   */
  static createMockRepository<T = any>(): any {
    return {
      find: jest.fn(),
      findOne: jest.fn(),
      findOneBy: jest.fn(),
      findAndCount: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
      delete: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
      count: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      offset: jest.fn().mockReturnThis(),
      getMany: jest.fn(),
      getOne: jest.fn(),
      getManyAndCount: jest.fn(),
      execute: jest.fn(),
    };
  }

  /**
   * 创建Mock FileSystem
   */
  static createMockFileSystem(): any {
    const files = new Map<string, string>();
    
    return {
      readFile: jest.fn().mockImplementation((path: string) => {
        if (!files.has(path)) {
          throw new Error(`File not found: ${path}`);
        }
        return Promise.resolve(files.get(path));
      }),
      writeFile: jest.fn().mockImplementation((path: string, content: string) => {
        files.set(path, content);
        return Promise.resolve();
      }),
      exists: jest.fn().mockImplementation((path: string) => {
        return Promise.resolve(files.has(path));
      }),
      unlink: jest.fn().mockImplementation((path: string) => {
        files.delete(path);
        return Promise.resolve();
      }),
      mkdir: jest.fn().mockResolvedValue(undefined),
      rmdir: jest.fn().mockResolvedValue(undefined),
      readdir: jest.fn().mockImplementation(() => {
        return Promise.resolve(Array.from(files.keys()));
      }),
      stat: jest.fn().mockImplementation((path: string) => {
        if (!files.has(path)) {
          throw new Error(`File not found: ${path}`);
        }
        return Promise.resolve({
          isFile: () => true,
          isDirectory: () => false,
          size: files.get(path)?.length || 0,
          mtime: new Date(),
        });
      }),
      _files: files, // 暴露内部存储以便测试
    };
  }

  /**
   * 创建Mock HTTP Client
   */
  static createMockHttpClient(): any {
    return {
      get: jest.fn().mockResolvedValue({ data: {} }),
      post: jest.fn().mockResolvedValue({ data: {} }),
      put: jest.fn().mockResolvedValue({ data: {} }),
      patch: jest.fn().mockResolvedValue({ data: {} }),
      delete: jest.fn().mockResolvedValue({ data: {} }),
      head: jest.fn().mockResolvedValue({ data: {} }),
      options: jest.fn().mockResolvedValue({ data: {} }),
    };
  }

  /**
   * 创建Mock Cache Service
   */
  static createMockCacheService(): any {
    const cache = new Map<string, any>();
    
    return {
      get: jest.fn().mockImplementation((key: string) => {
        return cache.get(key);
      }),
      set: jest.fn().mockImplementation((key: string, value: any) => {
        cache.set(key, value);
      }),
      delete: jest.fn().mockImplementation((key: string) => {
        return cache.delete(key);
      }),
      clear: jest.fn().mockImplementation(() => {
        cache.clear();
      }),
      has: jest.fn().mockImplementation((key: string) => {
        return cache.has(key);
      }),
      size: jest.fn().mockImplementation(() => {
        return cache.size;
      }),
      _cache: cache, // 暴露内部存储以便测试
    };
  }

  /**
   * 创建Mock Command Executor
   */
  static createMockCommandExecutor(): any {
    return {
      execute: jest.fn().mockResolvedValue({
        stdout: '',
        stderr: '',
        exitCode: 0,
        duration: 100,
      }),
      executeStream: jest.fn().mockResolvedValue({
        stdout: '',
        stderr: '',
        exitCode: 0,
        duration: 100,
      }),
      executeWithRetry: jest.fn().mockResolvedValue({
        stdout: '',
        stderr: '',
        exitCode: 0,
        duration: 100,
      }),
      commandExists: jest.fn().mockResolvedValue(true),
    };
  }

  /**
   * 创建Mock Module Service
   */
  static createMockModuleService(): any {
    return {
      listModules: jest.fn().mockResolvedValue([]),
      addModule: jest.fn().mockResolvedValue(true),
      removeModule: jest.fn().mockResolvedValue(true),
      getModuleInfo: jest.fn().mockResolvedValue(null),
      checkDependencies: jest.fn().mockResolvedValue({ valid: true, missing: [] }),
      initializeModule: jest.fn().mockResolvedValue(true),
      copyModule: jest.fn().mockResolvedValue(true),
      registerModule: jest.fn().mockResolvedValue(true),
    };
  }

  /**
   * 创建Mock Validation Service
   */
  static createMockValidationService(): any {
    return {
      validateString: jest.fn(),
      validateNumber: jest.fn(),
      validatePath: jest.fn().mockResolvedValue(undefined),
      validateEmail: jest.fn(),
      validateURL: jest.fn(),
      validatePort: jest.fn(),
      validateModuleName: jest.fn(),
      validateProjectName: jest.fn(),
      validateDatabaseConfig: jest.fn(),
      validateApiConfig: jest.fn(),
      validateFileUpload: jest.fn().mockResolvedValue(undefined),
      validateCliArgs: jest.fn(),
      validateWithSchema: jest.fn().mockResolvedValue(undefined),
      sanitizeString: jest.fn().mockImplementation((value: string) => value),
      sanitizeNumber: jest.fn().mockImplementation((value: any) => value),
      sanitizePath: jest.fn().mockImplementation((value: string) => value),
      escapeHtml: jest.fn().mockImplementation((value: string) => value),
      escapeShell: jest.fn().mockImplementation((value: string) => value),
    };
  }

  /**
   * 创建Mock Security Service
   */
  static createMockSecurityService(): any {
    return {
      // PathSecurityService
      validatePath: jest.fn().mockImplementation((path: string) => path),
      createSafeTempPath: jest.fn().mockReturnValue('/tmp/test_123'),
      getSafeRelativePath: jest.fn().mockImplementation((from: string, to: string) => to),
      validateFileName: jest.fn(),
      addAllowedPath: jest.fn(),
      addBlockedPath: jest.fn(),
      getSecurityConfig: jest.fn().mockReturnValue({
        projectRoot: '/test',
        allowedPaths: [],
        blockedPaths: [],
      }),
      
      // CommandSecurityService
      validateCommand: jest.fn(),
      validateArguments: jest.fn().mockImplementation((args: string[]) => args),
      createSafeOptions: jest.fn().mockReturnValue({}),
      validateEnvironment: jest.fn().mockImplementation((env: any) => env),
      logCommandExecution: jest.fn(),
      
      // SensitiveDataService
      encrypt: jest.fn().mockImplementation((data: string) => `encrypted:${data}`),
      decrypt: jest.fn().mockImplementation((data: string) => data.replace('encrypted:', '')),
      hash: jest.fn().mockImplementation((data: string) => `hash:${data}`),
      maskString: jest.fn().mockImplementation(() => '***'),
      maskEmail: jest.fn().mockImplementation(() => 'u***@example.com'),
      maskPhone: jest.fn().mockImplementation(() => '***-**-****'),
      maskCreditCard: jest.fn().mockImplementation(() => '****-****-****-****'),
      generateSecureToken: jest.fn().mockReturnValue('secure_token_123'),
      generateApiKey: jest.fn().mockReturnValue('sk_test_123'),
    };
  }

  /**
   * 创建Mock Event Emitter
   */
  static createMockEventEmitter(): any {
    const events = new Map<string, Function[]>();
    
    return {
      on: jest.fn().mockImplementation((event: string, handler: Function) => {
        if (!events.has(event)) {
          events.set(event, []);
        }
        events.get(event)!.push(handler);
      }),
      emit: jest.fn().mockImplementation((event: string, ...args: any[]) => {
        const handlers = events.get(event) || [];
        handlers.forEach(handler => handler(...args));
      }),
      off: jest.fn().mockImplementation((event: string, handler: Function) => {
        const handlers = events.get(event) || [];
        const index = handlers.indexOf(handler);
        if (index > -1) {
          handlers.splice(index, 1);
        }
      }),
      removeAllListeners: jest.fn().mockImplementation((event?: string) => {
        if (event) {
          events.delete(event);
        } else {
          events.clear();
        }
      }),
      _events: events, // 暴露内部存储以便测试
    };
  }
}
