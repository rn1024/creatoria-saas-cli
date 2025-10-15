import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';
import { CreatoriaConfig } from '../interfaces/config.interface';

@Injectable()
export class ConfigService {
  private readonly config: CreatoriaConfig;

  constructor(private nestConfigService: NestConfigService) {
    this.config = this.nestConfigService.get<CreatoriaConfig>('default') || {} as CreatoriaConfig;
  }

  get app() {
    return this.config?.app;
  }

  get modules() {
    return this.config?.modules;
  }

  get database() {
    return this.config?.database || {
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'postgres',
      database: 'creatoria_db',
      synchronize: false,
      logging: false
    };
  }

  get redis() {
    return this.config?.redis;
  }

  get rabbitmq() {
    return this.config?.rabbitmq;
  }

  get jwt() {
    return this.config?.jwt;
  }

  get swagger() {
    return this.config?.swagger;
  }

  get logging() {
    return this.config?.logging;
  }

  getModuleConfig(moduleName: string): any {
    return this.config?.modules?.config?.[moduleName] || {};
  }

  isModuleEnabled(moduleName: string): boolean {
    return this.config?.modules?.enabled?.includes(moduleName) || false;
  }
}