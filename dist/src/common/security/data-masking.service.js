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
exports.DataMaskingService = void 0;
const common_1 = require("@nestjs/common");
const sensitive_data_service_1 = require("./sensitive-data.service");
const logger_service_1 = require("../logger/logger.service");
let DataMaskingService = class DataMaskingService {
    sensitiveData;
    logger;
    maskingRules = [];
    constructor(sensitiveData, logger) {
        this.sensitiveData = sensitiveData;
        this.logger = logger;
        this.initializeDefaultRules();
    }
    initializeDefaultRules() {
        this.maskingRules = [
            {
                pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
                replacement: (match) => this.sensitiveData.maskEmail(match),
                description: 'Email addresses',
            },
            {
                pattern: /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g,
                replacement: (match) => this.sensitiveData.maskPhone(match),
                description: 'Phone numbers',
            },
            {
                pattern: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g,
                replacement: (match) => this.sensitiveData.maskCreditCard(match),
                description: 'Credit card numbers',
            },
            {
                pattern: /\b\d{3}-\d{2}-\d{4}\b/g,
                replacement: 'XXX-XX-XXXX',
                description: 'Social Security Numbers',
            },
            {
                pattern: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g,
                replacement: (match) => this.sensitiveData.maskIP(match),
                description: 'IP addresses',
            },
            {
                pattern: /\b(sk|pk|api[_-]?key|token)[_-]?[A-Za-z0-9]{20,}\b/gi,
                replacement: '[API_KEY_REDACTED]',
                description: 'API keys and tokens',
            },
            {
                pattern: /Bearer\s+[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+/g,
                replacement: 'Bearer [JWT_REDACTED]',
                description: 'JWT tokens',
            },
            {
                pattern: /"password"\s*:\s*"[^"]+"/gi,
                replacement: '"password":"[REDACTED]"',
                description: 'Password fields in JSON',
            },
            {
                pattern: /\b(AKIA|ASIA)[A-Z0-9]{16}\b/g,
                replacement: '[AWS_ACCESS_KEY_REDACTED]',
                description: 'AWS Access Keys',
            },
            {
                pattern: /-----BEGIN (RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----[\s\S]+?-----END (RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----/g,
                replacement: '[PRIVATE_KEY_REDACTED]',
                description: 'Private keys',
            },
        ];
    }
    addMaskingRule(rule) {
        this.maskingRules.push(rule);
        this.logger.debug('添加脚敏规则', { description: rule.description });
    }
    maskText(text) {
        let maskedText = text;
        for (const rule of this.maskingRules) {
            const pattern = typeof rule.pattern === 'string'
                ? new RegExp(rule.pattern, 'g')
                : rule.pattern;
            if (typeof rule.replacement === 'function') {
                maskedText = maskedText.replace(pattern, rule.replacement);
            }
            else {
                maskedText = maskedText.replace(pattern, rule.replacement);
            }
        }
        return maskedText;
    }
    maskJSON(obj) {
        if (obj === null || obj === undefined) {
            return obj;
        }
        const jsonString = JSON.stringify(obj);
        const maskedString = this.maskText(jsonString);
        try {
            return JSON.parse(maskedString);
        }
        catch {
            return this.sensitiveData.maskObject(obj);
        }
    }
    maskLogEntry(level, message, context) {
        const { message: maskedMessage, context: maskedContext } = this.sensitiveData.maskLogMessage(message, context);
        const finalMessage = this.maskText(maskedMessage);
        return {
            level,
            message: finalMessage,
            context: maskedContext,
            masked: finalMessage !== message || maskedContext !== context,
        };
    }
    async maskFileContent(content, fileType) {
        switch (fileType) {
            case '.json':
                try {
                    const obj = JSON.parse(content);
                    const masked = this.maskJSON(obj);
                    return JSON.stringify(masked, null, 2);
                }
                catch {
                    return this.maskText(content);
                }
            case '.env':
                return this.maskEnvFile(content);
            case '.log':
                return this.maskLogFile(content);
            default:
                return this.maskText(content);
        }
    }
    maskEnvFile(content) {
        const lines = content.split('\n');
        const maskedLines = [];
        const sensitiveKeys = [
            'PASSWORD', 'SECRET', 'KEY', 'TOKEN',
            'API', 'PRIVATE', 'CREDENTIAL', 'AUTH',
        ];
        for (const line of lines) {
            if (line.startsWith('#') || line.trim() === '') {
                maskedLines.push(line);
                continue;
            }
            const [key, ...valueParts] = line.split('=');
            const value = valueParts.join('=');
            if (key && value) {
                const upperKey = key.toUpperCase();
                const needsMasking = sensitiveKeys.some(sensitive => upperKey.includes(sensitive));
                if (needsMasking) {
                    maskedLines.push(`${key}=[REDACTED]`);
                }
                else {
                    const maskedValue = this.maskText(value);
                    maskedLines.push(`${key}=${maskedValue}`);
                }
            }
            else {
                maskedLines.push(line);
            }
        }
        return maskedLines.join('\n');
    }
    maskLogFile(content) {
        const lines = content.split('\n');
        const maskedLines = [];
        for (const line of lines) {
            maskedLines.push(this.maskText(line));
        }
        return maskedLines.join('\n');
    }
    maskStackTrace(stack) {
        let masked = stack.replace(/\/(?:home|Users)\/[^\/]+/g, '/[USER]');
        masked = this.maskText(masked);
        return masked;
    }
    maskHttpRequest(request) {
        const masked = {
            method: request.method,
            url: this.maskText(request.url),
        };
        if (request.headers) {
            masked.headers = {};
            const sensitiveHeaders = [
                'authorization', 'cookie', 'x-api-key',
                'x-auth-token', 'x-access-token',
            ];
            for (const [key, value] of Object.entries(request.headers)) {
                const lowerKey = key.toLowerCase();
                if (sensitiveHeaders.includes(lowerKey)) {
                    masked.headers[key] = '[REDACTED]';
                }
                else {
                    masked.headers[key] = this.maskText(value);
                }
            }
        }
        if (request.body) {
            masked.body = this.maskJSON(request.body);
        }
        return masked;
    }
    maskHttpResponse(response) {
        const masked = {
            status: response.status,
        };
        if (response.headers) {
            masked.headers = {};
            const sensitiveHeaders = ['set-cookie'];
            for (const [key, value] of Object.entries(response.headers)) {
                const lowerKey = key.toLowerCase();
                if (sensitiveHeaders.includes(lowerKey)) {
                    masked.headers[key] = '[REDACTED]';
                }
                else {
                    masked.headers[key] = value;
                }
            }
        }
        if (response.body) {
            masked.body = this.maskJSON(response.body);
        }
        return masked;
    }
    getMaskingStats() {
        return {
            rulesCount: this.maskingRules.length,
            rules: this.maskingRules.map(rule => ({
                pattern: rule.pattern.toString(),
                description: rule.description,
            })),
        };
    }
};
exports.DataMaskingService = DataMaskingService;
exports.DataMaskingService = DataMaskingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [sensitive_data_service_1.SensitiveDataService,
        logger_service_1.LoggerService])
], DataMaskingService);
//# sourceMappingURL=data-masking.service.js.map