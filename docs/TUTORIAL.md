# Creatoria SaaS CLI - 使用教程

## 目录
1. [快速开始](#快速开始)
2. [环境准备](#环境准备)
3. [安装部署](#安装部署)
4. [模块管理](#模块管理)
5. [数据库操作](#数据库操作)
6. [配置管理](#配置管理)
7. [开发指南](#开发指南)
8. [生产部署](#生产部署)
9. [故障排除](#故障排除)
10. [最佳实践](#最佳实践)

## 快速开始

### 30秒快速体验
```bash
# 1. 克隆项目
git clone https://github.com/creatoria/creatoria-saas-cli.git
cd creatoria-saas-cli

# 2. 安装依赖
npm install

# 3. 配置环境变量
cp .env.example .env

# 4. 启动服务
npm run start:dev

# 5. 访问 API 文档
open http://localhost:3000/api-docs
```

### 使用模板创建新项目
```bash
# 在任意工作目录下，使用 creatoria-saas create 脚手架
creatoria-saas create my-saas-app \
  --db-host localhost \
  --db-port 5432 \
  --db-database creatoria \
  --db-username postgres \
  --db-password password

# 跳过安装依赖
creatoria-saas create my-saas-app --skip-install
```

## 环境准备

### 系统要求
- Node.js >= 20.0.0
- npm >= 10.0.0
- Git >= 2.0.0
- PostgreSQL >= 14.0
- Redis >= 6.0

### 安装 Node.js
```bash
# 使用 nvm 安装 (推荐)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 20
nvm use 20

# 或使用官方安装包
# 访问 https://nodejs.org/ 下载安装
```

### 安装 PostgreSQL
```bash
# macOS
brew install postgresql@14
brew services start postgresql@14

# Ubuntu/Debian
sudo apt-get update
sudo apt-get install postgresql-14

# CentOS/RHEL
sudo yum install postgresql14-server
sudo postgresql-14-setup initdb
sudo systemctl start postgresql-14
```

### 安装 Redis
```bash
# macOS
brew install redis
brew services start redis

# Ubuntu/Debian
sudo apt-get install redis-server
sudo systemctl start redis

# CentOS/RHEL
sudo yum install redis
sudo systemctl start redis
```

## 安装部署

### 1. 获取代码
```bash
# 克隆 CLI 项目
git clone https://github.com/creatoria/creatoria-saas-cli.git
cd creatoria-saas-cli
```

### 2. 安装依赖
```bash
# 安装项目依赖
npm install

# 如果遇到权限问题
sudo npm install --unsafe-perm
```

### 3. 环境配置

创建 `.env` 文件：
```bash
cp .env.example .env
```

编辑 `.env` 文件：
```env
# 应用配置
NODE_ENV=development
PORT=3000
API_PREFIX=api

# 数据库配置
DB_TYPE=postgres
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=creatoria

# Redis配置
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT配置
JWT_SECRET=your-secret-key-change-this
JWT_EXPIRES_IN=7d

# 模块配置
MODULES_SOURCE=github:rn1024/creatoria-saas-modules
ENABLED_MODULES=system,crm,erp,mall,bpm,ai

# Swagger配置
SWAGGER_ENABLED=true
SWAGGER_PATH=api-docs
```

### 4. 数据库初始化

创建数据库：
```bash
# 登录 PostgreSQL
psql -U postgres

# 创建数据库
CREATE DATABASE creatoria;
CREATE DATABASE creatoria_test;  # 测试数据库

# 创建用户（可选）
CREATE USER creatoria WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE creatoria TO creatoria;
\q
```

运行迁移：
```bash
# 运行数据库迁移
npm run db:migrate

# 导入初始数据
npm run db:seed
```

### 5. 安装模块

```bash
# 从远程仓库安装模块
npm run module:install

# 或使用 CLI 命令
./bin/creatoria module install
```

### 6. 启动应用

开发环境：
```bash
# 启动开发服务器（带热重载）
npm run start:dev

# 启动调试模式
npm run start:debug
```

生产环境：
```bash
# 构建项目
npm run build

# 启动生产服务器
npm run start:prod
```

### 7. 验证安装

访问以下地址验证：
- API 文档: http://localhost:3000/api-docs
- 健康检查: http://localhost:3000/health
- 系统信息: http://localhost:3000/api/system/info

## 模块管理

### 查看已安装模块
```bash
# 列出所有模块
creatoria module list

# 查看模块详情
creatoria module info system
```

输出示例：
```
┌─────────┬──────────┬─────────┬─────────────────┐
│ Module  │ Version  │ Status  │ Description     │
├─────────┼──────────┼─────────┼─────────────────┤
│ system  │ 1.0.0    │ enabled │ 系统管理模块     │
│ crm     │ 1.0.0    │ enabled │ 客户关系管理     │
│ erp     │ 1.0.0    │ enabled │ 企业资源计划     │
│ mall    │ 1.0.0    │ disabled│ 电商模块        │
│ bpm     │ 1.0.0    │ enabled │ 业务流程管理     │
│ ai      │ 1.0.0    │ enabled │ 人工智能模块     │
└─────────┴──────────┴─────────┴─────────────────┘
```

### 安装新模块
```bash
# 从 GitHub 安装
creatoria module install github:rn1024/creatoria-saas-modules

# 从本地目录安装
creatoria module install file:../my-custom-module

# 从 npm 安装
creatoria module install npm:@creatoria/custom-module
```

### 启用/禁用模块
```bash
# 启用模块
creatoria module enable mall

# 禁用模块
creatoria module disable mall
```

### 更新模块
```bash
# 更新所有模块
creatoria module update

# 更新指定模块
creatoria module update crm
```

### 卸载模块
```bash
# 卸载模块
creatoria module uninstall mall
```

## 数据库操作

### 迁移管理
```bash
# 查看迁移状态
creatoria db status

# 运行待执行的迁移
creatoria db migrate

# 回滚最后一次迁移
creatoria db rollback

# 回滚到指定版本
creatoria db rollback --to=20240101120000
```

### 数据导入导出
```bash
# 导出数据
creatoria db export --output=backup.sql

# 导入数据
creatoria db import --input=backup.sql

# 导出指定表
creatoria db export --tables=users,roles --output=users_roles.sql
```

### 数据库重置
```bash
# 重置数据库（危险操作）
creatoria db reset --force

# 重置并导入种子数据
creatoria db reset --seed
```

## 配置管理

### 查看配置
```bash
# 显示所有配置
creatoria config show

# 显示指定配置
creatoria config get database.host
```

### 修改配置
```bash
# 设置配置项
creatoria config set database.host localhost

# 设置 JSON 配置
creatoria config set modules.config.crm '{"leadScoring": true}'
```

### 配置文件

主配置文件 `creatoria.config.ts`:
```typescript
import { CreatoriaConfig } from './src/interfaces/config.interface';

const config: CreatoriaConfig = {
  app: {
    name: 'Creatoria SaaS',
    version: '1.0.0',
    port: 3000,
    prefix: 'api',
  },
  
  modules: {
    source: 'github:rn1024/creatoria-saas-modules',
    enabled: ['system', 'crm', 'erp'],
    installPath: './modules',
    config: {
      system: {
        multiTenant: true,
        defaultTenant: 'default',
      },
      crm: {
        leadScoring: true,
        autoAssignment: false,
      },
    },
  },
  
  database: {
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'postgres',
    password: 'password',
    database: 'creatoria',
  },
};

export default config;
```

## 开发指南

### 项目结构
```
creatoria-saas-cli/
├── src/
│   ├── cli/              # CLI 命令实现
│   ├── config/           # 配置模块
│   ├── core/             # 核心功能
│   │   ├── cache/        # 缓存模块
│   │   ├── database/     # 数据库模块
│   │   └── module-loader/ # 模块加载器
│   ├── interfaces/       # TypeScript 接口
│   ├── app.module.ts     # 根模块
│   └── main.ts          # 应用入口
├── bin/
│   └── creatoria        # CLI 可执行文件
├── modules/             # 已安装的模块
├── docs/                # 文档
├── test/                # 测试文件
└── docker-compose.yml   # Docker 配置
```

### 创建自定义模块

1. **创建模块结构**:
```bash
mkdir -p my-module/src/{controllers,services,entities,dto}
cd my-module
```

2. **创建 package.json**:
```json
{
  "name": "@creatoria/my-module",
  "version": "1.0.0",
  "main": "dist/src/my-module.module.js",
  "scripts": {
    "build": "tsc",
    "test": "jest"
  },
  "dependencies": {
    "@nestjs/common": "^11.0.0",
    "@nestjs/core": "^11.0.0"
  }
}
```

3. **创建模块元数据 module.json**:
```json
{
  "name": "my-module",
  "displayName": "我的模块",
  "version": "1.0.0",
  "description": "自定义业务模块",
  "author": "Your Name",
  "dependencies": ["system"],
  "permissions": [
    "my-module:view",
    "my-module:create",
    "my-module:update",
    "my-module:delete"
  ],
  "menus": [
    {
      "name": "我的模块",
      "path": "/my-module",
      "icon": "custom",
      "permission": "my-module:view"
    }
  ]
}
```

4. **创建模块主文件**:
```typescript
// src/my-module.module.ts
import { Module } from '@nestjs/common';
import { MyModuleController } from './my-module.controller';
import { MyModuleService } from './my-module.service';

@Module({
  controllers: [MyModuleController],
  providers: [MyModuleService],
  exports: [MyModuleService],
})
export class MyModuleModule {}
```

5. **创建控制器**:
```typescript
// src/my-module.controller.ts
import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { MyModuleService } from './my-module.service';

@ApiTags('我的模块')
@Controller('my-module')
export class MyModuleController {
  constructor(private readonly service: MyModuleService) {}

  @Get()
  @ApiOperation({ summary: '获取列表' })
  async findAll() {
    return this.service.findAll();
  }

  @Post()
  @ApiOperation({ summary: '创建记录' })
  async create(@Body() dto: any) {
    return this.service.create(dto);
  }
}
```

### API 开发

#### 创建 RESTful API
```typescript
@Controller('products')
export class ProductController {
  @Get()
  findAll(@Query() query: QueryDto) {
    // 获取列表
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    // 获取详情
  }

  @Post()
  create(@Body() dto: CreateProductDto) {
    // 创建
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    // 更新
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    // 删除
  }
}
```

#### 使用 Swagger 文档
```typescript
@ApiTags('产品管理')
@Controller('products')
export class ProductController {
  @Get()
  @ApiOperation({ summary: '获取产品列表' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: '成功' })
  async findAll(@Query() query: QueryDto) {
    return this.productService.findAll(query);
  }
}
```

### 数据库操作

#### 定义实体
```typescript
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column({ default: 0 })
  stock: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

#### 使用 Repository
```typescript
@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async findAll(query: QueryDto) {
    const { page = 1, limit = 10, keyword } = query;
    
    const queryBuilder = this.productRepository.createQueryBuilder('product');
    
    if (keyword) {
      queryBuilder.where('product.name LIKE :keyword', { 
        keyword: `%${keyword}%` 
      });
    }
    
    const [data, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();
    
    return { data, total, page, limit };
  }
}
```

### 测试

#### 单元测试
```typescript
describe('ProductService', () => {
  let service: ProductService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProductService],
    }).compile();

    service = module.get<ProductService>(ProductService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a product', async () => {
    const product = await service.create({
      name: 'Test Product',
      price: 99.99,
    });
    expect(product.name).toBe('Test Product');
  });
});
```

运行测试：
```bash
# 运行所有测试
npm run test

# 运行测试并生成覆盖率报告
npm run test:cov

# 监听模式
npm run test:watch
```

## 生产部署

### Docker 部署

1. **构建镜像**:
```bash
docker build -t creatoria-saas-cli .
```

2. **使用 Docker Compose**:
```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DB_HOST=postgres
      - REDIS_HOST=redis
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:14
    environment:
      POSTGRES_DB: creatoria
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:6-alpine
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

启动服务：
```bash
docker-compose up -d
```

### PM2 部署

1. **安装 PM2**:
```bash
npm install -g pm2
```

2. **创建 ecosystem 配置**:
```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'creatoria-saas',
    script: 'dist/src/main.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
    },
    error_file: 'logs/err.log',
    out_file: 'logs/out.log',
    log_file: 'logs/combined.log',
    time: true,
  }],
};
```

3. **启动应用**:
```bash
# 构建项目
npm run build

# 启动
pm2 start ecosystem.config.js

# 查看状态
pm2 status

# 查看日志
pm2 logs

# 重启
pm2 restart creatoria-saas

# 停止
pm2 stop creatoria-saas
```

### Nginx 反向代理

```nginx
server {
    listen 80;
    server_name api.example.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### SSL 配置

使用 Let's Encrypt:
```bash
# 安装 Certbot
sudo apt-get install certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d api.example.com

# 自动续期
sudo certbot renew --dry-run
```

## 故障排除

### 常见问题

#### 1. 数据库连接失败
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
**解决方案**:
- 检查 PostgreSQL 是否运行: `pg_isready`
- 检查数据库配置是否正确
- 检查防火墙设置

#### 2. Redis 连接失败
```
Error: Redis connection to localhost:6379 failed
```
**解决方案**:
- 检查 Redis 是否运行: `redis-cli ping`
- 检查 Redis 配置
- 检查密码设置

#### 3. 模块加载失败
```
Error: Cannot find module '@creatoria/system'
```
**解决方案**:
- 运行 `npm run module:install`
- 检查模块路径配置
- 重新构建模块: `npm run build`

#### 4. 端口被占用
```
Error: listen EADDRINUSE: address already in use :::3000
```
**解决方案**:
- 查找占用端口的进程: `lsof -i :3000`
- 终止进程或更换端口
- 修改 `.env` 中的 PORT 配置

#### 5. 内存不足
```
FATAL ERROR: Reached heap limit Allocation failed
```
**解决方案**:
- 增加 Node.js 内存限制:
```bash
node --max-old-space-size=4096 dist/src/main.js
```

### 日志查看

```bash
# 查看应用日志
tail -f logs/app.log

# 查看错误日志
tail -f logs/error.log

# 使用 PM2 查看日志
pm2 logs creatoria-saas

# Docker 日志
docker-compose logs -f app
```

### 性能调优

#### 1. 数据库优化
```sql
-- 创建索引
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_orders_user_id ON orders(user_id);

-- 分析查询
EXPLAIN ANALYZE SELECT * FROM orders WHERE user_id = 1;
```

#### 2. Redis 缓存优化
```typescript
// 设置缓存
await this.cacheManager.set('key', value, { ttl: 3600 });

// 使用缓存装饰器
@UseInterceptors(CacheInterceptor)
@CacheTTL(60)
@Get()
async findAll() {
  return this.service.findAll();
}
```

#### 3. 应用性能监控
```typescript
// 添加性能监控中间件
export class PerformanceMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();
    
    res.on('finish', () => {
      const duration = Date.now() - start;
      console.log(`${req.method} ${req.url} - ${duration}ms`);
    });
    
    next();
  }
}
```

## 最佳实践

### 1. 安全最佳实践
- 使用强密码和密钥
- 启用 HTTPS
- 实施访问控制
- 定期更新依赖
- 使用环境变量管理敏感信息
- 实施日志审计

### 2. 性能最佳实践
- 使用缓存减少数据库查询
- 实施分页和懒加载
- 优化数据库查询和索引
- 使用 CDN 加速静态资源
- 实施负载均衡

### 3. 开发最佳实践
- 遵循 RESTful API 设计原则
- 编写单元测试和集成测试
- 使用 TypeScript 类型系统
- 实施代码审查
- 维护清晰的文档
- 使用 Git 分支管理策略

### 4. 运维最佳实践
- 实施监控和告警
- 定期备份数据
- 制定灾难恢复计划
- 使用容器化部署
- 实施自动化 CI/CD
- 维护变更日志

### 5. 模块开发规范
- 保持模块独立性
- 定义清晰的接口
- 实施版本管理
- 编写模块文档
- 提供示例代码
- 进行兼容性测试

## 获取帮助

### 官方资源
- 官方文档: https://docs.creatoria.com
- API 参考: https://api.creatoria.com
- GitHub: https://github.com/creatoria/creatoria-saas-cli

### 社区支持
- Discord: https://discord.gg/creatoria
- 论坛: https://forum.creatoria.com
- Stack Overflow: [creatoria-saas] 标签

### 报告问题
```bash
# 收集诊断信息
creatoria debug --output=debug.log

# 提交 Issue
# https://github.com/creatoria/creatoria-saas-cli/issues
```

### 商业支持
- 邮箱: support@creatoria.com
- 电话: +86-xxx-xxxx-xxxx
- 企业版: https://creatoria.com/enterprise

---

文档版本: 1.0.0
更新日期: 2025-01-02
作者: Creatoria Team
