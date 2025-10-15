/**
 * 路径安全服务
 */

import { Injectable } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs-extra';
import { BaseException } from '../exceptions/base.exception';
import { ERROR_CODES } from '../constants/error-codes';
import { LoggerService } from '../logger/logger.service';
import { PathValidator } from '../validation/validators/path.validator';

@Injectable()
export class PathSecurityService {
  private projectRoot: string;
  private allowedPaths: Set<string> = new Set();
  private blockedPaths: Set<string> = new Set();
  
  constructor(
    private readonly logger: LoggerService,
  ) {
    this.projectRoot = process.cwd();
    this.initializeSecurityRules();
  }

  /**
   * 初始化安全规则
   */
  private initializeSecurityRules(): void {
    // 允许的路径
    this.allowedPaths.add(this.projectRoot);
    this.allowedPaths.add(path.join(this.projectRoot, 'src'));
    this.allowedPaths.add(path.join(this.projectRoot, 'dist'));
    this.allowedPaths.add(path.join(this.projectRoot, 'node_modules'));
    this.allowedPaths.add(path.join(this.projectRoot, 'uploads'));
    this.allowedPaths.add(path.join(this.projectRoot, 'temp'));
    this.allowedPaths.add(path.join(this.projectRoot, 'config'));
    this.allowedPaths.add(path.join(this.projectRoot, 'modules'));
    
    // 禁止的路径
    this.blockedPaths.add('/etc');
    this.blockedPaths.add('/usr');
    this.blockedPaths.add('/bin');
    this.blockedPaths.add('/sbin');
    this.blockedPaths.add('/var');
    this.blockedPaths.add('/root');
    this.blockedPaths.add(process.env.HOME || '');
    
    // Windows 系统目录
    if (process.platform === 'win32') {
      this.blockedPaths.add('C:\\Windows');
      this.blockedPaths.add('C:\\Program Files');
      this.blockedPaths.add('C:\\Program Files (x86)');
    }
  }

  /**
   * 验证路径安全性
   */
  validatePath(inputPath: string, options: {
    allowAbsolute?: boolean;
    basePath?: string;
    checkExists?: boolean;
    allowSymlinks?: boolean;
  } = {}): string {
    // 检查路径遍历
    if (PathValidator.hasPathTraversal(inputPath)) {
      this.logger.warn('检测到路径遍历尝试', { path: inputPath });
      throw new BaseException(
        ERROR_CODES.VALIDATION_2008,
        { path: inputPath }
      );
    }
    
    // 解码URL编码
    const decodedPath = this.decodePathSafely(inputPath);
    
    // 再次检查解码后的路径
    if (PathValidator.hasPathTraversal(decodedPath)) {
      this.logger.warn('检测到URL编码的路径遍历', { path: inputPath });
      throw new BaseException(
        ERROR_CODES.VALIDATION_2008,
        { path: inputPath }
      );
    }
    
    // 解析路径
    const basePath = options.basePath || this.projectRoot;
    const resolvedPath = path.resolve(basePath, decodedPath);
    const normalizedPath = path.normalize(resolvedPath);
    
    // 检查是否在允许范围内
    if (!this.isPathAllowed(normalizedPath)) {
      this.logger.warn('访问被禁止的路径', { path: normalizedPath });
      throw new BaseException(
        ERROR_CODES.FS_PERMISSION_DENIED,
        { path: normalizedPath }
      );
    }
    
    // 检查符号链接
    if (!options.allowSymlinks && this.isSymlinkSync(normalizedPath)) {
      const realPath = fs.realpathSync(normalizedPath);
      if (!this.isPathAllowed(realPath)) {
        this.logger.warn('符号链接指向禁止的路径', { 
          symlink: normalizedPath,
          target: realPath 
        });
        throw new BaseException(
          ERROR_CODES.FS_PERMISSION_DENIED,
          { path: normalizedPath }
        );
      }
    }
    
    // 检查文件是否存在
    if (options.checkExists && !fs.existsSync(normalizedPath)) {
      throw new BaseException(
        ERROR_CODES.FS_FILE_NOT_FOUND,
        { path: normalizedPath }
      );
    }
    
    return normalizedPath;
  }

