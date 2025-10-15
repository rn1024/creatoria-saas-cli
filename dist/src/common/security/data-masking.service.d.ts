import { SensitiveDataService } from './sensitive-data.service';
import { LoggerService } from '../logger/logger.service';
export interface MaskingRule {
    pattern: RegExp | string;
    replacement: string | ((match: string) => string);
    description: string;
}
export declare class DataMaskingService {
    private readonly sensitiveData;
    private readonly logger;
    private maskingRules;
    constructor(sensitiveData: SensitiveDataService, logger: LoggerService);
    private initializeDefaultRules;
    addMaskingRule(rule: MaskingRule): void;
    maskText(text: string): string;
    maskJSON(obj: any): any;
    maskLogEntry(level: string, message: string, context?: any): {
        level: string;
        message: string;
        context?: any;
        masked: boolean;
    };
    maskFileContent(content: string, fileType: string): Promise<string>;
    private maskEnvFile;
    private maskLogFile;
    maskStackTrace(stack: string): string;
    maskHttpRequest(request: {
        method: string;
        url: string;
        headers?: Record<string, string>;
        body?: any;
    }): any;
    maskHttpResponse(response: {
        status: number;
        headers?: Record<string, string>;
        body?: any;
    }): any;
    getMaskingStats(): {
        rulesCount: number;
        rules: Array<{
            pattern: string;
            description: string;
        }>;
    };
}
