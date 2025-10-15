/**
 * 控制台日志传输器
 */

import { LogEntry, LogLevel } from '../logger.config';
import { CliFormatter } from '../formatters/cli.formatter';

export class ConsoleTransport {
  private formatter: CliFormatter;

  constructor(useColors: boolean = true, useIcons: boolean = true) {
    this.formatter = new CliFormatter(useColors, useIcons);
  }

  /**
   * 写入日志
   */
  write(entry: LogEntry): void {
    const formatted = this.formatter.format(entry);
    
    // 根据级别选择输出流
    if (entry.level >= LogLevel.ERROR) {
      console.error(formatted);
    } else if (entry.level === LogLevel.WARN) {
      console.warn(formatted);
    } else {
      console.log(formatted);
    }
  }

  /**
   * 批量写入
   */
  writeBatch(entries: LogEntry[]): void {
    entries.forEach(entry => this.write(entry));
  }

  /**
   * 清空缓冲区
   */
  flush(): void {
    // 控制台传输器不需要缓冲
  }
}