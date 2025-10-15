import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { CliModule } from './cli/cli.module';
import { CliService } from './cli/cli.service';
import { CreateCommand } from './cli/commands/create.command';
import { DependencyManagerService } from './cli/services/dependency-manager.service';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { cliExceptionHandler } from './common/filters/cli-exception.filter';
import { LoggerService } from './common/logger/logger.service';
const chalk = require('chalk');

// 创建全局日志实例
const logger = new LoggerService('Main');

async function bootstrap() {
  // 设置CLI异常处理器配置
  cliExceptionHandler.setVerboseMode(process.env.VERBOSE === 'true');
  
  // Check if running as CLI command
  const isCliMode = process.argv.length > 2 && !process.argv[2].startsWith('--');
  
  if (isCliMode) {
    logger.debug('Running in CLI mode');
    const subcmd = process.argv[2];
    
    if (subcmd === 'create') {
      // Fast path: run create without Nest DI
      logger.debug('Running create command in fast mode');
      const argv = process.argv.slice(2);
      const name = argv[1];
      const opts: any = {};
      for (let i = 2; i < argv.length; i++) {
        const a = argv[i];
        const next = argv[i + 1];
        if (a === '--skip-install') opts.skipInstall = true;
        if (a === '--skip-docker') opts.skipDocker = true;
        if (a === '--path' && next) { opts.path = next; i++; }
        if (a === '--package-manager' && next) { opts.packageManager = next; i++; }
        if (a === '--features' && next) { opts.features = next.split(',').map((f: string) => f.trim()); i++; }
        if (a === '--db-type' && next) { opts.dbType = next; i++; }
        if (a === '--db-host' && next) { opts.dbHost = next; i++; }
        if (a === '--db-port' && next) { opts.dbPort = Number(next); i++; }
        if (a === '--db-database' && next) { opts.dbDatabase = next; i++; }
        if (a === '--db-username' && next) { opts.dbUsername = next; i++; }
        if (a === '--db-password' && next) { opts.dbPassword = next; i++; }
        if (a === '--api-prefix' && next) { opts.apiPrefix = next; i++; }
        if (a === '--admin-prefix' && next) { opts.adminPrefix = next; i++; }
        if (a === '--system-prefix' && next) { opts.systemPrefix = next; i++; }
        if (a === '--app-port' && next) { opts.appPort = Number(next); i++; }
        if (a === '--jwt-secret' && next) { opts.jwtSecret = next; i++; }
        if (a === '--session-secret' && next) { opts.sessionSecret = next; i++; }
        if (a === '--redis-port' && next) { opts.redisPort = Number(next); i++; }
        if (a === '--redis-password' && next) { opts.redisPassword = next; i++; }
        if (a === '--rabbitmq-user' && next) { opts.rabbitmqUser = next; i++; }
        if (a === '--rabbitmq-password' && next) { opts.rabbitmqPassword = next; i++; }
        if (a === '--minio-root-user' && next) { opts.minioRootUser = next; i++; }
        if (a === '--minio-root-password' && next) { opts.minioRootPassword = next; i++; }
      }
      
      try {
        const dependencyManager = new DependencyManagerService();
        const cmd = new CreateCommand(dependencyManager);
        await cmd.run([name], opts);
        process.exit(0);
      } catch (error) {
        cliExceptionHandler.handle(error);
        process.exit(1);
      }
    } else {
      // Generic CLI mode - use minimal module
      logger.debug('Running in generic CLI mode');
      const app = await NestFactory.createApplicationContext(CliModule, {
        logger: false, // Disable default NestJS logger
      });
      
      // Note: ApplicationContext doesn't support global filters
      // Errors will be handled by the CLI exception handler
      
      const cliService = app.get(CliService);
      
      try {
        await cliService.run();
      } catch (error) {
        cliExceptionHandler.handle(error);
      } finally {
        await app.close();
        // Flush logs before exit
        logger.flush();
      }
      
      process.exit(0);
    }
  } else {
    // Server mode - standard NestJS startup (simplified, no dynamic loading)
    logger.info('Starting Creatoria SaaS Server...');
    
    // Create the app with standard module
    const app = await NestFactory.create(AppModule, {
      logger: false, // Use our custom logger
    });
    
    // Set environment for HTTP mode
    process.env.HTTP_SERVER_ENABLED = 'true';
    
    // Global exception filter
    app.useGlobalFilters(new GlobalExceptionFilter());
    
    // Global pipes
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );
    
    // Set global prefix
    const prefix = process.env.API_PREFIX || 'api';
    app.setGlobalPrefix(prefix);
    
    // Define port early for Swagger configuration
    const port = process.env.PORT || 3000;
    
    // Swagger documentation (默认启用)
    const swaggerEnabled = process.env.SWAGGER_ENABLED !== 'false';
    if (swaggerEnabled) {
      const config = new DocumentBuilder()
        .setTitle(process.env.SWAGGER_TITLE || 'Creatoria SaaS API')
        .setDescription(
          process.env.SWAGGER_DESCRIPTION || 'The Creatoria SaaS API documentation',
        )
        .setVersion(process.env.SWAGGER_VERSION || '1.0.0')
        .addBearerAuth(
          {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            name: 'JWT',
            description: 'Enter JWT token',
            in: 'header',
          },
          'JWT-auth',
        )
        .addApiKey(
          {
            type: 'apiKey',
            name: 'X-API-Key',
            in: 'header',
            description: 'API Key authentication',
          },
          'api-key',
        )
        .addServer(`http://localhost:${port}`, 'Local Development')
        .addServer('https://api.creatoria.com', 'Production')
        .addTag('Modules', '模块管理相关接口')
        .addTag('Config', '配置管理相关接口')
        .addTag('Auth', '认证授权相关接口')
        .build();
      
      const document = SwaggerModule.createDocument(app, config);
      const swaggerPath = process.env.SWAGGER_PATH || 'api-docs';
      
      // 增强的 Swagger UI 配置
      SwaggerModule.setup(swaggerPath, app, document, {
        swaggerOptions: {
          persistAuthorization: true,
          docExpansion: 'none',
          filter: true,
          showRequestDuration: true,
          tryItOutEnabled: true,
          syntaxHighlight: {
            activate: true,
            theme: 'monokai',
          },
        },
        customCss: '.swagger-ui .topbar { display: none }',
        customSiteTitle: 'Creatoria API Docs',
        customfavIcon: '/favicon.ico',
      });
      
      logger.info(`📚 Swagger documentation: http://localhost:${port}/${swaggerPath}`);
      logger.info(`📋 OpenAPI JSON: http://localhost:${port}/${swaggerPath}-json`);
    }
    
    // Start server
    await app.listen(port);
    
    logger.info(`Server is running at: http://localhost:${port}/${prefix}`);
  }
}

bootstrap().catch(error => {
  logger.fatal('Failed to start application', error);
  cliExceptionHandler.handle(error);
  process.exit(1);
});
