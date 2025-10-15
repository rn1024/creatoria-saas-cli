# Creatoria SaaS 快速参考指南

## 常用命令速查

### 🚀 快速开始
```bash
# 创建新项目
creatoria-saas create my-project

# 使用自定义配置创建
creatoria-saas create my-project \
  --api-prefix api/v1 \
  --admin-prefix admin \
  --system-prefix sys \
  --features auth,database,swagger,redis,rabbitmq

# 初始化项目
cd my-project
creatoria-saas init
```

### 💻 开发命令
```bash
# 开发模式（热重载）
creatoria-saas dev

# 开发模式with调试
creatoria-saas dev --debug --inspect 9229

# 生产模式启动
creatoria-saas start

# PM2守护进程模式
creatoria-saas start --daemon --workers 4

# 查看服务状态
creatoria-saas status

# 停止服务
creatoria-saas stop

# 重启服务
creatoria-saas restart
```

### 📦 模块管理
```bash
# 安装远程模块
creatoria-saas module install

# 列出已安装模块
creatoria-saas module list

# 添加模块到项目
creatoria-saas module add user

# 启用/禁用模块
creatoria-saas module enable user
creatoria-saas module disable user

# 查看模块信息
creatoria-saas module info user
```

### 🗄️ 数据库管理
```bash
# 运行迁移
creatoria-saas db migrate

# 运行种子数据
creatoria-saas db seed

# 强制重新运行种子
creatoria-saas db seed --force

# 重置数据库（危险！）
creatoria-saas db reset
creatoria-saas db reset --force  # 跳过确认
```

### 🐳 Docker管理
```bash
# 初始化Docker环境
creatoria-saas docker init

# 构建镜像
creatoria-saas docker build

# 启动容器
creatoria-saas docker up
creatoria-saas docker up --build  # 构建后启动

# 查看日志
creatoria-saas docker logs
creatoria-saas docker logs --tail 100

# 停止容器
creatoria-saas docker down
creatoria-saas docker down --force  # 删除卷

# 其他命令
creatoria-saas docker ps         # 查看状态
creatoria-saas docker restart    # 重启容器
creatoria-saas docker exec app bash  # 进入容器
```

### ⚙️ 配置管理
```bash
# 显示当前配置
creatoria-saas config show

# 设置配置项
creatoria-saas config set app.port 3001
creatoria-saas config set database.host localhost
```

## 环境变量配置

### 核心环境变量
```bash
# API路径配置（支持运行时修改）
API_PREFIX=api              # API全局前缀
ADMIN_PREFIX=admin-api       # 管理端前缀 ✅ 动态
SYSTEM_PREFIX=system         # 系统模块前缀 ✅ 动态

# 应用配置
NODE_ENV=development
PORT=3000

# 数据库配置
DB_TYPE=postgres
DB_HOST=localhost
DB_PORT=5432
DB_DATABASE=my_database
DB_USERNAME=postgres
DB_PASSWORD=password

# JWT配置
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# Redis配置
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# RabbitMQ配置
RABBITMQ_USER=admin
RABBITMQ_PASSWORD=admin
```

### 动态路径配置示例
```bash
# 1. 修改.env文件
ADMIN_PREFIX=custom-admin
SYSTEM_PREFIX=custom-system

# 2. 重启服务
creatoria-saas restart

# 3. 新路径生效
# 原路径：/api/admin-api/system/auth/login
# 新路径：/api/custom-admin/custom-system/auth/login
```

## 项目结构

### 生成的项目结构
```
my-project/
├── src/
│   ├── auth/               # 认证模块
│   ├── common/             # 公共模块
│   ├── database/           # 数据库配置
│   ├── system/             # 系统模块
│   ├── modules/            # 业务模块
│   ├── app.module.ts       # 根模块
│   └── main.ts             # 入口文件
├── test/                   # 测试文件
├── seeds/                  # 种子数据
├── migrations/             # 数据库迁移
├── docker-compose.yml      # Docker配置
├── .env                    # 环境变量
├── package.json
└── tsconfig.json
```

## 功能特性矩阵

| 功能 | 命令 | 默认值 | 可配置 |
|------|------|--------|--------|
| API前缀 | --api-prefix | api | ✅ |
| 管理端前缀 | --admin-prefix | admin-api | ✅ |
| 系统前缀 | --system-prefix | system | ✅ |
| 数据库类型 | --db-type | postgres | ✅ |
| 端口 | --app-port | 3000 | ✅ |
| JWT密钥 | --jwt-secret | 自动生成 | ✅ |
| Redis端口 | --redis-port | 6379 | ✅ |

## NPM Scripts

```json
{
  "scripts": {
    // 开发
    "start:dev": "nest start --watch",
    "start:debug": "nest start --debug --watch",
    "start:prod": "node dist/src/main",
    
    // 构建
    "build": "nest build",
    
    // 测试
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage",
    "test:e2e": "jest --config ./test/jest-e2e.json",
    
    // Docker
    "docker:build": "docker build -t my-project .",
    "docker:up": "docker-compose up -d",
    "docker:down": "docker-compose down",
    "docker:logs": "docker-compose logs -f",
    
    // 数据库
    "db:migrate": "npm run cli db migrate",
    "db:seed": "npm run cli db seed"
  }
}
```

## 故障排查

### 常见问题

#### 1. 项目创建失败
```bash
# 检查Node版本
node --version  # 需要 >= 16.0.0

# 清理npm缓存
npm cache clean --force

# 使用verbose模式查看详情
creatoria-saas create my-project --verbose
```

#### 2. 数据库连接失败
```bash
# 检查PostgreSQL服务
pg_isready

# 检查连接配置
cat .env | grep DB_

# 测试连接
psql -h localhost -U postgres -d my_database
```

#### 3. Docker问题
```bash
# 检查Docker服务
docker --version
docker-compose --version

# 查看容器日志
creatoria-saas docker logs --tail 50

# 重新构建
creatoria-saas docker down --force
creatoria-saas docker build
creatoria-saas docker up
```

#### 4. 端口占用
```bash
# 查看端口占用
lsof -i :3000

# 使用其他端口
creatoria-saas dev --port 3001
```

## 最佳实践

### 1. 项目初始化流程
```bash
# 完整初始化流程
creatoria-saas create my-project
cd my-project
creatoria-saas docker init
creatoria-saas docker up
creatoria-saas db migrate
creatoria-saas db seed
creatoria-saas dev
```

### 2. 生产部署流程
```bash
# 构建和部署
npm run build
creatoria-saas start --daemon --workers 4

# 或使用Docker
creatoria-saas docker build
creatoria-saas docker up --detach
```

### 3. 模块开发流程
```bash
# 创建新模块
creatoria-saas module add my-module

# 开发模块
# 编辑 src/modules/my-module/...

# 测试模块
npm run test:watch

# 提交模块
git add .
git commit -m "feat: add my-module"
```

## 有用的链接

- 📚 API文档：http://localhost:3000/api-docs
- 🏥 健康检查：http://localhost:3000/api/health
- 🔑 登录接口：POST /api/admin-api/system/auth/login
- 📊 RabbitMQ管理：http://localhost:15672
- 🗄️ pgAdmin：http://localhost:5050

## 版本信息

- CLI版本：1.0.0
- 模板版本：1.0.0
- Node要求：>= 16.0.0
- TypeScript：>= 5.0.0
- NestJS：11.0.0

---

*最后更新：2025-09-10*