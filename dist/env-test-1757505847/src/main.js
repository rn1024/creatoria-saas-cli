"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const apiPrefix = process.env.API_PREFIX || 'test-api';
    app.setGlobalPrefix(apiPrefix);
    app.enableCors();
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
    }));
    const config = new swagger_1.DocumentBuilder()
        .setTitle('env-test-1757505847 API')
        .setDescription('API documentation for env-test-1757505847')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    const swaggerPath = process.env.SWAGGER_PATH || 'api-docs';
    swagger_1.SwaggerModule.setup(swaggerPath, app, document);
    const port = process.env.PORT || 3000;
    await app.listen(port);
    console.log(`Application is running on: http://localhost:${port}/${apiPrefix}`);
    console.log(`Swagger docs available at: http://localhost:${port}/${swaggerPath}`);
}
bootstrap();
//# sourceMappingURL=main.js.map