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
export declare class PerformanceMonitor {
    private static instance;
    private startTime;
    private cpuUsageStart;
    private metricsHistory;
    private maxHistorySize;
    private constructor();
    static getInstance(): PerformanceMonitor;
    collectMetrics(): PerformanceMetrics;
    getFormattedReport(): string;
    getHeapStatistics(): v8.HeapInfo;
    getHeapSnapshot(): string;
    analyzeMemoryTrend(): {
        trend: 'increasing' | 'stable' | 'decreasing';
        averageGrowth: number;
    };
    detectMemoryLeak(): boolean;
    getPerformanceSuggestions(): string[];
    private formatBytes;
    startAutoMonitoring(interval?: number): void;
    stop(): string;
}
