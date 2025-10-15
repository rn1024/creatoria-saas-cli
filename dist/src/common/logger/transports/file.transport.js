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
exports.FileTransport = void 0;
const fs = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
const json_formatter_1 = require("../formatters/json.formatter");
class FileTransport {
    filePath;
    maxFileSize;
    maxFiles;
    bufferSize;
    flushInterval;
    formatter;
    logStream;
    currentFileSize = 0;
    currentFileIndex = 0;
    buffer = [];
    flushTimer;
    constructor(filePath, maxFileSize = 10 * 1024 * 1024, maxFiles = 5, bufferSize = 100, flushInterval = 5000) {
        this.filePath = filePath;
        this.maxFileSize = maxFileSize;
        this.maxFiles = maxFiles;
        this.bufferSize = bufferSize;
        this.flushInterval = flushInterval;
        this.formatter = new json_formatter_1.JsonFormatter();
        this.initializeFile();
        this.startFlushTimer();
    }
    async initializeFile() {
        try {
            const logDir = path.dirname(this.filePath);
            await fs.ensureDir(logDir);
            try {
                const stats = await fs.stat(this.filePath);
                this.currentFileSize = stats.size;
            }
            catch {
                this.currentFileSize = 0;
            }
            this.logStream = fs.createWriteStream(this.filePath, {
                flags: 'a',
                encoding: 'utf8',
            });
            this.logStream.on('error', (error) => {
                console.error('Log file write error:', error);
            });
        }
        catch (error) {
            console.error('Failed to initialize log file:', error);
        }
    }
    write(entry) {
        this.buffer.push(entry);
        if (this.buffer.length >= this.bufferSize) {
            this.flush();
        }
    }
    writeBatch(entries) {
        this.buffer.push(...entries);
        if (this.buffer.length >= this.bufferSize) {
            this.flush();
        }
    }
    flush() {
        if (this.buffer.length === 0 || !this.logStream) {
            return;
        }
        const entries = [...this.buffer];
        this.buffer = [];
        entries.forEach(entry => {
            const line = this.formatter.format(entry) + '\n';
            const bytes = Buffer.byteLength(line, 'utf8');
            if (this.currentFileSize + bytes > this.maxFileSize) {
                this.rotate();
            }
            this.logStream.write(line, (error) => {
                if (error) {
                    console.error('Failed to write log:', error);
                }
                else {
                    this.currentFileSize += bytes;
                }
            });
        });
    }
    async rotate() {
        try {
            if (this.logStream) {
                this.logStream.end();
            }
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const rotatedPath = this.filePath.replace(/\.log$/, `.${timestamp}.log`);
            if (await fs.pathExists(this.filePath)) {
                await fs.rename(this.filePath, rotatedPath);
            }
            await this.cleanOldFiles();
            this.currentFileSize = 0;
            await this.initializeFile();
        }
        catch (error) {
            console.error('Failed to rotate log file:', error);
        }
    }
    async cleanOldFiles() {
        try {
            const logDir = path.dirname(this.filePath);
            const baseName = path.basename(this.filePath, '.log');
            const files = await fs.readdir(logDir);
            const logFiles = files
                .filter(file => file.startsWith(baseName) && file.endsWith('.log'))
                .filter(file => file !== path.basename(this.filePath));
            const fileStats = await Promise.all(logFiles.map(async (file) => {
                const filePath = path.join(logDir, file);
                const stats = await fs.stat(filePath);
                return { file, filePath, mtime: stats.mtime };
            }));
            fileStats.sort((a, b) => b.mtime.getTime() - a.mtime.getTime());
            if (fileStats.length >= this.maxFiles) {
                const filesToDelete = fileStats.slice(this.maxFiles - 1);
                await Promise.all(filesToDelete.map(({ filePath }) => fs.remove(filePath)));
            }
        }
        catch (error) {
            console.error('Failed to clean old log files:', error);
        }
    }
    startFlushTimer() {
        this.flushTimer = setInterval(() => {
            this.flush();
        }, this.flushInterval);
    }
    close() {
        if (this.flushTimer) {
            clearInterval(this.flushTimer);
        }
        this.flush();
        if (this.logStream) {
            this.logStream.end();
        }
    }
}
exports.FileTransport = FileTransport;
//# sourceMappingURL=file.transport.js.map