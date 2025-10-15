# 详细改动点清单

## 一、模板项目改动（creatoria-saas-template）

### 1. 新增文件清单

#### 1.1 auth-business.service.ts.hbs
```typescript
// src/auth/auth-business.service.ts.hbs
import { Injectable } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  AuthLoginReqVO,
  AuthLoginRespVO,
  AuthPermissionInfoRespVO,
  AuthRegisterReqVO,
  // ... other DTOs
} from './dto/auth.dto';

@Injectable()
export class AuthBusinessService {
  constructor(private readonly authService: AuthService) {}

  async login(loginReq: AuthLoginReqVO, clientIP?: string): Promise<AuthLoginRespVO> {
    // 实际业务逻辑
    const user = await this.authService.validateUser(loginReq.username, loginReq.password);
    const tokens = await this.authService.generateTokens(user);
    
    // 记录登录日志
    {{#if (includes features 'audit')}}
    await this.auditService.logLogin(user.id, clientIP);
    {{/if}}
    
    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: this.authService.sanitizeUser(user),
    };
  }

  // ... 其他方法
}
```

#### 1.2 auth.dto.ts.hbs
```typescript
// src/auth/dto/auth.dto.ts.hbs
import { IsString, IsNotEmpty, MinLength{{#if (includes features 'email')}}, IsEmail{{/if}} } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AuthLoginReqVO {
  @ApiProperty({ description: '用户名' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ description: '密码' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}

// ... 其他DTOs
```

#### 1.3 common.module.ts.hbs
```typescript
// src/common/common.module.ts.hbs
import { Module, Global } from '@nestjs/common';
{{#if (includes features 'cache')}}
import { CacheModule } from '@nestjs/cache-manager';
{{/if}}
{{#if (includes features 'logger')}}
import { LoggerModule } from './logger/logger.module';
{{/if}}
{{#if (includes features 'validation')}}
import { ValidationPipe } from '@nestjs/common';
{{/if}}

@Global()
@Module({
  imports: [
    {{#if (includes features 'cache')}}
    CacheModule.register({
      ttl: 5,
      max: 100,
    }),
    {{/if}}
    {{#if (includes features 'logger')}}
    LoggerModule,
    {{/if}}
  ],
  providers: [
    {{#if (includes features 'validation')}}
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
    {{/if}}
  ],
  exports: [
    {{#if (includes features 'cache')}}
    CacheModule,
    {{/if}}
    {{#if (includes features 'logger')}}
    LoggerModule,
    {{/if}}
  ],
})
export class CommonModule {}
```

#### 1.4 base.entity.ts.hbs
```typescript
// src/database/base.entity.ts.hbs
import {
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Column,
  VersionColumn,
} from 'typeorm';
{{#if (includes features 'swagger')}}
import { ApiProperty, ApiHideProperty } from '@nestjs/swagger';
{{/if}}

export abstract class BaseDO {
  {{#if (includes features 'swagger')}}
  @ApiProperty({ description: '主键ID' })
  {{/if}}
  @PrimaryGeneratedColumn({{#if (includes features 'uuid')}}'uuid'{{/if}})
  id: {{#if (includes features 'uuid')}}string{{else}}number{{/if}};

  {{#if (includes features 'swagger')}}
  @ApiProperty({ description: '创建时间' })
  {{/if}}
  @CreateDateColumn()
  createdAt: Date;

  {{#if (includes features 'swagger')}}
  @ApiProperty({ description: '更新时间' })
  {{/if}}
  @UpdateDateColumn()
  updatedAt: Date;

  {{#if (includes features 'soft-delete')}}
  {{#if (includes features 'swagger')}}
  @ApiHideProperty()
  {{/if}}
  @DeleteDateColumn()
  deletedAt?: Date;
  {{/if}}

  {{#if (includes features 'audit')}}
  @Column({ nullable: true })
  creator?: string;

  @Column({ nullable: true })
  updater?: string;
  {{/if}}

  {{#if (includes features 'version')}}
  @VersionColumn()
  version: number;
  {{/if}}
}
```

