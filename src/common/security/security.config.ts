/**
 * 安全配置
 */

export interface SecurityConfig {
  // 路径安全
  pathSecurity: {
    enabled: boolean;
    strictMode: boolean;
    allowSymlinks: boolean;
    maxPathLength: number;
    tempFileLifetime: number;
  };
  
  // 输入验证
  inputValidation: {
    enabled: boolean;
    autoSanitize: boolean;
    rejectDangerousInput: boolean;
    maxStringLength: number;
    maxArraySize: number;
    maxObjectDepth: number;
  };
  
  // 文件上传
  fileUpload: {
    enabled: boolean;
    maxFileSize: number;
    allowedExtensions: string[];
    blockedExtensions: string[];
    scanForVirus: boolean;
    quarantineDirectory: string;
  };
  
  // 命令执行
  commandExecution: {
    enabled: boolean;
    allowedCommands: string[];
    blockedCommands: string[];
    useShellEscape: boolean;
    maxCommandLength: number;
    timeout: number;
  };
  
  // 敏感信息
  sensitiveData: {
    maskInLogs: boolean;
    encryptAtRest: boolean;
    redactPatterns: RegExp[];
    protectedFields: string[];
  };
  
  // 速率限制
  rateLimiting: {
    enabled: boolean;
    maxRequests: number;
    windowMs: number;
    skipSuccessfulRequests: boolean;
  };
  
  // 审计日志
  auditLog: {
    enabled: boolean;
    logLevel: 'all' | 'security' | 'critical';
    retentionDays: number;
    includeRequestBody: boolean;
    includeResponseBody: boolean;
  };
}

/**
 * 默认安全配置
 */
export const defaultSecurityConfig: SecurityConfig = {
  pathSecurity: {
    enabled: true,
    strictMode: true,
    allowSymlinks: false,
    maxPathLength: 4096,
    tempFileLifetime: 24 * 60 * 60 * 1000, // 24小时
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
    maxFileSize: 10 * 1024 * 1024, // 10MB
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
    timeout: 30000, // 30秒
  },
  
  sensitiveData: {
    maskInLogs: true,
    encryptAtRest: false,
    redactPatterns: [
      /password[\s]*[:=][\s]*['"][^'"]+['"]/gi,
      /api[_-]?key[\s]*[:=][\s]*['"][^'"]+['"]/gi,
      /token[\s]*[:=][\s]*['"][^'"]+['"]/gi,
      /secret[\s]*[:=][\s]*['"][^'"]+['"]/gi,
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, // Email
      /\b\d{3}-\d{2}-\d{4}\b/g, // SSN
      /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, // Credit card
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
    windowMs: 60 * 1000, // 1分钟
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

/**
 * 获取安全配置
 */
export function getSecurityConfig(): SecurityConfig {
  // 可以从环境变量或配置文件加载
  const config = { ...defaultSecurityConfig };
  
  // 从环境变量覆盖
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
