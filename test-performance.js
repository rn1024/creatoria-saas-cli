#!/usr/bin/env node

/**
 * 性能测试脚本
 */

const { spawn } = require('child_process');
const chalk = require('chalk');
const path = require('path');

// 测试配置
const tests = [
  {
    name: '原始版本 - 帮助命令',
    command: 'node',
    args: ['dist/src/main.js', '--help'],
    env: {},
  },
  {
    name: '优化版本 - 帮助命令',
    command: 'node',
    args: ['dist/src/main-optimized.js', '--help'],
    env: { SHOW_STARTUP_TIME: 'true' },
  },
  {
    name: '原始版本 - 模块列表',
    command: 'node',
    args: ['dist/src/main.js', 'module', 'list'],
    env: {},
  },
  {
    name: '优化版本 - 模块列表',
    command: 'node',
    args: ['dist/src/main-optimized.js', 'module', 'list'],
    env: { SHOW_STARTUP_TIME: 'true' },
  },
];

/**
 * 运行单个测试
 */
async function runTest(test) {
  return new Promise((resolve) => {
    console.log(chalk.blue(`\n测试: ${test.name}`));
    console.log(chalk.gray(`命令: ${test.command} ${test.args.join(' ')}`));
    
    const startTime = Date.now();
    
    const child = spawn(test.command, test.args, {
      env: { ...process.env, ...test.env },
      cwd: __dirname,
    });
    
    let output = '';
    
    child.stdout.on('data', (data) => {
      output += data.toString();
      if (process.env.VERBOSE) {
        process.stdout.write(data);
      }
    });
    
    child.stderr.on('data', (data) => {
      if (process.env.VERBOSE) {
        process.stderr.write(data);
      }
    });
    
    child.on('close', (code) => {
      const duration = Date.now() - startTime;
      
      console.log(chalk.green(`✓ 完成 (${duration}ms)`));
      
      // 提取性能数据
      const perfMatch = output.match(/Total startup time: (\d+)ms/);
      if (perfMatch) {
        console.log(chalk.yellow(`  报告的启动时间: ${perfMatch[1]}ms`));
      }
      
      resolve({
        name: test.name,
        duration,
        reportedTime: perfMatch ? parseInt(perfMatch[1]) : null,
        exitCode: code,
      });
    });
  });
}

/**
 * 运行多次测试取平均值
 */
async function runMultipleTimes(test, times = 3) {
  const results = [];
  
  for (let i = 0; i < times; i++) {
    console.log(chalk.gray(`  运行 ${i + 1}/${times}...`));
    const result = await runTest(test);
    results.push(result);
  }
  
  const avgDuration = results.reduce((sum, r) => sum + r.duration, 0) / results.length;
  const avgReported = results[0].reportedTime 
    ? results.reduce((sum, r) => sum + (r.reportedTime || 0), 0) / results.length
    : null;
  
  return {
    ...test,
    avgDuration: Math.round(avgDuration),
    avgReported: avgReported ? Math.round(avgReported) : null,
    runs: results.length,
  };
}

/**
 * 比较结果
 */
function compareResults(results) {
  console.log(chalk.cyan('\n\n📊 性能比较结果'));
  console.log(chalk.gray('=' .repeat(60)));
  
  // 按测试类型分组
  const grouped = {};
  results.forEach(r => {
    const type = r.name.includes('帮助') ? 'help' : 'module';
    const version = r.name.includes('优化') ? 'optimized' : 'original';
    
    if (!grouped[type]) grouped[type] = {};
    grouped[type][version] = r;
  });
  
  // 输出比较
  Object.entries(grouped).forEach(([type, versions]) => {
    const testName = type === 'help' ? '帮助命令' : '模块列表';
    console.log(chalk.yellow(`\n${testName}:`));
    
    if (versions.original && versions.optimized) {
      const improvement = ((versions.original.avgDuration - versions.optimized.avgDuration) / versions.original.avgDuration * 100).toFixed(1);
      const faster = versions.optimized.avgDuration < versions.original.avgDuration;
      
      console.log(`  原始版本: ${versions.original.avgDuration}ms`);
      console.log(`  优化版本: ${versions.optimized.avgDuration}ms`);
      
      if (faster) {
        console.log(chalk.green(`  ✨ 性能提升: ${improvement}%`));
      } else {
        console.log(chalk.red(`  ⚠️  性能下降: ${Math.abs(improvement)}%`));
      }
    }
  });
  
  // 总体统计
  const originalAvg = results
    .filter(r => r.name.includes('原始'))
    .reduce((sum, r) => sum + r.avgDuration, 0) / 2;
  
  const optimizedAvg = results
    .filter(r => r.name.includes('优化'))
    .reduce((sum, r) => sum + r.avgDuration, 0) / 2;
  
  const overallImprovement = ((originalAvg - optimizedAvg) / originalAvg * 100).toFixed(1);
  
  console.log(chalk.cyan('\n总体性能:'));
  console.log(`  原始版本平均: ${Math.round(originalAvg)}ms`);
  console.log(`  优化版本平均: ${Math.round(optimizedAvg)}ms`);
  console.log(chalk.green(`  ✨ 总体性能提升: ${overallImprovement}%`));
}

/**
 * 主函数
 */
async function main() {
  console.log(chalk.cyan('🚀 Creatoria CLI 性能测试'));
  console.log(chalk.gray('=' .repeat(60)));
  
  // 首先构建项目
  console.log(chalk.blue('\n构建项目...'));
  const { execSync } = require('child_process');
  
  try {
    execSync('npm run build', { stdio: 'inherit' });
  } catch (error) {
    console.error(chalk.red('构建失败'));
    process.exit(1);
  }
  
  // 运行测试
  const results = [];
  const runCount = process.env.QUICK ? 1 : 3;
  
  for (const test of tests) {
    const result = await runMultipleTimes(test, runCount);
    results.push(result);
  }
  
  // 比较结果
  compareResults(results);
  
  // 建议
  console.log(chalk.cyan('\n\n💡 优化建议:'));
  console.log(chalk.gray('  1. 使用 SHOW_STARTUP_TIME=true 查看详细启动时间'));
  console.log(chalk.gray('  2. 使用 PERFORMANCE_DEBUG=true 启用性能调试'));
  console.log(chalk.gray('  3. 使用 ENABLE_MONITORING=true 启用运行时监控'));
  console.log(chalk.gray('  4. 考虑使用 --turbo 标志启用 V8 优化'));
}

// 运行测试
main().catch(error => {
  console.error(chalk.red('测试失败:'), error);
  process.exit(1);
});