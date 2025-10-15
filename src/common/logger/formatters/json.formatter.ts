/**
 * JSON日志格式化器
 */

import { LogEntry, getLogLevelName } from '../logger.config';

export class JsonFormatter {
  /**
   * 格式化日志条目为JSON
   */
  format(entry: LogEntry): string {
    const formatted: any = {
      timestamp: entry.timestamp.toISOString(),
      level: getLogLevelName(entry.level),
      message: entry.message,
    };

    if (entry.context) {
      formatted.context = entry.context;
    }

    if (entry.tags && entry.tags.length > 0) {
      formatted.tags = entry.tags;
    }

    if (entry.error) {
      formatted.error = {
        name: entry.error.name,
        message: entry.error.message,
        stack: entry.error.stack,
      };
    }

    return JSON.stringify(formatted);
  }

  /**
   * 批量格式化
   */
  formatBatch(entries: LogEntry[]): string {
    return entries.map(entry => this.format(entry)).join('\n');
  }
}