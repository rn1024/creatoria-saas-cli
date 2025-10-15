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
exports.PathValidator = void 0;
const path = __importStar(require("path"));
const fs = __importStar(require("fs-extra"));
class PathValidator {
    static isAbsolute(value) {
        if (typeof value !== 'string') {
            return false;
        }
        return path.isAbsolute(value);
    }
    static isRelative(value) {
        if (typeof value !== 'string') {
            return false;
        }
        return !path.isAbsolute(value);
    }
    static async exists(value) {
        if (typeof value !== 'string') {
            return false;
        }
        try {
            await fs.access(value);
            return true;
        }
        catch {
            return false;
        }
    }
    static existsSync(value) {
        if (typeof value !== 'string') {
            return false;
        }
        try {
            fs.accessSync(value);
            return true;
        }
        catch {
            return false;
        }
    }
    static async isFile(value) {
        if (typeof value !== 'string') {
            return false;
        }
        try {
            const stats = await fs.stat(value);
            return stats.isFile();
        }
        catch {
            return false;
        }
    }
    static async isDirectory(value) {
        if (typeof value !== 'string') {
            return false;
        }
        try {
            const stats = await fs.stat(value);
            return stats.isDirectory();
        }
        catch {
            return false;
        }
    }
    static hasExtension(value, extensions) {
        if (typeof value !== 'string') {
            return false;
        }
        const ext = path.extname(value).toLowerCase();
        const validExtensions = Array.isArray(extensions) ? extensions : [extensions];
        return validExtensions.some(validExt => {
            const normalized = validExt.startsWith('.') ? validExt : `.${validExt}`;
            return ext === normalized.toLowerCase();
        });
    }
    static hasPathTraversal(value) {
        if (typeof value !== 'string') {
            return false;
        }
        const patterns = [
            /\.\.\//,
            /\.\.\\/,
            /%2e%2e/i,
            /\.\.%2f/i,
            /\.\.%5c/i,
        ];
        return patterns.some(pattern => pattern.test(value));
    }
    static isSafePath(value, basePath) {
        if (typeof value !== 'string') {
            return false;
        }
        if (this.hasPathTraversal(value)) {
            return false;
        }
        const dangerousChars = ['\0', '|', '>', '<', '&', ';', '$', '`', '\n', '\r'];
        if (dangerousChars.some(char => value.includes(char))) {
            return false;
        }
        if (basePath) {
            const resolvedPath = path.resolve(basePath, value);
            const normalizedBase = path.resolve(basePath);
            return resolvedPath.startsWith(normalizedBase);
        }
        return true;
    }
    static isValidFileName(value) {
        if (typeof value !== 'string' || value.length === 0) {
            return false;
        }
        const invalidChars = /[<>:"|?*\x00-\x1f]/;
        if (invalidChars.test(value)) {
            return false;
        }
        const reservedNames = [
            'CON', 'PRN', 'AUX', 'NUL',
            'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9',
            'LPT1', 'LPT2', 'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9'
        ];
        const nameWithoutExt = path.basename(value, path.extname(value));
        if (reservedNames.includes(nameWithoutExt.toUpperCase())) {
            return false;
        }
        if (value.length > 255) {
            return false;
        }
        return true;
    }
    static sanitize(value) {
        if (typeof value !== 'string') {
            return '';
        }
        let cleaned = value.replace(/\.\.\/|\.\.\\/g, '');
        cleaned = cleaned.replace(/[\0|><&;$`\n\r]/g, '');
        cleaned = cleaned.replace(/\/+/g, '/');
        cleaned = cleaned.trim();
        return cleaned;
    }
    static normalize(value) {
        if (typeof value !== 'string') {
            return '';
        }
        const cleaned = this.sanitize(value);
        return path.normalize(cleaned);
    }
    static getSafeRelativePath(from, to) {
        if (typeof from !== 'string' || typeof to !== 'string') {
            return null;
        }
        if (!this.isSafePath(from) || !this.isSafePath(to)) {
            return null;
        }
        try {
            return path.relative(from, to);
        }
        catch {
            return null;
        }
    }
    static async hasPermission(value, mode) {
        if (typeof value !== 'string') {
            return false;
        }
        try {
            await fs.access(value, mode);
            return true;
        }
        catch {
            return false;
        }
    }
    static async isReadable(value) {
        return this.hasPermission(value, fs.constants.R_OK);
    }
    static async isWritable(value) {
        return this.hasPermission(value, fs.constants.W_OK);
    }
    static async isExecutable(value) {
        return this.hasPermission(value, fs.constants.X_OK);
    }
}
exports.PathValidator = PathValidator;
//# sourceMappingURL=path.validator.js.map