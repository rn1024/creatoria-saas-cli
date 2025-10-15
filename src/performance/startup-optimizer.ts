/**
 * 启动优化器
 */

export class StartupOptimizer {
  private static timings: Map<string, number> = new Map();
  private static startTime: number = Date.now();

  /**
   * 标记时间点
   */
  static mark(name: string): void {
    this.timings.set(name, Date.now() - this.startTime);
  }

  /**
   * 测量两个时间点之间的耗时
   */
  static measure(name: string, startMark: string, endMark: string): number {
    const start = this.timings.get(startMark) || 0;
    const end = this.timings.get(endMark) || 0;
    const duration = end - start;
    
    if (process.env.PERFORMANCE_DEBUG === 'true') {
      console.log(`[PERF] ${name}: ${duration}ms`);
    }
    
    return duration;
  }

  /**
   * 延迟导入模块
   */
  static lazyImport<T = any>(modulePath: string): () => Promise<T> {
    let module: T | null = null;
    
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

  /**
   * 延迟require（CommonJS）
   */
  static lazyRequire<T = any>(modulePath: string): () => T {
    let module: T | null = null;
    
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

  /**
   * 优化的配置加载
   */
  static async loadConfig(configPath: string): Promise<any> {
    const fs = await import('fs-extra');
    
    // 使用流式读取
    return new Promise((resolve, reject) => {
      const stream = fs.createReadStream(configPath, { encoding: 'utf8' });
      let data = '';
      
      stream.on('data', chunk => {
        data += chunk;
      });
      
      stream.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (error) {
          reject(error);
        }
      });
      
      stream.on('error', reject);
    });
  }

  /**
   * 并行初始化任务
   */
  static async parallelInit(tasks: Array<() => Promise<any>>): Promise<any[]> {
    const startTime = Date.now();
    const results = await Promise.all(tasks);
    const duration = Date.now() - startTime;
    
    if (process.env.PERFORMANCE_DEBUG === 'true') {
      console.log(`[PERF] Parallel init completed in ${duration}ms`);
    }
    
    return results;
  }

  /**
   * 获取性能报告
   */
  static getReport(): string {
    const totalTime = Date.now() - this.startTime;
    const lines: string[] = [
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

  /**
   * 输出性能报告（如果启用）
   */
  static printReport(): void {
    if (process.env.PERFORMANCE_DEBUG === 'true' || process.env.SHOW_STARTUP_TIME === 'true') {
      console.log('\n' + this.getReport());
    }
  }
}