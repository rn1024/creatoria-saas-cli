"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultSecurityConfig = void 0;
exports.getSecurityConfig = getSecurityConfig;
exports.defaultSecurityConfig = {
    pathSecurity: {
        enabled: true,
        strictMode: true,
        allowSymlinks: false,
        maxPathLength: 4096,
        tempFileLifetime: 24 * 60 * 60 * 1000,
    },
    inputValidation: {
        enabled: true,
        autoSanitize: true,
        rejectDangerousInput: true,
        maxStringLength: 10000,
        maxArraySize: 1000,
        maxObjectDepth: 10,
    },
    fileUpload: {
        enabled: true,
        maxFileSize: 10 * 1024 * 1024,
        allowedExtensions: [
            '.txt', '.pdf', '.doc', '.docx',
            '.jpg', '.jpeg', '.png', '.gif',
            '.json', '.xml', '.csv',
            '.js', '.ts', '.jsx', '.tsx',
            '.css', '.scss', '.sass',
            '.html', '.md',
        ],
        blockedExtensions: [
            '.exe', '.dll', '.bat', '.cmd',
            '.sh', '.ps1', '.app', '.dmg',
            '.deb', '.rpm', '.msi',
        ],
        scanForVirus: false,
        quarantineDirectory: 'quarantine',
    },
    commandExecution: {
        enabled: true,
        allowedCommands: [
            'npm', 'yarn', 'pnpm',
            'git', 'node', 'npx',
        ],
        blockedCommands: [
            'rm', 'del', 'format',
            'shutdown', 'reboot',
            'kill', 'killall',
        ],
        useShellEscape: true,
        maxCommandLength: 1000,
        timeout: 30000,
    },
    sensitiveData: {
        maskInLogs: true,
        encryptAtRest: false,
        redactPatterns: [
            /password[\s]*[:=][\s]*['"][^'"]+['"]/gi,
            /api[_-]?key[\s]*[:=][\s]*['"][^'"]+['"]/gi,
            /token[\s]*[:=][\s]*['"][^'"]+['"]/gi,
            /secret[\s]*[:=][\s]*['"][^'"]+['"]/gi,
            /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
            /\b\d{3}-\d{2}-\d{4}\b/g,
            /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g,
        ],
        protectedFields: [
            'password', 'pwd', 'pass',
            'token', 'apiKey', 'api_key',
            'secret', 'privateKey', 'private_key',
            'ssn', 'creditCard', 'credit_card',
            'email', 'phone', 'address',
        ],
    },
    rateLimiting: {
        enabled: true,
        maxRequests: 100,
        windowMs: 60 * 1000,
        skipSuccessfulRequests: true,
    },
    auditLog: {
        enabled: true,
        logLevel: 'security',
        retentionDays: 90,
        includeRequestBody: false,
        includeResponseBody: false,
    },
};
function getSecurityConfig() {
    const config = { ...exports.defaultSecurityConfig };
    if (process.env.SECURITY_STRICT_MODE === 'false') {
        config.pathSecurity.strictMode = false;
    }
    if (process.env.SECURITY_AUTO_SANITIZE === 'false') {
        config.inputValidation.autoSanitize = false;
    }
    if (process.env.SECURITY_MAX_FILE_SIZE) {
        config.fileUpload.maxFileSize = parseInt(process.env.SECURITY_MAX_FILE_SIZE, 10);
    }
    return config;
}
//# sourceMappingURL=security.config.js.map