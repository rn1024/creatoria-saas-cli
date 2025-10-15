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
exports.PathSecurityService = void 0;
const common_1 = require("@nestjs/common");
const path = __importStar(require("path"));
const fs = __importStar(require("fs-extra"));
const base_exception_1 = require("../exceptions/base.exception");
const error_codes_1 = require("../constants/error-codes");
const logger_service_1 = require("../logger/logger.service");
const path_validator_1 = require("../validation/validators/path.validator");
let PathSecurityService = class PathSecurityService {
    logger;
    projectRoot;
    allowedPaths = new Set();
    blockedPaths = new Set();
    constructor(logger) {
        this.logger = logger;
        this.projectRoot = process.cwd();
        this.initializeSecurityRules();
    }
    initializeSecurityRules() {
        this.allowedPaths.add(this.projectRoot);
        this.allowedPaths.add(path.join(this.projectRoot, 'src'));
        this.allowedPaths.add(path.join(this.projectRoot, 'dist'));
        this.allowedPaths.add(path.join(this.projectRoot, 'node_modules'));
        this.allowedPaths.add(path.join(this.projectRoot, 'uploads'));
        this.allowedPaths.add(path.join(this.projectRoot, 'temp'));
        this.allowedPaths.add(path.join(this.projectRoot, 'config'));
        this.allowedPaths.add(path.join(this.projectRoot, 'modules'));
        this.blockedPaths.add('/etc');
        this.blockedPaths.add('/usr');
        this.blockedPaths.add('/bin');
        this.blockedPaths.add('/sbin');
        this.blockedPaths.add('/var');
        this.blockedPaths.add('/root');
        this.blockedPaths.add(process.env.HOME || '');
        if (process.platform === 'win32') {
            this.blockedPaths.add('C:\\Windows');
            this.blockedPaths.add('C:\\Program Files');
            this.blockedPaths.add('C:\\Program Files (x86)');
        }
    }
    validatePath(inputPath, options = {}) {
        if (path_validator_1.PathValidator.hasPathTraversal(inputPath)) {
            this.logger.warn('检测到路径遍历尝试', { path: inputPath });
            throw new base_exception_1.BaseException(error_codes_1.ERROR_CODES.VALIDATION_2008, { path: inputPath });
        }
        const decodedPath = this.decodePathSafely(inputPath);
        if (path_validator_1.PathValidator.hasPathTraversal(decodedPath)) {
            this.logger.warn('检测到URL编码的路径遍历', { path: inputPath });
            throw new base_exception_1.BaseException(error_codes_1.ERROR_CODES.VALIDATION_2008, { path: inputPath });
        }
        const basePath = options.basePath || this.projectRoot;
        const resolvedPath = path.resolve(basePath, decodedPath);
        const normalizedPath = path.normalize(resolvedPath);
        if (!this.isPathAllowed(normalizedPath)) {
            this.logger.warn('访问被禁止的路径', { path: normalizedPath });
            throw new base_exception_1.BaseException(error_codes_1.ERROR_CODES.FS_PERMISSION_DENIED, { path: normalizedPath });
        }
        if (!options.allowSymlinks && this.isSymlinkSync(normalizedPath)) {
            const realPath = fs.realpathSync(normalizedPath);
            if (!this.isPathAllowed(realPath)) {
                this.logger.warn('符号链接指向禁止的路径', {
                    symlink: normalizedPath,
                    target: realPath
                });
                throw new base_exception_1.BaseException(error_codes_1.ERROR_CODES.FS_PERMISSION_DENIED, { path: normalizedPath });
            }
        }
        if (options.checkExists && !fs.existsSync(normalizedPath)) {
            throw new base_exception_1.BaseException(error_codes_1.ERROR_CODES.FS_FILE_NOT_FOUND, { path: normalizedPath });
        }
        return normalizedPath;
    }
    decodePathSafely(inputPath) {
        try {
            let decoded = inputPath;
            let previousDecoded = '';
            let maxIterations = 3;
            while (decoded !== previousDecoded && maxIterations > 0) {
                previousDecoded = decoded;
                decoded = decodeURIComponent(decoded);
                maxIterations--;
            }
            return decoded;
        }
        catch {
            return inputPath;
        }
    }
    isPathAllowed(normalizedPath) {
        for (const blockedPath of this.blockedPaths) {
            if (blockedPath && normalizedPath.startsWith(blockedPath)) {
                return false;
            }
        }
        for (const allowedPath of this.allowedPaths) {
            if (normalizedPath.startsWith(allowedPath)) {
                return true;
            }
        }
        return false;
    }
    isSymlinkSync(filePath) {
        try {
            const stats = fs.lstatSync(filePath);
            return stats.isSymbolicLink();
        }
        catch {
            return false;
        }
    }
    createSafeTempPath(prefix = 'temp') {
        const tempDir = path.join(this.projectRoot, 'temp');
        fs.ensureDirSync(tempDir);
        const randomName = `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2)}`;
        return path.join(tempDir, randomName);
    }
    getSafeRelativePath(from, to) {
        const safeFrom = this.validatePath(from);
        const safeTo = this.validatePath(to);
        return path.relative(safeFrom, safeTo);
    }
    validateFileName(fileName) {
        const invalidChars = /[<>:"|?*\x00-\x1f\/\\]/;
        if (invalidChars.test(fileName)) {
            throw new base_exception_1.BaseException(error_codes_1.ERROR_CODES.FS_INVALID_PATH, { path: fileName });
        }
        const reservedNames = [
            'CON', 'PRN', 'AUX', 'NUL',
            'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9',
            'LPT1', 'LPT2', 'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9'
        ];
        const nameWithoutExt = path.basename(fileName, path.extname(fileName));
        if (reservedNames.includes(nameWithoutExt.toUpperCase())) {
            throw new base_exception_1.BaseException(error_codes_1.ERROR_CODES.FS_INVALID_PATH, { path: fileName });
        }
        if (fileName.length > 255) {
            throw new base_exception_1.BaseException(error_codes_1.ERROR_CODES.FS_INVALID_PATH, { path: fileName });
        }
    }
    addAllowedPath(dirPath) {
        const normalizedPath = path.resolve(dirPath);
        this.allowedPaths.add(normalizedPath);
        this.logger.debug('添加允许路径', { path: normalizedPath });
    }
    addBlockedPath(dirPath) {
        const normalizedPath = path.resolve(dirPath);
        this.blockedPaths.add(normalizedPath);
        this.logger.debug('添加禁止路径', { path: normalizedPath });
    }
    getSecurityConfig() {
        return {
            projectRoot: this.projectRoot,
            allowedPaths: Array.from(this.allowedPaths),
            blockedPaths: Array.from(this.blockedPaths),
        };
    }
};
exports.PathSecurityService = PathSecurityService;
exports.PathSecurityService = PathSecurityService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [logger_service_1.LoggerService])
], PathSecurityService);
//# sourceMappingURL=path-security.service.js.map