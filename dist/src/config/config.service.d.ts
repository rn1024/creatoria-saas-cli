import { ConfigService as NestConfigService } from '@nestjs/config';
export declare class ConfigService {
    private nestConfigService;
    private readonly config;
    constructor(nestConfigService: NestConfigService);
    get app(): import("../interfaces/config.interface").AppConfig;
    get modules(): import("../interfaces/config.interface").ModulesConfig;
    get database(): import("../interfaces/config.interface").DatabaseConfig;
    get redis(): import("../interfaces/config.interface").RedisConfig;
    get rabbitmq(): import("../interfaces/config.interface").RabbitMQConfig;
    get jwt(): import("../interfaces/config.interface").JwtConfig;
    get swagger(): import("../interfaces/config.interface").SwaggerConfig;
    get logging(): import("../interfaces/config.interface").LoggingConfig;
    getModuleConfig(moduleName: string): any;
    isModuleEnabled(moduleName: string): boolean;
}
