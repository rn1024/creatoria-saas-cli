/**
 * 敏感数据保护服务
 */

import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { getSecurityConfig } from './security.config';
import { LoggerService } from '../logger/logger.service';

@Injectable()
export class SensitiveDataService {
  private encryptionKey: Buffer;
  private redactPatterns: RegExp[];
  private protectedFields: Set<string>;
  
  constructor(
    private readonly logger: LoggerService,
  ) {
    this.initializeEncryption();
    this.initializePatterns();
  }

  /**
   * 初始化加密
   */
  private initializeEncryption(): void {
    // 从环境变量获取密钥，或生成默认密钥
    const keySource = process.env.ENCRYPTION_KEY || 'default-encryption-key-change-in-production';
    this.encryptionKey = crypto.createHash('sha256').update(keySource).digest();
  }

  /**
   * 初始化敏感数据模式
   */
  private initializePatterns(): void {
    const config = getSecurityConfig();
    this.redactPatterns = config.sensitiveData.redactPatterns;
    this.protectedFields = new Set(config.sensitiveData.protectedFields);
  }

  /**
   * 加密敏感数据
   */
  encrypt(data: string): string {
    try {
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv('aes-256-cbc', this.encryptionKey, iv);
      
      let encrypted = cipher.update(data, 'utf8', 'base64');
      encrypted += cipher.final('base64');
      
      // 返回iv:加密数据
      return iv.toString('base64') + ':' + encrypted;
    } catch (error) {
      this.logger.error('加密失败', { error: error.message });
      throw error;
    }
  }

