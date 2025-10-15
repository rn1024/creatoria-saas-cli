"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PathSecurityMiddleware = void 0;
const common_1 = require("@nestjs/common");
const path_security_service_1 = require("./path-security.service");
const logger_service_1 = require("../logger/logger.service");
const base_exception_1 = require("../exceptions/base.exception");
const error_codes_1 = require("../constants/error-codes");
let PathSecurityMiddleware = class PathSecurityMiddleware {
    pathSecurity;
    logger;
    constructor(pathSecurity, logger) {
        this.pathSecurity = pathSecurity;
        this.logger = logger;
    }
    use(req, res, next) {
        try {
            this.validateRequestPath(req.path);
            this.validateQueryPaths(req.query);
            if (req.body && typeof req.body === 'object') {
                this.validateBodyPaths(req.body);
            }
            if (req.files) {
                this.validateUploadedFiles(req.files);
            }
            next();
        }
        catch (error) {
            this.logger.warn('路径安全检查失败', {
                path: req.path,
                method: req.method,
                ip: req.ip,
                error: error.message,
            });
            if (error instanceof base_exception_1.BaseException) {
                res.status(403).json({
                    error: error.code,
                    message: error.message,
                });
            }
            else {
                res.status(403).json({
                    error: 'SECURITY_ERROR',
                    message: 'Security check failed',
                });
            }
        }
    }
    validateRequestPath(requestPath) {
        if (requestPath.includes('../') || requestPath.includes('..\\')) {
            throw new base_exception_1.BaseException(error_codes_1.ERROR_CODES.VALIDATION_2008, { path: requestPath });
        }
        const decodedPath = decodeURIComponent(requestPath);
        if (decodedPath.includes('../') || decodedPath.includes('..\\')) {
            throw new base_exception_1.BaseException(error_codes_1.ERROR_CODES.VALIDATION_2008, { path: requestPath });
        }
    }
    validateQueryPaths(query) {
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
    validateBodyPaths(body, depth = 0) {
        if (depth > 10)
            return;
        const pathFields = ['path', 'file', 'dir', 'folder', 'filepath', 'filename',
            'sourcePath', 'targetPath', 'destPath', 'outputPath'];
        for (const [key, value] of Object.entries(body)) {
            if (pathFields.includes(key) && typeof value === 'string') {
                this.pathSecurity.validatePath(value, { allowAbsolute: false });
            }
            else if (typeof value === 'object' && value !== null) {
                this.validateBodyPaths(value, depth + 1);
            }
        }
    }
    validateUploadedFiles(files) {
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
};
exports.PathSecurityMiddleware = PathSecurityMiddleware;
exports.PathSecurityMiddleware = PathSecurityMiddleware = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [path_security_service_1.PathSecurityService,
        logger_service_1.LoggerService])
], PathSecurityMiddleware);
//# sourceMappingURL=path-security.middleware.js.map