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
exports.SecretManagerService = void 0;
const common_1 = require("@nestjs/common");
const fs = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
const sensitive_data_service_1 = require("./sensitive-data.service");
const secure_file_service_1 = require("./secure-file.service");
const logger_service_1 = require("../logger/logger.service");
const base_exception_1 = require("../exceptions/base.exception");
const error_codes_1 = require("../constants/error-codes");
let SecretManagerService = class SecretManagerService {
    sensitiveData;
    secureFile;
    logger;
    secretsStore = new Map();
    secretsFilePath;
    constructor(sensitiveData, secureFile, logger) {
        this.sensitiveData = sensitiveData;
        this.secureFile = secureFile;
        this.logger = logger;
        this.secretsFilePath = path.join(process.cwd(), '.secrets', 'secrets.encrypted');
        this.loadSecrets();
    }
    async loadSecrets() {
        try {
            if (await this.secureFile.exists(this.secretsFilePath)) {
                const encryptedData = await this.secureFile.readFile(this.secretsFilePath, 'utf8');
                const decryptedData = this.sensitiveData.decrypt(encryptedData);
                const secrets = JSON.parse(decryptedData);
                for (const secret of secrets) {
                    this.secretsStore.set(secret.id, {
                        ...secret,
                        createdAt: new Date(secret.createdAt),
                        updatedAt: new Date(secret.updatedAt),
                        expiresAt: secret.expiresAt ? new Date(secret.expiresAt) : undefined,
                    });
                }
                this.logger.debug('加载密钥成功', { count: this.secretsStore.size });
            }
        }
        catch (error) {
            this.logger.error('加载密钥失败', { error: error.message });
        }
    }
    async saveSecrets() {
        try {
            const secrets = Array.from(this.secretsStore.values());
            const jsonData = JSON.stringify(secrets, null, 2);
            const encryptedData = this.sensitiveData.encrypt(jsonData);
            await this.secureFile.writeFile(this.secretsFilePath, encryptedData);
            this.logger.debug('保存密钥成功', { count: secrets.length });
        }
        catch (error) {
            this.logger.error('保存密钥失败', { error: error.message });
            throw new base_exception_1.BaseException(error_codes_1.ERROR_CODES.FS_WRITE_FAILED, { path: this.secretsFilePath, error: error.message });
        }
    }
    async createSecret(name, value, options = {}) {
        const id = this.sensitiveData.generateSecureToken(16);
        const secret = {
            id,
            name,
            value: options.encrypt ? this.sensitiveData.encrypt(value) : value,
            encrypted: options.encrypt || false,
            createdAt: new Date(),
            updatedAt: new Date(),
            metadata: options.metadata,
        };
        if (options.expiresIn) {
            secret.expiresAt = new Date(Date.now() + options.expiresIn);
        }
        this.secretsStore.set(id, secret);
        await this.saveSecrets();
        this.logger.info('创建密钥', { name, id });
        return { ...secret, value: '[HIDDEN]' };
    }
    getSecret(id) {
        const secret = this.secretsStore.get(id);
        if (!secret) {
            return null;
        }
        if (secret.expiresAt && secret.expiresAt < new Date()) {
            this.logger.warn('密钥已过期', { id, name: secret.name });
            this.deleteSecret(id);
            return null;
        }
        if (secret.encrypted) {
            try {
                return this.sensitiveData.decrypt(secret.value);
            }
            catch (error) {
                this.logger.error('解密密钥失败', { id, error: error.message });
                return null;
            }
        }
        return secret.value;
    }
    getSecretByName(name) {
        for (const secret of this.secretsStore.values()) {
            if (secret.name === name) {
                return this.getSecret(secret.id);
            }
        }
        return null;
    }
    async updateSecret(id, value) {
        const secret = this.secretsStore.get(id);
        if (!secret) {
            return false;
        }
        secret.value = secret.encrypted ? this.sensitiveData.encrypt(value) : value;
        secret.updatedAt = new Date();
        await this.saveSecrets();
        this.logger.info('更新密钥', { id, name: secret.name });
        return true;
    }
    async deleteSecret(id) {
        const secret = this.secretsStore.get(id);
        if (!secret) {
            return false;
        }
        this.secretsStore.delete(id);
        await this.saveSecrets();
        this.logger.info('删除密钥', { id, name: secret.name });
        return true;
    }
    listSecrets() {
        const secrets = [];
        for (const secret of this.secretsStore.values()) {
            if (secret.expiresAt && secret.expiresAt < new Date()) {
                continue;
            }
            const { value, ...secretInfo } = secret;
            secrets.push(secretInfo);
        }
        return secrets;
    }
    async cleanupExpiredSecrets() {
        const now = new Date();
        const expiredIds = [];
        for (const [id, secret] of this.secretsStore.entries()) {
            if (secret.expiresAt && secret.expiresAt < now) {
                expiredIds.push(id);
            }
        }
        for (const id of expiredIds) {
            this.secretsStore.delete(id);
        }
        if (expiredIds.length > 0) {
            await this.saveSecrets();
            this.logger.info('清理过期密钥', { count: expiredIds.length });
        }
        return expiredIds.length;
    }
    async rotateSecret(id) {
        const secret = this.secretsStore.get(id);
        if (!secret) {
            return null;
        }
        const newValue = this.sensitiveData.generateApiKey(secret.name);
        const newSecret = await this.createSecret(`${secret.name}_rotated`, newValue, {
            encrypt: secret.encrypted,
            metadata: {
                ...secret.metadata,
                rotatedFrom: id,
                rotatedAt: new Date(),
            },
        });
        secret.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
        secret.metadata = {
            ...secret.metadata,
            rotatedTo: newSecret.id,
            rotatedAt: new Date(),
        };
        await this.saveSecrets();
        this.logger.info('轮转密钥', { oldId: id, newId: newSecret.id });
        return newSecret;
    }
    async backupSecrets(backupPath) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupFile = backupPath || path.join(process.cwd(), '.secrets', 'backups', `secrets_backup_${timestamp}.encrypted`);
        await fs.ensureDir(path.dirname(backupFile));
        const secrets = Array.from(this.secretsStore.values());
        const jsonData = JSON.stringify(secrets, null, 2);
        const encryptedData = this.sensitiveData.encrypt(jsonData);
        await fs.writeFile(backupFile, encryptedData);
        this.logger.info('备份密钥', { file: backupFile, count: secrets.length });
        return backupFile;
    }
    async restoreSecrets(backupPath) {
        try {
            const encryptedData = await fs.readFile(backupPath, 'utf8');
            const decryptedData = this.sensitiveData.decrypt(encryptedData);
            const secrets = JSON.parse(decryptedData);
            this.secretsStore.clear();
            for (const secret of secrets) {
                this.secretsStore.set(secret.id, {
                    ...secret,
                    createdAt: new Date(secret.createdAt),
                    updatedAt: new Date(secret.updatedAt),
                    expiresAt: secret.expiresAt ? new Date(secret.expiresAt) : undefined,
                });
            }
            await this.saveSecrets();
            this.logger.info('恢复密钥', { file: backupPath, count: secrets.length });
            return secrets.length;
        }
        catch (error) {
            this.logger.error('恢复密钥失败', { file: backupPath, error: error.message });
            throw new base_exception_1.BaseException(error_codes_1.ERROR_CODES.FS_READ_FAILED, { path: backupPath, error: error.message });
        }
    }
};
exports.SecretManagerService = SecretManagerService;
exports.SecretManagerService = SecretManagerService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [sensitive_data_service_1.SensitiveDataService,
        secure_file_service_1.SecureFileService,
        logger_service_1.LoggerService])
], SecretManagerService);
//# sourceMappingURL=secret-manager.service.js.map