#### 1.5 docker-compose.yml.hbs
```yaml
# docker-compose.yml.hbs
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: {{projectName}}_postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: {{dbUsername}}
      POSTGRES_PASSWORD: {{dbPassword}}
      POSTGRES_DB: {{dbDatabase}}
      TZ: Asia/Shanghai
    ports:
      - "{{dbPort}}:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./scripts/init-db.sql:/docker-entrypoint-initdb.d/init.sql:ro
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U {{dbUsername}}"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - {{projectName}}_network

  {{#if (includes features 'redis')}}
  redis:
    image: redis:7-alpine
    container_name: {{projectName}}_redis
    restart: unless-stopped
    ports:
      - "6379:6379"
    command: redis-server --appendonly yes --requirepass {{redisPassword}}
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - {{projectName}}_network
  {{/if}}

  {{#if (includes features 'elasticsearch')}}
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.5.0
    container_name: {{projectName}}_elasticsearch
    environment:
      - discovery.type=single-node
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
      - xpack.security.enabled=false
    ports:
      - "9200:9200"
    volumes:
      - es_data:/usr/share/elasticsearch/data
    networks:
      - {{projectName}}_network
  {{/if}}

volumes:
  postgres_data:
  {{#if (includes features 'redis')}}
  redis_data:
  {{/if}}
  {{#if (includes features 'elasticsearch')}}
  es_data:
  {{/if}}

networks:
  {{projectName}}_network:
    driver: bridge
```

### 2. 更新文件清单

#### 2.1 package.json.hbs 更新
```json
{
  "name": "{{projectName}}",
  "version": "0.1.0",
  "description": "{{description}}",
  "scripts": {
    // 开发脚本
    "dev": "npm run db:start && npm run start:dev",
    "dev:clean": "npm run db:reset && npm run dev",
    
    // 数据库脚本
    "db:start": "docker-compose up -d postgres {{#if (includes features 'redis')}}redis{{/if}}",
    "db:stop": "docker-compose stop",
    "db:reset": "docker-compose down -v && docker-compose up -d postgres",
    "db:migrate": "npm run typeorm migration:run",
    "db:migrate:generate": "npm run typeorm migration:generate -- -n",
    "db:seed": "ts-node src/database/seeds/run-seed.ts",
    "db:backup": "bash scripts/backup-db.sh",
    
    // 构建脚本
    "build": "nest build",
    "build:prod": "npm run build && npm run copy:assets",
    
    // 测试脚本
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage",
    "test:e2e": "jest --config ./test/jest-e2e.json",
    
    // 代码质量
    "lint": "eslint \"{src,apps,libs,test}/**/*.ts\" --fix",
    "format": "prettier --write \"src/**/*.ts\" \"test/**/*.ts\"",
    "typecheck": "tsc --noEmit",
    "precommit": "npm run lint && npm run typecheck && npm run test"
  },
  "dependencies": {
    // NestJS核心
    "@nestjs/common": "^11.1.6",
    "@nestjs/core": "^11.1.6",
    "@nestjs/platform-express": "^11.1.6",
    "@nestjs/config": "^3.3.0",
    
    {{#if (includes features 'auth')}}
    // 认证相关
    "@nestjs/jwt": "^11.0.0",
    "@nestjs/passport": "^11.0.5",
    "passport": "^0.7.0",
    "passport-jwt": "^4.0.1",
    "passport-local": "^1.0.0",
    "bcryptjs": "^2.4.3",
    {{/if}}
    
    {{#if (includes features 'database')}}
    // 数据库相关
    "@nestjs/typeorm": "^11.0.0",
    "typeorm": "^0.3.26",
    "pg": "^8.16.3",
    {{/if}}
    
    {{#if (includes features 'swagger')}}
    // API文档
    "@nestjs/swagger": "^11.2.0",
    "swagger-ui-express": "^5.0.1",
    {{/if}}
    
    {{#if (includes features 'redis')}}
    // Redis缓存
    "ioredis": "^5.3.2",
    "@nestjs/cache-manager": "^2.2.2",
    "cache-manager": "^5.7.6",
    "cache-manager-ioredis": "^2.1.0",
    {{/if}}
    
    {{#if (includes features 'validation')}}
    // 数据验证
    "class-validator": "^0.14.2",
    "class-transformer": "^0.5.1",
    {{/if}}
    
    // 工具库
    "reflect-metadata": "^0.1.14",
    "rxjs": "^7.8.2",
    "dayjs": "^1.11.13",
    "lodash": "^4.17.21",
    "@types/lodash": "^4.17.13"
  },
  "devDependencies": {
    "@nestjs/cli": "^11.0.10",
    "@nestjs/schematics": "^11.0.7",
    "@nestjs/testing": "^11.1.6",
    "@types/express": "^5.0.3",
    "@types/jest": "^30.0.0",
    "@types/node": "^24.3.1",
    "@types/supertest": "^6.0.3",
    "@types/bcryptjs": "^2.4.6",
    "@types/passport-jwt": "^4.0.1",
    "@types/passport-local": "^1.0.38",
    "@typescript-eslint/eslint-plugin": "^8.43.0",
    "@typescript-eslint/parser": "^8.43.0",
    "eslint": "^9.35.0",
    "eslint-config-prettier": "^10.1.8",
    "eslint-plugin-prettier": "^5.5.4",
    "jest": "^30.1.3",
    "prettier": "^3.6.2",
    "source-map-support": "^0.5.21",
    "supertest": "^7.1.4",
    "ts-jest": "^29.4.1",
    "ts-loader": "^9.5.4",
    "ts-node": "^10.9.2",
    "tsconfig-paths": "^4.2.0",
    "typescript": "^5.9.2"
  }
}
```

