"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StringValidator = void 0;
class StringValidator {
    static isNotEmpty(value) {
        if (value === null || value === undefined) {
            return false;
        }
        if (typeof value !== 'string') {
            return false;
        }
        return value.trim().length > 0;
    }
    static isLength(value, min, max) {
        if (typeof value !== 'string') {
            return false;
        }
        const len = value.length;
        if (max === undefined) {
            return len >= min;
        }
        return len >= min && len <= max;
    }
    static isEmail(value) {
        if (typeof value !== 'string') {
            return false;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value);
    }
    static isURL(value) {
        if (typeof value !== 'string') {
            return false;
        }
        try {
            new URL(value);
            return true;
        }
        catch {
            return false;
        }
    }
    static matches(value, pattern) {
        if (typeof value !== 'string') {
            return false;
        }
        const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
        return regex.test(value);
    }
    static isAlphanumeric(value) {
        if (typeof value !== 'string') {
            return false;
        }
        return /^[a-zA-Z0-9]+$/.test(value);
    }
    static isValidModuleName(value) {
        if (typeof value !== 'string') {
            return false;
        }
        return /^[a-z][a-z0-9-]*$/.test(value);
    }
    static isVersion(value) {
        if (typeof value !== 'string') {
            return false;
        }
        return /^\d+\.\d+\.\d+(-[a-zA-Z0-9.-]+)?(\+[a-zA-Z0-9.-]+)?$/.test(value);
    }
    static isJSON(value) {
        if (typeof value !== 'string') {
            return false;
        }
        try {
            JSON.parse(value);
            return true;
        }
        catch {
            return false;
        }
    }
    static isBase64(value) {
        if (typeof value !== 'string') {
            return false;
        }
        const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
        return base64Regex.test(value) && value.length % 4 === 0;
    }
    static isUUID(value, version) {
        if (typeof value !== 'string') {
            return false;
        }
        const patterns = {
            3: /^[0-9a-f]{8}-[0-9a-f]{4}-3[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
            4: /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
            5: /^[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
            all: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
        };
        return version ? patterns[version].test(value) : patterns.all.test(value);
    }
    static isSafe(value) {
        if (typeof value !== 'string') {
            return false;
        }
        const dangerousPatterns = [
            /<script/i,
            /javascript:/i,
            /on\w+\s*=/i,
            /[;&|`$]/,
            /\.\.[\/\\]/,
            /\x00/,
        ];
        return !dangerousPatterns.some(pattern => pattern.test(value));
    }
    static sanitize(value) {
        if (typeof value !== 'string') {
            return '';
        }
        let cleaned = value.replace(/<[^>]*>/g, '');
        cleaned = cleaned.replace(/[;&|`$]/g, '');
        cleaned = cleaned.replace(/\x00/g, '');
        cleaned = cleaned.trim();
        return cleaned;
    }
    static escapeHtml(value) {
        if (typeof value !== 'string') {
            return '';
        }
        const htmlEscapes = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;',
        };
        return value.replace(/[&<>"']/g, char => htmlEscapes[char]);
    }
    static escapeShell(value) {
        if (typeof value !== 'string') {
            return '';
        }
        return "'" + value.replace(/'/g, "'\\''") + "'";
    }
}
exports.StringValidator = StringValidator;
//# sourceMappingURL=string.validator.js.map