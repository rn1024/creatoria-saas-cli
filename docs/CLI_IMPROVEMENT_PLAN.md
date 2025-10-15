# CLI工具改进方案
> 生成时间: 2025-01-10
> 版本: v1.0.0

## 一、问题分析与解决方案

### 1.1 依赖包管理问题

#### 当前问题
生成的项目缺少关键依赖，需要手动安装：
- `@nestjs/swagger`
- `swagger-ui-express`
- `@nestjs/typeorm`
- `typeorm`
- `pg`
- `@nestjs/jwt`
- `@nestjs/passport`
- `passport`
- `passport-jwt`

#### 解决方案
**方案A: 在模板项目package.json中预置依赖**
```json
// creatoria-saas-template/package.json.hbs
{
  "dependencies": {
    "@nestjs/common": "^11.1.6",
    "@nestjs/core": "^11.1.6",
    "@nestjs/platform-express": "^11.1.6",
    "@nestjs/config": "^3.3.0",
    {{#if (includes features 'auth')}}
    "@nestjs/jwt": "^11.0.0",
    "@nestjs/passport": "^11.0.5",
    "passport": "^0.7.0",
    "passport-jwt": "^4.0.1",
    {{/if}}
    {{#if (includes features 'database')}}
    "@nestjs/typeorm": "^11.0.0",
    "typeorm": "^0.3.26",
    "pg": "^8.16.3",
    {{/if}}
    {{#if (includes features 'swagger')}}
    "@nestjs/swagger": "^11.2.0",
    "swagger-ui-express": "^5.0.1",
    {{/if}}
    "reflect-metadata": "^0.1.14",
    "rxjs": "^7.8.2",
    "class-transformer": "^0.5.1",
    "class-validator": "^0.14.2"
  }
}
```

**方案B: CLI智能依赖管理器**
```typescript
// cli/services/dependency-manager.service.ts
class DependencyManager {
  private featureDependencies = {
    auth: ['@nestjs/jwt', '@nestjs/passport', 'passport', 'passport-jwt'],
    database: ['@nestjs/typeorm', 'typeorm', 'pg'],
    swagger: ['@nestjs/swagger', 'swagger-ui-express'],
    redis: ['ioredis', '@nestjs/redis'],
    graphql: ['@nestjs/graphql', 'graphql', 'apollo-server-express']
  };

  async installForFeatures(features: string[], projectDir: string) {
    const deps = this.getDependenciesForFeatures(features);
    await this.installPackages(deps, projectDir);
  }
}
```

### 1.2 文件完整性问题

#### 当前问题
模板缺少以下关键文件：
- `src/common/common.module.ts`
- `src/database/base.entity.ts`
- `src/auth/auth-business.service.ts`
- `src/auth/dto/auth.dto.ts`

#### 解决方案
**在模板项目中添加所有必需文件**：

```bash
# 文件结构
creatoria-saas-template/
├── src/
│   ├── auth/
│   │   ├── auth.controller.ts
│   │   ├── auth.module.ts
│   │   ├── auth.service.ts.hbs
│   │   ├── auth-business.service.ts.hbs  # 新增
│   │   └── dto/
│   │       ├── index.ts.hbs
│   │       └── auth.dto.ts.hbs          # 新增
│   ├── common/
│   │   ├── common.module.ts.hbs         # 新增
│   │   └── index.ts.hbs
│   └── database/
│       ├── database.module.ts.hbs
│       └── base.entity.ts.hbs           # 新增
```

### 1.3 模块功能验证缺失

#### 当前问题
没有验证模块添加功能（module-add命令）

#### 解决方案
**添加模块管理测试流程**：

```typescript
// cli/commands/module.command.spec.ts
describe('Module Management', () => {
  it('should add a new module successfully', async () => {
    await cli.run(['module-add', 'user', '--crud']);
    
    // 验证文件创建
    expect(fs.existsSync('src/user/user.module.ts')).toBe(true);
    expect(fs.existsSync('src/user/user.controller.ts')).toBe(true);
    expect(fs.existsSync('src/user/user.service.ts')).toBe(true);
    
    // 验证模块注册
    const appModule = fs.readFileSync('src/app.module.ts', 'utf-8');
    expect(appModule).toContain('UserModule');
  });

  it('should generate CRUD operations when requested', async () => {
    await cli.run(['module-add', 'product', '--crud', '--entity']);
    
    // 验证CRUD端点
    const controller = fs.readFileSync('src/product/product.controller.ts', 'utf-8');
    expect(controller).toContain('@Get()');
    expect(controller).toContain('@Post()');
    expect(controller).toContain('@Put(:id)');
    expect(controller).toContain('@Delete(:id)');
  });
});
```

### 1.4 数据库自动化配置

#### 当前问题
需要手动启动Docker数据库

#### 解决方案
**添加数据库管理脚本**：

```yaml
# docker-compose.yml.hbs
version: '3.8'
services:
  postgres:
    image: postgres:15-alpine
    container_name: {{projectName}}_postgres
    environment:
      POSTGRES_USER: {{dbUsername}}
      POSTGRES_PASSWORD: {{dbPassword}}
      POSTGRES_DB: {{dbDatabase}}
    ports:
      - "{{dbPort}}:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U {{dbUsername}}"]
      interval: 10s
      timeout: 5s
      retries: 5

  {{#if (includes features 'redis')}}
  redis:
    image: redis:7-alpine
    container_name: {{projectName}}_redis
    ports:
      - "6379:6379"
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
  {{/if}}

volumes:
  postgres_data:
  {{#if (includes features 'redis')}}
  redis_data:
  {{/if}}
```

