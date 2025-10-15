/**
 * 安全文件操作服务
 */

import { Injectable } from '@nestjs/common';
import * as fs from 'fs-extra';
import * as path from 'path';
import { PathSecurityService } from './path-security.service';
import { LoggerService } from '../logger/logger.service';
import { BaseException } from '../exceptions/base.exception';
import { ERROR_CODES } from '../constants/error-codes';

@Injectable()
export class SecureFileService {
  constructor(
    private readonly pathSecurity: PathSecurityService,
    private readonly logger: LoggerService,
  ) {}

  /**
   * 安全读取文件
   */
  async readFile(filePath: string, encoding?: BufferEncoding): Promise<string | Buffer> {
    const safePath = this.pathSecurity.validatePath(filePath, {
      checkExists: true,
      allowSymlinks: false,
    });
    
    this.logger.debug('安全读取文件', { path: safePath });
    
    try {
      if (encoding) {
        return await fs.readFile(safePath, encoding);
      } else {
        return await fs.readFile(safePath);
      }
    } catch (error) {
      throw new BaseException(
        ERROR_CODES.FS_READ_FAILED,
        { path: filePath, error: error.message }
      );
    }
  }

  /**
   * 安全写入文件
   */
  async writeFile(filePath: string, data: string | Buffer, options?: fs.WriteFileOptions): Promise<void> {
    const safePath = this.pathSecurity.validatePath(filePath, {
      allowSymlinks: false,
    });
    
    // 检查父目录是否存在
    const dir = path.dirname(safePath);
    await fs.ensureDir(dir);
    
    this.logger.debug('安全写入文件', { path: safePath });
    
    try {
      await fs.writeFile(safePath, data, options);
    } catch (error) {
      throw new BaseException(
        ERROR_CODES.FS_WRITE_FAILED,
        { path: filePath, error: error.message }
      );
    }
  }

  /**
   * 安全删除文件
   */
  async deleteFile(filePath: string): Promise<void> {
    const safePath = this.pathSecurity.validatePath(filePath, {
      checkExists: true,
      allowSymlinks: false,
    });
    
    this.logger.debug('安全删除文件', { path: safePath });
    
    try {
      await fs.unlink(safePath);
    } catch (error) {
      throw new BaseException(
        ERROR_CODES.FS_DELETE_FAILED,
        { path: filePath, error: error.message }
      );
    }
  }

  /**
   * 安全复制文件
   */
  async copyFile(srcPath: string, destPath: string): Promise<void> {
    const safeSrc = this.pathSecurity.validatePath(srcPath, {
      checkExists: true,
      allowSymlinks: false,
    });
    
    const safeDest = this.pathSecurity.validatePath(destPath, {
      allowSymlinks: false,
    });
    
    // 检查目标父目录
    const destDir = path.dirname(safeDest);
    await fs.ensureDir(destDir);
    
    this.logger.debug('安全复制文件', { from: safeSrc, to: safeDest });
    
    try {
      await fs.copyFile(safeSrc, safeDest);
    } catch (error) {
      throw new BaseException(
        ERROR_CODES.FS_WRITE_FAILED,
        { path: destPath, error: error.message }
      );
    }
  }

  /**
   * 安全移动文件
   */
  async moveFile(srcPath: string, destPath: string): Promise<void> {
    const safeSrc = this.pathSecurity.validatePath(srcPath, {
      checkExists: true,
      allowSymlinks: false,
    });
    
    const safeDest = this.pathSecurity.validatePath(destPath, {
      allowSymlinks: false,
    });
    
    // 检查目标父目录
    const destDir = path.dirname(safeDest);
    await fs.ensureDir(destDir);
    
    this.logger.debug('安全移动文件', { from: safeSrc, to: safeDest });
    
    try {
      await fs.move(safeSrc, safeDest);
    } catch (error) {
      throw new BaseException(
        ERROR_CODES.FS_WRITE_FAILED,
        { path: destPath, error: error.message }
      );
    }
  }

  /**
   * 安全创建目录
   */
  async createDirectory(dirPath: string): Promise<void> {
    const safePath = this.pathSecurity.validatePath(dirPath, {
      allowSymlinks: false,
    });
    
    this.logger.debug('安全创建目录', { path: safePath });
    
    try {
      await fs.ensureDir(safePath);
    } catch (error) {
      throw new BaseException(
        ERROR_CODES.FS_WRITE_FAILED,
        { path: dirPath, error: error.message }
      );
    }
  }

  /**
   * 安全删除目录
   */
  async deleteDirectory(dirPath: string): Promise<void> {
    const safePath = this.pathSecurity.validatePath(dirPath, {
      checkExists: true,
      allowSymlinks: false,
    });
    
    this.logger.debug('安全删除目录', { path: safePath });
    
    try {
      await fs.remove(safePath);
    } catch (error) {
      throw new BaseException(
        ERROR_CODES.FS_DELETE_FAILED,
        { path: dirPath, error: error.message }
      );
    }
  }

  /**
   * 安全读取目录
   */
  async readDirectory(dirPath: string): Promise<string[]> {
    const safePath = this.pathSecurity.validatePath(dirPath, {
      checkExists: true,
      allowSymlinks: false,
    });
    
    this.logger.debug('安全读取目录', { path: safePath });
    
    try {
      const files = await fs.readdir(safePath);
      // 过滤隐藏文件
      return files.filter(file => !file.startsWith('.'));
    } catch (error) {
      throw new BaseException(
        ERROR_CODES.FS_READ_FAILED,
        { path: dirPath, error: error.message }
      );
    }
  }

  /**
   * 安全检查文件是否存在
   */
  async exists(filePath: string): Promise<boolean> {
    try {
      const safePath = this.pathSecurity.validatePath(filePath, {
        allowSymlinks: false,
      });
      return await fs.pathExists(safePath);
    } catch {
      return false;
    }
  }

  /**
   * 安全获取文件状态
   */
  async getStats(filePath: string): Promise<fs.Stats> {
    const safePath = this.pathSecurity.validatePath(filePath, {
      checkExists: true,
      allowSymlinks: false,
    });
    
    try {
      return await fs.stat(safePath);
    } catch (error) {
      throw new BaseException(
        ERROR_CODES.FS_READ_FAILED,
        { path: filePath, error: error.message }
      );
    }
  }

  /**
   * 安全创建临时文件
   */
  async createTempFile(prefix: string = 'tmp', extension: string = '.tmp'): Promise<string> {
    const tempPath = this.pathSecurity.createSafeTempPath(prefix) + extension;
    await fs.ensureFile(tempPath);
    return tempPath;
  }

  /**
   * 安全创建临时目录
   */
  async createTempDirectory(prefix: string = 'tmpdir'): Promise<string> {
    const tempPath = this.pathSecurity.createSafeTempPath(prefix);
    await fs.ensureDir(tempPath);
    return tempPath;
  }

  /**
   * 安全清理临时文件
   */
  async cleanupTempFiles(olderThanMs: number = 24 * 60 * 60 * 1000): Promise<void> {
    const tempDir = path.join(process.cwd(), 'temp');
    
    try {
      const files = await fs.readdir(tempDir);
      const now = Date.now();
      
      for (const file of files) {
        const filePath = path.join(tempDir, file);
        const stats = await fs.stat(filePath);
        
        if (now - stats.mtimeMs > olderThanMs) {
          await fs.remove(filePath);
          this.logger.debug('清理临时文件', { file });
        }
      }
    } catch (error) {
      this.logger.warn('清理临时文件失败', { error: error.message });
    }
  }
}
