# 命令参考

## 全局选项

| 选项 | 简写 | 描述 |
|------|------|------|
| `--help` | `-h` | 显示帮助信息 |
| `--version` | `-v` | 显示版本号 |
| `--verbose` | | 详细输出模式 |
| `--quiet` | `-q` | 静默模式 |

## create - 创建项目

```bash
cra create <project-name> [options]
```

| 选项 | 描述 | 默认值 |
|------|------|--------|
| `--skip-install` | 跳过依赖安装 | false |
| `--template <name>` | 使用指定模板 | default |
| `--db-host <host>` | 数据库主机 | localhost |
| `--db-port <port>` | 数据库端口 | 5432 |

**示例：**
```bash
cra create my-app --skip-install
```

## init - 初始化项目

```bash
cra init [options]
```

| 选项 | 描述 | 默认值 |
|------|------|--------|
| `--force` | 强制重新初始化 | false |
| `--skip-install` | 跳过依赖安装 | false |
| `--skip-db` | 跳过数据库初始化 | false |

**示例：**
```bash
cra init --force
```

## module - 模块管理

### module add
```bash
cra module add <module-name> [options]
```

| 选项 | 描述 | 默认值 |
|------|------|--------|
| `--source <url>` | 模块源地址 | registry |
| `--version <ver>` | 指定版本 | latest |
| `--skip-install` | 跳过依赖安装 | false |
| `--force` | 强制覆盖 | false |

### module list
```bash
cra module list [options]
```

| 选项 | 描述 |
|------|------|
| `--json` | JSON格式输出 |
| `--detailed` | 显示详细信息 |

### module remove
```bash
cra module remove <module-name> [options]
```

| 选项 | 描述 |
|------|------|
| `--force` | 强制删除 |
| `--keep-data` | 保留数据 |

### module info
```bash
cra module info <module-name>
```

## config - 配置管理

### config show
```bash
cra config show [options]
```

| 选项 | 描述 |
|------|------|
| `--json` | JSON格式输出 |
| `--env` | 显示环境变量 |

### config get
```bash
cra config get <key>
```

### config set
```bash
cra config set <key> --value <value>
```

### config validate
```bash
cra config validate
```

### config export
```bash
cra config export --output <file>
```

### config import
```bash
cra config import --input <file>
```

## database - 数据库管理

### db migrate
```bash
cra db migrate [options]
```

| 选项 | 描述 |
|------|------|
| `--run` | 执行迁移 |
| `--revert` | 回滚迁移 |
| `--generate <name>` | 生成迁移 |

### db seed
```bash
cra db seed [options]
```

| 选项 | 描述 |
|------|------|
| `--run` | 执行种子数据 |
| `--class <name>` | 指定种子类 |

## build - 构建项目

```bash
cra build [options]
```

| 选项 | 描述 | 默认值 |
|------|------|--------|
| `--watch` | 监视模式 | false |
| `--production` | 生产构建 | false |
| `--analyze` | 分析包大小 | false |

## test - 测试命令

```bash
cra test [options]
```

| 选项 | 描述 |
|------|------|
| `--watch` | 监视模式 |
| `--coverage` | 生成覆盖率 |
| `--unit` | 仅单元测试 |
| `--e2e` | 仅E2E测试 |

## start - 启动服务

```bash
cra start [options]
```

| 选项 | 描述 | 默认值 |
|------|------|--------|
| `--dev` | 开发模式 | false |
| `--prod` | 生产模式 | false |
| `--port <port>` | 指定端口 | 3000 |
| `--host <host>` | 指定主机 | localhost |

## 高级用法

### 管道命令
```bash
# 导出配置并备份
cra config export --output - | gzip > config.json.gz
```

### 批量操作
```bash
# 批量添加模块
for module in auth cache logger; do
  cra module add $module
done
```

### 环境切换
```bash
# 使用不同环境配置
NODE_ENV=production cra start --prod
```

## 快捷键

在交互模式下可用：

| 快捷键 | 功能 |
|--------|------|
| `Ctrl+C` | 退出 |
| `Tab` | 自动补全 |
| `↑/↓` | 历史命令 |
| `Ctrl+L` | 清屏 |