"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.PerformanceMonitor = void 0;
const os = __importStar(require("os"));
const v8 = __importStar(require("v8"));
class PerformanceMonitor {
    static instance;
    startTime;
    cpuUsageStart;
    metricsHistory = [];
    maxHistorySize = 100;
    constructor() {
        this.startTime = Date.now();
        this.cpuUsageStart = process.cpuUsage();
    }
    static getInstance() {
        if (!PerformanceMonitor.instance) {
            PerformanceMonitor.instance = new PerformanceMonitor();
        }
        return PerformanceMonitor.instance;
    }
    collectMetrics() {
        const memUsage = process.memoryUsage();
        const cpuUsage = process.cpuUsage(this.cpuUsageStart);
        const metrics = {
            cpu: {
                usage: (cpuUsage.user + cpuUsage.system) / 1000,
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
        this.metricsHistory.push(metrics);
        if (this.metricsHistory.length > this.maxHistorySize) {
            this.metricsHistory.shift();
        }
        return metrics;
    }
    getFormattedReport() {
        const metrics = this.collectMetrics();
        const lines = [
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
    getHeapStatistics() {
        return v8.getHeapStatistics();
    }
    getHeapSnapshot() {
        return v8.writeHeapSnapshot();
    }
    analyzeMemoryTrend() {
        if (this.metricsHistory.length < 10) {
            return { trend: 'stable', averageGrowth: 0 };
        }
        const recent = this.metricsHistory.slice(-10);
        const growths = [];
        for (let i = 1; i < recent.length; i++) {
            const growth = recent[i].memory.heapUsed - recent[i - 1].memory.heapUsed;
            growths.push(growth);
        }
        const averageGrowth = growths.reduce((a, b) => a + b, 0) / growths.length;
        let trend;
        if (averageGrowth > 1024 * 1024) {
            trend = 'increasing';
        }
        else if (averageGrowth < -1024 * 1024) {
            trend = 'decreasing';
        }
        else {
            trend = 'stable';
        }
        return { trend, averageGrowth };
    }
    detectMemoryLeak() {
        const trend = this.analyzeMemoryTrend();
        if (trend.trend === 'increasing' && trend.averageGrowth > 5 * 1024 * 1024) {
            return true;
        }
        return false;
    }
    getPerformanceSuggestions() {
        const suggestions = [];
        const metrics = this.collectMetrics();
        const heapStats = this.getHeapStatistics();
        const heapUsagePercent = (metrics.memory.heapUsed / metrics.memory.heapTotal) * 100;
        if (heapUsagePercent > 90) {
            suggestions.push('High heap usage detected. Consider increasing --max-old-space-size');
        }
        if (this.detectMemoryLeak()) {
            suggestions.push('Potential memory leak detected. Review recent code changes');
        }
        if (metrics.cpu.loadAverage[0] > os.cpus().length) {
            suggestions.push('High CPU load detected. Consider optimizing CPU-intensive operations');
        }
        if (heapStats.total_heap_size > 500 * 1024 * 1024) {
            suggestions.push('Large heap size. Consider refactoring to reduce memory footprint');
        }
        return suggestions;
    }
    formatBytes(bytes) {
        const units = ['B', 'KB', 'MB', 'GB'];
        let size = bytes;
        let unitIndex = 0;
        while (size >= 1024 && unitIndex < units.length - 1) {
            size /= 1024;
            unitIndex++;
        }
        return `${size.toFixed(2)} ${units[unitIndex]}`;
    }
    startAutoMonitoring(interval = 5000) {
        setInterval(() => {
            const metrics = this.collectMetrics();
            if (process.env.PERFORMANCE_MONITORING === 'true') {
                console.log(`[MONITOR] Memory: ${this.formatBytes(metrics.memory.heapUsed)}, CPU: ${metrics.cpu.usage.toFixed(2)}ms`);
            }
            const suggestions = this.getPerformanceSuggestions();
            if (suggestions.length > 0 && process.env.PERFORMANCE_WARNINGS === 'true') {
                console.warn('[PERFORMANCE WARNING]');
                suggestions.forEach(s => console.warn(`  - ${s}`));
            }
        }, interval);
    }
    stop() {
        const report = this.getFormattedReport();
        const suggestions = this.getPerformanceSuggestions();
        if (suggestions.length > 0) {
            return report + '\n\nSuggestions:\n' + suggestions.map(s => `  - ${s}`).join('\n');
        }
        return report;
    }
}
exports.PerformanceMonitor = PerformanceMonitor;
//# sourceMappingURL=performance-monitor.js.map