# Creatoria SaaS CLI 文档中心

欢迎使用 Creatoria SaaS CLI！这是一个功能强大的企业级 SaaS 平台解决方案。

## 📚 文档导航

### 核心文档

- **[功能介绍](./FEATURES.md)** - 了解平台的所有功能特性
- **[使用教程](./TUTORIAL.md)** - 从零开始学习如何使用平台
- **[API 参考](./API_REFERENCE.md)** - 完整的 API 接口文档

### 架构文档

- **[架构概览](./architecture/ARCHITECTURE.md)** - 系统整体架构设计
- **[模块设计](./architecture/modules/)** - 各业务模块详细设计
- **[技术栈](./architecture/TECH_STACK.md)** - 使用的技术和工具

### 部署文档

- **[快速部署](./deployment/QUICK_START.md)** - 5分钟快速部署指南
- **[生产部署](./deployment/PRODUCTION.md)** - 生产环境部署最佳实践
- **[Docker 部署](./deployment/DOCKER.md)** - 容器化部署方案
- **[Kubernetes 部署](./deployment/K8S.md)** - K8s 集群部署指南

### 开发文档

- **[开发指南](./development/GUIDE.md)** - 开发环境搭建和规范
- **[模块开发](./development/MODULE.md)** - 如何开发自定义模块
- **[API 开发](./development/API.md)** - RESTful API 开发指南
- **[测试指南](./development/TESTING.md)** - 单元测试和集成测试

## 🚀 快速开始

### 1. 环境要求

- Node.js >= 20.0.0
- PostgreSQL >= 14.0
- Redis >= 6.0
- Git >= 2.0

### 2. 安装步骤

```bash
# 克隆项目
git clone https://github.com/creatoria/@creatoria/cli.git
cd creatoria-saas-cli

# 安装依赖
npm install

# 配置环境
cp .env.example .env
# 编辑 .env 文件配置数据库等信息

# 初始化数据库
npm run db:migrate
npm run db:seed

# 安装模块
npm run module:install

# 启动服务
npm run start:dev
```

### 3. 访问服务

- API 文档: http://localhost:3000/api-docs
- 健康检查: http://localhost:3000/health
- 默认账号: admin / admin123

## 🏗️ 系统架构

```
┌─────────────────────────────────────────────────────┐
│                    前端应用层                         │
│         (Web App / Mobile App / Mini Program)        │
└─────────────────────────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────┐
│                    API 网关层                         │
│              (Nginx / Kong / Traefik)                │
└─────────────────────────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────┐
│                 Creatoria SaaS CLI                   │
│  ┌─────────────────────────────────────────────┐   │
│  │            动态模块加载引擎                    │   │
│  └─────────────────────────────────────────────┘   │
│  ┌──────┬──────┬──────┬──────┬──────┬──────┐     │
│  │System│ CRM  │ ERP  │ Mall │ BPM  │  AI  │     │
│  └──────┴──────┴──────┴──────┴──────┴──────┘     │
└─────────────────────────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────┐
│                    数据存储层                         │
│     PostgreSQL │ Redis │ RabbitMQ │ MinIO          │
└─────────────────────────────────────────────────────┘
```

## 📦 核心模块

### System 系统管理
- 用户、角色、权限管理
- 组织架构管理
- 系统配置管理
- 日志审计

### CRM 客户关系管理
- 客户管理
- 商机跟踪
- 合同管理
- 数据分析

### ERP 企业资源计划
- 产品管理
- 采购销售
- 库存管理
- 财务管理

### Mall 电商系统
- 商品管理
- 订单处理
- 营销活动
- 会员体系

### BPM 流程管理
- 流程设计
- 审批流转
- 表单引擎
- 流程监控

### AI 人工智能
- AI 对话
- 图像生成
- 知识库
- 智能分析

## 🛠️ 技术栈

- **后端框架**: NestJS 11 + TypeScript 5
- **数据库**: PostgreSQL + TypeORM
- **缓存**: Redis
- **消息队列**: RabbitMQ
- **认证**: JWT + Passport
- **API 文档**: Swagger
- **容器化**: Docker + Docker Compose
- **进程管理**: PM2

## 📊 性能指标

- ✅ 支持 10万+ 用户并发
- ✅ 毫秒级响应时间
- ✅ 99.99% 服务可用性
- ✅ 水平扩展能力
- ✅ 完整的监控体系

## 🔒 安全特性

- JWT Token 认证
- RBAC 权限控制
- 数据加密存储
- SQL 注入防护
- XSS/CSRF 防护
- 访问频率限制
- 操作审计日志

## 🤝 参与贡献

我们欢迎所有形式的贡献！

### 贡献方式

1. 🐛 提交 Bug 报告
2. 💡 提出新功能建议
3. 📝 改进文档
4. 🔧 提交代码修复
5. ⭐ Star 项目支持

### 贡献流程

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 开源协议

本项目采用 [MIT License](../LICENSE) 开源协议。

## 🆘 获取帮助

### 官方资源
- 📖 [官方文档](https://docs.creatoria.com)
- 🔍 [API 文档](http://localhost:3000/api-docs)
- 💬 [GitHub Issues](https://github.com/creatoria/@creatoria/cli/issues)

### 社区支持
- Discord: [加入社区](https://discord.gg/creatoria)
- 论坛: [访问论坛](https://forum.creatoria.com)
- QQ群: 123456789

### 商业支持
- 📧 邮箱: support@creatoria.com
- 📱 电话: +86-xxx-xxxx-xxxx
- 🏢 企业版: [了解更多](https://creatoria.com/enterprise)

## 🌟 Star History

[![Star History Chart](https://api.star-history.com/svg?repos=creatoria/@creatoria/cli&type=Date)](https://star-history.com/#creatoria/@creatoria/cli&Date)

## 👥 贡献者

感谢所有为项目做出贡献的开发者！

<!-- ALL-CONTRIBUTORS-LIST:START -->
<!-- ALL-CONTRIBUTORS-LIST:END -->

## 📈 项目状态

![GitHub stars](https://img.shields.io/github/stars/creatoria/@creatoria/cli?style=social)
![GitHub forks](https://img.shields.io/github/forks/creatoria/@creatoria/cli?style=social)
![GitHub issues](https://img.shields.io/github/issues/creatoria/@creatoria/cli)
![GitHub license](https://img.shields.io/github/license/creatoria/@creatoria/cli)
![GitHub release](https://img.shields.io/github/v/release/creatoria/@creatoria/cli)

---

<p align="center">
  Made with ❤️ by Creatoria Team
  <br>
  Copyright © 2024 Creatoria. All rights reserved.
</p>