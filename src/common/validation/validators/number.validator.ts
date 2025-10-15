/**
 * 数字验证器
 */

export class NumberValidator {
  /**
   * 验证是否为有效数字
   */
  static isNumber(value: any): boolean {
    if (typeof value === 'number') {
      return !isNaN(value) && isFinite(value);
    }
    if (typeof value === 'string') {
      const num = Number(value);
      return !isNaN(num) && isFinite(num);
    }
    return false;
  }

  /**
   * 验证是否为整数
   */
  static isInteger(value: any): boolean {
    if (!this.isNumber(value)) {
      return false;
    }
    const num = Number(value);
    return Number.isInteger(num);
  }

  /**
   * 验证是否为正数
   */
  static isPositive(value: any): boolean {
    if (!this.isNumber(value)) {
      return false;
    }
    return Number(value) > 0;
  }

  /**
   * 验证是否为负数
   */
  static isNegative(value: any): boolean {
    if (!this.isNumber(value)) {
      return false;
    }
    return Number(value) < 0;
  }

  /**
   * 验证数字范围
   */
  static isInRange(value: any, min: number, max: number): boolean {
    if (!this.isNumber(value)) {
      return false;
    }
    const num = Number(value);
    return num >= min && num <= max;
  }

  /**
   * 验证是否为端口号
   */
  static isPort(value: any): boolean {
    if (!this.isInteger(value)) {
      return false;
    }
    const port = Number(value);
    return port >= 1 && port <= 65535;
  }

  /**
   * 验证是否为有效的百分比
   */
  static isPercentage(value: any): boolean {
    if (!this.isNumber(value)) {
      return false;
    }
    const num = Number(value);
    return num >= 0 && num <= 100;
  }

  /**
   * 验证是否为有效的文件大小
   */
  static isValidFileSize(value: any, maxSizeInBytes: number): boolean {
    if (!this.isInteger(value)) {
      return false;
    }
    const size = Number(value);
    return size >= 0 && size <= maxSizeInBytes;
  }

  /**
   * 验证是否为有效的数组索引
   */
  static isValidIndex(value: any, arrayLength: number): boolean {
    if (!this.isInteger(value)) {
      return false;
    }
    const index = Number(value);
    return index >= 0 && index < arrayLength;
  }

  /**
   * 验证是否为有效的时间戳
   */
  static isTimestamp(value: any): boolean {
    if (!this.isInteger(value)) {
      return false;
    }
    const timestamp = Number(value);
    // 合理的时间戳范围：1970-01-01 到 2100-01-01
    return timestamp >= 0 && timestamp <= 4102444800000;
  }

  /**
   * 验证是否为有效的HTTP状态码
   */
  static isHttpStatusCode(value: any): boolean {
    if (!this.isInteger(value)) {
      return false;
    }
    const code = Number(value);
    return code >= 100 && code <= 599;
  }

  /**
   * 验证是否为有效的优先级
   */
  static isPriority(value: any, maxPriority: number = 10): boolean {
    if (!this.isInteger(value)) {
      return false;
    }
    const priority = Number(value);
    return priority >= 0 && priority <= maxPriority;
  }

  /**
   * 清理数字（移除非数字字符）
   */
  static sanitize(value: any): number | null {
    if (typeof value === 'number') {
      return isFinite(value) ? value : null;
    }
    
    if (typeof value === 'string') {
      // 移除非数字字符（保留小数点和负号）
      const cleaned = value.replace(/[^0-9.-]/g, '');
      const num = Number(cleaned);
      return !isNaN(num) && isFinite(num) ? num : null;
    }
    
    return null;
  }

  /**
   * 转换为安全的整数
   */
  static toSafeInteger(value: any, defaultValue: number = 0): number {
    const num = this.sanitize(value);
    if (num === null) {
      return defaultValue;
    }
    
    // 确保在安全整数范围内
    if (num > Number.MAX_SAFE_INTEGER) {
      return Number.MAX_SAFE_INTEGER;
    }
    if (num < Number.MIN_SAFE_INTEGER) {
      return Number.MIN_SAFE_INTEGER;
    }
    
    return Math.floor(num);
  }

  /**
   * 限制数字范围
   */
  static clamp(value: any, min: number, max: number): number {
    const num = this.sanitize(value);
    if (num === null) {
      return min;
    }
    
    if (num < min) return min;
    if (num > max) return max;
    return num;
  }
}
