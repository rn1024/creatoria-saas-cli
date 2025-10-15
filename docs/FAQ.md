# 常见问题解答 (FAQ)

## 目录

1. [基础问题](#基础问题)
2. [开发相关](#开发相关)
3. [数据库相关](#数据库相关)
4. [模块系统](#模块系统)
5. [性能优化](#性能优化)
6. [部署运维](#部署运维)
7. [安全相关](#安全相关)
8. [授权许可](#授权许可)

## 基础问题

### Q: Creatoria SaaS CLI 是什么？
**A:** Creatoria SaaS CLI 是一个基于 NestJS 的企业级 SaaS 平台解决方案，提供模块化架构、自动化配置和完整的业务功能模块。

### Q: 支持哪些数据库？
**A:** 主要支持 PostgreSQL (推荐)，也支持 MySQL、MariaDB。通过 TypeORM 理论上支持所有主流关系型数据库。

### Q: 最低系统要求是什么？
**A:** 
- Node.js >= 20.0.0
- PostgreSQL >= 14.0
- Redis >= 6.0 (可选)
- 内存 >= 2GB
- 磁盘空间 >= 10GB

### Q: 如何快速开始？
**A:** 
```bash
# 1. 克隆项目
git clone https://github.com/creatoria/creatoria-saas-cli.git

# 2. 安装依赖
npm install

# 3. 配置环境
cp .env.example .env

# 4. 启动开发服务器
npm run start:dev

# 5. 访问API文档
open http://localhost:3000/api-docs
```

## 开发相关

### Q: 如何创建新模块？
**A:** 使用内置的CLI命令：
```bash
npm run module:create [module-name]
```
这会自动创建包含 module、entity、service、controller 和 DTO 的完整模块结构。

### Q: autoLoadEntities 是什么？如何工作？
**A:** `autoLoadEntities: true` 是 TypeORM 的配置，它会自动发现和加载所有通过 `TypeOrmModule.forFeature()` 注册的实体，无需手动在配置中列出所有实体。

```typescript
// 传统方式（不推荐）
TypeOrmModule.forRoot({
  entities: [User, Product, Order], // 需要手动添加
})

// 使用 autoLoadEntities（推荐）
TypeOrmModule.forRoot({
  autoLoadEntities: true, // 自动发现
})
```

### Q: 如何处理模块间的依赖？
**A:** 使用 NestJS 的模块导入和导出机制：
```typescript
// 导出服务
@Module({
  providers: [UserService],
  exports: [UserService], // 导出供其他模块使用
})
export class UserModule {}

// 导入使用
@Module({
  imports: [UserModule], // 导入模块
  providers: [OrderService],
})
export class OrderModule {}
```

### Q: 热重载不工作怎么办？
**A:** 
1. 确保使用 `npm run start:dev` 而不是 `npm start`
2. 检查 `nest-cli.json` 配置
3. 清理缓存: `rm -rf dist/`
4. 重启开发服务器

## 数据库相关

### Q: 为什么推荐使用 PostgreSQL？
**A:** 
- 强大的 JSON 支持
- 更好的并发控制
- 丰富的数据类型
- 优秀的性能和稳定性
- 完善的全文搜索功能

### Q: 如何处理数据库迁移？
**A:** 
```bash
# 生成迁移
npm run migration:generate -- -n MigrationName

# 运行迁移
npm run migration:run

# 回滚迁移
npm run migration:revert
```

### Q: synchronize: true 安全吗？
**A:** 
- **开发环境**: 可以使用，方便快速开发
- **生产环境**: **绝对不要使用**！应该使用迁移脚本
```typescript
synchronize: process.env.NODE_ENV === 'development'
```

### Q: 如何优化数据库查询？
**A:** 
1. 使用索引
2. 避免 N+1 查询问题
3. 使用查询构建器进行复杂查询
4. 启用查询缓存
```typescript
// 使用关联查询避免 N+1
const orders = await this.orderRepository.find({
  relations: ['user', 'items', 'items.product'],
});
```

## 模块系统

### Q: 什么是模块自包含原则？
**A:** 每个模块应该包含完整的功能实现，包括：
- 实体定义 (entities)
- 业务逻辑 (services)
- API接口 (controllers)
- 数据传输对象 (DTOs)
- 模块配置 (module)

### Q: 如何实现模块间通信？
**A:** 
1. **服务注入**: 直接导入和注入服务
2. **事件驱动**: 使用 EventEmitter
3. **消息队列**: 使用 RabbitMQ 等
```typescript
// 事件驱动示例
@Injectable()
export class OrderService {
  constructor(private eventEmitter: EventEmitter2) {}
  
  async createOrder() {
    // 创建订单后发布事件
    this.eventEmitter.emit('order.created', order);
  }
}
```

### Q: 如何处理大型模块？
**A:** 将大模块拆分为子模块：
```
order/
├── order.module.ts        # 主模块
├── order-core/           # 核心功能
├── order-payment/        # 支付子模块
└── order-shipping/       # 物流子模块
```

## 性能优化

### Q: 如何提高API响应速度？
**A:** 
1. 启用缓存
2. 优化数据库查询
3. 使用分页
4. 实现懒加载
5. 使用 CDN 加速静态资源

### Q: 当前性能指标如何？
**A:** 基于 2025-09-03 测试：
- 平均响应时间: 15ms
- 并发处理: ~650 req/s
- 内存占用: 125MB
- 启动时间: 3秒

### Q: 如何监控应用性能？
**A:** 
1. 使用内置健康检查: `/health`
2. 集成 APM 工具 (如 New Relic, DataDog)
3. 使用 PM2 监控
```bash
pm2 monit
```

## 部署运维

### Q: 推荐的部署方式是什么？
**A:** 
1. **开发/测试**: Docker Compose
2. **生产环境**: Kubernetes
3. **小型项目**: PM2 + Nginx

### Q: 如何实现零停机部署？
**A:** 
1. 使用蓝绿部署
2. 滚动更新 (Kubernetes)
3. PM2 reload 模式
```bash
pm2 reload creatoria
```

### Q: 需要多少服务器资源？
**A:** 最小配置：
- CPU: 2 核心
- 内存: 4GB
- 存储: 20GB SSD
- 带宽: 10Mbps

推荐配置：
- CPU: 4 核心
- 内存: 8GB
- 存储: 100GB SSD
- 带宽: 100Mbps

### Q: 如何备份数据？
**A:** 
```bash
# 数据库备份
pg_dump -U postgres creatoria_db > backup.sql

# 恢复数据库
psql -U postgres creatoria_db < backup.sql

# 定时备份
0 2 * * * pg_dump -U postgres creatoria_db > /backup/db-$(date +\%Y\%m\%d).sql
```

## 安全相关

### Q: 如何保护API安全？
**A:** 
1. 使用 JWT 认证
2. 实施 RBAC 权限控制
3. 启用 HTTPS
4. 实现 API 限流
5. 输入验证和清理
6. SQL 注入防护 (TypeORM 自动处理)

### Q: 密码是如何存储的？
**A:** 使用 bcrypt 进行哈希加密，不存储明文密码：
```typescript
const hashedPassword = await bcrypt.hash(password, 10);
```

### Q: 如何处理敏感配置？
**A:** 
1. 使用环境变量
2. 不要提交 `.env` 文件到代码库
3. 使用密钥管理服务 (生产环境)
4. 定期轮换密钥

### Q: 支持哪些认证方式？
**A:** 
- JWT Token (已实现基础)
- OAuth2 (计划中)
- SAML (企业版)
- LDAP/AD (企业版)

## 授权许可

### Q: 项目使用什么开源协议？
**A:** MIT License，可以自由使用、修改和分发。

### Q: 可以用于商业项目吗？
**A:** 是的，MIT 协议允许商业使用。

### Q: 是否提供商业支持？
**A:** 是的，提供：
- 技术咨询
- 定制开发
- 培训服务
- 7x24 技术支持

联系: support@creatoria.com

### Q: 如何贡献代码？
**A:** 
1. Fork 项目
2. 创建特性分支
3. 提交代码
4. 发起 Pull Request
5. 等待代码审查

## 其他问题

### Q: 与其他框架相比有什么优势？
**A:** 
- **vs Express**: 更完整的企业级架构
- **vs Spring Boot**: 更轻量，JavaScript 生态
- **vs Django**: 更好的 TypeScript 支持
- **vs Laravel**: 更适合微服务架构

### Q: 学习曲线如何？
**A:** 
- 熟悉 Node.js: 1-2 周上手
- 熟悉 NestJS: 2-3 天上手
- 新手: 3-4 周掌握基础

### Q: 有哪些学习资源？
**A:** 
- 官方文档: docs/
- API 文档: http://localhost:3000/api-docs
- 示例代码: examples/
- 视频教程: YouTube (计划中)
- 技术博客: blog.creatoria.com

### Q: 未来发展方向？
**A:** 
- 微服务架构支持
- AI 功能集成
- 低代码平台
- 云原生支持
- 国际化

### Q: 如何获取最新更新？
**A:** 
- GitHub: Watch & Star 项目
- Newsletter: 订阅邮件列表
- Discord: 加入社区
- Twitter: @CreatoriaSaaS

---

还有其他问题？请提交到 [GitHub Issues](https://github.com/creatoria/creatoria-saas-cli/issues) 或发送邮件至 support@creatoria.com

文档版本: 1.0.0  
更新日期: 2025-09-03  
作者: Creatoria Team