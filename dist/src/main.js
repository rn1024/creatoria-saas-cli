"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
const cli_module_1 = require("./cli/cli.module");
const cli_service_1 = require("./cli/cli.service");
const create_command_1 = require("./cli/commands/create.command");
const dependency_manager_service_1 = require("./cli/services/dependency-manager.service");
const global_exception_filter_1 = require("./common/filters/global-exception.filter");
const cli_exception_filter_1 = require("./common/filters/cli-exception.filter");
const logger_service_1 = require("./common/logger/logger.service");
const chalk = require('chalk');
const logger = new logger_service_1.LoggerService('Main');
async function bootstrap() {
    cli_exception_filter_1.cliExceptionHandler.setVerboseMode(process.env.VERBOSE === 'true');
    const isCliMode = process.argv.length > 2 && !process.argv[2].startsWith('--');
    if (isCliMode) {
        logger.debug('Running in CLI mode');
        const subcmd = process.argv[2];
        if (subcmd === 'create') {
            logger.debug('Running create command in fast mode');
            const argv = process.argv.slice(2);
            const name = argv[1];
            const opts = {};
            for (let i = 2; i < argv.length; i++) {
                const a = argv[i];
                const next = argv[i + 1];
                if (a === '--skip-install')
                    opts.skipInstall = true;
                if (a === '--skip-docker')
                    opts.skipDocker = true;
                if (a === '--package-manager' && next) {
                    opts.packageManager = next;
                    i++;
                }
                if (a === '--features' && next) {
                    opts.features = next.split(',').map((f) => f.trim());
                    i++;
                }
                if (a === '--db-type' && next) {
                    opts.dbType = next;
                    i++;
                }
                if (a === '--db-host' && next) {
                    opts.dbHost = next;
                    i++;
                }
                if (a === '--db-port' && next) {
                    opts.dbPort = Number(next);
                    i++;
                }
                if (a === '--db-database' && next) {
                    opts.dbDatabase = next;
                    i++;
                }
                if (a === '--db-username' && next) {
                    opts.dbUsername = next;
                    i++;
                }
                if (a === '--db-password' && next) {
                    opts.dbPassword = next;
                    i++;
                }
                if (a === '--api-prefix' && next) {
                    opts.apiPrefix = next;
                    i++;
                }
                if (a === '--admin-prefix' && next) {
                    opts.adminPrefix = next;
                    i++;
                }
                if (a === '--system-prefix' && next) {
                    opts.systemPrefix = next;
                    i++;
                }
                if (a === '--app-port' && next) {
                    opts.appPort = Number(next);
                    i++;
                }
                if (a === '--jwt-secret' && next) {
                    opts.jwtSecret = next;
                    i++;
                }
                if (a === '--session-secret' && next) {
                    opts.sessionSecret = next;
                    i++;
                }
                if (a === '--redis-port' && next) {
                    opts.redisPort = Number(next);
                    i++;
                }
                if (a === '--redis-password' && next) {
                    opts.redisPassword = next;
                    i++;
                }
                if (a === '--rabbitmq-user' && next) {
                    opts.rabbitmqUser = next;
                    i++;
                }
                if (a === '--rabbitmq-password' && next) {
                    opts.rabbitmqPassword = next;
                    i++;
                }
                if (a === '--minio-root-user' && next) {
                    opts.minioRootUser = next;
                    i++;
                }
                if (a === '--minio-root-password' && next) {
                    opts.minioRootPassword = next;
                    i++;
                }
            }
            try {
                const dependencyManager = new dependency_manager_service_1.DependencyManagerService();
                const cmd = new create_command_1.CreateCommand(dependencyManager);
                await cmd.run([name], opts);
                process.exit(0);
            }
            catch (error) {
                cli_exception_filter_1.cliExceptionHandler.handle(error);
                process.exit(1);
            }
        }
        else {
            logger.debug('Running in generic CLI mode');
            const app = await core_1.NestFactory.createApplicationContext(cli_module_1.CliModule, {
                logger: false,
            });
            const cliService = app.get(cli_service_1.CliService);
            try {
                await cliService.run();
            }
            catch (error) {
                cli_exception_filter_1.cliExceptionHandler.handle(error);
            }
            finally {
                await app.close();
                logger.flush();
            }
            process.exit(0);
        }
    }
    else {
        logger.info('Starting Creatoria SaaS Server...');
        const app = await core_1.NestFactory.create(app_module_1.AppModule, {
            logger: false,
        });
        process.env.HTTP_SERVER_ENABLED = 'true';
        app.useGlobalFilters(new global_exception_filter_1.GlobalExceptionFilter());
        app.useGlobalPipes(new common_1.ValidationPipe({
            whitelist: true,
            transform: true,
            forbidNonWhitelisted: true,
        }));
        const prefix = process.env.API_PREFIX || 'api';
        app.setGlobalPrefix(prefix);
        const port = process.env.PORT || 3000;
        const swaggerEnabled = process.env.SWAGGER_ENABLED !== 'false';
        if (swaggerEnabled) {
            const config = new swagger_1.DocumentBuilder()
                .setTitle(process.env.SWAGGER_TITLE || 'Creatoria SaaS API')
                .setDescription(process.env.SWAGGER_DESCRIPTION || 'The Creatoria SaaS API documentation')
                .setVersion(process.env.SWAGGER_VERSION || '1.0.0')
                .addBearerAuth({
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
                name: 'JWT',
                description: 'Enter JWT token',
                in: 'header',
            }, 'JWT-auth')
                .addApiKey({
                type: 'apiKey',
                name: 'X-API-Key',
                in: 'header',
                description: 'API Key authentication',
            }, 'api-key')
                .addServer(`http://localhost:${port}`, 'Local Development')
                .addServer('https://api.creatoria.com', 'Production')
                .addTag('Modules', '模块管理相关接口')
                .addTag('Config', '配置管理相关接口')
                .addTag('Auth', '认证授权相关接口')
                .build();
            const document = swagger_1.SwaggerModule.createDocument(app, config);
            const swaggerPath = process.env.SWAGGER_PATH || 'api-docs';
            swagger_1.SwaggerModule.setup(swaggerPath, app, document, {
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
        await app.listen(port);
        logger.info(`Server is running at: http://localhost:${port}/${prefix}`);
    }
}
bootstrap().catch(error => {
    logger.fatal('Failed to start application', error);
    cli_exception_filter_1.cliExceptionHandler.handle(error);
    process.exit(1);
});
//# sourceMappingURL=main.js.map