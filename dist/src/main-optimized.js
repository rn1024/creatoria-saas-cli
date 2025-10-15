"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const startup_optimizer_1 = require("./performance/startup-optimizer");
const performance_monitor_1 = require("./performance/performance-monitor");
startup_optimizer_1.StartupOptimizer.mark('start');
const monitor = process.env.ENABLE_MONITORING === 'true'
    ? performance_monitor_1.PerformanceMonitor.getInstance()
    : null;
const getNestFactory = startup_optimizer_1.StartupOptimizer.lazyImport('@nestjs/core').then(m => m.NestFactory);
const getValidationPipe = startup_optimizer_1.StartupOptimizer.lazyImport('@nestjs/common').then(m => m.ValidationPipe);
const getSwaggerModule = startup_optimizer_1.StartupOptimizer.lazyImport('@nestjs/swagger');
const getChalk = startup_optimizer_1.StartupOptimizer.lazyRequire('chalk');
const isCliMode = process.argv.length > 2 && !process.argv[2].startsWith('--');
async function bootstrapOptimized() {
    try {
        startup_optimizer_1.StartupOptimizer.mark('bootstrap-start');
        if (isCliMode) {
            await handleCliMode();
        }
        else {
            await handleServerMode();
        }
        startup_optimizer_1.StartupOptimizer.mark('bootstrap-end');
        if (process.env.SHOW_STARTUP_TIME === 'true') {
            startup_optimizer_1.StartupOptimizer.printReport();
            if (monitor) {
                console.log('\n' + monitor.getFormattedReport());
            }
        }
    }
    catch (error) {
        const chalk = getChalk();
        console.error(chalk.red('Failed to start application:'), error);
        if (monitor) {
            console.error('\n' + monitor.stop());
        }
        process.exit(1);
    }
}
async function handleCliMode() {
    const chalk = getChalk();
    const subcmd = process.argv[2];
    if (subcmd === 'create') {
        startup_optimizer_1.StartupOptimizer.mark('create-start');
        const { CreateCommand } = await import('./cli/commands/create.command');
        const cmd = new CreateCommand();
        const argv = process.argv.slice(2);
        const name = argv[1];
        const opts = parseCreateOptions(argv);
        await cmd.run([name], opts);
        startup_optimizer_1.StartupOptimizer.mark('create-end');
        process.exit(0);
    }
    if (subcmd === '--help' || subcmd === '-h') {
        showQuickHelp();
        process.exit(0);
    }
    startup_optimizer_1.StartupOptimizer.mark('cli-module-start');
    const [NestFactory, CliModule, LoggerService] = await startup_optimizer_1.StartupOptimizer.parallelInit([
        async () => (await getNestFactory),
        async () => (await import('./cli/cli.module')).CliModule,
        async () => (await import('./common/logger/logger.service')).LoggerService,
    ]);
    const logger = new LoggerService('Main');
    logger.debug('Running in optimized CLI mode');
    const app = await NestFactory.createApplicationContext(CliModule, {
        logger: false,
        abortOnError: false,
    });
    startup_optimizer_1.StartupOptimizer.mark('cli-module-end');
    const { OptimizedCliService } = await import('./cli/cli-optimized.service');
    const cliService = app.get(OptimizedCliService);
    try {
        await cliService.run();
    }
    finally {
        await app.close();
        logger.flush();
    }
    process.exit(0);
}
async function handleServerMode() {
    const chalk = getChalk();
    const [NestFactory, ValidationPipe, LoggerService] = await startup_optimizer_1.StartupOptimizer.parallelInit([
        async () => (await getNestFactory),
        async () => (await getValidationPipe),
        async () => (await import('./common/logger/logger.service')).LoggerService,
    ]);
    const logger = new LoggerService('Main');
    logger.info('Starting Creatoria SaaS Server (Optimized)...');
    startup_optimizer_1.StartupOptimizer.mark('app-create-start');
    const { AppModule } = await import('./app.module');
    const app = await NestFactory.create(AppModule, {
        logger: false,
        cors: true,
    });
    startup_optimizer_1.StartupOptimizer.mark('app-create-end');
    process.env.HTTP_SERVER_ENABLED = 'true';
    app.useGlobalPipes(new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
        transformOptions: {
            enableImplicitConversion: true,
        },
    }));
    const prefix = process.env.API_PREFIX || 'api';
    app.setGlobalPrefix(prefix);
    if (process.env.SWAGGER_ENABLED === 'true') {
        await setupSwagger(app);
    }
    startup_optimizer_1.StartupOptimizer.mark('server-listen-start');
    const port = process.env.PORT || 3000;
    await app.listen(port);
    startup_optimizer_1.StartupOptimizer.mark('server-listen-end');
    logger.info(`Server is running at: http://localhost:${port}/${prefix}`);
    if (monitor) {
        monitor.startAutoMonitoring();
    }
}
async function setupSwagger(app) {
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
function parseCreateOptions(argv) {
    const opts = {};
    for (let i = 2; i < argv.length; i++) {
        const arg = argv[i];
        const next = argv[i + 1];
        switch (arg) {
            case '--skip-install':
                opts.skipInstall = true;
                break;
            case '--db-host':
                if (next)
                    opts.dbHost = next;
                break;
            case '--db-port':
                if (next)
                    opts.dbPort = Number(next);
                break;
            case '--db-database':
                if (next)
                    opts.dbDatabase = next;
                break;
            case '--db-username':
                if (next)
                    opts.dbUsername = next;
                break;
            case '--db-password':
                if (next)
                    opts.dbPassword = next;
                break;
        }
    }
    return opts;
}
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
process.on('SIGINT', async () => {
    const chalk = getChalk();
    console.log(chalk.yellow('\n\n👋 Shutting down gracefully...'));
    if (monitor) {
        console.log('\n' + monitor.stop());
    }
    startup_optimizer_1.StartupOptimizer.printReport();
    process.exit(0);
});
process.on('SIGTERM', async () => {
    if (monitor) {
        console.log(monitor.stop());
    }
    process.exit(0);
});
bootstrapOptimized();
//# sourceMappingURL=main-optimized.js.map