export declare class NumberValidator {
    static isNumber(value: any): boolean;
    static isInteger(value: any): boolean;
    static isPositive(value: any): boolean;
    static isNegative(value: any): boolean;
    static isInRange(value: any, min: number, max: number): boolean;
    static isPort(value: any): boolean;
    static isPercentage(value: any): boolean;
    static isValidFileSize(value: any, maxSizeInBytes: number): boolean;
    static isValidIndex(value: any, arrayLength: number): boolean;
    static isTimestamp(value: any): boolean;
    static isHttpStatusCode(value: any): boolean;
    static isPriority(value: any, maxPriority?: number): boolean;
    static sanitize(value: any): number | null;
    static toSafeInteger(value: any, defaultValue?: number): number;
    static clamp(value: any, min: number, max: number): number;
}
