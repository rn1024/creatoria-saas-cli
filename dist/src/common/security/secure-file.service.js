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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecureFileService = void 0;
const common_1 = require("@nestjs/common");
const fs = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
const path_security_service_1 = require("./path-security.service");
const logger_service_1 = require("../logger/logger.service");
const base_exception_1 = require("../exceptions/base.exception");
const error_codes_1 = require("../constants/error-codes");
let SecureFileService = class SecureFileService {
    pathSecurity;
    logger;
    constructor(pathSecurity, logger) {
        this.pathSecurity = pathSecurity;
        this.logger = logger;
    }
    async readFile(filePath, encoding) {
        const safePath = this.pathSecurity.validatePath(filePath, {
            checkExists: true,
            allowSymlinks: false,
        });
        this.logger.debug('安全读取文件', { path: safePath });
        try {
            if (encoding) {
                return await fs.readFile(safePath, encoding);
            }
            else {
                return await fs.readFile(safePath);
            }
        }
        catch (error) {
            throw new base_exception_1.BaseException(error_codes_1.ERROR_CODES.FS_READ_FAILED, { path: filePath, error: error.message });
        }
    }
    async writeFile(filePath, data, options) {
        const safePath = this.pathSecurity.validatePath(filePath, {
            allowSymlinks: false,
        });
        const dir = path.dirname(safePath);
        await fs.ensureDir(dir);
        this.logger.debug('安全写入文件', { path: safePath });
        try {
            await fs.writeFile(safePath, data, options);
        }
        catch (error) {
            throw new base_exception_1.BaseException(error_codes_1.ERROR_CODES.FS_WRITE_FAILED, { path: filePath, error: error.message });
        }
    }
    async deleteFile(filePath) {
        const safePath = this.pathSecurity.validatePath(filePath, {
            checkExists: true,
            allowSymlinks: false,
        });
        this.logger.debug('安全删除文件', { path: safePath });
        try {
            await fs.unlink(safePath);
        }
        catch (error) {
            throw new base_exception_1.BaseException(error_codes_1.ERROR_CODES.FS_DELETE_FAILED, { path: filePath, error: error.message });
        }
    }
    async copyFile(srcPath, destPath) {
        const safeSrc = this.pathSecurity.validatePath(srcPath, {
            checkExists: true,
            allowSymlinks: false,
        });
        const safeDest = this.pathSecurity.validatePath(destPath, {
            allowSymlinks: false,
        });
        const destDir = path.dirname(safeDest);
        await fs.ensureDir(destDir);
        this.logger.debug('安全复制文件', { from: safeSrc, to: safeDest });
        try {
            await fs.copyFile(safeSrc, safeDest);
        }
        catch (error) {
            throw new base_exception_1.BaseException(error_codes_1.ERROR_CODES.FS_WRITE_FAILED, { path: destPath, error: error.message });
        }
    }
    async moveFile(srcPath, destPath) {
        const safeSrc = this.pathSecurity.validatePath(srcPath, {
            checkExists: true,
            allowSymlinks: false,
        });
        const safeDest = this.pathSecurity.validatePath(destPath, {
            allowSymlinks: false,
        });
        const destDir = path.dirname(safeDest);
        await fs.ensureDir(destDir);
        this.logger.debug('安全移动文件', { from: safeSrc, to: safeDest });
        try {
            await fs.move(safeSrc, safeDest);
        }
        catch (error) {
            throw new base_exception_1.BaseException(error_codes_1.ERROR_CODES.FS_WRITE_FAILED, { path: destPath, error: error.message });
        }
    }
    async createDirectory(dirPath) {
        const safePath = this.pathSecurity.validatePath(dirPath, {
            allowSymlinks: false,
        });
        this.logger.debug('安全创建目录', { path: safePath });
        try {
            await fs.ensureDir(safePath);
        }
        catch (error) {
            throw new base_exception_1.BaseException(error_codes_1.ERROR_CODES.FS_WRITE_FAILED, { path: dirPath, error: error.message });
        }
    }
    async deleteDirectory(dirPath) {
        const safePath = this.pathSecurity.validatePath(dirPath, {
            checkExists: true,
            allowSymlinks: false,
        });
        this.logger.debug('安全删除目录', { path: safePath });
        try {
            await fs.remove(safePath);
        }
        catch (error) {
            throw new base_exception_1.BaseException(error_codes_1.ERROR_CODES.FS_DELETE_FAILED, { path: dirPath, error: error.message });
        }
    }
    async readDirectory(dirPath) {
        const safePath = this.pathSecurity.validatePath(dirPath, {
            checkExists: true,
            allowSymlinks: false,
        });
        this.logger.debug('安全读取目录', { path: safePath });
        try {
            const files = await fs.readdir(safePath);
            return files.filter(file => !file.startsWith('.'));
        }
        catch (error) {
            throw new base_exception_1.BaseException(error_codes_1.ERROR_CODES.FS_READ_FAILED, { path: dirPath, error: error.message });
        }
    }
    async exists(filePath) {
        try {
            const safePath = this.pathSecurity.validatePath(filePath, {
                allowSymlinks: false,
            });
            return await fs.pathExists(safePath);
        }
        catch {
            return false;
        }
    }
    async getStats(filePath) {
        const safePath = this.pathSecurity.validatePath(filePath, {
            checkExists: true,
            allowSymlinks: false,
        });
        try {
            return await fs.stat(safePath);
        }
        catch (error) {
            throw new base_exception_1.BaseException(error_codes_1.ERROR_CODES.FS_READ_FAILED, { path: filePath, error: error.message });
        }
    }
    async createTempFile(prefix = 'tmp', extension = '.tmp') {
        const tempPath = this.pathSecurity.createSafeTempPath(prefix) + extension;
        await fs.ensureFile(tempPath);
        return tempPath;
    }
    async createTempDirectory(prefix = 'tmpdir') {
        const tempPath = this.pathSecurity.createSafeTempPath(prefix);
        await fs.ensureDir(tempPath);
        return tempPath;
    }
    async cleanupTempFiles(olderThanMs = 24 * 60 * 60 * 1000) {
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
        }
        catch (error) {
            this.logger.warn('清理临时文件失败', { error: error.message });
        }
    }
};
exports.SecureFileService = SecureFileService;
exports.SecureFileService = SecureFileService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [path_security_service_1.PathSecurityService,
        logger_service_1.LoggerService])
], SecureFileService);
//# sourceMappingURL=secure-file.service.js.map