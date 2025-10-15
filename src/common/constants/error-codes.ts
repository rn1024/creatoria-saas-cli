/**
 * 错误代码常量定义
 */

export const ErrorCodes = {
  // 系统错误 (1000-1999)
  SYSTEM_UNKNOWN: 'SYS_1000',
  SYSTEM_INITIALIZATION_FAILED: 'SYS_1001',
  SYSTEM_OUT_OF_MEMORY: 'SYS_1002',
  SYSTEM_PERMISSION_DENIED: 'SYS_1003',
  
  // 文件系统错误 (2000-2999)
  FS_FILE_NOT_FOUND: 'FS_2000',
  FS_DIRECTORY_NOT_FOUND: 'FS_2001',
  FS_READ_FAILED: 'FS_2002',
  FS_WRITE_FAILED: 'FS_2003',
  FS_DELETE_FAILED: 'FS_2004',
  FS_PERMISSION_DENIED: 'FS_2005',
  FS_DIRECTORY_EXISTS: 'FS_2006',
  FS_FILE_EXISTS: 'FS_2007',
  FS_INVALID_PATH: 'FS_2008',
  
  // 模块错误 (3000-3999)
  MODULE_NOT_FOUND: 'MOD_3000',
  MODULE_ALREADY_EXISTS: 'MOD_3001',
  MODULE_INITIALIZATION_FAILED: 'MOD_3002',
  MODULE_DEPENDENCY_MISSING: 'MOD_3003',
  MODULE_CIRCULAR_DEPENDENCY: 'MOD_3004',
  MODULE_INVALID_METADATA: 'MOD_3005',
  MODULE_COPY_FAILED: 'MOD_3006',
  MODULE_REGISTRATION_FAILED: 'MOD_3007',
  MODULE_INCOMPATIBLE_VERSION: 'MOD_3008',
  
  // CLI错误 (4000-4999)
  CLI_INVALID_COMMAND: 'CLI_4000',
  CLI_INVALID_ARGUMENT: 'CLI_4001',
  CLI_MISSING_REQUIRED_OPTION: 'CLI_4002',
  CLI_PROJECT_NOT_FOUND: 'CLI_4003',
  CLI_NOT_IN_PROJECT: 'CLI_4004',
  CLI_TEMPLATE_NOT_FOUND: 'CLI_4005',
  CLI_BUILD_FAILED: 'CLI_4006',
  CLI_TEST_FAILED: 'CLI_4007',
  
  // 配置错误 (5000-5999)
  CONFIG_NOT_FOUND: 'CFG_5000',
  CONFIG_INVALID_FORMAT: 'CFG_5001',
  CONFIG_MISSING_REQUIRED: 'CFG_5002',
  CONFIG_VALIDATION_FAILED: 'CFG_5003',
  CONFIG_SAVE_FAILED: 'CFG_5004',
  
  // 数据库错误 (6000-6999)
  DB_CONNECTION_FAILED: 'DB_6000',
  DB_MIGRATION_FAILED: 'DB_6001',
  DB_SEED_FAILED: 'DB_6002',
  DB_QUERY_FAILED: 'DB_6003',
  DB_TRANSACTION_FAILED: 'DB_6004',
  
  // 网络错误 (7000-7999)
  NET_CONNECTION_FAILED: 'NET_7000',
  NET_TIMEOUT: 'NET_7001',
  NET_DOWNLOAD_FAILED: 'NET_7002',
  NET_UPLOAD_FAILED: 'NET_7003',
  
  // 验证错误 (8000-8999)
  VAL_INVALID_INPUT: 'VAL_8000',
  VAL_REQUIRED_FIELD_MISSING: 'VAL_8001',
  VAL_INVALID_FORMAT: 'VAL_8002',
  VAL_OUT_OF_RANGE: 'VAL_8003',
  VAL_DUPLICATE_VALUE: 'VAL_8004',
  
  // 输入验证错误 (2000-2099)
  VALIDATION_2000: 'VAL_2000',
  VALIDATION_2001: 'VAL_2001',
  VALIDATION_2002: 'VAL_2002',
  VALIDATION_2003: 'VAL_2003',
  VALIDATION_2004: 'VAL_2004',
  VALIDATION_2005: 'VAL_2005',
  VALIDATION_2006: 'VAL_2006',
  VALIDATION_2007: 'VAL_2007',
  VALIDATION_2008: 'VAL_2008',
  VALIDATION_2009: 'VAL_2009',
  VALIDATION_2010: 'VAL_2010',
  VALIDATION_2011: 'VAL_2011',
  VALIDATION_2012: 'VAL_2012',
  VALIDATION_2013: 'VAL_2013',
  VALIDATION_2014: 'VAL_2014',
  VALIDATION_2015: 'VAL_2015',
  VALIDATION_2016: 'VAL_2016',
  VALIDATION_2017: 'VAL_2017',
  VALIDATION_2018: 'VAL_2018',
  VALIDATION_2019: 'VAL_2019',
  
  // AST错误 (9000-9999)
  AST_PARSE_FAILED: 'AST_9000',
  AST_TRANSFORM_FAILED: 'AST_9001',
  AST_NODE_NOT_FOUND: 'AST_9002',
  AST_INVALID_SYNTAX: 'AST_9003',
  AST_SAVE_FAILED: 'AST_9004',
} as const;

