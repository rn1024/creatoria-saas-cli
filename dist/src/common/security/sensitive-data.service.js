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
exports.SensitiveDataService = void 0;
const common_1 = require("@nestjs/common");
const crypto = __importStar(require("crypto"));
const security_config_1 = require("./security.config");
const logger_service_1 = require("../logger/logger.service");
let SensitiveDataService = class SensitiveDataService {
    logger;
    encryptionKey;
    redactPatterns;
    protectedFields;
    constructor(logger) {
        this.logger = logger;
        this.initializeEncryption();
        this.initializePatterns();
    }
    initializeEncryption() {
        const keySource = process.env.ENCRYPTION_KEY || 'default-encryption-key-change-in-production';
        this.encryptionKey = crypto.createHash('sha256').update(keySource).digest();
    }
    initializePatterns() {
        const config = (0, security_config_1.getSecurityConfig)();
        this.redactPatterns = config.sensitiveData.redactPatterns;
        this.protectedFields = new Set(config.sensitiveData.protectedFields);
    }
    encrypt(data) {
        try {
            const iv = crypto.randomBytes(16);
            const cipher = crypto.createCipheriv('aes-256-cbc', this.encryptionKey, iv);
            let encrypted = cipher.update(data, 'utf8', 'base64');
            encrypted += cipher.final('base64');
            return iv.toString('base64') + ':' + encrypted;
        }
        catch (error) {
            this.logger.error('加密失败', { error: error.message });
            throw error;
        }
    }
    decrypt(encryptedData) {
        try {
            const parts = encryptedData.split(':');
            if (parts.length !== 2) {
                throw new Error('Invalid encrypted data format');
            }
            const iv = Buffer.from(parts[0], 'base64');
            const encrypted = parts[1];
            const decipher = crypto.createDecipheriv('aes-256-cbc', this.encryptionKey, iv);
            let decrypted = decipher.update(encrypted, 'base64', 'utf8');
            decrypted += decipher.final('utf8');
            return decrypted;
        }
        catch (error) {
            this.logger.error('解密失败', { error: error.message });
            throw error;
        }
    }
    hash(data) {
        return crypto.createHash('sha256').update(data).digest('hex');
    }
    maskString(value, options = {}) {
        if (!value || value.length === 0) {
            return value;
        }
        const showFirst = options.showFirst || 0;
        const showLast = options.showLast || 0;
        const maskChar = options.maskChar || '*';
        if (value.length <= showFirst + showLast) {
            return maskChar.repeat(value.length);
        }
        const start = value.substring(0, showFirst);
        const end = value.substring(value.length - showLast);
        const middle = maskChar.repeat(value.length - showFirst - showLast);
        return start + middle + end;
    }
    maskEmail(email) {
        const parts = email.split('@');
        if (parts.length !== 2) {
            return this.maskString(email);
        }
        const [localPart, domain] = parts;
        const maskedLocal = this.maskString(localPart, { showFirst: 1, showLast: 1 });
        return `${maskedLocal}@${domain}`;
    }
    maskPhone(phone) {
        const digitsOnly = phone.replace(/\D/g, '');
        if (digitsOnly.length < 7) {
            return this.maskString(phone);
        }
        return this.maskString(digitsOnly, { showFirst: 3, showLast: 4 });
    }
    maskCreditCard(cardNumber) {
        const digitsOnly = cardNumber.replace(/\D/g, '');
        if (digitsOnly.length < 12) {
            return this.maskString(cardNumber);
        }
        return this.maskString(digitsOnly, { showLast: 4 });
    }
    maskIP(ip) {
        const parts = ip.split('.');
        if (parts.length !== 4) {
            return this.maskString(ip);
        }
        return `${parts[0]}.xxx.xxx.xxx`;
    }
    maskObject(obj, depth = 0) {
        if (depth > 10)
            return obj;
        if (obj === null || obj === undefined) {
            return obj;
        }
        if (typeof obj !== 'object') {
            return obj;
        }
        if (Array.isArray(obj)) {
            return obj.map(item => this.maskObject(item, depth + 1));
        }
        const masked = {};
        for (const [key, value] of Object.entries(obj)) {
            const lowerKey = key.toLowerCase();
            if (this.isProtectedField(lowerKey)) {
                masked[key] = this.maskValue(value, lowerKey);
            }
            else if (typeof value === 'object' && value !== null) {
                masked[key] = this.maskObject(value, depth + 1);
            }
            else if (typeof value === 'string') {
                masked[key] = this.redactSensitivePatterns(value);
            }
            else {
                masked[key] = value;
            }
        }
        return masked;
    }
    isProtectedField(fieldName) {
        const lowerName = fieldName.toLowerCase();
        if (this.protectedFields.has(lowerName)) {
            return true;
        }
        for (const protectedField of this.protectedFields) {
            if (lowerName.includes(protectedField)) {
                return true;
            }
        }
        return false;
    }
    maskValue(value, fieldName) {
        if (value === null || value === undefined) {
            return value;
        }
        if (typeof value !== 'string') {
            return '[REDACTED]';
        }
        if (fieldName.includes('email')) {
            return this.maskEmail(value);
        }
        else if (fieldName.includes('phone')) {
            return this.maskPhone(value);
        }
        else if (fieldName.includes('card') || fieldName.includes('credit')) {
            return this.maskCreditCard(value);
        }
        else if (fieldName.includes('ip')) {
            return this.maskIP(value);
        }
        else if (fieldName.includes('token') || fieldName.includes('key') || fieldName.includes('secret')) {
            return '[REDACTED]';
        }
        else {
            return this.maskString(value, { showFirst: 2, showLast: 2 });
        }
    }
    redactSensitivePatterns(text) {
        let redacted = text;
        for (const pattern of this.redactPatterns) {
            redacted = redacted.replace(pattern, '[REDACTED]');
        }
        return redacted;
    }
    maskLogMessage(message, context) {
        const config = (0, security_config_1.getSecurityConfig)();
        if (!config.sensitiveData.maskInLogs) {
            return { message, context };
        }
        const maskedMessage = this.redactSensitivePatterns(message);
        const maskedContext = context ? this.maskObject(context) : undefined;
        return {
            message: maskedMessage,
            context: maskedContext,
        };
    }
    containsSensitiveData(text) {
        for (const pattern of this.redactPatterns) {
            if (pattern.test(text)) {
                return true;
            }
        }
        return false;
    }
    generateSecureToken(length = 32) {
        return crypto.randomBytes(length).toString('hex');
    }
    generateApiKey(prefix = 'sk') {
        const token = this.generateSecureToken(24);
        return `${prefix}_${token}`;
    }
    validatePasswordStrength(password) {
        const issues = [];
        let score = 0;
        if (password.length < 8) {
            issues.push('密码长度至少为8个字符');
        }
        else if (password.length >= 12) {
            score += 2;
        }
        else {
            score += 1;
        }
        if (!/[A-Z]/.test(password)) {
            issues.push('密码必须包含大写字母');
        }
        else {
            score += 1;
        }
        if (!/[a-z]/.test(password)) {
            issues.push('密码必须包含小写字母');
        }
        else {
            score += 1;
        }
        if (!/\d/.test(password)) {
            issues.push('密码必须包含数字');
        }
        else {
            score += 1;
        }
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            issues.push('密码必须包含特殊字符');
        }
        else {
            score += 1;
        }
        const commonPasswords = [
            'password', '123456', '12345678', 'qwerty', 'abc123',
            'password123', 'admin', 'letmein', 'welcome', 'monkey'
        ];
        if (commonPasswords.includes(password.toLowerCase())) {
            issues.push('密码太常见，容易被破解');
            score = 0;
        }
        return {
            valid: issues.length === 0,
            score: Math.min(score, 5),
            issues,
        };
    }
};
exports.SensitiveDataService = SensitiveDataService;
exports.SensitiveDataService = SensitiveDataService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [logger_service_1.LoggerService])
], SensitiveDataService);
//# sourceMappingURL=sensitive-data.service.js.map