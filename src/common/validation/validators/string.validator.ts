/**
 * 字符串验证器
 */

export class StringValidator {
  /**
   * 验证是否为空
   */
  static isNotEmpty(value: any): boolean {
    if (value === null || value === undefined) {
      return false;
    }
    if (typeof value !== 'string') {
      return false;
    }
    return value.trim().length > 0;
  }

  /**
   * 验证长度范围
   */
  static isLength(value: string, min: number, max?: number): boolean {
    if (typeof value !== 'string') {
      return false;
    }
    const len = value.length;
    if (max === undefined) {
      return len >= min;
    }
    return len >= min && len <= max;
  }

  /**
   * 验证是否为有效的邮箱
   */
  static isEmail(value: string): boolean {
    if (typeof value !== 'string') {
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  }

  /**
   * 验证是否为有效的URL
   */
  static isURL(value: string): boolean {
    if (typeof value !== 'string') {
      return false;
    }
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 验证是否匹配正则表达式
   */
  static matches(value: string, pattern: RegExp | string): boolean {
    if (typeof value !== 'string') {
      return false;
    }
    const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
    return regex.test(value);
  }

  /**
   * 验证是否为字母数字
   */
  static isAlphanumeric(value: string): boolean {
    if (typeof value !== 'string') {
      return false;
    }
    return /^[a-zA-Z0-9]+$/.test(value);
  }

  /**
   * 验证是否为有效的模块名
   */
  static isValidModuleName(value: string): boolean {
    if (typeof value !== 'string') {
      return false;
    }
    // 模块名规则：小写字母、数字、横线，不能以数字开头
    return /^[a-z][a-z0-9-]*$/.test(value);
  }

  /**
   * 验证是否为有效的版本号
   */
  static isVersion(value: string): boolean {
    if (typeof value !== 'string') {
      return false;
    }
    // 支持 semver 格式
    return /^\d+\.\d+\.\d+(-[a-zA-Z0-9.-]+)?(\+[a-zA-Z0-9.-]+)?$/.test(value);
  }

  /**
   * 验证是否为有效的JSON字符串
   */
  static isJSON(value: string): boolean {
    if (typeof value !== 'string') {
      return false;
    }
    try {
      JSON.parse(value);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 验证是否为有效的Base64字符串
   */
  static isBase64(value: string): boolean {
    if (typeof value !== 'string') {
      return false;
    }
    const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
    return base64Regex.test(value) && value.length % 4 === 0;
  }

  /**
   * 验证是否为有效的UUID
   */
  static isUUID(value: string, version?: 3 | 4 | 5): boolean {
    if (typeof value !== 'string') {
      return false;
    }
    
    const patterns = {
      3: /^[0-9a-f]{8}-[0-9a-f]{4}-3[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      4: /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      5: /^[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      all: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    };
    
    return version ? patterns[version].test(value) : patterns.all.test(value);
  }

  /**
   * 验证是否包含危险字符
   */
  static isSafe(value: string): boolean {
    if (typeof value !== 'string') {
      return false;
    }
    
    // 检查常见的危险字符和模式
    const dangerousPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+\s*=/i,  // onclick=, onload=, etc.
      /[;&|`$]/,     // Shell危险字符
      /\.\.[\/\\]/,  // 路径遍历
      /\x00/,        // Null字节
    ];
    
    return !dangerousPatterns.some(pattern => pattern.test(value));
  }

  /**
   * 清理字符串（移除危险字符）
   */
  static sanitize(value: string): string {
    if (typeof value !== 'string') {
      return '';
    }
    
    // 移除HTML标签
    let cleaned = value.replace(/<[^>]*>/g, '');
    
    // 移除危险字符
    cleaned = cleaned.replace(/[;&|`$]/g, '');
    
    // 移除null字节
    cleaned = cleaned.replace(/\x00/g, '');
    
    // 移除多余的空白
    cleaned = cleaned.trim();
    
    return cleaned;
  }

  /**
   * 转义HTML特殊字符
   */
  static escapeHtml(value: string): string {
    if (typeof value !== 'string') {
      return '';
    }
    
    const htmlEscapes: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };
    
    return value.replace(/[&<>"']/g, char => htmlEscapes[char]);
  }

  /**
   * 转义Shell特殊字符
   */
  static escapeShell(value: string): string {
    if (typeof value !== 'string') {
      return '';
    }
    
    // 对于Shell命令，使用单引号包裹并转义单引号
    return "'" + value.replace(/'/g, "'\\''") + "'";
  }
}