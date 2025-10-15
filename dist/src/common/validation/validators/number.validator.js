"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NumberValidator = void 0;
class NumberValidator {
    static isNumber(value) {
        if (typeof value === 'number') {
            return !isNaN(value) && isFinite(value);
        }
        if (typeof value === 'string') {
            const num = Number(value);
            return !isNaN(num) && isFinite(num);
        }
        return false;
    }
    static isInteger(value) {
        if (!this.isNumber(value)) {
            return false;
        }
        const num = Number(value);
        return Number.isInteger(num);
    }
    static isPositive(value) {
        if (!this.isNumber(value)) {
            return false;
        }
        return Number(value) > 0;
    }
    static isNegative(value) {
        if (!this.isNumber(value)) {
            return false;
        }
        return Number(value) < 0;
    }
    static isInRange(value, min, max) {
        if (!this.isNumber(value)) {
            return false;
        }
        const num = Number(value);
        return num >= min && num <= max;
    }
    static isPort(value) {
        if (!this.isInteger(value)) {
            return false;
        }
        const port = Number(value);
        return port >= 1 && port <= 65535;
    }
    static isPercentage(value) {
        if (!this.isNumber(value)) {
            return false;
        }
        const num = Number(value);
        return num >= 0 && num <= 100;
    }
    static isValidFileSize(value, maxSizeInBytes) {
        if (!this.isInteger(value)) {
            return false;
        }
        const size = Number(value);
        return size >= 0 && size <= maxSizeInBytes;
    }
    static isValidIndex(value, arrayLength) {
        if (!this.isInteger(value)) {
            return false;
        }
        const index = Number(value);
        return index >= 0 && index < arrayLength;
    }
    static isTimestamp(value) {
        if (!this.isInteger(value)) {
            return false;
        }
        const timestamp = Number(value);
        return timestamp >= 0 && timestamp <= 4102444800000;
    }
    static isHttpStatusCode(value) {
        if (!this.isInteger(value)) {
            return false;
        }
        const code = Number(value);
        return code >= 100 && code <= 599;
    }
    static isPriority(value, maxPriority = 10) {
        if (!this.isInteger(value)) {
            return false;
        }
        const priority = Number(value);
        return priority >= 0 && priority <= maxPriority;
    }
    static sanitize(value) {
        if (typeof value === 'number') {
            return isFinite(value) ? value : null;
        }
        if (typeof value === 'string') {
            const cleaned = value.replace(/[^0-9.-]/g, '');
            const num = Number(cleaned);
            return !isNaN(num) && isFinite(num) ? num : null;
        }
        return null;
    }
    static toSafeInteger(value, defaultValue = 0) {
        const num = this.sanitize(value);
        if (num === null) {
            return defaultValue;
        }
        if (num > Number.MAX_SAFE_INTEGER) {
            return Number.MAX_SAFE_INTEGER;
        }
        if (num < Number.MIN_SAFE_INTEGER) {
            return Number.MIN_SAFE_INTEGER;
        }
        return Math.floor(num);
    }
    static clamp(value, min, max) {
        const num = this.sanitize(value);
        if (num === null) {
            return min;
        }
        if (num < min)
            return min;
        if (num > max)
            return max;
        return num;
    }
}
exports.NumberValidator = NumberValidator;
//# sourceMappingURL=number.validator.js.map