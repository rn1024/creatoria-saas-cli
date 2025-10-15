/**
 * 路径验证器
 */

import * as path from 'path';
import * as fs from 'fs-extra';

export class PathValidator {
  /**
   * 验证是否为绝对路径
   */
  static isAbsolute(value: string): boolean {
    if (typeof value !== 'string') {
      return false;
    }
    return path.isAbsolute(value);
  }

  /**
   * 验证是否为相对路径
   */
  static isRelative(value: string): boolean {
    if (typeof value !== 'string') {
      return false;
    }
    return !path.isAbsolute(value);
  }

  /**
   * 验证路径是否存在
   */
  static async exists(value: string): Promise<boolean> {
    if (typeof value !== 'string') {
      return false;
    }
    try {
      await fs.access(value);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 验证路径是否存在（同步）
   */
  static existsSync(value: string): boolean {
    if (typeof value !== 'string') {
      return false;
    }
    try {
      fs.accessSync(value);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 验证是否为文件
   */
  static async isFile(value: string): Promise<boolean> {
    if (typeof value !== 'string') {
      return false;
    }
    try {
      const stats = await fs.stat(value);
      return stats.isFile();
    } catch {
      return false;
    }
  }

  /**
   * 验证是否为目录
   */
  static async isDirectory(value: string): Promise<boolean> {
    if (typeof value !== 'string') {
      return false;
    }
    try {
      const stats = await fs.stat(value);
      return stats.isDirectory();
    } catch {
      return false;
    }
  }

  /**
   * 验证文件扩展名
   */
  static hasExtension(value: string, extensions: string | string[]): boolean {
    if (typeof value !== 'string') {
      return false;
    }
    
    const ext = path.extname(value).toLowerCase();
    const validExtensions = Array.isArray(extensions) ? extensions : [extensions];
    
    return validExtensions.some(validExt => {
      const normalized = validExt.startsWith('.') ? validExt : `.${validExt}`;
      return ext === normalized.toLowerCase();
    });
  }

  /**
   * 验证是否包含路径遍历
   */
  static hasPathTraversal(value: string): boolean {
    if (typeof value !== 'string') {
      return false;
    }
    
    // 检查路径遍历模式
    const patterns = [
      /\.\.\//, // ../
      /\.\.\\/,  // ..\
      /%2e%2e/i, // URL编码的..
      /\.\.%2f/i, // URL编码的../
      /\.\.%5c/i, // URL编码的..\
    ];
    
    return patterns.some(pattern => pattern.test(value));
  }

  /**
   * 验证是否为安全路径
   */
  static isSafePath(value: string, basePath?: string): boolean {
    if (typeof value !== 'string') {
      return false;
    }
    
    // 检查路径遍历
    if (this.hasPathTraversal(value)) {
      return false;
    }
    
    // 检查特殊字符
    const dangerousChars = ['\0', '|', '>', '<', '&', ';', '$', '`', '\n', '\r'];
    if (dangerousChars.some(char => value.includes(char))) {
      return false;
    }
    
    // 如果提供了基础路径，验证解析后的路径是否在基础路径内
    if (basePath) {
      const resolvedPath = path.resolve(basePath, value);
      const normalizedBase = path.resolve(basePath);
      return resolvedPath.startsWith(normalizedBase);
    }
    
    return true;
  }

  /**
   * 验证是否为有效的文件名
   */
  static isValidFileName(value: string): boolean {
    if (typeof value !== 'string' || value.length === 0) {
      return false;
    }
    
    // 检查非法字符
    const invalidChars = /[<>:"|?*\x00-\x1f]/;
    if (invalidChars.test(value)) {
      return false;
    }
    
    // 检查保留名称（Windows）
    const reservedNames = [
      'CON', 'PRN', 'AUX', 'NUL',
      'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9',
      'LPT1', 'LPT2', 'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9'
    ];
    
    const nameWithoutExt = path.basename(value, path.extname(value));
    if (reservedNames.includes(nameWithoutExt.toUpperCase())) {
      return false;
    }
    
    // 检查长度限制
    if (value.length > 255) {
      return false;
    }
    
    return true;
  }

  /**
   * 清理路径（移除危险字符）
   */
  static sanitize(value: string): string {
    if (typeof value !== 'string') {
      return '';
    }
    
    // 移除路径遍历
    let cleaned = value.replace(/\.\.\/|\.\.\\/g, '');
    
    // 移除危险字符
    cleaned = cleaned.replace(/[\0|><&;$`\n\r]/g, '');
    
    // 移除多余的斜杠
    cleaned = cleaned.replace(/\/+/g, '/');
    
    // 移除前后空白
    cleaned = cleaned.trim();
    
    return cleaned;
  }

  /**
   * 规范化路径
   */
  static normalize(value: string): string {
    if (typeof value !== 'string') {
      return '';
    }
    
    // 先清理危险字符
    const cleaned = this.sanitize(value);
    
    // 使用path.normalize规范化
    return path.normalize(cleaned);
  }

  /**
   * 获取安全的相对路径
   */
  static getSafeRelativePath(from: string, to: string): string | null {
    if (typeof from !== 'string' || typeof to !== 'string') {
      return null;
    }
    
    // 确保路径安全
    if (!this.isSafePath(from) || !this.isSafePath(to)) {
      return null;
    }
    
    try {
      return path.relative(from, to);
    } catch {
      return null;
    }
  }

  /**
   * 验证路径权限
   */
  static async hasPermission(value: string, mode: number): Promise<boolean> {
    if (typeof value !== 'string') {
      return false;
    }
    
    try {
      await fs.access(value, mode);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 验证是否可读
   */
  static async isReadable(value: string): Promise<boolean> {
    return this.hasPermission(value, fs.constants.R_OK);
  }

  /**
   * 验证是否可写
   */
  static async isWritable(value: string): Promise<boolean> {
    return this.hasPermission(value, fs.constants.W_OK);
  }

  /**
   * 验证是否可执行
   */
  static async isExecutable(value: string): Promise<boolean> {
    return this.hasPermission(value, fs.constants.X_OK);
  }
}
