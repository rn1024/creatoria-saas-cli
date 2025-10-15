"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StartupOptimizer = void 0;
class StartupOptimizer {
    static timings = new Map();
    static startTime = Date.now();
    static mark(name) {
        this.timings.set(name, Date.now() - this.startTime);
    }
    static measure(name, startMark, endMark) {
        const start = this.timings.get(startMark) || 0;
        const end = this.timings.get(endMark) || 0;
        const duration = end - start;
        if (process.env.PERFORMANCE_DEBUG === 'true') {
            console.log(`[PERF] ${name}: ${duration}ms`);
        }
        return duration;
    }
    static lazyImport(modulePath) {
        let module = null;
        return async () => {
            if (!module) {
                const startTime = Date.now();
                module = await import(modulePath);
                const loadTime = Date.now() - startTime;
                if (process.env.PERFORMANCE_DEBUG === 'true') {
                    console.log(`[LAZY] Loaded ${modulePath} in ${loadTime}ms`);
                }
            }
            return module;
        };
    }
    static lazyRequire(modulePath) {
        let module = null;
        return () => {
            if (!module) {
                const startTime = Date.now();
                module = require(modulePath);
                const loadTime = Date.now() - startTime;
                if (process.env.PERFORMANCE_DEBUG === 'true') {
                    console.log(`[LAZY] Required ${modulePath} in ${loadTime}ms`);
                }
            }
            return module;
        };
    }
    static async loadConfig(configPath) {
        const fs = await import('fs-extra');
        return new Promise((resolve, reject) => {
            const stream = fs.createReadStream(configPath, { encoding: 'utf8' });
            let data = '';
            stream.on('data', chunk => {
                data += chunk;
            });
            stream.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                }
                catch (error) {
                    reject(error);
                }
            });
            stream.on('error', reject);
        });
    }
    static async parallelInit(tasks) {
        const startTime = Date.now();
        const results = await Promise.all(tasks);
        const duration = Date.now() - startTime;
        if (process.env.PERFORMANCE_DEBUG === 'true') {
            console.log(`[PERF] Parallel init completed in ${duration}ms`);
        }
        return results;
    }
    static getReport() {
        const totalTime = Date.now() - this.startTime;
        const lines = [
            '=== Startup Performance Report ===',
            `Total startup time: ${totalTime}ms`,
            '',
            'Timing marks:',
        ];
        this.timings.forEach((time, name) => {
            lines.push(`  ${name}: ${time}ms`);
        });
        return lines.join('\n');
    }
    static printReport() {
        if (process.env.PERFORMANCE_DEBUG === 'true' || process.env.SHOW_STARTUP_TIME === 'true') {
            console.log('\n' + this.getReport());
        }
    }
}
exports.StartupOptimizer = StartupOptimizer;
//# sourceMappingURL=startup-optimizer.js.map