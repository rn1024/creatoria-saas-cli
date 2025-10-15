/**
 * 路径安全中间件
 */

import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PathSecurityService } from './path-security.service';
import { LoggerService } from '../logger/logger.service';
import { BaseException } from '../exceptions/base.exception';
import { ERROR_CODES } from '../constants/error-codes';

@Injectable()
export class PathSecurityMiddleware implements NestMiddleware {
  constructor(
    private readonly pathSecurity: PathSecurityService,
    private readonly logger: LoggerService,
  ) {}

  use(req: Request, res: Response, next: NextFunction) {
    try {
      // 检查URL路径
      this.validateRequestPath(req.path);
      
      // 检查查询参数中的路径
      this.validateQueryPaths(req.query);
      
      // 检查请求体中的路径
      if (req.body && typeof req.body === 'object') {
        this.validateBodyPaths(req.body);
      }
      
      // 检查文件上传
      if (req.files) {
        this.validateUploadedFiles(req.files);
      }
      
      next();
    } catch (error) {
      this.logger.warn('路径安全检查失败', {
        path: req.path,
        method: req.method,
        ip: req.ip,
        error: error.message,
      });
      
      if (error instanceof BaseException) {
        res.status(403).json({
          error: error.code,
          message: error.message,
        });
      } else {
        res.status(403).json({
          error: 'SECURITY_ERROR',
          message: 'Security check failed',
        });
      }
    }
  }

  /**
   * 验证请求路径
   */
  private validateRequestPath(requestPath: string): void {
    // 检查路径遍历
    if (requestPath.includes('../') || requestPath.includes('..\\')) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_2008,
        { path: requestPath }
      );
    }
    
    // 检查URL编码的路径遍历
    const decodedPath = decodeURIComponent(requestPath);
    if (decodedPath.includes('../') || decodedPath.includes('..\\')) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_2008,
        { path: requestPath }
      );
    }
  }

  /**
   * 验证查询参数中的路径
   */
  private validateQueryPaths(query: any): void {
    const pathParams = ['path', 'file', 'dir', 'folder', 'filepath', 'filename'];
    
    for (const param of pathParams) {
      if (query[param]) {
        const value = Array.isArray(query[param]) ? query[param][0] : query[param];
        if (typeof value === 'string') {
          this.pathSecurity.validatePath(value, { allowAbsolute: false });
        }
      }
    }
  }

  /**
   * 验证请求体中的路径
   */
  private validateBodyPaths(body: any, depth: number = 0): void {
    if (depth > 10) return; // 防止无限递归
    
    const pathFields = ['path', 'file', 'dir', 'folder', 'filepath', 'filename', 
                       'sourcePath', 'targetPath', 'destPath', 'outputPath'];
    
    for (const [key, value] of Object.entries(body)) {
      if (pathFields.includes(key) && typeof value === 'string') {
        this.pathSecurity.validatePath(value, { allowAbsolute: false });
      } else if (typeof value === 'object' && value !== null) {
        this.validateBodyPaths(value, depth + 1);
      }
    }
  }

  /**
   * 验证上传的文件
   */
  private validateUploadedFiles(files: any): void {
    const fileArray = Array.isArray(files) ? files : [files];
    
    for (const file of fileArray) {
      if (file && file.originalname) {
        this.pathSecurity.validateFileName(file.originalname);
      }
      
      if (file && file.path) {
        this.pathSecurity.validatePath(file.path);
      }
    }
  }
}
