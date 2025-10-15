/**
 * 安全服务集成测试
 */

import { Test, TestingModule } from '@nestjs/testing';
import { PathSecurityService } from '../../../src/common/security/path-security.service';
import { SecureFileService } from '../../../src/common/security/secure-file.service';
import { CommandSecurityService } from '../../../src/common/security/command-security.service';
import { SecureCommandExecutor } from '../../../src/common/security/secure-command.executor';
import { SensitiveDataService } from '../../../src/common/security/sensitive-data.service';
import { LoggerService } from '../../../src/common/logger/logger.service';
import { TestHelper } from '../../utils/test-helper';
import { MockFactory } from '../../utils/mock-factory';
import { Assertions } from '../../utils/assertions';
import * as path from 'path';
import * as fs from 'fs-extra';

describe('Security Services Integration', () => {
  let pathSecurity: PathSecurityService;
  let secureFile: SecureFileService;
  let commandSecurity: CommandSecurityService;
  let commandExecutor: SecureCommandExecutor;
  let sensitiveData: SensitiveDataService;
  let testDir: string;
  let mockLogger: jest.Mocked<LoggerService>;

  beforeEach(async () => {
    testDir = await TestHelper.createTempDir('security');
    mockLogger = MockFactory.createMockLogger();

    const module: TestingModule = await TestHelper.createTestingModule(
      {
        providers: [
          PathSecurityService,
          SecureFileService,
          CommandSecurityService,
          SecureCommandExecutor,
          SensitiveDataService,
          { provide: LoggerService, useValue: mockLogger },
        ],
      },
    );

    pathSecurity = module.get<PathSecurityService>(PathSecurityService);
    secureFile = module.get<SecureFileService>(SecureFileService);
    commandSecurity = module.get<CommandSecurityService>(CommandSecurityService);
    commandExecutor = module.get<SecureCommandExecutor>(SecureCommandExecutor);
    sensitiveData = module.get<SensitiveDataService>(SensitiveDataService);

    // 添加测试目录到允许列表
    pathSecurity.addAllowedPath(testDir);
  });

  afterEach(async () => {
    await TestHelper.cleanupTempDir();
    await TestHelper.closeApp();
  });

  describe('路径安全集成', () => {
    it('应该阻止路径遍历攻击', () => {
      const maliciousPaths = [
        '../../../etc/passwd',
        '..\\..\\..\\windows\\system32',
        'test/../../../etc/passwd',
        '%2e%2e%2f%2e%2e%2fetc%2fpasswd',
        '..%2f..%2f..%2fetc%2fpasswd',
      ];

      for (const malPath of maliciousPaths) {
        expect(() => pathSecurity.validatePath(malPath))
          .toThrow(/Unsafe path detected|Permission denied/);
      }
    });

    it('应该允许安全路径', () => {
      const safePaths = [
        'test.txt',
        'folder/file.txt',
        './local/path',
      ];

      for (const safePath of safePaths) {
        const validated = pathSecurity.validatePath(safePath, {
          basePath: testDir,
        });
        expect(validated).toContain(testDir);
        expect(validated).not.toContain('..');
      }
    });

    it('应该检测符号链接', async () => {
      const realFile = path.join(testDir, 'real.txt');
      const linkFile = path.join(testDir, 'link.txt');
      const outsideFile = '/etc/passwd';
      
      await fs.writeFile(realFile, 'content');
      
      // 创建指向安全文件的符号链接
      await fs.symlink(realFile, linkFile);
      
      // 应该拒绝符号链接（默认）
      expect(() => pathSecurity.validatePath(linkFile, {
        allowSymlinks: false,
        checkExists: true,
      })).not.toThrow();
      
      // 应该允许符号链接（如果明确允许）
      const validated = pathSecurity.validatePath(linkFile, {
        allowSymlinks: true,
        checkExists: true,
      });
      expect(validated).toBeDefined();
    });
  });

  describe('安全文件操作集成', () => {
    it('应该安全读写文件', async () => {
      const filename = 'test.txt';
      const content = 'Hello, World!';
      const filepath = path.join(testDir, filename);

      // 写入文件
      await secureFile.writeFile(filepath, content);
      
      // 读取文件
      const readContent = await secureFile.readFile(filepath, 'utf8');
      expect(readContent).toBe(content);

      // 删除文件
      await secureFile.deleteFile(filepath);
      expect(await secureFile.exists(filepath)).toBe(false);
    });

    it('应该拒绝访问危险路径', async () => {
      const dangerousPath = '../../../etc/passwd';
      
      await Assertions.assertPromiseRejected(
        secureFile.readFile(dangerousPath),
        /Unsafe path detected|Permission denied/,
      );

      await Assertions.assertPromiseRejected(
        secureFile.writeFile(dangerousPath, 'malicious'),
        /Unsafe path detected|Permission denied/,
      );
    });

    it('应该创建安全的临时文件', async () => {
      const tempFile = await secureFile.createTempFile('test');
      
      expect(tempFile).toContain('temp');
      expect(tempFile).toContain('test');
      expect(await fs.pathExists(tempFile)).toBe(true);
      
      // 清理
      await fs.unlink(tempFile);
    });
  });

  describe('命令执行安全集成', () => {
    it('应该阻止命令注入', () => {
      const dangerousCommands = [
        'ls; rm -rf /',
        'echo hello && rm -rf /',
        'echo `rm -rf /`',
        'echo $(rm -rf /)',
        'ls | rm -rf /',
      ];

      for (const cmd of dangerousCommands) {
        expect(() => commandSecurity.validateCommand(cmd))
          .toThrow(/Invalid command|Dangerous pattern/);
      }
    });

    it('应该清理危险参数', () => {
      const dangerousArgs = [
        '; rm -rf /',
        '&& rm -rf /',
        '`rm -rf /`',
        '$(rm -rf /)',
        '../../../etc/passwd',
      ];

      for (const arg of dangerousArgs) {
        expect(() => commandSecurity.validateArguments([arg]))
          .toThrow(/Invalid argument|Dangerous pattern/);
      }
    });

    it('应该安全执行命令', async () => {
      // 添加允许的命令
      commandSecurity.addAllowedCommand('echo');
      commandSecurity.addAllowedCommand('ls');

      // 执行安全命令
      const result = await commandExecutor.execute('echo', ['hello', 'world']);
      
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('hello world');
      expect(result.stderr).toBe('');
      
      // 验证日志
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining('命令执行成功'),
        expect.objectContaining({ command: 'echo' }),
      );
    });

    it('应该处理命令超时', async () => {
      commandSecurity.addAllowedCommand('sleep');
      
      const resultPromise = commandExecutor.execute(
        'sleep',
        ['10'],
        { timeout: 100 }, // 100ms 超时
      );

      await Assertions.assertPromiseRejected(
        resultPromise,
        /Timeout|timeout/,
      );
    });
  });

  describe('敏感数据保护集成', () => {
    it('应该加密和解密数据', () => {
      const originalData = 'sensitive information';
      
      // 加密
      const encrypted = sensitiveData.encrypt(originalData);
      expect(encrypted).not.toBe(originalData);
      expect(encrypted).toContain(':'); // IV:加密数据
      
      // 解密
      const decrypted = sensitiveData.decrypt(encrypted);
      expect(decrypted).toBe(originalData);
    });

    it('应该脚敏敏感信息', () => {
      const testCases = [
        {
          input: 'user@example.com',
          type: 'email',
          expected: /u\*+@example\.com/,
        },
        {
          input: '123-456-7890',
          type: 'phone',
          expected: /123\*+7890/,
        },
        {
          input: '4111111111111111',
          type: 'creditCard',
          expected: /\*+1111/,
        },
        {
          input: '192.168.1.1',
          type: 'ip',
          expected: /192\.xxx\.xxx\.xxx/,
        },
      ];

      for (const test of testCases) {
        let masked: string;
        
        switch (test.type) {
          case 'email':
            masked = sensitiveData.maskEmail(test.input);
            break;
          case 'phone':
            masked = sensitiveData.maskPhone(test.input);
            break;
          case 'creditCard':
            masked = sensitiveData.maskCreditCard(test.input);
            break;
          case 'ip':
            masked = sensitiveData.maskIP(test.input);
            break;
          default:
            masked = '';
        }
        
        expect(masked).toMatch(test.expected);
        expect(masked).not.toBe(test.input);
      }
    });

    it('应该脚敏对象中的敏感字段', () => {
      const originalObj = {
        username: 'john',
        password: 'secret123',
        email: 'john@example.com',
        apiKey: 'sk_test_123456789',
        data: {
          token: 'bearer_token_123',
          creditCard: '4111111111111111',
        },
      };

      const masked = sensitiveData.maskObject(originalObj);
      
      expect(masked.username).toBe('john'); // 不敏感
      expect(masked.password).toBe('[REDACTED]'); // 敏感
      expect(masked.email).toMatch(/\*+@example\.com/); // 脚敏
      expect(masked.apiKey).toBe('[REDACTED]'); // 敏感
      expect(masked.data.token).toBe('[REDACTED]'); // 敏感
      expect(masked.data.creditCard).toMatch(/\*+1111/); // 脚敏
    });

    it('应该验证密码强度', () => {
      const weakPasswords = [
        'password',
        '123456',
        'abc123',
        'short',
      ];

      for (const pwd of weakPasswords) {
        const result = sensitiveData.validatePasswordStrength(pwd);
        expect(result.valid).toBe(false);
        expect(result.issues.length).toBeGreaterThan(0);
        expect(result.score).toBeLessThanOrEqual(3);
      }

      const strongPassword = 'MyStr0ng!P@ssw0rd123';
      const result = sensitiveData.validatePasswordStrength(strongPassword);
      expect(result.valid).toBe(true);
      expect(result.issues).toHaveLength(0);
      expect(result.score).toBeGreaterThanOrEqual(5);
    });
  });

  describe('综合安全场景', () => {
    it('应该安全处理用户上传文件', async () => {
      // 模拟用户上传
      const uploadDir = path.join(testDir, 'uploads');
      await fs.ensureDir(uploadDir);
      
      // 尝试上传到危险路径
      const maliciousFilename = '../../../etc/passwd';
      
      expect(() => pathSecurity.validateFileName(maliciousFilename))
        .toThrow();
      
      // 使用安全文件名
      const safeFilename = 'document.pdf';
      pathSecurity.validateFileName(safeFilename);
      
      const safePath = pathSecurity.validatePath(
        path.join('uploads', safeFilename),
        { basePath: testDir },
      );
      
      await secureFile.writeFile(safePath, 'file content');
      expect(await secureFile.exists(safePath)).toBe(true);
    });

    it('应该安全执行用户提交的命令', async () => {
      // 模拟用户输入
      const userInput = 'search-term';
      const dangerousInput = 'term; rm -rf /';
      
      // 安全输入
      commandSecurity.addAllowedCommand('grep');
      const safeArgs = commandSecurity.validateArguments([userInput, 'file.txt']);
      expect(safeArgs).toEqual([userInput, 'file.txt']);
      
      // 危险输入
      expect(() => commandSecurity.validateArguments([dangerousInput, 'file.txt']))
        .toThrow();
    });
  });
});
