import { LoggerService } from '../logger/logger.service';
export declare class SensitiveDataService {
    private readonly logger;
    private encryptionKey;
    private redactPatterns;
    private protectedFields;
    constructor(logger: LoggerService);
    private initializeEncryption;
    private initializePatterns;
    encrypt(data: string): string;
    decrypt(encryptedData: string): string;
    hash(data: string): string;
    maskString(value: string, options?: {
        showFirst?: number;
        showLast?: number;
        maskChar?: string;
    }): string;
    maskEmail(email: string): string;
    maskPhone(phone: string): string;
    maskCreditCard(cardNumber: string): string;
    maskIP(ip: string): string;
    maskObject(obj: any, depth?: number): any;
    private isProtectedField;
    private maskValue;
    redactSensitivePatterns(text: string): string;
    maskLogMessage(message: string, context?: any): {
        message: string;
        context?: any;
    };
    containsSensitiveData(text: string): boolean;
    generateSecureToken(length?: number): string;
    generateApiKey(prefix?: string): string;
    validatePasswordStrength(password: string): {
        valid: boolean;
        score: number;
        issues: string[];
    };
}
