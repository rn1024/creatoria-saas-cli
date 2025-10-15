/**
 * 字符串验证器单元测试
 */

import { StringValidator } from '../../../../src/common/validation/validators/string.validator';
import { Assertions } from '../../../utils/assertions';

describe('StringValidator', () => {
  describe('isNotEmpty', () => {
    it('应该验证非空字符串', () => {
      expect(StringValidator.isNotEmpty('hello')).toBe(true);
      expect(StringValidator.isNotEmpty(' hello ')).toBe(true);
      expect(StringValidator.isNotEmpty('0')).toBe(true);
    });

    it('应该拒绝空字符串', () => {
      expect(StringValidator.isNotEmpty('')).toBe(false);
      expect(StringValidator.isNotEmpty('  ')).toBe(false);
      expect(StringValidator.isNotEmpty(null)).toBe(false);
      expect(StringValidator.isNotEmpty(undefined)).toBe(false);
      expect(StringValidator.isNotEmpty(123 as any)).toBe(false);
    });
  });

  describe('isLength', () => {
    it('应该验证字符串长度', () => {
      expect(StringValidator.isLength('hello', 5, 10)).toBe(true);
      expect(StringValidator.isLength('hello', 1, 5)).toBe(true);
      expect(StringValidator.isLength('hello', 5, 5)).toBe(true);
      expect(StringValidator.isLength('hello', 5)).toBe(true);
    });

    it('应该拒绝不符合长度的字符串', () => {
      expect(StringValidator.isLength('hello', 6, 10)).toBe(false);
      expect(StringValidator.isLength('hello', 1, 4)).toBe(false);
      expect(StringValidator.isLength(123 as any, 1, 10)).toBe(false);
    });
  });

  describe('isEmail', () => {
    it('应该验证有效的邮箱', () => {
      expect(StringValidator.isEmail('test@example.com')).toBe(true);
      expect(StringValidator.isEmail('user.name@example.co.uk')).toBe(true);
      expect(StringValidator.isEmail('user+tag@example.com')).toBe(true);
    });

    it('应该拒绝无效的邮箱', () => {
      expect(StringValidator.isEmail('invalid')).toBe(false);
      expect(StringValidator.isEmail('@example.com')).toBe(false);
      expect(StringValidator.isEmail('user@')).toBe(false);
      expect(StringValidator.isEmail('user @example.com')).toBe(false);
      expect(StringValidator.isEmail(123 as any)).toBe(false);
    });
  });

  describe('isURL', () => {
    it('应该验证有效的URL', () => {
      expect(StringValidator.isURL('https://example.com')).toBe(true);
      expect(StringValidator.isURL('http://localhost:3000')).toBe(true);
      expect(StringValidator.isURL('ftp://files.example.com')).toBe(true);
      expect(StringValidator.isURL('https://example.com/path?query=value')).toBe(true);
    });

    it('应该拒绝无效的URL', () => {
      expect(StringValidator.isURL('not a url')).toBe(false);
      expect(StringValidator.isURL('example.com')).toBe(false);
      expect(StringValidator.isURL('//example.com')).toBe(false);
      expect(StringValidator.isURL(123 as any)).toBe(false);
    });
  });

  describe('isValidModuleName', () => {
    it('应该验证有效的模块名', () => {
      expect(StringValidator.isValidModuleName('module')).toBe(true);
      expect(StringValidator.isValidModuleName('my-module')).toBe(true);
      expect(StringValidator.isValidModuleName('module123')).toBe(true);
      expect(StringValidator.isValidModuleName('a')).toBe(true);
    });

    it('应该拒绝无效的模块名', () => {
      expect(StringValidator.isValidModuleName('Module')).toBe(false);
      expect(StringValidator.isValidModuleName('123module')).toBe(false);
      expect(StringValidator.isValidModuleName('module_name')).toBe(false);
      expect(StringValidator.isValidModuleName('module name')).toBe(false);
      expect(StringValidator.isValidModuleName('')).toBe(false);
    });
  });

  describe('isSafe', () => {
    it('应该验证安全的字符串', () => {
      expect(StringValidator.isSafe('hello world')).toBe(true);
      expect(StringValidator.isSafe('user@example.com')).toBe(true);
      expect(StringValidator.isSafe('path/to/file.txt')).toBe(true);
    });

    it('应该检测危险字符', () => {
      expect(StringValidator.isSafe('<script>alert(1)</script>')).toBe(false);
      expect(StringValidator.isSafe('javascript:void(0)')).toBe(false);
      expect(StringValidator.isSafe('onclick="alert(1)"')).toBe(false);
      expect(StringValidator.isSafe('rm -rf /')).toBe(false);
      expect(StringValidator.isSafe('../../../etc/passwd')).toBe(false);
    });
  });

  describe('sanitize', () => {
    it('应该清理危险字符', () => {
      expect(StringValidator.sanitize('<script>alert(1)</script>'))
        .toBe('alert(1)');
      expect(StringValidator.sanitize('hello; rm -rf /'))
        .toBe('hello rm -rf /');
      expect(StringValidator.sanitize('  text  '))
        .toBe('text');
    });

    it('应该处理非字符串输入', () => {
      expect(StringValidator.sanitize(null as any)).toBe('');
      expect(StringValidator.sanitize(undefined as any)).toBe('');
      expect(StringValidator.sanitize(123 as any)).toBe('');
    });
  });

  describe('escapeHtml', () => {
    it('应该转义HTML特殊字符', () => {
      expect(StringValidator.escapeHtml('<div>Hello</div>'))
        .toBe('&lt;div&gt;Hello&lt;/div&gt;');
      expect(StringValidator.escapeHtml('"Hello"'))
        .toBe('&quot;Hello&quot;');
      expect(StringValidator.escapeHtml("It's me"))
        .toBe('It&#39;s me');
      expect(StringValidator.escapeHtml('A & B'))
        .toBe('A &amp; B');
    });

    it('应该处理非字符串输入', () => {
      expect(StringValidator.escapeHtml(null as any)).toBe('');
      expect(StringValidator.escapeHtml(undefined as any)).toBe('');
    });
  });

  describe('escapeShell', () => {
    it('应该转义Shell特殊字符', () => {
      expect(StringValidator.escapeShell('hello world'))
        .toBe("'hello world'");
      expect(StringValidator.escapeShell("it's me"))
        .toBe("'it'\\''s me'");
      expect(StringValidator.escapeShell('rm -rf /'))
        .toBe("'rm -rf /'");
    });

    it('应该处理非字符串输入', () => {
      expect(StringValidator.escapeShell(null as any)).toBe("''");
      expect(StringValidator.escapeShell(undefined as any)).toBe("''");
    });
  });

  describe('isVersion', () => {
    it('应该验证有效的版本号', () => {
      expect(StringValidator.isVersion('1.0.0')).toBe(true);
      expect(StringValidator.isVersion('2.1.3')).toBe(true);
      expect(StringValidator.isVersion('1.0.0-beta')).toBe(true);
      expect(StringValidator.isVersion('1.0.0-beta.1')).toBe(true);
      expect(StringValidator.isVersion('1.0.0+build.123')).toBe(true);
    });

    it('应该拒绝无效的版本号', () => {
      expect(StringValidator.isVersion('1.0')).toBe(false);
      expect(StringValidator.isVersion('v1.0.0')).toBe(false);
      expect(StringValidator.isVersion('1.0.0.0')).toBe(false);
      expect(StringValidator.isVersion('not-a-version')).toBe(false);
    });
  });

  describe('isJSON', () => {
    it('应该验证有效的JSON字符串', () => {
      expect(StringValidator.isJSON('{}')).toBe(true);
      expect(StringValidator.isJSON('[]')).toBe(true);
      expect(StringValidator.isJSON('{"key":"value"}')).toBe(true);
      expect(StringValidator.isJSON('[1,2,3]')).toBe(true);
      expect(StringValidator.isJSON('"string"')).toBe(true);
      expect(StringValidator.isJSON('123')).toBe(true);
      expect(StringValidator.isJSON('true')).toBe(true);
      expect(StringValidator.isJSON('null')).toBe(true);
    });

    it('应该拒绝无效的JSON字符串', () => {
      expect(StringValidator.isJSON('{key:"value"}')).toBe(false);
      expect(StringValidator.isJSON('[1,2,3,]')).toBe(false);
      expect(StringValidator.isJSON('undefined')).toBe(false);
      expect(StringValidator.isJSON('not json')).toBe(false);
    });
  });

  describe('isBase64', () => {
    it('应该验证有效的Base64字符串', () => {
      expect(StringValidator.isBase64('SGVsbG8gV29ybGQ=')).toBe(true);
      expect(StringValidator.isBase64('SGVsbG8gV29ybGQ')).toBe(true);
      expect(StringValidator.isBase64('U29tZSBkYXRh')).toBe(true);
      expect(StringValidator.isBase64('')).toBe(true);
    });

    it('应该拒绝无效的Base64字符串', () => {
      expect(StringValidator.isBase64('Hello World!')).toBe(false);
      expect(StringValidator.isBase64('SGVsbG8gV29ybGQ===')).toBe(false);
      expect(StringValidator.isBase64('SGVs bG8=')).toBe(false);
    });
  });

  describe('isUUID', () => {
    it('应该验证有效的UUID', () => {
      expect(StringValidator.isUUID('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
      expect(StringValidator.isUUID('550e8400-e29b-31d4-a716-446655440000', 3)).toBe(true);
      expect(StringValidator.isUUID('550e8400-e29b-41d4-a716-446655440000', 4)).toBe(true);
      expect(StringValidator.isUUID('550e8400-e29b-51d4-a716-446655440000', 5)).toBe(true);
    });

    it('应该拒绝无效的UUID', () => {
      expect(StringValidator.isUUID('not-a-uuid')).toBe(false);
      expect(StringValidator.isUUID('550e8400-e29b-61d4-a716-446655440000')).toBe(false);
      expect(StringValidator.isUUID('550e8400-e29b-41d4-a716-44665544000')).toBe(false);
      expect(StringValidator.isUUID('550e8400-e29b-31d4-a716-446655440000', 4)).toBe(false);
    });
  });
});
