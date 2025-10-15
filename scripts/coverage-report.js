#!/usr/bin/env node

/**
 * 测试覆盖率报告生成脚本
 */

const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');

// 读取覆盖率数据
const coveragePath = path.join(__dirname, '..', 'coverage', 'coverage-summary.json');

if (!fs.existsSync(coveragePath)) {
  console.error(chalk.red('错误: 找不到覆盖率数据。请先运行 npm test:cov'));
  process.exit(1);
}

const coverage = fs.readJSONSync(coveragePath);

// 配置阈值
const thresholds = {
  lines: 70,
  statements: 70,
  functions: 70,
  branches: 70,
};

// 显示覆盖率报告
console.log(chalk.cyan('\n=== 测试覆盖率报告 ===\n'));

const total = coverage.total;
const metrics = ['lines', 'statements', 'functions', 'branches'];
let allPassed = true;

metrics.forEach(metric => {
  const value = total[metric].pct;
  const threshold = thresholds[metric];
  const passed = value >= threshold;
  
  if (!passed) allPassed = false;
  
  const color = passed ? chalk.green : chalk.red;
  const icon = passed ? '✓' : '✗';
  
  console.log(
    `${icon} ${metric.padEnd(12)}: ${color(value.toFixed(2) + '%')} (阈值: ${threshold}%)`
  );
});

console.log('\n' + chalk.gray('-'.repeat(40)));

// 显示文件级别的覆盖率
const files = Object.entries(coverage)
  .filter(([key]) => key !== 'total')
  .sort((a, b) => a[1].lines.pct - b[1].lines.pct)
  .slice(0, 10); // 显示最低的10个文件

if (files.length > 0) {
  console.log(chalk.yellow('\n覆盖率最低的文件:'));
  
  files.forEach(([file, data]) => {
    const shortPath = file.replace(process.cwd(), '.');
    const linesPct = data.lines.pct;
    const color = linesPct < 50 ? chalk.red : linesPct < 70 ? chalk.yellow : chalk.green;
    
    console.log(`  ${color(linesPct.toFixed(1) + '%').padEnd(8)} ${shortPath}`);
  });
}

// 生成详细报告
const reportPath = path.join(__dirname, '..', 'coverage', 'coverage-report.txt');
const reportContent = generateDetailedReport(coverage);
fs.writeFileSync(reportPath, reportContent);

console.log(chalk.gray(`\n详细报告已保存到: ${reportPath}`));
console.log(chalk.gray(`HTML报告: coverage/lcov-report/index.html`));

// 检查是否通过
if (!allPassed) {
  console.log(chalk.red('\n❌ 覆盖率未达到阈值'));
  process.exit(1);
} else {
  console.log(chalk.green('\n✅ 所有覆盖率指标已达标'));
}

/**
 * 生成详细报告
 */
function generateDetailedReport(coverage) {
  const lines = [];
  const timestamp = new Date().toLocaleString();
  
  lines.push('=' .repeat(60));
  lines.push('CREATORIA SAAS CLI - 测试覆盖率报告');
  lines.push(`生成时间: ${timestamp}`);
  lines.push('=' .repeat(60));
  lines.push('');
  
  // 总体覆盖率
  lines.push('总体覆盖率:');
  lines.push('-'.repeat(40));
  
  const total = coverage.total;
  ['lines', 'statements', 'functions', 'branches'].forEach(metric => {
    const data = total[metric];
    lines.push(
      `${metric.padEnd(12)}: ${data.pct.toFixed(2)}% (${data.covered}/${data.total})`
    );
  });
  
  lines.push('');
  lines.push('文件级别覆盖率:');
  lines.push('-'.repeat(40));
  
  // 按模块分组
  const moduleGroups = {};
  
  Object.entries(coverage).forEach(([file, data]) => {
    if (file === 'total') return;
    
    const relativePath = file.replace(process.cwd() + '/', '');
    const module = relativePath.split('/')[1] || 'root'; // src/modules/xxx -> modules
    
    if (!moduleGroups[module]) {
      moduleGroups[module] = [];
    }
    
    moduleGroups[module].push({
      file: relativePath,
      lines: data.lines.pct,
      statements: data.statements.pct,
      functions: data.functions.pct,
      branches: data.branches.pct,
    });
  });
  
  // 输出每个模块的覆盖率
  Object.entries(moduleGroups).forEach(([module, files]) => {
    lines.push('');
    lines.push(`[${module}]`);
    
    files.sort((a, b) => b.lines - a.lines).forEach(file => {
      const status = file.lines >= 70 ? '✓' : '✗';
      lines.push(
        `  ${status} ${file.lines.toFixed(1)}% - ${file.file}`
      );
    });
    
    // 计算模块平均覆盖率
    const avgLines = files.reduce((sum, f) => sum + f.lines, 0) / files.length;
    lines.push(`  平均覆盖率: ${avgLines.toFixed(2)}%`);
  });
  
  lines.push('');
  lines.push('=' .repeat(60));
  
  // 添加建议
  lines.push('');
  lines.push('优化建议:');
  lines.push('-'.repeat(40));
  
  const lowCoverageFiles = Object.entries(coverage)
    .filter(([key, data]) => key !== 'total' && data.lines.pct < 50)
    .map(([file]) => file.replace(process.cwd() + '/', ''));
  
  if (lowCoverageFiles.length > 0) {
    lines.push('以下文件覆盖率低于50%，建议增加测试:');
    lowCoverageFiles.forEach(file => {
      lines.push(`  - ${file}`);
    });
  } else {
    lines.push('✅ 所有文件覆盖率均超过50%');
  }
  
  const uncoveredFunctions = Object.entries(coverage)
    .filter(([key, data]) => key !== 'total' && data.functions.pct === 0)
    .length;
  
  if (uncoveredFunctions > 0) {
    lines.push(`\n⚠️  有 ${uncoveredFunctions} 个文件没有函数测试覆盖`);
  }
  
  return lines.join('\n');
}
