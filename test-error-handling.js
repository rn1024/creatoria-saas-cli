#!/usr/bin/env node

/**
 * 测试错误处理系统的脚本
 */

const { spawn } = require('child_process');
const chalk = require('chalk');
const path = require('path');

const CLI_PATH = path.join(__dirname, 'dist/src/main.js');

// 测试场景
const testScenarios = [
  {
    name: '测试无效命令',
    args: ['invalid-command'],
    expectedError: true,
  },
  {
    name: '测试缺少参数',
    args: ['module', 'add'],
    expectedError: true,
  },
  {
    name: '测试不在项目目录',
    args: ['module', 'add', 'test'],
    cwd: '/tmp',
    expectedError: true,
  },
  {
    name: '测试模块不存在',
    args: ['module', 'add', 'non-existent-module'],
    expectedError: true,
  },
  {
    name: '测试帮助命令',
    args: ['--help'],
    expectedError: false,
  },
];

async function runTest(scenario) {
  console.log(chalk.blue(`\n📝 ${scenario.name}`));
  console.log(chalk.gray(`   命令: node ${CLI_PATH} ${scenario.args.join(' ')}`));
  
  return new Promise((resolve) => {
    const options = {
      cwd: scenario.cwd || process.cwd(),
      env: {
        ...process.env,
        VERBOSE: 'true',
        LOG_LEVEL: 'DEBUG',
      },
    };
    
    const child = spawn('node', [CLI_PATH, ...scenario.args], options);
    
    let stdout = '';
    let stderr = '';
    
    child.stdout.on('data', (data) => {
      stdout += data.toString();
      process.stdout.write(chalk.gray(data));
    });
    
    child.stderr.on('data', (data) => {
      stderr += data.toString();
      process.stderr.write(chalk.red(data));
    });
    
    child.on('close', (code) => {
      const success = scenario.expectedError ? code !== 0 : code === 0;
      
      if (success) {
        console.log(chalk.green(`   ✅ 测试通过 (退出码: ${code})`));
      } else {
        console.log(chalk.red(`   ❌ 测试失败 (退出码: ${code})`));
      }
      
      resolve(success);
    });
  });
}

async function runAllTests() {
  console.log(chalk.cyan('🧪 开始测试错误处理系统...'));
  
  const results = [];
  
  for (const scenario of testScenarios) {
    const success = await runTest(scenario);
    results.push({ scenario: scenario.name, success });
  }
  
  // 打印总结
  console.log(chalk.cyan('\n📊 测试结果总结:'));
  
  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  results.forEach(r => {
    const icon = r.success ? '✅' : '❌';
    const color = r.success ? chalk.green : chalk.red;
    console.log(color(`   ${icon} ${r.scenario}`));
  });
  
  console.log(chalk.cyan(`\n   总计: ${passed} 通过, ${failed} 失败`));
  
  if (failed > 0) {
    process.exit(1);
  }
}

// 运行测试
runAllTests().catch(error => {
  console.error(chalk.red('测试执行失败:'), error);
  process.exit(1);
});