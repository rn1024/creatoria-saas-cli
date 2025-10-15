/**
 * 错误类型定义
 */

export enum ErrorCategory {
  // 系统错误
  SYSTEM = 'SYSTEM',
  // 验证错误
  VALIDATION = 'VALIDATION',
  // 业务错误
  BUSINESS = 'BUSINESS',
  // 权限错误
  PERMISSION = 'PERMISSION',
  // 网络错误
  NETWORK = 'NETWORK',
  // 依赖错误
  DEPENDENCY = 'DEPENDENCY',
  // 文件系统错误
  FILESYSTEM = 'FILESYSTEM',
  // 配置错误
  CONFIGURATION = 'CONFIGURATION',
}

export enum ErrorSeverity {
  // 致命错误，需要退出程序
  FATAL = 'FATAL',
  // 错误，操作失败但程序可继续
  ERROR = 'ERROR',
  // 警告，操作成功但有潜在问题
  WARNING = 'WARNING',
  // 信息，仅供参考
  INFO = 'INFO',
}

export interface ErrorContext {
  // 错误发生的模块
  module?: string;
  // 错误发生的方法
  method?: string;
  // 错误相关的文件路径
  filePath?: string;
  // 错误相关的命令
  command?: string;
  // 错误相关的参数
  argument?: string;
  // 期望的值
  expected?: string;
  // 错误相关的选项
  option?: string;
  // 额外的上下文信息
  metadata?: Record<string, any>;
  // 用户ID或会话ID
  userId?: string;
  // 时间戳
  timestamp?: Date;
}

export interface ErrorResponse {
  // 错误代码
  code: string;
  // 错误消息
  message: string;
  // 错误分类
  category: ErrorCategory;
  // 错误严重程度
  severity: ErrorSeverity;
  // 错误上下文
  context?: ErrorContext;
  // 错误堆栈（仅在开发环境）
  stack?: string;
  // 解决建议
  suggestion?: string;
  // 相关文档链接
  documentationUrl?: string;
}

export interface ErrorOptions {
  // 错误代码
  code?: string;
  // 错误分类
  category?: ErrorCategory;
  // 错误严重程度
  severity?: ErrorSeverity;
  // 错误上下文
  context?: ErrorContext;
  // 解决建议
  suggestion?: string;
  // 原始错误
  cause?: Error;
}