  /**
   * 安全解码路径
   */
  private decodePathSafely(inputPath: string): string {
    try {
      // 多次解码以防止双重编码
      let decoded = inputPath;
      let previousDecoded = '';
      let maxIterations = 3;
      
      while (decoded !== previousDecoded && maxIterations > 0) {
        previousDecoded = decoded;
        decoded = decodeURIComponent(decoded);
        maxIterations--;
      }
      
      return decoded;
    } catch {
      // 如果解码失败，返回原始路径
      return inputPath;
    }
  }

  /**
   * 检查路径是否允许
   */
  private isPathAllowed(normalizedPath: string): boolean {
    // 检查是否在禁止列表中
    for (const blockedPath of this.blockedPaths) {
      if (blockedPath && normalizedPath.startsWith(blockedPath)) {
        return false;
      }
    }
    
    // 检查是否在允许列表中
    for (const allowedPath of this.allowedPaths) {
      if (normalizedPath.startsWith(allowedPath)) {
        return true;
      }
    }
    
    // 默认不允许
    return false;
  }

  /**
   * 检查是否为符号链接
   */
  private isSymlinkSync(filePath: string): boolean {
    try {
      const stats = fs.lstatSync(filePath);
      return stats.isSymbolicLink();
    } catch {
      return false;
    }
  }

  /**
   * 创建安全的临时路径
   */
  createSafeTempPath(prefix: string = 'temp'): string {
    const tempDir = path.join(this.projectRoot, 'temp');
    fs.ensureDirSync(tempDir);
    
    const randomName = `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2)}`;
    return path.join(tempDir, randomName);
  }

  /**
   * 获取安全的相对路径
   */
  getSafeRelativePath(from: string, to: string): string {
    const safeFrom = this.validatePath(from);
    const safeTo = this.validatePath(to);
    
    return path.relative(safeFrom, safeTo);
  }

  /**
   * 检查文件名安全性
   */
  validateFileName(fileName: string): void {
    // 检查非法字符
    const invalidChars = /[<>:"|?*\x00-\x1f\/\\]/;
    if (invalidChars.test(fileName)) {
      throw new BaseException(
        ERROR_CODES.FS_INVALID_PATH,
        { path: fileName }
      );
    }
    
    // 检查保留名称
    const reservedNames = [
      'CON', 'PRN', 'AUX', 'NUL',
      'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9',
      'LPT1', 'LPT2', 'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9'
    ];
    
    const nameWithoutExt = path.basename(fileName, path.extname(fileName));
    if (reservedNames.includes(nameWithoutExt.toUpperCase())) {
      throw new BaseException(
        ERROR_CODES.FS_INVALID_PATH,
        { path: fileName }
      );
    }
    
    // 检查名称长度
    if (fileName.length > 255) {
      throw new BaseException(
        ERROR_CODES.FS_INVALID_PATH,
        { path: fileName }
      );
    }
  }

  /**
   * 添加允许路径
   */
  addAllowedPath(dirPath: string): void {
    const normalizedPath = path.resolve(dirPath);
    this.allowedPaths.add(normalizedPath);
    this.logger.debug('添加允许路径', { path: normalizedPath });
  }

  /**
   * 添加禁止路径
   */
  addBlockedPath(dirPath: string): void {
    const normalizedPath = path.resolve(dirPath);
    this.blockedPaths.add(normalizedPath);
    this.logger.debug('添加禁止路径', { path: normalizedPath });
  }

  /**
   * 获取安全配置
   */
  getSecurityConfig(): {
    projectRoot: string;
    allowedPaths: string[];
    blockedPaths: string[];
  } {
    return {
      projectRoot: this.projectRoot,
      allowedPaths: Array.from(this.allowedPaths),
      blockedPaths: Array.from(this.blockedPaths),
    };
  }
}
