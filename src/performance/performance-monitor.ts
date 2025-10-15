/**
 * 性能监控器
 */

import * as os from 'os';
import * as v8 from 'v8';

export interface PerformanceMetrics {
  cpu: {
    usage: number;
    loadAverage: number[];
  };
  memory: {
    rss: number;
    heapTotal: number;
    heapUsed: number;
    external: number;
    arrayBuffers: number;
  };
  timing: {
    startTime: number;
    uptime: number;
  };
}

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private startTime: number;
  private cpuUsageStart: NodeJS.CpuUsage;
  private metricsHistory: PerformanceMetrics[] = [];
  private maxHistorySize: number = 100;

  private constructor() {
    this.startTime = Date.now();
    this.cpuUsageStart = process.cpuUsage();
  }

  /**
   * 获取单例实例
   */
  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  /**
   * 收集当前性能指标
   */
  collectMetrics(): PerformanceMetrics {
    const memUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage(this.cpuUsageStart);
    
    const metrics: PerformanceMetrics = {
      cpu: {
        usage: (cpuUsage.user + cpuUsage.system) / 1000, // 转换为毫秒
        loadAverage: os.loadavg(),
      },
      memory: {
        rss: memUsage.rss,
        heapTotal: memUsage.heapTotal,
        heapUsed: memUsage.heapUsed,
        external: memUsage.external,
        arrayBuffers: memUsage.arrayBuffers,
      },
      timing: {
        startTime: this.startTime,
        uptime: Date.now() - this.startTime,
      },
    };
    
    // 保存到历史记录
    this.metricsHistory.push(metrics);
    if (this.metricsHistory.length > this.maxHistorySize) {
      this.metricsHistory.shift();
    }
    
    return metrics;
  }

  /**
   * 获取格式化的性能报告
   */
  getFormattedReport(): string {
    const metrics = this.collectMetrics();
    const lines: string[] = [
      '=== Performance Metrics ===',
      '',
      'CPU:',
      `  Usage: ${metrics.cpu.usage.toFixed(2)}ms`,
      `  Load Average: ${metrics.cpu.loadAverage.map(n => n.toFixed(2)).join(', ')}`,
      '',
      'Memory:',
      `  RSS: ${this.formatBytes(metrics.memory.rss)}`,
      `  Heap Total: ${this.formatBytes(metrics.memory.heapTotal)}`,
      `  Heap Used: ${this.formatBytes(metrics.memory.heapUsed)}`,
      `  External: ${this.formatBytes(metrics.memory.external)}`,
      '',
      'Timing:',
      `  Uptime: ${metrics.timing.uptime}ms`,
    ];
    
    return lines.join('\n');
  }

  /**
   * 获取V8堆统计信息
   */
  getHeapStatistics(): v8.HeapInfo {
    return v8.getHeapStatistics();
  }

  /**
   * 获取V8堆快照
   */
  getHeapSnapshot(): string {
    return v8.writeHeapSnapshot();
  }

  /**
   * 分析内存使用趋势
   */
  analyzeMemoryTrend(): {
    trend: 'increasing' | 'stable' | 'decreasing';
    averageGrowth: number;
  } {
    if (this.metricsHistory.length < 10) {
      return { trend: 'stable', averageGrowth: 0 };
    }
    
    const recent = this.metricsHistory.slice(-10);
    const growths: number[] = [];
    
    for (let i = 1; i < recent.length; i++) {
      const growth = recent[i].memory.heapUsed - recent[i - 1].memory.heapUsed;
      growths.push(growth);
    }
    
    const averageGrowth = growths.reduce((a, b) => a + b, 0) / growths.length;
    
    let trend: 'increasing' | 'stable' | 'decreasing';
    if (averageGrowth > 1024 * 1024) { // 1MB
      trend = 'increasing';
    } else if (averageGrowth < -1024 * 1024) {
      trend = 'decreasing';
    } else {
      trend = 'stable';
    }
    
    return { trend, averageGrowth };
  }

  /**
   * 检测内存泄漏
   */
  detectMemoryLeak(): boolean {
    const trend = this.analyzeMemoryTrend();
    
    if (trend.trend === 'increasing' && trend.averageGrowth > 5 * 1024 * 1024) {
      // 平均增长超过5MB，可能存在内存泄漏
      return true;
    }
    
    return false;
  }

  /**
   * 获取性能建议
   */
  getPerformanceSuggestions(): string[] {
    const suggestions: string[] = [];
    const metrics = this.collectMetrics();
    const heapStats = this.getHeapStatistics();
    
    // 检查内存使用
    const heapUsagePercent = (metrics.memory.heapUsed / metrics.memory.heapTotal) * 100;
    if (heapUsagePercent > 90) {
      suggestions.push('High heap usage detected. Consider increasing --max-old-space-size');
    }
    
    // 检查内存泄漏
    if (this.detectMemoryLeak()) {
      suggestions.push('Potential memory leak detected. Review recent code changes');
    }
    
    // 检查CPU使用
    if (metrics.cpu.loadAverage[0] > os.cpus().length) {
      suggestions.push('High CPU load detected. Consider optimizing CPU-intensive operations');
    }
    
    // 检查堆大小
    if (heapStats.total_heap_size > 500 * 1024 * 1024) { // 500MB
      suggestions.push('Large heap size. Consider refactoring to reduce memory footprint');
    }
    
    return suggestions;
  }

  /**
   * 格式化字节数
   */
  private formatBytes(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(2)} ${units[unitIndex]}`;
  }

  /**
   * 启动自动监控
   */
  startAutoMonitoring(interval: number = 5000): void {
    setInterval(() => {
      const metrics = this.collectMetrics();
      
      if (process.env.PERFORMANCE_MONITORING === 'true') {
        console.log(`[MONITOR] Memory: ${this.formatBytes(metrics.memory.heapUsed)}, CPU: ${metrics.cpu.usage.toFixed(2)}ms`);
      }
      
      // 检查并警告
      const suggestions = this.getPerformanceSuggestions();
      if (suggestions.length > 0 && process.env.PERFORMANCE_WARNINGS === 'true') {
        console.warn('[PERFORMANCE WARNING]');
        suggestions.forEach(s => console.warn(`  - ${s}`));
      }
    }, interval);
  }

  /**
   * 停止监控并生成报告
   */
  stop(): string {
    const report = this.getFormattedReport();
    const suggestions = this.getPerformanceSuggestions();
    
    if (suggestions.length > 0) {
      return report + '\n\nSuggestions:\n' + suggestions.map(s => `  - ${s}`).join('\n');
    }
    
    return report;
  }
}