/**
 * 优化的主入口文件
 */

import { StartupOptimizer } from './performance/startup-optimizer';
import { PerformanceMonitor } from './performance/performance-monitor';

// 标记启动开始
StartupOptimizer.mark('start');

// 启动性能监控（如果启用）
const monitor = process.env.ENABLE_MONITORING === 'true' 
  ? PerformanceMonitor.getInstance() 
  : null;

// 延迟导入重量级模块
const getNestFactory = StartupOptimizer.lazyImport('@nestjs/core').then(m => m.NestFactory);
const getValidationPipe = StartupOptimizer.lazyImport('@nestjs/common').then(m => m.ValidationPipe);
const getSwaggerModule = StartupOptimizer.lazyImport('@nestjs/swagger');
const getChalk = StartupOptimizer.lazyRequire('chalk');

// 快速检查是否为CLI模式
const isCliMode = process.argv.length > 2 && !process.argv[2].startsWith('--');

async function bootstrapOptimized() {
  try {
    StartupOptimizer.mark('bootstrap-start');
    
    if (isCliMode) {
      await handleCliMode();
    } else {
      await handleServerMode();
    }
    
    StartupOptimizer.mark('bootstrap-end');
    
    // 输出性能报告
    if (process.env.SHOW_STARTUP_TIME === 'true') {
      StartupOptimizer.printReport();
      if (monitor) {
        console.log('\n' + monitor.getFormattedReport());
      }
    }
  } catch (error) {
    const chalk = getChalk();
    console.error(chalk.red('Failed to start application:'), error);
    
    if (monitor) {
      console.error('\n' + monitor.stop());
    }
    
    process.exit(1);
  }
}

/**
 * 处理CLI模式
 */
async function handleCliMode() {
  const chalk = getChalk();
  const subcmd = process.argv[2];
  
  // 快速路径：create命令
  if (subcmd === 'create') {
    StartupOptimizer.mark('create-start');
    
    const { CreateCommand } = await import('./cli/commands/create.command');
    const cmd = new CreateCommand();
    
    const argv = process.argv.slice(2);
    const name = argv[1];
    const opts: any = parseCreateOptions(argv);
    
    await cmd.run([name], opts);
    
    StartupOptimizer.mark('create-end');
    process.exit(0);
  }
  
  // 优化的CLI模式 - 使用懒加载
  if (subcmd === '--help' || subcmd === '-h') {
    // 快速显示帮助，不加载所有模块
    showQuickHelp();
    process.exit(0);
  }
  
  // 通用CLI模式
  StartupOptimizer.mark('cli-module-start');
  
  // 并行加载必要模块
  const [NestFactory, CliModule, LoggerService] = await StartupOptimizer.parallelInit([
    async () => (await getNestFactory),
    async () => (await import('./cli/cli.module')).CliModule,
    async () => (await import('./common/logger/logger.service')).LoggerService,
  ]);
  
  const logger = new LoggerService('Main');
  logger.debug('Running in optimized CLI mode');
  
  // 创建应用上下文（使用优化配置）
  const app = await NestFactory.createApplicationContext(CliModule, {
    logger: false,
    abortOnError: false,
  });
  
  StartupOptimizer.mark('cli-module-end');
  
  // 获取CLI服务
  const { OptimizedCliService } = await import('./cli/cli-optimized.service');
  const cliService = app.get(OptimizedCliService);
  
  try {
    await cliService.run();
  } finally {
    await app.close();
    logger.flush();
  }
  
  process.exit(0);
}

/**
 * 处理服务器模式
 */
