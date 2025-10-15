# 故障排除指南

## 常见问题快速索引

1. [安装问题](#安装问题)
2. [启动问题](#启动问题)
3. [数据库问题](#数据库问题)
4. [模块问题](#模块问题)
5. [API问题](#api问题)
6. [性能问题](#性能问题)
7. [部署问题](#部署问题)

## 安装问题

### 问题: npm install 失败

**错误信息**:
```
npm ERR! code ERESOLVE
npm ERR! ERESOLVE unable to resolve dependency tree
```

**解决方案**:
```bash
# 清理缓存
npm cache clean --force

# 删除node_modules和package-lock.json
rm -rf node_modules package-lock.json

# 重新安装
npm install --legacy-peer-deps
```

### 问题: chalk 模块报错

**错误信息**:
```
Error [ERR_REQUIRE_ESM]: require() of ES Module chalk
```

**解决方案**:
```bash
# 降级chalk到v4版本
npm uninstall chalk
npm install chalk@4.1.2
```

### 问题: TypeScript版本冲突

**错误信息**:
```
Type error: Cannot find module 'typescript' or its corresponding type declarations
```

**解决方案**:
```bash
# 安装正确版本的TypeScript
npm install --save-dev typescript@^5.0.0
```

## 启动问题

### 问题: 端口被占用

**错误信息**:
```
Error: listen EADDRINUSE: address already in use :::3000
```

**解决方案**:
```bash
# 方法1: 修改端口
PORT=3456 npm run start:dev

# 方法2: 查找并杀死占用端口的进程
lsof -i :3000
kill -9 [PID]

# Windows系统
netstat -ano | findstr :3000
taskkill /PID [PID] /F
```

### 问题: 环境变量未加载

**错误信息**:
```
Error: Cannot read properties of undefined
```

**解决方案**:
```bash
# 确保.env文件存在
cp .env.example .env

# 检查环境变量格式
cat .env | grep -E "^[A-Z_]+="

# 确保ConfigModule已配置
# app.module.ts
ConfigModule.forRoot({
  isGlobal: true,
  envFilePath: ['.env.local', '.env'],
})
```

### 问题: 模块导入错误

**错误信息**:
```
Error: Nest can't resolve dependencies of the UserService
```

**解决方案**:
```typescript
// 检查模块导入
@Module({
  imports: [
    TypeOrmModule.forFeature([User]), // 确保导入了实体
  ],
  providers: [UserService],
  exports: [UserService], // 如果其他模块需要使用
})
export class UserModule {}
```

## 数据库问题

### 问题: 数据库连接失败

**错误信息**:
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**解决方案**:
```bash
# 1. 检查PostgreSQL是否运行
docker ps | grep postgres

# 2. 启动PostgreSQL容器
docker run -d \
  --name postgres \
  -e POSTGRES_PASSWORD=123456 \
  -e POSTGRES_DB=creatoria_db \
  -p 5432:5432 \
  postgres:14

# 3. 检查连接配置
cat .env | grep DB_
```

### 问题: 密码认证失败

**错误信息**:
```
password authentication failed for user "postgres"
```

**解决方案**:
```bash
# 更新.env文件中的密码
DB_PASSWORD=123456  # 改为正确的密码

# 或重置PostgreSQL密码
docker exec -it postgres psql -U postgres
ALTER USER postgres PASSWORD '123456';
```

### 问题: 数据库不存在

**错误信息**:
```
database "creatoria_db" does not exist
```

**解决方案**:
```bash
# 创建数据库
docker exec -it postgres psql -U postgres
CREATE DATABASE creatoria_db;

# 或在.env中设置自动创建
DB_SYNCHRONIZE=true
```

### 问题: 实体未被加载

**错误信息**:
```
No repository for "User" was found
```

**解决方案**:
```typescript
// 使用autoLoadEntities自动加载
TypeOrmModule.forRoot({
  autoLoadEntities: true, // 添加这一行
  synchronize: true,
})

// 确保实体已导出
@Module({
  imports: [TypeOrmModule.forFeature([User])],
})
```

## 模块问题

### 问题: 模块未找到

**错误信息**:
```
Cannot find module './modules/product/product.module'
```

**解决方案**:
```bash
# 检查模块文件是否存在
ls -la src/modules/product/

# 创建缺失的模块
npm run module:create product

# 检查导入路径
# 使用相对路径: ./modules/product/product.module
# 不要使用: modules/product/product.module
```

### 问题: 循环依赖

**错误信息**:
```
Nest detected circular dependency
```

**解决方案**:
```typescript
// 使用forwardRef解决循环依赖
@Module({
  imports: [
    forwardRef(() => OtherModule),
  ],
})

// 或重新设计模块结构避免循环依赖
```

## API问题

### 问题: 404 Not Found

**错误信息**:
```
Cannot GET /api/users
```

**解决方案**:
```typescript
// 1. 检查控制器路由
@Controller('api/users') // 确保路径正确
export class UserController {}

// 2. 检查方法装饰器
@Get() // GET请求
@Post() // POST请求

// 3. 检查全局前缀
app.setGlobalPrefix('api'); // main.ts中设置
```

### 问题: 验证错误

**错误信息**:
```
{
  "statusCode": 400,
  "message": ["email must be an email"],
  "error": "Bad Request"
}
```

**解决方案**:
```typescript
// 检查DTO验证规则
export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
  
  @MinLength(6)
  @IsString()
  password: string;
}

// 确保使用ValidationPipe
app.useGlobalPipes(new ValidationPipe({
  whitelist: true,
  transform: true,
}));
```

### 问题: CORS错误

**错误信息**:
```
Access to XMLHttpRequest has been blocked by CORS policy
```

**解决方案**:
```typescript
// main.ts中启用CORS
app.enableCors({
  origin: true, // 或指定具体域名
  credentials: true,
});
```

## 性能问题

### 问题: 响应缓慢

**症状**:
- API响应时间超过1秒
- 数据库查询慢

**解决方案**:
```typescript
// 1. 添加索引
@Index(['email'])
export class User {
  @Column()
  email: string;
}

// 2. 使用查询优化
const users = await this.userRepository
  .createQueryBuilder('user')
  .leftJoinAndSelect('user.orders', 'order')
  .limit(10)
  .getMany();

// 3. 启用查询缓存
@Get()
@UseInterceptors(CacheInterceptor)
findAll() {
  return this.userService.findAll();
}
```

### 问题: 内存泄漏

**症状**:
- 内存使用持续增长
- 应用最终崩溃

**解决方案**:
```bash
# 1. 监控内存使用
node --inspect npm run start:dev

# 2. 限制内存使用
node --max-old-space-size=512 dist/main.js

# 3. 检查代码
# - 避免全局变量
# - 清理定时器
# - 关闭数据库连接
```

## 部署问题

### 问题: Docker构建失败

**错误信息**:
```
npm ERR! code ENOENT
```

**解决方案**:
```dockerfile
# 修复Dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
CMD ["node", "dist/main"]
```

### 问题: 生产环境配置

**问题**: 生产环境使用了开发配置

**解决方案**:
```bash
# 设置生产环境变量
export NODE_ENV=production
export DB_SYNCHRONIZE=false  # 生产环境禁用自动同步

# 使用PM2管理进程
pm2 start dist/main.js --name creatoria
```

## 调试技巧

### 启用详细日志

```typescript
// main.ts
const app = await NestFactory.create(AppModule, {
  logger: ['error', 'warn', 'debug', 'verbose', 'log'],
});
```

### 数据库查询日志

```typescript
// database.module.ts
TypeOrmModule.forRoot({
  logging: true, // 开启SQL日志
  logger: 'advanced-console',
})
```

### 使用调试器

```json
// .vscode/launch.json
{
  "type": "node",
  "request": "launch",
  "name": "Debug Nest",
  "runtimeArgs": ["run", "start:debug"],
  "runtimeExecutable": "npm",
  "skipFiles": ["<node_internals>/**"],
  "outFiles": ["${workspaceFolder}/dist/**/*.js"]
}
```

## 获取帮助

### 日志位置
- 应用日志: `logs/app.log`
- 错误日志: `logs/error.log`
- PM2日志: `~/.pm2/logs/`

### 诊断命令

```bash
# 检查Node版本
node --version  # 需要 >= 20.0.0

# 检查依赖版本
npm list @nestjs/core

# 检查数据库连接
psql -h localhost -U postgres -d creatoria_db -c "SELECT 1"

# 检查端口占用
netstat -tulpn | grep 3000
```

### 社区支持

- GitHub Issues: https://github.com/creatoria/@creatoria/cli/issues
- Discord: https://discord.gg/creatoria
- Email: support@creatoria.com

## 常见错误代码

| 错误代码 | 含义 | 解决方案 |
|---------|------|---------|
| ECONNREFUSED | 连接被拒绝 | 检查服务是否运行 |
| EADDRINUSE | 端口被占用 | 更换端口或关闭占用进程 |
| ENOENT | 文件不存在 | 检查文件路径 |
| ETIMEDOUT | 连接超时 | 检查网络和防火墙 |
| EACCES | 权限不足 | 使用sudo或修改权限 |

---

文档版本: 1.0.0  
更新日期: 2025-09-03  
作者: Creatoria Team