#### 2.2 auth.controller.ts.hbs 更新
```typescript
// src/auth/auth.controller.ts.hbs
@ApiTags('{{systemPrefix}} - 认证管理')
@Controller('/{{adminPrefix}}/{{systemPrefix}}/auth')
export class AuthController {
  // Controller内容保持不变，只是路径变成可配置的
}
```

#### 2.3 database.module.ts.hbs 更新
```typescript
// src/database/database.module.ts.hbs
useFactory: (configService: ConfigService) => ({
  type: '{{dbType}}' as const,  // 确保有类型
  host: configService.get('DB_HOST', '{{dbHost}}'),
  port: configService.get('DB_PORT', {{dbPort}}),  // 确保有默认值
  username: configService.get('DB_USERNAME', '{{dbUsername}}'),
  password: configService.get('DB_PASSWORD', '{{dbPassword}}'),
  database: configService.get('DB_DATABASE', '{{dbDatabase}}'),
  // ... 其他配置
})
```

#### 2.4 main.ts.hbs 更新
```typescript
// src/main.ts.hbs
const port = process.env.PORT || {{appPort}};  // 确保有默认值
```

## 二、CLI项目改动（@creatoria/cli）

### 1. create.command.ts 增强

```typescript
interface CreateOptions {
  skipInstall?: boolean;
  
  // 数据库配置
  dbHost?: string;
  dbPort?: number;
  dbDatabase?: string;
  dbUsername?: string;
  dbPassword?: string;
  dbType?: 'postgres' | 'mysql' | 'mariadb';
  
  // API路径配置
  apiPrefix?: string;       // 默认: 'api'
  adminPrefix?: string;     // 默认: 'admin-api'
  systemPrefix?: string;    // 默认: 'system'
  
  // 应用配置
  appPort?: number;         // 默认: 3000
  
  // 功能开关
  features?: string[];      // 默认: ['auth', 'database', 'swagger']
  
  // Docker配置
  withDocker?: boolean;     // 是否生成docker-compose.yml
  autoStartDb?: boolean;    // 是否自动启动数据库
}

const context = {
  projectName,
  createdAt: new Date().toISOString(),
  
  // 功能配置
  features: options.features || ['auth', 'system', 'database', 'common', 'swagger'],
  
  // 数据库配置
  dbType: options.dbType || 'postgres',
  dbHost: options.dbHost || 'localhost',
  dbPort: options.dbPort || 5432,
  dbDatabase: options.dbDatabase || projectName,
  dbUsername: options.dbUsername || 'postgres',
  dbPassword: options.dbPassword || 'password',
  
  // API路径配置
  apiPrefix: options.apiPrefix || 'api',
  adminPrefix: options.adminPrefix || 'admin-api',
  systemPrefix: options.systemPrefix || 'system',
  
  // 应用配置
  appPort: options.appPort || 3000,
  
  // Docker配置
  withDocker: options.withDocker !== false,  // 默认生成
  
  // Redis配置（如果包含redis功能）
  redisPassword: this.generateSecurePassword(),
};
```

### 2. 新增服务

#### 2.1 dependency-manager.service.ts
```typescript
// src/cli/services/dependency-manager.service.ts
@Injectable()
export class DependencyManagerService {
  private readonly featureDependencies = {
    auth: {
      dependencies: [
        '@nestjs/jwt@^11.0.0',
        '@nestjs/passport@^11.0.5',
        'passport@^0.7.0',
        'passport-jwt@^4.0.1',
        'bcryptjs@^2.4.3',
      ],
      devDependencies: [
        '@types/bcryptjs@^2.4.6',
        '@types/passport-jwt@^4.0.1',
      ],
    },
    database: {
      dependencies: [
        '@nestjs/typeorm@^11.0.0',
        'typeorm@^0.3.26',
        'pg@^8.16.3',
      ],
      devDependencies: [],
    },
    swagger: {
      dependencies: [
        '@nestjs/swagger@^11.2.0',
        'swagger-ui-express@^5.0.1',
      ],
      devDependencies: [],
    },
    redis: {
      dependencies: [
        'ioredis@^5.3.2',
        '@nestjs/cache-manager@^2.2.2',
        'cache-manager@^5.7.6',
      ],
      devDependencies: [],
    },
  };

  async ensureDependencies(projectDir: string, features: string[]): Promise<void> {
    const deps = this.collectDependencies(features);
    
    // 更新package.json
    await this.updatePackageJson(projectDir, deps);
    
    // 安装依赖
    await this.installPackages(projectDir);
  }
}
```