  /**
   * 解密敏感数据
   */
  decrypt(encryptedData: string): string {
    try {
      const parts = encryptedData.split(':');
      if (parts.length !== 2) {
        throw new Error('Invalid encrypted data format');
      }
      
      const iv = Buffer.from(parts[0], 'base64');
      const encrypted = parts[1];
      
      const decipher = crypto.createDecipheriv('aes-256-cbc', this.encryptionKey, iv);
      
      let decrypted = decipher.update(encrypted, 'base64', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      this.logger.error('解密失败', { error: error.message });
      throw error;
    }
  }

  /**
   * 哈希敏感数据
   */
  hash(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * 脚敏字符串
   */
  maskString(value: string, options: {
    showFirst?: number;
    showLast?: number;
    maskChar?: string;
  } = {}): string {
    if (!value || value.length === 0) {
      return value;
    }
    
    const showFirst = options.showFirst || 0;
    const showLast = options.showLast || 0;
    const maskChar = options.maskChar || '*';
    
    if (value.length <= showFirst + showLast) {
      return maskChar.repeat(value.length);
    }
    
    const start = value.substring(0, showFirst);
    const end = value.substring(value.length - showLast);
    const middle = maskChar.repeat(value.length - showFirst - showLast);
    
    return start + middle + end;
  }

  /**
   * 脚敏邮箱
   */
  maskEmail(email: string): string {
    const parts = email.split('@');
    if (parts.length !== 2) {
      return this.maskString(email);
    }
    
    const [localPart, domain] = parts;
    const maskedLocal = this.maskString(localPart, { showFirst: 1, showLast: 1 });
    
    return `${maskedLocal}@${domain}`;
  }

  /**
   * 脚敏电话
   */
  maskPhone(phone: string): string {
    // 移除非数字字符
    const digitsOnly = phone.replace(/\D/g, '');
    
    if (digitsOnly.length < 7) {
      return this.maskString(phone);
    }
    
    // 显示前3位和后4位
    return this.maskString(digitsOnly, { showFirst: 3, showLast: 4 });
  }

  /**
   * 脚敏信用卡
   */
  maskCreditCard(cardNumber: string): string {
    // 移除非数字字符
    const digitsOnly = cardNumber.replace(/\D/g, '');
    
    if (digitsOnly.length < 12) {
      return this.maskString(cardNumber);
    }
    
    // 只显示后4位
    return this.maskString(digitsOnly, { showLast: 4 });
  }

  /**
   * 脚敏IP地址
   */
  maskIP(ip: string): string {
    const parts = ip.split('.');
    if (parts.length !== 4) {
      return this.maskString(ip);
    }
    
    // 保留第一段，脚敏后三段
    return `${parts[0]}.xxx.xxx.xxx`;
  }

  /**
   * 脚敏对象中的敏感字段
   */
  maskObject(obj: any, depth: number = 0): any {
    if (depth > 10) return obj; // 防止无限递归
    
    if (obj === null || obj === undefined) {
      return obj;
    }
    
    if (typeof obj !== 'object') {
      return obj;
    }
    
    if (Array.isArray(obj)) {
      return obj.map(item => this.maskObject(item, depth + 1));
    }
    
    const masked: any = {};
    
    for (const [key, value] of Object.entries(obj)) {
      const lowerKey = key.toLowerCase();
      
      // 检查是否为保护字段
      if (this.isProtectedField(lowerKey)) {
        masked[key] = this.maskValue(value, lowerKey);
      } else if (typeof value === 'object' && value !== null) {
        masked[key] = this.maskObject(value, depth + 1);
      } else if (typeof value === 'string') {
        masked[key] = this.redactSensitivePatterns(value);
      } else {
        masked[key] = value;
      }
    }
    
    return masked;
  }

  /**
   * 检查是否为保护字段
   */
  private isProtectedField(fieldName: string): boolean {
    const lowerName = fieldName.toLowerCase();
    
    // 精确匹配
    if (this.protectedFields.has(lowerName)) {
      return true;
    }
    
    // 模糊匹配
    for (const protectedField of this.protectedFields) {
      if (lowerName.includes(protectedField)) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * 脚敏值
   */
  private maskValue(value: any, fieldName: string): any {
    if (value === null || value === undefined) {
      return value;
    }
    
    if (typeof value !== 'string') {
      return '[REDACTED]';
    }
    
    // 根据字段名称选择脚敏方式
    if (fieldName.includes('email')) {
      return this.maskEmail(value);
    } else if (fieldName.includes('phone')) {
      return this.maskPhone(value);
    } else if (fieldName.includes('card') || fieldName.includes('credit')) {
      return this.maskCreditCard(value);
    } else if (fieldName.includes('ip')) {
      return this.maskIP(value);
    } else if (fieldName.includes('token') || fieldName.includes('key') || fieldName.includes('secret')) {
      return '[REDACTED]';
    } else {
      return this.maskString(value, { showFirst: 2, showLast: 2 });
    }
  }

  /**
   * 使用正则脚敏敏感模式
   */
  redactSensitivePatterns(text: string): string {
    let redacted = text;
    
    for (const pattern of this.redactPatterns) {
      redacted = redacted.replace(pattern, '[REDACTED]');
    }
    
    return redacted;
  }

  /**
   * 脚敏日志消息
   */
  maskLogMessage(message: string, context?: any): { message: string; context?: any } {
    const config = getSecurityConfig();
    
    if (!config.sensitiveData.maskInLogs) {
      return { message, context };
    }
    
    // 脚敏消息中的敏感模式
    const maskedMessage = this.redactSensitivePatterns(message);
    
    // 脚敏上下文对象
    const maskedContext = context ? this.maskObject(context) : undefined;
    
    return {
      message: maskedMessage,
      context: maskedContext,
    };
  }

  /**
   * 检查文本是否包含敏感信息
   */
  containsSensitiveData(text: string): boolean {
    for (const pattern of this.redactPatterns) {
      if (pattern.test(text)) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * 生成安全的随机令牌
   */
  generateSecureToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * 生成安全的API密钥
   */
  generateApiKey(prefix: string = 'sk'): string {
    const token = this.generateSecureToken(24);
    return `${prefix}_${token}`;
  }

  /**
   * 验证密码强度
   */
  validatePasswordStrength(password: string): {
    valid: boolean;
    score: number;
    issues: string[];
  } {
    const issues: string[] = [];
    let score = 0;
    
    // 长度检查
    if (password.length < 8) {
      issues.push('密码长度至少为8个字符');
    } else if (password.length >= 12) {
      score += 2;
    } else {
      score += 1;
    }
    
    // 大写字母
    if (!/[A-Z]/.test(password)) {
      issues.push('密码必须包含大写字母');
    } else {
      score += 1;
    }
    
    // 小写字母
    if (!/[a-z]/.test(password)) {
      issues.push('密码必须包含小写字母');
    } else {
      score += 1;
    }
    
    // 数字
    if (!/\d/.test(password)) {
      issues.push('密码必须包含数字');
    } else {
      score += 1;
    }
    
    // 特殊字符
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      issues.push('密码必须包含特殊字符');
    } else {
      score += 1;
    }
    
    // 常见密码检查
    const commonPasswords = [
      'password', '123456', '12345678', 'qwerty', 'abc123',
      'password123', 'admin', 'letmein', 'welcome', 'monkey'
    ];
    
    if (commonPasswords.includes(password.toLowerCase())) {
      issues.push('密码太常见，容易被破解');
      score = 0;
    }
    
    return {
      valid: issues.length === 0,
      score: Math.min(score, 5),
      issues,
    };
  }
}
