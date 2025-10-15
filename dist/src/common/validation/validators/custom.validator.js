"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomValidator = void 0;
const string_validator_1 = require("./string.validator");
const number_validator_1 = require("./number.validator");
const path_validator_1 = require("./path.validator");
class CustomValidator {
    static rules = new Map();
    static registerRule(name, rule) {
        this.rules.set(name, rule);
    }
    static getRule(name) {
        return this.rules.get(name);
    }
    static validateModuleName(value) {
        const errors = [];
        if (!string_validator_1.StringValidator.isNotEmpty(value)) {
            errors.push({ field: 'moduleName', message: '模块名称不能为空' });
        }
        else if (!string_validator_1.StringValidator.isValidModuleName(value)) {
            errors.push({ field: 'moduleName', message: '模块名称格式不正确，必须以小写字母开头，只能包含小写字母、数字和横线' });
        }
        else if (!string_validator_1.StringValidator.isLength(value, 2, 50)) {
            errors.push({ field: 'moduleName', message: '模块名称长度必须在2-50个字符之间' });
        }
        return {
            valid: errors.length === 0,
            errors
        };
    }
    static validateProjectName(value) {
        const errors = [];
        if (!string_validator_1.StringValidator.isNotEmpty(value)) {
            errors.push({ field: 'projectName', message: '项目名称不能为空' });
        }
        else if (!string_validator_1.StringValidator.matches(value, /^[a-z][a-z0-9-_]*$/)) {
            errors.push({ field: 'projectName', message: '项目名称格式不正确，必须以小写字母开头' });
        }
        else if (!string_validator_1.StringValidator.isLength(value, 2, 100)) {
            errors.push({ field: 'projectName', message: '项目名称长度必须在2-100个字符之间' });
        }
        else if (!string_validator_1.StringValidator.isSafe(value)) {
            errors.push({ field: 'projectName', message: '项目名称包含危险字符' });
        }
        return {
            valid: errors.length === 0,
            errors
        };
    }
    static validateDatabaseConfig(config) {
        const errors = [];
        if (!string_validator_1.StringValidator.isNotEmpty(config.host)) {
            errors.push({ field: 'host', message: '数据库主机不能为空' });
        }
        else if (!string_validator_1.StringValidator.isSafe(config.host)) {
            errors.push({ field: 'host', message: '数据库主机包含危险字符' });
        }
        if (!number_validator_1.NumberValidator.isPort(config.port)) {
            errors.push({ field: 'port', message: '数据库端口无效，必须在1-65535之间' });
        }
        if (!string_validator_1.StringValidator.isNotEmpty(config.database)) {
            errors.push({ field: 'database', message: '数据库名不能为空' });
        }
        else if (!string_validator_1.StringValidator.matches(config.database, /^[a-zA-Z][a-zA-Z0-9_]*$/)) {
            errors.push({ field: 'database', message: '数据库名格式不正确' });
        }
        if (!string_validator_1.StringValidator.isNotEmpty(config.username)) {
            errors.push({ field: 'username', message: '数据库用户名不能为空' });
        }
        else if (!string_validator_1.StringValidator.isSafe(config.username)) {
            errors.push({ field: 'username', message: '数据库用户名包含危险字符' });
        }
        if (config.password && !string_validator_1.StringValidator.isLength(config.password, 6, 128)) {
            errors.push({ field: 'password', message: '数据库密码长度必须在6-128个字符之间' });
        }
        return {
            valid: errors.length === 0,
            errors
        };
    }
    static validateApiConfig(config) {
        const errors = [];
        if (!string_validator_1.StringValidator.isNotEmpty(config.url)) {
            errors.push({ field: 'url', message: 'API URL不能为空' });
        }
        else if (!string_validator_1.StringValidator.isURL(config.url)) {
            errors.push({ field: 'url', message: 'API URL格式不正确' });
        }
        if (config.apiKey && !string_validator_1.StringValidator.matches(config.apiKey, /^[a-zA-Z0-9-_]+$/)) {
            errors.push({ field: 'apiKey', message: 'API Key格式不正确' });
        }
        if (config.timeout && !number_validator_1.NumberValidator.isInRange(config.timeout, 100, 60000)) {
            errors.push({ field: 'timeout', message: '超时时间必须在100-60000毫秒之间' });
        }
        if (config.retries && !number_validator_1.NumberValidator.isInRange(config.retries, 0, 10)) {
            errors.push({ field: 'retries', message: '重试次数必须在0-10之间' });
        }
        return {
            valid: errors.length === 0,
            errors
        };
    }
    static async validateFileUpload(file, options = {}) {
        const errors = [];
        if (!await path_validator_1.PathValidator.isFile(file.path)) {
            errors.push({ field: 'file', message: '文件不存在' });
            return { valid: false, errors };
        }
        const maxSize = options.maxSize || 10 * 1024 * 1024;
        if (!number_validator_1.NumberValidator.isValidFileSize(file.size, maxSize)) {
            errors.push({ field: 'size', message: `文件大小超过限制（最大${maxSize / 1024 / 1024}MB）` });
        }
        if (options.allowedTypes && options.allowedTypes.length > 0) {
            if (!options.allowedTypes.includes(file.mimetype)) {
                errors.push({ field: 'type', message: `文件类型不允许，允许的类型：${options.allowedTypes.join(', ')}` });
            }
        }
        if (options.allowedExtensions && options.allowedExtensions.length > 0) {
            if (!path_validator_1.PathValidator.hasExtension(file.path, options.allowedExtensions)) {
                errors.push({ field: 'extension', message: `文件扩展名不允许，允许的扩展名：${options.allowedExtensions.join(', ')}` });
            }
        }
        const fileName = file.path.split('/').pop() || '';
        if (!path_validator_1.PathValidator.isValidFileName(fileName)) {
            errors.push({ field: 'filename', message: '文件名包含非法字符' });
        }
        return {
            valid: errors.length === 0,
            errors
        };
    }
    static validateCliArgs(args) {
        const errors = [];
        args.forEach((arg, index) => {
            if (arg.includes(';') || arg.includes('|') || arg.includes('&')) {
                errors.push({ field: `arg[${index}]`, message: '参数包含危险的shell字符' });
            }
            if (path_validator_1.PathValidator.hasPathTraversal(arg)) {
                errors.push({ field: `arg[${index}]`, message: '参数包含路径遍历' });
            }
            const sqlPatterns = [
                /('|(\-\-)|(;)|(\|\|)|(\/\*)|(<>)|(\*\|))/i,
                /(\b(ALTER|CREATE|DELETE|DROP|EXEC(UTE)?|INSERT|SELECT|UNION|UPDATE)\b)/i
            ];
            if (sqlPatterns.some(pattern => pattern.test(arg))) {
                errors.push({ field: `arg[${index}]`, message: '参数可能包含SQL注入' });
            }
        });
        return {
            valid: errors.length === 0,
            errors
        };
    }
    static async validateWithSchema(data, schema) {
        const errors = [];
        for (const [field, rules] of Object.entries(schema)) {
            const value = data[field];
            for (const rule of rules) {
                try {
                    const isValid = await Promise.resolve(rule.validator(value));
                    if (!isValid) {
                        errors.push({ field, message: rule.message });
                    }
                }
                catch (error) {
                    errors.push({ field, message: `验证失败: ${error.message}` });
                }
            }
        }
        return {
            valid: errors.length === 0,
            errors
        };
    }
    static combine(...validators) {
        return (value) => {
            const allErrors = [];
            for (const validator of validators) {
                const result = validator(value);
                if (!result.valid) {
                    allErrors.push(...result.errors);
                }
            }
            return {
                valid: allErrors.length === 0,
                errors: allErrors
            };
        };
    }
}
exports.CustomValidator = CustomValidator;
//# sourceMappingURL=custom.validator.js.map