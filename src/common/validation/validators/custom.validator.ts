/**
 * 自定义验证器
 */

import { StringValidator } from './string.validator';
import { NumberValidator } from './number.validator';
import { PathValidator } from './path.validator';

export interface ValidationRule {
  validator: (value: any) => boolean | Promise<boolean>;
  message: string;
}

export interface ValidationSchema {
  [field: string]: ValidationRule[];
}

export interface ValidationResult {
  valid: boolean;
  errors: { field: string; message: string }[];
}

export class CustomValidator {
  private static rules: Map<string, ValidationRule> = new Map();

  /**
   * 注册自定义验证规则
   */
  static registerRule(name: string, rule: ValidationRule): void {
    this.rules.set(name, rule);
  }

  /**
   * 获取验证规则
   */
  static getRule(name: string): ValidationRule | undefined {
    return this.rules.get(name);
  }

  /**
   * 验证模块名称
   */
  static validateModuleName(value: string): ValidationResult {
    const errors: { field: string; message: string }[] = [];
    
    if (!StringValidator.isNotEmpty(value)) {
      errors.push({ field: 'moduleName', message: '模块名称不能为空' });
    } else if (!StringValidator.isValidModuleName(value)) {
      errors.push({ field: 'moduleName', message: '模块名称格式不正确，必须以小写字母开头，只能包含小写字母、数字和横线' });
    } else if (!StringValidator.isLength(value, 2, 50)) {
      errors.push({ field: 'moduleName', message: '模块名称长度必须在2-50个字符之间' });
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * 验证项目名称
   */
  static validateProjectName(value: string): ValidationResult {
    const errors: { field: string; message: string }[] = [];
    
    if (!StringValidator.isNotEmpty(value)) {
      errors.push({ field: 'projectName', message: '项目名称不能为空' });
    } else if (!StringValidator.matches(value, /^[a-z][a-z0-9-_]*$/)) {
      errors.push({ field: 'projectName', message: '项目名称格式不正确，必须以小写字母开头' });
    } else if (!StringValidator.isLength(value, 2, 100)) {
      errors.push({ field: 'projectName', message: '项目名称长度必须在2-100个字符之间' });
    } else if (!StringValidator.isSafe(value)) {
      errors.push({ field: 'projectName', message: '项目名称包含危险字符' });
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * 验证数据库配置
   */
  static validateDatabaseConfig(config: any): ValidationResult {
    const errors: { field: string; message: string }[] = [];
    
    // 验证主机
    if (!StringValidator.isNotEmpty(config.host)) {
      errors.push({ field: 'host', message: '数据库主机不能为空' });
    } else if (!StringValidator.isSafe(config.host)) {
      errors.push({ field: 'host', message: '数据库主机包含危险字符' });
    }
    
    // 验证端口
    if (!NumberValidator.isPort(config.port)) {
      errors.push({ field: 'port', message: '数据库端口无效，必须在1-65535之间' });
    }
    
    // 验证数据库名
    if (!StringValidator.isNotEmpty(config.database)) {
      errors.push({ field: 'database', message: '数据库名不能为空' });
    } else if (!StringValidator.matches(config.database, /^[a-zA-Z][a-zA-Z0-9_]*$/)) {
      errors.push({ field: 'database', message: '数据库名格式不正确' });
    }
    
    // 验证用户名
    if (!StringValidator.isNotEmpty(config.username)) {
      errors.push({ field: 'username', message: '数据库用户名不能为空' });
    } else if (!StringValidator.isSafe(config.username)) {
      errors.push({ field: 'username', message: '数据库用户名包含危险字符' });
    }
    
    // 验证密码（可选）
    if (config.password && !StringValidator.isLength(config.password, 6, 128)) {
      errors.push({ field: 'password', message: '数据库密码长度必须在6-128个字符之间' });
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * 验证API配置
   */
  static validateApiConfig(config: any): ValidationResult {
    const errors: { field: string; message: string }[] = [];
    
    // 验证API URL
    if (!StringValidator.isNotEmpty(config.url)) {
      errors.push({ field: 'url', message: 'API URL不能为空' });
    } else if (!StringValidator.isURL(config.url)) {
      errors.push({ field: 'url', message: 'API URL格式不正确' });
    }
    
    // 验证API Key
    if (config.apiKey && !StringValidator.matches(config.apiKey, /^[a-zA-Z0-9-_]+$/)) {
      errors.push({ field: 'apiKey', message: 'API Key格式不正确' });
    }
    
    // 验证超时时间
    if (config.timeout && !NumberValidator.isInRange(config.timeout, 100, 60000)) {
      errors.push({ field: 'timeout', message: '超时时间必须在100-60000毫秒之间' });
    }
    
    // 验证重试次数
    if (config.retries && !NumberValidator.isInRange(config.retries, 0, 10)) {
      errors.push({ field: 'retries', message: '重试次数必须在0-10之间' });
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * 验证文件上传
   */
  static async validateFileUpload(file: {
    path: string;
    size: number;
    mimetype: string;
  }, options: {
    maxSize?: number;
    allowedTypes?: string[];
    allowedExtensions?: string[];
  } = {}): Promise<ValidationResult> {
    const errors: { field: string; message: string }[] = [];
    
    // 验证文件路径
    if (!await PathValidator.isFile(file.path)) {
      errors.push({ field: 'file', message: '文件不存在' });
      return { valid: false, errors };
    }
    
    // 验证文件大小
    const maxSize = options.maxSize || 10 * 1024 * 1024; // 默认10MB
    if (!NumberValidator.isValidFileSize(file.size, maxSize)) {
      errors.push({ field: 'size', message: `文件大小超过限制（最大${maxSize / 1024 / 1024}MB）` });
    }
    
    // 验证MIME类型
    if (options.allowedTypes && options.allowedTypes.length > 0) {
      if (!options.allowedTypes.includes(file.mimetype)) {
        errors.push({ field: 'type', message: `文件类型不允许，允许的类型：${options.allowedTypes.join(', ')}` });
      }
    }
    
    // 验证文件扩展名
    if (options.allowedExtensions && options.allowedExtensions.length > 0) {
      if (!PathValidator.hasExtension(file.path, options.allowedExtensions)) {
        errors.push({ field: 'extension', message: `文件扩展名不允许，允许的扩展名：${options.allowedExtensions.join(', ')}` });
      }
    }
    
    // 验证文件名安全性
    const fileName = file.path.split('/').pop() || '';
    if (!PathValidator.isValidFileName(fileName)) {
      errors.push({ field: 'filename', message: '文件名包含非法字符' });
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * 验证命令行参数
   */
  static validateCliArgs(args: string[]): ValidationResult {
    const errors: { field: string; message: string }[] = [];
    
    args.forEach((arg, index) => {
      // 检查命令注入
      if (arg.includes(';') || arg.includes('|') || arg.includes('&')) {
        errors.push({ field: `arg[${index}]`, message: '参数包含危险的shell字符' });
      }
      
      // 检查路径遍历
      if (PathValidator.hasPathTraversal(arg)) {
        errors.push({ field: `arg[${index}]`, message: '参数包含路径遍历' });
      }
      
      // 检查SQL注入
      const sqlPatterns = [
        /('|(\-\-)|(;)|(\|\|)|(\/\*)|(<>)|(\*\|))/i,
        /(\b(ALTER|CREATE|DELETE|DROP|EXEC(UTE)?|INSERT|SELECT|UNION|UPDATE)\b)/i
      ];
      
      if (sqlPatterns.some(pattern => pattern.test(arg))) {
        errors.push({ field: `arg[${index}]`, message: '参数可能包含SQL注入' });
      }
    });
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * 使用schema验证对象
   */
  static async validateWithSchema(data: any, schema: ValidationSchema): Promise<ValidationResult> {
    const errors: { field: string; message: string }[] = [];
    
    for (const [field, rules] of Object.entries(schema)) {
      const value = data[field];
      
      for (const rule of rules) {
        try {
          const isValid = await Promise.resolve(rule.validator(value));
          if (!isValid) {
            errors.push({ field, message: rule.message });
          }
        } catch (error) {
          errors.push({ field, message: `验证失败: ${error.message}` });
        }
      }
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * 创建组合验证器
   */
  static combine(...validators: Array<(value: any) => ValidationResult>): (value: any) => ValidationResult {
    return (value: any) => {
      const allErrors: { field: string; message: string }[] = [];
      
      for (const validator of validators) {
        const result = validator(value);
        if (!result.valid) {
          allErrors.push(...result.errors);
        }
      }
      
      return {
        valid: allErrors.length === 0,
        errors: allErrors
      };
    };
  }
}
