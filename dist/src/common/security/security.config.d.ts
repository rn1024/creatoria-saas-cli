export interface SecurityConfig {
    pathSecurity: {
        enabled: boolean;
        strictMode: boolean;
        allowSymlinks: boolean;
        maxPathLength: number;
        tempFileLifetime: number;
    };
    inputValidation: {
        enabled: boolean;
        autoSanitize: boolean;
        rejectDangerousInput: boolean;
        maxStringLength: number;
        maxArraySize: number;
        maxObjectDepth: number;
    };
    fileUpload: {
        enabled: boolean;
        maxFileSize: number;
        allowedExtensions: string[];
        blockedExtensions: string[];
        scanForVirus: boolean;
        quarantineDirectory: string;
    };
    commandExecution: {
        enabled: boolean;
        allowedCommands: string[];
        blockedCommands: string[];
        useShellEscape: boolean;
        maxCommandLength: number;
        timeout: number;
    };
    sensitiveData: {
        maskInLogs: boolean;
        encryptAtRest: boolean;
        redactPatterns: RegExp[];
        protectedFields: string[];
    };
    rateLimiting: {
        enabled: boolean;
        maxRequests: number;
        windowMs: number;
        skipSuccessfulRequests: boolean;
    };
    auditLog: {
        enabled: boolean;
        logLevel: 'all' | 'security' | 'critical';
        retentionDays: number;
        includeRequestBody: boolean;
        includeResponseBody: boolean;
    };
}
export declare const defaultSecurityConfig: SecurityConfig;
export declare function getSecurityConfig(): SecurityConfig;
