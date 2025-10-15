/**
 * 数据脚敏服务
 */

import { Injectable } from '@nestjs/common';
import { SensitiveDataService } from './sensitive-data.service';
import { LoggerService } from '../logger/logger.service';

export interface MaskingRule {
  pattern: RegExp | string;
  replacement: string | ((match: string) => string);
  description: string;
}

@Injectable()
export class DataMaskingService {
  private maskingRules: MaskingRule[] = [];
  
  constructor(
    private readonly sensitiveData: SensitiveDataService,
    private readonly logger: LoggerService,
  ) {
    this.initializeDefaultRules();
  }

  /**
   * 初始化默认脚敏规则
   */
  private initializeDefaultRules(): void {
    this.maskingRules = [
      // 邮箱
      {
        pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
        replacement: (match: string) => this.sensitiveData.maskEmail(match),
        description: 'Email addresses',
      },
      
      // 电话号码
      {
        pattern: /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g,
        replacement: (match: string) => this.sensitiveData.maskPhone(match),
        description: 'Phone numbers',
      },
      
      // 信用卡
      {
        pattern: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g,
        replacement: (match: string) => this.sensitiveData.maskCreditCard(match),
        description: 'Credit card numbers',
      },
      
      // SSN
      {
        pattern: /\b\d{3}-\d{2}-\d{4}\b/g,
        replacement: 'XXX-XX-XXXX',
        description: 'Social Security Numbers',
      },
      
      // IP地址
      {
        pattern: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g,
        replacement: (match: string) => this.sensitiveData.maskIP(match),
        description: 'IP addresses',
      },
      
      // API密钥
      {
        pattern: /\b(sk|pk|api[_-]?key|token)[_-]?[A-Za-z0-9]{20,}\b/gi,
        replacement: '[API_KEY_REDACTED]',
        description: 'API keys and tokens',
      },
      
      // JWT
      {
        pattern: /Bearer\s+[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+/g,
        replacement: 'Bearer [JWT_REDACTED]',
        description: 'JWT tokens',
      },
      
      // 密码
      {
        pattern: /"password"\s*:\s*"[^"]+"/gi,
        replacement: '"password":"[REDACTED]"',
        description: 'Password fields in JSON',
      },
      
      // AWS访问密钥
      {
        pattern: /\b(AKIA|ASIA)[A-Z0-9]{16}\b/g,
        replacement: '[AWS_ACCESS_KEY_REDACTED]',
        description: 'AWS Access Keys',
      },
      
      // 私钥
      {
        pattern: /-----BEGIN (RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----[\s\S]+?-----END (RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----/g,
        replacement: '[PRIVATE_KEY_REDACTED]',
        description: 'Private keys',
      },
    ];
  }

  /**
   * 添加自定义脚敏规则
   */
  addMaskingRule(rule: MaskingRule): void {
    this.maskingRules.push(rule);
    this.logger.debug('添加脚敏规则', { description: rule.description });
  }

  /**
   * 脚敏文本
   */
  maskText(text: string): string {
    let maskedText = text;
    
    for (const rule of this.maskingRules) {
      const pattern = typeof rule.pattern === 'string' 
        ? new RegExp(rule.pattern, 'g')
        : rule.pattern;
      
      if (typeof rule.replacement === 'function') {
        maskedText = maskedText.replace(pattern, rule.replacement);
      } else {
        maskedText = maskedText.replace(pattern, rule.replacement);
      }
    }
    
    return maskedText;
  }

  /**
   * 脚敏JSON对象
   */
  maskJSON(obj: any): any {
    if (obj === null || obj === undefined) {
      return obj;
    }
    
    // 先转换为JSON字符串
    const jsonString = JSON.stringify(obj);
    
    // 脚敏字符串
    const maskedString = this.maskText(jsonString);
    
    // 转换回对象
    try {
      return JSON.parse(maskedString);
    } catch {
      // 如果解析失败，使用敏感数据服务的方法
      return this.sensitiveData.maskObject(obj);
    }
  }

  /**
   * 脚敏日志消息
   */
  maskLogEntry(level: string, message: string, context?: any): {
    level: string;
    message: string;
    context?: any;
    masked: boolean;
  } {
    // 使用敏感数据服务脚敏
    const { message: maskedMessage, context: maskedContext } = 
      this.sensitiveData.maskLogMessage(message, context);
    
    // 额外的文本脚敏
    const finalMessage = this.maskText(maskedMessage);
    
    return {
      level,
      message: finalMessage,
      context: maskedContext,
      masked: finalMessage !== message || maskedContext !== context,
    };
  }

  /**
   * 脚敏文件内容
   */
  async maskFileContent(content: string, fileType: string): Promise<string> {
    // 根据文件类型选择脚敏策略
    switch (fileType) {
      case '.json':
        try {
          const obj = JSON.parse(content);
          const masked = this.maskJSON(obj);
          return JSON.stringify(masked, null, 2);
        } catch {
          return this.maskText(content);
        }
      
      case '.env':
        // 环境变量文件特殊处理
        return this.maskEnvFile(content);
      
      case '.log':
        // 日志文件逐行脚敏
        return this.maskLogFile(content);
      
      default:
        // 默认文本脚敏
        return this.maskText(content);
    }
  }

  /**
   * 脚敏环境变量文件
   */
  private maskEnvFile(content: string): string {
    const lines = content.split('\n');
    const maskedLines: string[] = [];
    
    const sensitiveKeys = [
      'PASSWORD', 'SECRET', 'KEY', 'TOKEN',
      'API', 'PRIVATE', 'CREDENTIAL', 'AUTH',
    ];
    
    for (const line of lines) {
      // 跳过注释和空行
      if (line.startsWith('#') || line.trim() === '') {
        maskedLines.push(line);
        continue;
      }
      
      const [key, ...valueParts] = line.split('=');
      const value = valueParts.join('=');
      
      if (key && value) {
        const upperKey = key.toUpperCase();
        const needsMasking = sensitiveKeys.some(sensitive => 
          upperKey.includes(sensitive)
        );
        
        if (needsMasking) {
          maskedLines.push(`${key}=[REDACTED]`);
        } else {
          // 还是要检查值中的敏感信息
          const maskedValue = this.maskText(value);
          maskedLines.push(`${key}=${maskedValue}`);
        }
      } else {
        maskedLines.push(line);
      }
    }
    
    return maskedLines.join('\n');
  }

  /**
   * 脚敏日志文件
   */
  private maskLogFile(content: string): string {
    const lines = content.split('\n');
    const maskedLines: string[] = [];
    
    for (const line of lines) {
      maskedLines.push(this.maskText(line));
    }
    
    return maskedLines.join('\n');
  }

  /**
   * 脚敏错误堆栈
   */
  maskStackTrace(stack: string): string {
    // 脚敏路径中的用户名
    let masked = stack.replace(
      /\/(?:home|Users)\/[^\/]+/g,
      '/[USER]'
    );
    
    // 脚敏其他敏感信息
    masked = this.maskText(masked);
    
    return masked;
  }

  /**
   * 脚敏HTTP请求
   */
  maskHttpRequest(request: {
    method: string;
    url: string;
    headers?: Record<string, string>;
    body?: any;
  }): any {
    const masked: any = {
      method: request.method,
      url: this.maskText(request.url),
    };
    
    // 脚敏头部
    if (request.headers) {
      masked.headers = {};
      const sensitiveHeaders = [
        'authorization', 'cookie', 'x-api-key',
        'x-auth-token', 'x-access-token',
      ];
      
      for (const [key, value] of Object.entries(request.headers)) {
        const lowerKey = key.toLowerCase();
        if (sensitiveHeaders.includes(lowerKey)) {
          masked.headers[key] = '[REDACTED]';
        } else {
          masked.headers[key] = this.maskText(value);
        }
      }
    }
    
    // 脚敏请求体
    if (request.body) {
      masked.body = this.maskJSON(request.body);
    }
    
    return masked;
  }

  /**
   * 脚敏HTTP响应
   */
  maskHttpResponse(response: {
    status: number;
    headers?: Record<string, string>;
    body?: any;
  }): any {
    const masked: any = {
      status: response.status,
    };
    
    // 脚敏头部
    if (response.headers) {
      masked.headers = {};
      const sensitiveHeaders = ['set-cookie'];
      
      for (const [key, value] of Object.entries(response.headers)) {
        const lowerKey = key.toLowerCase();
        if (sensitiveHeaders.includes(lowerKey)) {
          masked.headers[key] = '[REDACTED]';
        } else {
          masked.headers[key] = value;
        }
      }
    }
    
    // 脚敏响应体
    if (response.body) {
      masked.body = this.maskJSON(response.body);
    }
    
    return masked;
  }

  /**
   * 获取脚敏统计
   */
  getMaskingStats(): {
    rulesCount: number;
    rules: Array<{ pattern: string; description: string }>;
  } {
    return {
      rulesCount: this.maskingRules.length,
      rules: this.maskingRules.map(rule => ({
        pattern: rule.pattern.toString(),
        description: rule.description,
      })),
    };
  }
}
