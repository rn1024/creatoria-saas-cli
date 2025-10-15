"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.StreamProcessor = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const readline = __importStar(require("readline"));
const zlib = __importStar(require("zlib"));
const stream_1 = require("stream");
const util_1 = require("util");
const logger_service_1 = require("../logger/logger.service");
const pipelineAsync = (0, util_1.promisify)(stream_1.pipeline);
class StreamProcessor {
    logger = new logger_service_1.LoggerService('StreamProcessor');
    async processLineByLine(filePath, processor, options = {}) {
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
    async streamCopy(source, destination, transformer, options = {}) {
        const { highWaterMark = 64 * 1024 } = options;
        const readStream = fs.createReadStream(source, { highWaterMark });
        const writeStream = fs.createWriteStream(destination, { highWaterMark });
        const streams = transformer
            ? [readStream, transformer, writeStream]
            : [readStream, writeStream];
        await pipelineAsync(...streams);
        this.logger.debug(`Stream copied from ${source} to ${destination}`);
    }
    async compressFile(source, destination, type = 'gzip') {
        const dest = destination || `${source}.${type === 'brotli' ? 'br' : 'gz'}`;
        const readStream = fs.createReadStream(source);
        const writeStream = fs.createWriteStream(dest);
        let compressor;
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
    async decompressFile(source, destination, type) {
        if (!type) {
            if (source.endsWith('.gz'))
                type = 'gzip';
            else if (source.endsWith('.br'))
                type = 'brotli';
            else
                type = 'gzip';
        }
        const dest = destination || source.replace(/\.(gz|br)$/, '');
        const readStream = fs.createReadStream(source);
        const writeStream = fs.createWriteStream(dest);
        let decompressor;
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
    createTransformStream(transformer) {
        return new stream_1.Transform({
            transform(chunk, encoding, callback) {
                try {
                    const result = transformer(chunk.toString());
                    callback(null, result);
                }
                catch (error) {
                    callback(error);
                }
            },
        });
    }
    async splitFile(filePath, maxSize, outputDir) {
        const dir = outputDir || path.dirname(filePath);
        const basename = path.basename(filePath);
        const files = [];
        const readStream = fs.createReadStream(filePath, {
            highWaterMark: maxSize,
        });
        let partNumber = 0;
        let currentSize = 0;
        let currentStream = null;
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
    async mergeFiles(files, destination) {
        const writeStream = fs.createWriteStream(destination);
        for (const file of files) {
            const readStream = fs.createReadStream(file);
            await new Promise((resolve, reject) => {
                readStream.pipe(writeStream, { end: false });
                readStream.on('end', resolve);
                readStream.on('error', reject);
            });
        }
        writeStream.end();
        this.logger.info(`Merged ${files.length} files into ${destination}`);
    }
    async searchInFile(filePath, pattern, options = {}) {
        const { maxMatches = 100, context = 0 } = options;
        const results = [];
        const contextBuffer = [];
        const regex = typeof pattern === 'string'
            ? new RegExp(pattern, 'gi')
            : pattern;
        await this.processLineByLine(filePath, (line, lineNumber) => {
            const matches = line.match(regex);
            if (matches && results.length < maxMatches) {
                const contextLines = [];
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
    async calculateHash(filePath, algorithm = 'sha256') {
        const crypto = require('crypto');
        const hash = crypto.createHash(algorithm);
        const stream = fs.createReadStream(filePath);
        return new Promise((resolve, reject) => {
            stream.on('data', (chunk) => hash.update(chunk));
            stream.on('end', () => resolve(hash.digest('hex')));
            stream.on('error', reject);
        });
    }
    async tail(filePath, lines = 10, follow = false) {
        const fileSize = fs.statSync(filePath).size;
        const buffer = [];
        const chunkSize = 1024;
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
        if (follow) {
            fs.watchFile(filePath, { interval: 1000 }, () => {
                this.logger.debug(`File ${filePath} changed`);
            });
        }
        return result;
    }
}
exports.StreamProcessor = StreamProcessor;
//# sourceMappingURL=stream-processor.js.map