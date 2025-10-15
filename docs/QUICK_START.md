# 快速开始指南

## 系统要求

- Node.js >= 16.0.0
- npm >= 7.0.0
- PostgreSQL >= 12 (可选)
- Redis >= 6 (可选)

## 安装 CLI

```bash
# 全局安装
npm install -g creatoria-saas-cli

# 或使用 yarn
yarn global add creatoria-saas-cli

# 验证安装
creatoria-saas --version
```

## 创建第一个项目

### 1. 创建项目

```bash
creatoria-saas create my-app
cd my-app
```

### 2. 初始化配置

```bash
# 基础初始化
creatoria-saas init

# 跳过依赖安装
creatoria-saas init --skip-install
```

### 3. 配置数据库（可选）

编辑 `.env` 文件：

```env
DB_HOST=localhost
DB_PORT=5432
DB_DATABASE=my_app_db
DB_USERNAME=postgres
DB_PASSWORD=your_password
```

### 4. 启动项目

```bash
# 开发模式
npm run start:dev

# 生产模式
npm run build
npm run start:prod
```

## 常用命令

### 模块管理

```bash
# 添加模块
creatoria-saas module add auth

# 列出模块
creatoria-saas module list

# 移除模块
creatoria-saas module remove auth
```

### 配置管理

```bash
# 查看配置
creatoria-saas config show

# 设置配置
creatoria-saas config set app.port 3001

# 验证配置
creatoria-saas config validate
```

## 项目结构

```
my-app/
├── src/                 # 源代码
│   ├── modules/        # 模块目录
│   ├── common/         # 公共组件
│   └── main.ts        # 入口文件
├── modules/            # 动态模块
├── config/            # 配置文件
├── .creatoria/        # CLI配置
├── .env              # 环境变量
└── package.json      # 项目配置
```

## 下一步

- 📖 阅读[完整文档](../README.md)
- 🔧 学习[配置管理](CONFIG.md)
- 📦 了解[模块系统](MODULES.md)
- 🚀 查看[部署指南](DEPLOYMENT.md)

## 获取帮助

```bash
# 查看帮助
creatoria-saas --help

# 查看命令帮助
creatoria-saas <command> --help

# 示例
creatoria-saas module --help
```

## 常见问题

**Q: 如何更改默认端口？**
```bash
creatoria-saas config set app.port 8080
```

**Q: 如何使用自定义模块源？**
```bash
creatoria-saas module add my-module --source https://github.com/user/module
```

**Q: 如何重置项目配置？**
```bash
creatoria-saas init --force
```