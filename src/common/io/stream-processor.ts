/**
 * 流处理器 - 用于大文件处理
 */

import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';
import * as zlib from 'zlib';
import { Transform, Readable, Writable, pipeline } from 'stream';
import { promisify } from 'util';
import { LoggerService } from '../logger/logger.service';

const pipelineAsync = promisify(pipeline);

export interface StreamOptions {
  encoding?: BufferEncoding;
  highWaterMark?: number;
  compression?: 'gzip' | 'deflate' | 'brotli';
}

export class StreamProcessor {
  private logger = new LoggerService('StreamProcessor');

  /**
   * 按行处理大文件
   */
  async processLineByLine(
    filePath: string,
    processor: (line: string, lineNumber: number) => Promise<void> | void,
    options: StreamOptions = {}
  ): Promise<number> {
    const { encoding = 'utf8' } = options;
    
    const fileStream = fs.createReadStream(filePath, { encoding });
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity,
    });

    let lineNumber = 0;
    
    for await (const line of rl) {
      lineNumber++;
      await processor(line, lineNumber);
    }

    this.logger.debug(`Processed ${lineNumber} lines from ${filePath}`);
    return lineNumber;
  }

  /**
   * 流式复制文件（支持转换）
   */
  async streamCopy(
    source: string,
    destination: string,
    transformer?: Transform,
    options: StreamOptions = {}
  ): Promise<void> {
    const { highWaterMark = 64 * 1024 } = options; // 64KB chunks
    
    const readStream = fs.createReadStream(source, { highWaterMark });
    const writeStream = fs.createWriteStream(destination, { highWaterMark });

    const streams = transformer
      ? [readStream, transformer, writeStream]
      : [readStream, writeStream];

    await pipelineAsync(...streams);
    
    this.logger.debug(`Stream copied from ${source} to ${destination}`);
  }

  /**
   * 压缩文件
   */
  async compressFile(
    source: string,
    destination?: string,
    type: 'gzip' | 'deflate' | 'brotli' = 'gzip'
  ): Promise<string> {
    const dest = destination || `${source}.${type === 'brotli' ? 'br' : 'gz'}`;
    
    const readStream = fs.createReadStream(source);
    const writeStream = fs.createWriteStream(dest);
    
    let compressor: Transform;
    switch (type) {
      case 'gzip':
        compressor = zlib.createGzip();
        break;
      case 'deflate':
        compressor = zlib.createDeflate();
        break;
      case 'brotli':
        compressor = zlib.createBrotliCompress();
        break;
    }

    await pipelineAsync(readStream, compressor, writeStream);
    
    const sourceSize = fs.statSync(source).size;
    const compressedSize = fs.statSync(dest).size;
    const ratio = ((1 - compressedSize / sourceSize) * 100).toFixed(2);
    
    this.logger.info(`Compressed ${source} (${ratio}% reduction)`);
    return dest;
  }

  /**
   * 解压文件
   */
  async decompressFile(
    source: string,
    destination?: string,
    type?: 'gzip' | 'deflate' | 'brotli'
  ): Promise<string> {
    // 自动检测压缩类型
    if (!type) {
      if (source.endsWith('.gz')) type = 'gzip';
      else if (source.endsWith('.br')) type = 'brotli';
      else type = 'gzip'; // 默认
    }
    
    const dest = destination || source.replace(/\.(gz|br)$/, '');
    
    const readStream = fs.createReadStream(source);
    const writeStream = fs.createWriteStream(dest);
    
    let decompressor: Transform;
    switch (type) {
      case 'gzip':
        decompressor = zlib.createGunzip();
        break;
      case 'deflate':
        decompressor = zlib.createInflate();
        break;
      case 'brotli':
        decompressor = zlib.createBrotliDecompress();
        break;
    }

    await pipelineAsync(readStream, decompressor, writeStream);
    
    this.logger.info(`Decompressed ${source} to ${dest}`);
    return dest;
  }

  /**
   * 创建转换流
   */
  createTransformStream(
    transformer: (chunk: string) => string | null
  ): Transform {
    return new Transform({
      transform(chunk, encoding, callback) {
        try {
          const result = transformer(chunk.toString());
          callback(null, result);
        } catch (error) {
          callback(error as Error);
        }
      },
    });
  }

  /**
   * 分割大文件
   */
  async splitFile(
    filePath: string,
    maxSize: number,
    outputDir?: string
  ): Promise<string[]> {
    const dir = outputDir || path.dirname(filePath);
    const basename = path.basename(filePath);
    const files: string[] = [];
    
    const readStream = fs.createReadStream(filePath, {
      highWaterMark: maxSize,
    });
    
    let partNumber = 0;
    let currentSize = 0;
    let currentStream: fs.WriteStream | null = null;
    
    for await (const chunk of readStream) {
      if (!currentStream || currentSize + chunk.length > maxSize) {
        if (currentStream) {
          currentStream.end();
        }
        
        partNumber++;
        const partPath = path.join(dir, `${basename}.part${partNumber}`);
        files.push(partPath);
        
        currentStream = fs.createWriteStream(partPath);
        currentSize = 0;
      }
      
      currentStream.write(chunk);
      currentSize += chunk.length;
    }
    
    if (currentStream) {
      currentStream.end();
    }
    
    this.logger.info(`Split ${filePath} into ${files.length} parts`);
    return files;
  }

  /**
   * 合并文件
   */
  async mergeFiles(
    files: string[],
    destination: string
  ): Promise<void> {
    const writeStream = fs.createWriteStream(destination);
    
    for (const file of files) {
      const readStream = fs.createReadStream(file);
      
      await new Promise<void>((resolve, reject) => {
        readStream.pipe(writeStream, { end: false });
        readStream.on('end', resolve);
        readStream.on('error', reject);
      });
    }
    
    writeStream.end();
    
    this.logger.info(`Merged ${files.length} files into ${destination}`);
  }

  /**
   * 搜索大文件内容
   */
  async searchInFile(
    filePath: string,
    pattern: RegExp | string,
    options: { maxMatches?: number; context?: number } = {}
  ): Promise<Array<{ line: number; content: string; match: string }>> {
    const { maxMatches = 100, context = 0 } = options;
    const results: Array<{ line: number; content: string; match: string }> = [];
    const contextBuffer: string[] = [];
    
    const regex = typeof pattern === 'string'
      ? new RegExp(pattern, 'gi')
      : pattern;
    
    await this.processLineByLine(filePath, (line, lineNumber) => {
      const matches = line.match(regex);
      
      if (matches && results.length < maxMatches) {
        // 添加上下文
        const contextLines: string[] = [];
        
        if (context > 0) {
          const start = Math.max(0, contextBuffer.length - context);
          contextLines.push(...contextBuffer.slice(start));
        }
        
        contextLines.push(line);
        
        results.push({
          line: lineNumber,
          content: contextLines.join('\n'),
          match: matches[0],
        });
      }
      
      // 维护上下文缓冲区
      if (context > 0) {
        contextBuffer.push(line);
        if (contextBuffer.length > context * 2) {
          contextBuffer.shift();
        }
      }
    });
    
    this.logger.debug(`Found ${results.length} matches in ${filePath}`);
    return results;
  }

  /**
   * 计算文件哈希（流式）
   */
  async calculateHash(
    filePath: string,
    algorithm: 'md5' | 'sha1' | 'sha256' = 'sha256'
  ): Promise<string> {
    const crypto = require('crypto');
    const hash = crypto.createHash(algorithm);
    const stream = fs.createReadStream(filePath);
    
    return new Promise((resolve, reject) => {
      stream.on('data', (chunk) => hash.update(chunk));
      stream.on('end', () => resolve(hash.digest('hex')));
      stream.on('error', reject);
    });
  }

  /**
   * 尾部读取（类似tail -f）
   */
  async tail(
    filePath: string,
    lines: number = 10,
    follow: boolean = false
  ): Promise<string[]> {
    const fileSize = fs.statSync(filePath).size;
    const buffer: string[] = [];
    const chunkSize = 1024;
    
    // 读取最后几行
    let position = Math.max(0, fileSize - chunkSize);
    
    while (buffer.length < lines && position >= 0) {
      const chunk = Buffer.alloc(chunkSize);
      const fd = fs.openSync(filePath, 'r');
      fs.readSync(fd, chunk, 0, chunkSize, position);
      fs.closeSync(fd);
      
      const text = chunk.toString('utf8');
      const lines = text.split('\n').filter(line => line.length > 0);
      buffer.unshift(...lines);
      
      position -= chunkSize;
    }
    
    const result = buffer.slice(-lines);
    
    // 监视文件变化
    if (follow) {
      fs.watchFile(filePath, { interval: 1000 }, () => {
        // 这里可以实现实时更新逻辑
        this.logger.debug(`File ${filePath} changed`);
      });
    }
    
    return result;
  }
}