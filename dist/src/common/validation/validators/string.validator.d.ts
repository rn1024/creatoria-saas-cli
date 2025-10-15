export declare class StringValidator {
    static isNotEmpty(value: any): boolean;
    static isLength(value: string, min: number, max?: number): boolean;
    static isEmail(value: string): boolean;
    static isURL(value: string): boolean;
    static matches(value: string, pattern: RegExp | string): boolean;
    static isAlphanumeric(value: string): boolean;
    static isValidModuleName(value: string): boolean;
    static isVersion(value: string): boolean;
    static isJSON(value: string): boolean;
    static isBase64(value: string): boolean;
    static isUUID(value: string, version?: 3 | 4 | 5): boolean;
    static isSafe(value: string): boolean;
    static sanitize(value: string): string;
    static escapeHtml(value: string): string;
    static escapeShell(value: string): string;
}