async function handleServerMode() {
  const chalk = getChalk();
  const [NestFactory, ValidationPipe, LoggerService] = await StartupOptimizer.parallelInit([
    async () => (await getNestFactory),
    async () => (await getValidationPipe),
    async () => (await import('./common/logger/logger.service')).LoggerService,
  ]);
  
  const logger = new LoggerService('Main');
  logger.info('Starting Creatoria SaaS Server (Optimized)...');
  
  StartupOptimizer.mark('app-create-start');
  
  // 延迟加载AppModule
  const { AppModule } = await import('./app.module');
  const app = await NestFactory.create(AppModule, {
    logger: false,
    cors: true,
  });
  
  StartupOptimizer.mark('app-create-end');
  
  // 设置环境
  process.env.HTTP_SERVER_ENABLED = 'true';
  
  // 全局管道
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    })
  );
  
  // 设置前缀
  const prefix = process.env.API_PREFIX || 'api';
  app.setGlobalPrefix(prefix);
  
  // Swagger（延迟加载，仅在需要时）
  if (process.env.SWAGGER_ENABLED === 'true') {
    await setupSwagger(app);
  }
  
  // 启动服务器
  StartupOptimizer.mark('server-listen-start');
  const port = process.env.PORT || 3000;
  await app.listen(port);
  StartupOptimizer.mark('server-listen-end');
  
  logger.info(`Server is running at: http://localhost:${port}/${prefix}`);
  
  // 启动自动监控
  if (monitor) {
    monitor.startAutoMonitoring();
  }
}

/**
 * 设置Swagger
 */
async function setupSwagger(app: any) {
  const { SwaggerModule, DocumentBuilder } = await getSwaggerModule;
  
  const config = new DocumentBuilder()
    .setTitle(process.env.SWAGGER_TITLE || 'Creatoria SaaS API')
    .setDescription(process.env.SWAGGER_DESCRIPTION || 'The Creatoria SaaS API documentation')
    .setVersion(process.env.SWAGGER_VERSION || '1.0.0')
    .addBearerAuth()
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  const swaggerPath = process.env.SWAGGER_PATH || 'api-docs';
  SwaggerModule.setup(swaggerPath, app, document);
  
  const { LoggerService } = await import('./common/logger/logger.service');
  const logger = new LoggerService('Swagger');
  logger.info(`Documentation available at: http://localhost:${process.env.PORT || 3000}/${swaggerPath}`);
}

/**
 * 解析create命令选项
 */
function parseCreateOptions(argv: string[]): any {
  const opts: any = {};
  
  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    const next = argv[i + 1];
    
    switch (arg) {
      case '--skip-install':
        opts.skipInstall = true;
        break;
      case '--db-host':
        if (next) opts.dbHost = next;
        break;
      case '--db-port':
        if (next) opts.dbPort = Number(next);
        break;
      case '--db-database':
        if (next) opts.dbDatabase = next;
        break;
      case '--db-username':
        if (next) opts.dbUsername = next;
        break;
      case '--db-password':
        if (next) opts.dbPassword = next;
        break;
    }
  }
  
  return opts;
}

/**
 * 快速显示帮助信息
 */
function showQuickHelp() {
  const chalk = getChalk();
  
  console.log(chalk.cyan('Creatoria SaaS CLI (Optimized)'));
  console.log(chalk.gray('================================'));
  console.log('');
  console.log('Usage: creatoria [command] [options]');
  console.log('');
  console.log('Commands:');
  console.log('  create <name>     Create a new project');
  console.log('  init              Initialize the project');
  console.log('  module add <name> Add a module to the project');
  console.log('  module list       List installed modules');
  console.log('  db migrate        Run database migrations');
  console.log('  config show       Show configuration');
  console.log('  start             Start the application');
  console.log('  dev               Start in development mode');
  console.log('');
  console.log('Options:');
  console.log('  --help, -h        Show help');
  console.log('  --version, -v     Show version');
  console.log('  --verbose         Enable verbose output');
  console.log('  --profile         Show performance profile');
  console.log('');
  console.log('Environment Variables:');
  console.log('  SHOW_STARTUP_TIME=true      Show startup performance');
  console.log('  PERFORMANCE_DEBUG=true      Enable performance debugging');
  console.log('  ENABLE_MONITORING=true      Enable performance monitoring');
  console.log('');
  console.log('For more information, visit: https://github.com/creatoria/cli');
}

// 优雅退出处理
process.on('SIGINT', async () => {
  const chalk = getChalk();
  console.log(chalk.yellow('\n\n👋 Shutting down gracefully...'));
  
  if (monitor) {
    console.log('\n' + monitor.stop());
  }
  
  StartupOptimizer.printReport();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  if (monitor) {
    console.log(monitor.stop());
  }
  
  process.exit(0);
});

// 启动应用
bootstrapOptimized();