#### 2.2 template-validator.service.ts
```typescript
// src/cli/services/template-validator.service.ts
@Injectable()
export class TemplateValidatorService {
  async validate(templateDir: string, features: string[]): Promise<ValidationResult> {
    const issues: Issue[] = [];
    
    // 检查必需文件
    const requiredFiles = this.getRequiredFiles(features);
    for (const file of requiredFiles) {
      if (!fs.existsSync(path.join(templateDir, file))) {
        issues.push({
          type: 'missing-file',
          severity: 'error',
          file,
          message: `Required file ${file} is missing`,
        });
      }
    }
    
    // 检查Handlebars模板
    const hbsFiles = await this.findHandlebarsFiles(templateDir);
    for (const file of hbsFiles) {
      const validation = await this.validateHandlebarsFile(file);
      if (!validation.valid) {
        issues.push(...validation.issues);
      }
    }
    
    return {
      valid: issues.length === 0,
      issues,
    };
  }
}
```

#### 2.3 project-health.service.ts
```typescript
// src/cli/services/project-health.service.ts
@Injectable()
export class ProjectHealthService {
  async checkHealth(projectDir: string): Promise<HealthReport> {
    const checks = {
      structure: await this.checkProjectStructure(projectDir),
      dependencies: await this.checkDependencies(projectDir),
      compilation: await this.checkCompilation(projectDir),
      docker: await this.checkDockerSetup(projectDir),
      database: await this.checkDatabaseConnection(projectDir),
    };
    
    const score = this.calculateHealthScore(checks);
    
    return {
      score,
      checks,
      recommendations: this.generateRecommendations(checks),
    };
  }

  async autoFix(projectDir: string): Promise<FixReport> {
    const fixes: Fix[] = [];
    
    // 自动修复常见问题
    fixes.push(...await this.fixMissingFiles(projectDir));
    fixes.push(...await this.fixDependencies(projectDir));
    fixes.push(...await this.fixConfiguration(projectDir));
    
    return {
      success: fixes.every(f => f.success),
      fixes,
    };
  }
}
```

## 三、新增命令

### 1. health命令
```bash
creatoria health [project-dir]
# 检查项目健康度
# 输出健康报告和建议
```

### 2. upgrade命令
```bash
creatoria upgrade [project-dir]
# 升级已有项目
# 智能合并新功能
# 保留自定义修改
```

### 3. doctor命令
```bash
creatoria doctor
# 检查环境配置
# Docker是否安装
# Node版本是否符合
# 必需工具是否可用
```

## 四、.env模板增强

```env
# .env.hbs
NODE_ENV=development
PORT={{appPort}}

# API路径配置
API_PREFIX={{apiPrefix}}
ADMIN_PREFIX={{adminPrefix}}
SYSTEM_PREFIX={{systemPrefix}}

# 数据库配置
DB_TYPE={{dbType}}
DB_HOST={{dbHost}}
DB_PORT={{dbPort}}
DB_DATABASE={{dbDatabase}}
DB_USERNAME={{dbUsername}}
DB_PASSWORD={{dbPassword}}
DB_SYNCHRONIZE=false
DB_LOGGING=false

{{#if (includes features 'auth')}}
# JWT配置
JWT_SECRET={{jwtSecret}}
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d
{{/if}}

{{#if (includes features 'redis')}}
# Redis配置
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD={{redisPassword}}
REDIS_DB=0
{{/if}}

{{#if (includes features 'swagger')}}
# Swagger配置
SWAGGER_ENABLED=true
SWAGGER_PATH=api-docs
SWAGGER_TITLE={{projectName}} API
SWAGGER_DESCRIPTION=API documentation for {{projectName}}
SWAGGER_VERSION=1.0.0
{{/if}}

{{#if (includes features 'cors')}}
# CORS配置
CORS_ENABLED=true
CORS_ORIGIN=*
{{/if}}

# 日志配置
LOG_LEVEL=debug
LOG_FORMAT=json

# 安全配置
RATE_LIMIT_TTL=60
RATE_LIMIT_MAX=100
```

---

*所有改动都已详细列出，请确认后开始实施。*