**package.json脚本增强**：
```json
{
  "scripts": {
    "db:start": "docker-compose up -d postgres",
    "db:stop": "docker-compose stop postgres",
    "db:reset": "docker-compose down -v && docker-compose up -d postgres",
    "db:migrate": "npm run typeorm migration:run",
    "db:seed": "ts-node src/database/seeds/run-seed.ts",
    "dev": "npm run db:start && npm run start:dev",
    "dev:full": "npm run db:reset && npm run db:migrate && npm run db:seed && npm run start:dev"
  }
}
```

### 1.5 API路径配置化

#### 当前问题
`admin-api`路径硬编码在代码中

#### 解决方案
**CLI创建时添加配置选项**：

```typescript
// cli/commands/create.command.ts
interface CreateOptions {
  // ... existing options
  apiPrefix?: string;        // 默认: 'api'
  adminPrefix?: string;      // 默认: 'admin-api'
  systemPrefix?: string;     // 默认: 'system'
}

// 使用方式
creatoria create my-project \
  --api-prefix v1 \
  --admin-prefix manage \
  --system-prefix core
```

**模板中使用变量**：
```typescript
// auth.controller.ts.hbs
@Controller('/{{adminPrefix}}/{{systemPrefix}}/auth')
export class AuthController {
  // ...
}
```

**.env配置**：
```env
# API路径配置
API_PREFIX=api
ADMIN_PREFIX=admin-api
SYSTEM_PREFIX=system

# 完整路径示例: /api/admin-api/system/auth/login
```

## 二、实施计划

### Phase 1: 模板完善（立即执行）
1. ✅ 添加所有缺失的.hbs文件
2. ✅ 更新package.json.hbs包含所有依赖
3. ✅ 修复默认值配置问题
4. ✅ 添加docker-compose.yml.hbs

**执行位置**: `/Users/samuelcn/Documents/Project/creatoria/creatoria-saas-template`

### Phase 2: CLI增强（本周完成）
1. ✅ 实现智能依赖管理器
2. ✅ 添加模块功能测试
3. ✅ 支持API路径配置
4. ✅ 添加项目健康检查命令

**执行位置**: `/Users/samuelcn/Documents/Project/creatoria/@creatoria/cli`

### Phase 3: 自动化工具（下周完成）
1. ✅ 数据库自动启动脚本
2. ✅ 开发环境一键配置
3. ✅ 生产环境部署脚本
4. ✅ CI/CD模板生成

## 三、验证标准

### 3.1 功能验证清单
- [ ] 新项目创建后无需手动安装依赖
- [ ] 执行`npm run dev`可直接启动（含数据库）
- [ ] 所有API端点正常工作
- [ ] 模块添加功能正常
- [ ] API路径可自定义配置

### 3.2 质量指标
```yaml
项目创建成功率: > 99%
零配置启动率: 100%
依赖完整性: 100%
API测试通过率: 100%
代码规范符合率: > 95%
```

## 四、改动影响分析

### 4.1 向后兼容性
- ✅ 所有改动向后兼容
- ✅ 新功能通过选项开启
- ✅ 默认行为保持不变

### 4.2 迁移指南
对于已创建的项目，提供升级脚本：
```bash
creatoria upgrade my-project
# 自动检测缺失文件和依赖
# 智能合并配置
# 保留自定义修改
```

## 五、具体文件改动清单

### 5.1 模板项目新增文件
```
creatoria-saas-template/
├── src/
│   ├── auth/
│   │   ├── auth-business.service.ts.hbs [新增]
│   │   └── dto/
│   │       └── auth.dto.ts.hbs [新增]
│   ├── common/
│   │   └── common.module.ts.hbs [新增]
│   ├── database/
│   │   └── base.entity.ts.hbs [新增]
│   └── config/
│       └── api.config.ts.hbs [新增]
├── docker-compose.yml.hbs [新增]
├── scripts/
│   ├── start-dev.sh [新增]
│   └── setup-db.sh [新增]
└── package.json.hbs [更新]
```

### 5.2 CLI项目改动
```
@creatoria/cli/
├── src/
│   ├── cli/
│   │   ├── commands/
│   │   │   └── create.command.ts [更新]
│   │   └── services/
│   │       ├── dependency-manager.service.ts [新增]
│   │       ├── template-validator.service.ts [新增]
│   │       └── project-health.service.ts [新增]
│   └── config/
│       └── feature-dependencies.ts [新增]
└── test/
    └── module-management.spec.ts [新增]
```

## 六、风险评估

### 6.1 技术风险
- **风险**: Docker未安装
- **缓解**: 提供检测和安装指引

### 6.2 兼容性风险
- **风险**: 不同操作系统差异
- **缓解**: 提供跨平台脚本

## 七、总结

本方案旨在解决CLI工具当前存在的关键问题，确保生成的项目能够**开箱即用**。通过模板完善、CLI增强和自动化工具三个阶段的实施，将大幅提升开发体验。

**预期效果**：
1. 项目创建时间缩短50%
2. 配置错误减少90%
3. 开发效率提升30%
4. 用户满意度达到95%

---

*本文档需要审批后执行，请确认是否按此方案进行改进。*