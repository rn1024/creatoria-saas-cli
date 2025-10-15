/**
 * 文件日志传输器
 */

import * as fs from 'fs-extra';
import * as path from 'path';
import { LogEntry } from '../logger.config';
import { JsonFormatter } from '../formatters/json.formatter';

export class FileTransport {
  private formatter: JsonFormatter;
  private logStream?: fs.WriteStream;
  private currentFileSize: number = 0;
  private currentFileIndex: number = 0;
  private buffer: LogEntry[] = [];
  private flushTimer?: NodeJS.Timeout;

  constructor(
    private filePath: string,
    private maxFileSize: number = 10 * 1024 * 1024, // 10MB
    private maxFiles: number = 5,
    private bufferSize: number = 100,
    private flushInterval: number = 5000 // 5秒
  ) {
    this.formatter = new JsonFormatter();
    this.initializeFile();
    this.startFlushTimer();
  }

  /**
   * 初始化日志文件
   */
  private async initializeFile(): Promise<void> {
    try {
      // 确保日志目录存在
      const logDir = path.dirname(this.filePath);
      await fs.ensureDir(logDir);

      // 获取当前文件大小
      try {
        const stats = await fs.stat(this.filePath);
        this.currentFileSize = stats.size;
      } catch {
        this.currentFileSize = 0;
      }

      // 创建写入流
      this.logStream = fs.createWriteStream(this.filePath, {
        flags: 'a',
        encoding: 'utf8',
      });

      this.logStream.on('error', (error) => {
        console.error('Log file write error:', error);
      });
    } catch (error) {
      console.error('Failed to initialize log file:', error);
    }
  }

  /**
   * 写入日志
   */
  write(entry: LogEntry): void {
    this.buffer.push(entry);

    // 如果缓冲区满了，立即刷新
    if (this.buffer.length >= this.bufferSize) {
      this.flush();
    }
  }

  /**
   * 批量写入
   */
  writeBatch(entries: LogEntry[]): void {
    this.buffer.push(...entries);
    
    if (this.buffer.length >= this.bufferSize) {
      this.flush();
    }
  }

  /**
   * 刷新缓冲区
   */
  flush(): void {
    if (this.buffer.length === 0 || !this.logStream) {
      return;
    }

    const entries = [...this.buffer];
    this.buffer = [];

    entries.forEach(entry => {
      const line = this.formatter.format(entry) + '\n';
      const bytes = Buffer.byteLength(line, 'utf8');

      // 检查是否需要轮转
      if (this.currentFileSize + bytes > this.maxFileSize) {
        this.rotate();
      }

      // 写入日志
      this.logStream!.write(line, (error) => {
        if (error) {
          console.error('Failed to write log:', error);
        } else {
          this.currentFileSize += bytes;
        }
      });
    });
  }

  /**
   * 轮转日志文件
   */
  private async rotate(): Promise<void> {
    try {
      // 关闭当前流
      if (this.logStream) {
        this.logStream.end();
      }

      // 重命名现有文件
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const rotatedPath = this.filePath.replace(/\.log$/, `.${timestamp}.log`);
      
      if (await fs.pathExists(this.filePath)) {
        await fs.rename(this.filePath, rotatedPath);
      }

      // 清理旧文件
      await this.cleanOldFiles();

      // 重新初始化
      this.currentFileSize = 0;
      await this.initializeFile();
    } catch (error) {
      console.error('Failed to rotate log file:', error);
    }
  }

  /**
   * 清理旧日志文件
   */
  private async cleanOldFiles(): Promise<void> {
    try {
      const logDir = path.dirname(this.filePath);
      const baseName = path.basename(this.filePath, '.log');
      
      // 获取所有日志文件
      const files = await fs.readdir(logDir);
      const logFiles = files
        .filter(file => file.startsWith(baseName) && file.endsWith('.log'))
        .filter(file => file !== path.basename(this.filePath));

      // 按修改时间排序
      const fileStats = await Promise.all(
        logFiles.map(async file => {
          const filePath = path.join(logDir, file);
          const stats = await fs.stat(filePath);
          return { file, filePath, mtime: stats.mtime };
        })
      );

      fileStats.sort((a, b) => b.mtime.getTime() - a.mtime.getTime());

      // 删除超出限制的文件
      if (fileStats.length >= this.maxFiles) {
        const filesToDelete = fileStats.slice(this.maxFiles - 1);
        await Promise.all(
          filesToDelete.map(({ filePath }) => fs.remove(filePath))
        );
      }
    } catch (error) {
      console.error('Failed to clean old log files:', error);
    }
  }

  /**
   * 启动定时刷新
   */
  private startFlushTimer(): void {
    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.flushInterval);
  }

  /**
   * 关闭传输器
   */
  close(): void {
    // 停止定时器
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }

    // 刷新剩余的日志
    this.flush();

    // 关闭流
    if (this.logStream) {
      this.logStream.end();
    }
  }
}