export type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes];

// Alias for compatibility
export const ERROR_CODES = ErrorCodes;

/**
 * 错误消息模板
 */
export const ErrorMessages: Record<ErrorCode, string> = {
  // 系统错误
  [ErrorCodes.SYSTEM_UNKNOWN]: 'An unknown system error occurred',
  [ErrorCodes.SYSTEM_INITIALIZATION_FAILED]: 'System initialization failed',
  [ErrorCodes.SYSTEM_OUT_OF_MEMORY]: 'System ran out of memory',
  [ErrorCodes.SYSTEM_PERMISSION_DENIED]: 'System permission denied',
  
  // 文件系统错误
  [ErrorCodes.FS_FILE_NOT_FOUND]: 'File not found: {path}',
  [ErrorCodes.FS_DIRECTORY_NOT_FOUND]: 'Directory not found: {path}',
  [ErrorCodes.FS_READ_FAILED]: 'Failed to read file: {path}',
  [ErrorCodes.FS_WRITE_FAILED]: 'Failed to write file: {path}',
  [ErrorCodes.FS_DELETE_FAILED]: 'Failed to delete: {path}',
  [ErrorCodes.FS_PERMISSION_DENIED]: 'Permission denied: {path}',
  [ErrorCodes.FS_DIRECTORY_EXISTS]: 'Directory already exists: {path}',
  [ErrorCodes.FS_FILE_EXISTS]: 'File already exists: {path}',
  [ErrorCodes.FS_INVALID_PATH]: 'Invalid path: {path}',
  
  // 模块错误
  [ErrorCodes.MODULE_NOT_FOUND]: 'Module not found: {module}',
  [ErrorCodes.MODULE_ALREADY_EXISTS]: 'Module already exists: {module}',
  [ErrorCodes.MODULE_INITIALIZATION_FAILED]: 'Module initialization failed: {module}',
  [ErrorCodes.MODULE_DEPENDENCY_MISSING]: 'Missing dependency: {dependency} required by {module}',
  [ErrorCodes.MODULE_CIRCULAR_DEPENDENCY]: 'Circular dependency detected: {chain}',
  [ErrorCodes.MODULE_INVALID_METADATA]: 'Invalid module metadata: {module}',
  [ErrorCodes.MODULE_COPY_FAILED]: 'Failed to copy module: {module}',
  [ErrorCodes.MODULE_REGISTRATION_FAILED]: 'Failed to register module: {module}',
  [ErrorCodes.MODULE_INCOMPATIBLE_VERSION]: 'Incompatible module version: {module} requires {required}, got {actual}',
  
  // CLI错误
  [ErrorCodes.CLI_INVALID_COMMAND]: 'Invalid command: {command}',
  [ErrorCodes.CLI_INVALID_ARGUMENT]: 'Invalid argument: {argument}',
  [ErrorCodes.CLI_MISSING_REQUIRED_OPTION]: 'Missing required option: {option}',
  [ErrorCodes.CLI_PROJECT_NOT_FOUND]: 'Project not found: {project}',
  [ErrorCodes.CLI_NOT_IN_PROJECT]: 'Not in a Creatoria SaaS project directory',
  [ErrorCodes.CLI_TEMPLATE_NOT_FOUND]: 'Template not found at: {path}',
  [ErrorCodes.CLI_BUILD_FAILED]: 'Build failed: {error}',
  [ErrorCodes.CLI_TEST_FAILED]: 'Tests failed: {error}',
  
  // 配置错误
  [ErrorCodes.CONFIG_NOT_FOUND]: 'Configuration file not found: {file}',
  [ErrorCodes.CONFIG_INVALID_FORMAT]: 'Invalid configuration format: {error}',
  [ErrorCodes.CONFIG_MISSING_REQUIRED]: 'Missing required configuration: {field}',
  [ErrorCodes.CONFIG_VALIDATION_FAILED]: 'Configuration validation failed: {error}',
  [ErrorCodes.CONFIG_SAVE_FAILED]: 'Failed to save configuration: {error}',
  
  // 数据库错误
  [ErrorCodes.DB_CONNECTION_FAILED]: 'Database connection failed: {error}',
  [ErrorCodes.DB_MIGRATION_FAILED]: 'Migration failed: {migration}',
  [ErrorCodes.DB_SEED_FAILED]: 'Seed failed: {seed}',
  [ErrorCodes.DB_QUERY_FAILED]: 'Query failed: {error}',
  [ErrorCodes.DB_TRANSACTION_FAILED]: 'Transaction failed: {error}',
  
  // 网络错误
  [ErrorCodes.NET_CONNECTION_FAILED]: 'Connection failed: {url}',
  [ErrorCodes.NET_TIMEOUT]: 'Request timeout: {url}',
  [ErrorCodes.NET_DOWNLOAD_FAILED]: 'Download failed: {url}',
  [ErrorCodes.NET_UPLOAD_FAILED]: 'Upload failed: {url}',
  
  // 验证错误
  [ErrorCodes.VAL_INVALID_INPUT]: 'Invalid input: {field}',
  [ErrorCodes.VAL_REQUIRED_FIELD_MISSING]: 'Required field missing: {field}',
  [ErrorCodes.VAL_INVALID_FORMAT]: 'Invalid format for {field}: expected {expected}',
  [ErrorCodes.VAL_OUT_OF_RANGE]: 'Value out of range for {field}: {value}',
  [ErrorCodes.VAL_DUPLICATE_VALUE]: 'Duplicate value: {field}',
  
  // 输入验证错误
  [ErrorCodes.VALIDATION_2000]: 'Required field is missing: {field}',
  [ErrorCodes.VALIDATION_2001]: 'Invalid type for {field}: expected {expected}, got {actual}',
  [ErrorCodes.VALIDATION_2002]: 'String length out of range: min={min}, max={max}',
  [ErrorCodes.VALIDATION_2003]: 'Value does not match pattern: {pattern}',
  [ErrorCodes.VALIDATION_2004]: 'Value contains dangerous characters: {value}',
  [ErrorCodes.VALIDATION_2005]: 'Value must be an integer',
  [ErrorCodes.VALIDATION_2006]: 'Value must be positive',
  [ErrorCodes.VALIDATION_2007]: 'Number out of range: min={min}, max={max}',
  [ErrorCodes.VALIDATION_2008]: 'Unsafe path detected: {path}',
  [ErrorCodes.VALIDATION_2009]: 'Path does not exist: {path}',
  [ErrorCodes.VALIDATION_2010]: 'Invalid email address: {value}',
  [ErrorCodes.VALIDATION_2011]: 'Invalid URL: {value}',
  [ErrorCodes.VALIDATION_2012]: 'Invalid port number: {value}',
  [ErrorCodes.VALIDATION_2013]: 'Invalid module name: {errors}',
  [ErrorCodes.VALIDATION_2014]: 'Invalid project name: {errors}',
  [ErrorCodes.VALIDATION_2015]: 'Invalid database configuration: {errors}',
  [ErrorCodes.VALIDATION_2016]: 'Invalid API configuration: {errors}',
  [ErrorCodes.VALIDATION_2017]: 'Invalid file upload: {errors}',
  [ErrorCodes.VALIDATION_2018]: 'Dangerous CLI arguments detected: {errors}',
  [ErrorCodes.VALIDATION_2019]: 'Schema validation failed: {errors}',
  
  // AST错误
  [ErrorCodes.AST_PARSE_FAILED]: 'Failed to parse file: {file}',
  [ErrorCodes.AST_TRANSFORM_FAILED]: 'Failed to transform AST: {error}',
  [ErrorCodes.AST_NODE_NOT_FOUND]: 'AST node not found: {node}',
  [ErrorCodes.AST_INVALID_SYNTAX]: 'Invalid syntax: {error}',
  [ErrorCodes.AST_SAVE_FAILED]: 'Failed to save AST changes: {file}',
};

/**
 * 格式化错误消息
 */
export function formatErrorMessage(code: ErrorCode, params?: Record<string, any>): string {
  let message = ErrorMessages[code] || 'Unknown error';
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      message = message.replace(`{${key}}`, String(value));
    });
  }
  
  return message;
}