export interface CreatoriaConfig {
  app: AppConfig;
  modules: ModulesConfig;
  database: DatabaseConfig;
  redis: RedisConfig;
  rabbitmq: RabbitMQConfig;
  jwt: JwtConfig;
  swagger: SwaggerConfig;
  logging: LoggingConfig;
}

export interface AppConfig {
  name: string;
  version: string;
  port: number;
  prefix: string;
}

export interface ModulesConfig {
  source: string;
  version: string;
  enabled: string[];
  installPath: string;
  config: Record<string, any>;
}

export interface DatabaseConfig {
  type: 'postgres' | 'mysql' | 'mongodb';
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  synchronize?: boolean;
  logging?: boolean;
  entities: string[];
  migrations: string[];
}

export interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  ttl?: number;
}

export interface RabbitMQConfig {
  url: string;
  exchanges: {
    events: string;
    commands: string;
  };
  queues: {
    notifications: string;
    emails: string;
    tasks: string;
  };
}

export interface JwtConfig {
  secret: string;
  expiresIn: string;
}

export interface SwaggerConfig {
  enabled: boolean;
  title: string;
  description: string;
  version: string;
  path: string;
}

export interface LoggingConfig {
  level: string;
  format: string;
  transports: string[];
  filename?: string;
}