import { CreatoriaConfig } from './src/interfaces/config.interface';

const config: CreatoriaConfig = {
  // Application settings
  app: {
    name: 'Creatoria SaaS',
    version: '1.0.0',
    port: parseInt(process.env.PORT || '3000'),
    prefix: process.env.API_PREFIX || 'api',
  },

  // Module configuration
  modules: {
    source: process.env.MODULES_SOURCE || 'github:creatoria/creatoria-saas-modules',
    version: process.env.MODULES_VERSION || 'latest',
    enabled: (process.env.ENABLED_MODULES || 'system').split(','),
    installPath: './modules',
    config: {
      system: {
        multiTenant: process.env.MULTI_TENANT_ENABLED === 'true',
        defaultTenant: process.env.DEFAULT_TENANT_ID || 'default',
      },
      crm: {
        leadScoring: true,
        autoAssignment: false,
      },
      erp: {
        multiCurrency: true,
        multiWarehouse: true,
      },
      mall: {
        multiStore: false,
        paymentGateways: ['stripe', 'paypal'],
      },
      bpm: {
        engine: 'camunda',
        enableMonitoring: true,
      },
      ai: {
        defaultModel: 'gpt-4',
        enableKnowledgeBase: true,
      },
    },
  },

  // Database configuration
  database: {
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_DATABASE || 'creatoria',
    synchronize: process.env.NODE_ENV === 'development',
    logging: process.env.NODE_ENV === 'development',
    entities: ['dist/**/*.entity{.ts,.js}', 'modules/**/dist/**/*.entity{.ts,.js}'],
    migrations: ['dist/migrations/*{.ts,.js}', 'modules/**/dist/migrations/*{.ts,.js}'],
  },

  // Redis configuration
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
    ttl: 3600,
  },

  // RabbitMQ configuration
  rabbitmq: {
    url: process.env.RABBITMQ_URL || 'amqp://localhost:5672',
    exchanges: {
      events: 'creatoria.events',
      commands: 'creatoria.commands',
    },
    queues: {
      notifications: 'notifications',
      emails: 'emails',
      tasks: 'tasks',
    },
  },

  // JWT configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },

  // Swagger configuration
  swagger: {
    enabled: process.env.SWAGGER_ENABLED === 'true',
    title: process.env.SWAGGER_TITLE || 'Creatoria SaaS API',
    description: process.env.SWAGGER_DESCRIPTION || 'The Creatoria SaaS API documentation',
    version: process.env.SWAGGER_VERSION || '1.0.0',
    path: process.env.SWAGGER_PATH || 'api-docs',
  },

  // Logging configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'json',
    transports: ['console', 'file'],
    filename: 'logs/app.log',
  },
};

export default config;