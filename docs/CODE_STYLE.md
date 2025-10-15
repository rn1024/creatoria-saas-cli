# 代码注释规范

## TSDoc/JSDoc 标准

### 类注释

```typescript
/**
 * 用户服务类
 * 处理用户相关的业务逻辑
 * 
 * @class UserService
 * @module User
 * @since 1.0.0
 */
@Injectable()
export class UserService {
  // ...
}
```

### 方法注释

```typescript
/**
 * 创建新用户
 * 
 * @param {CreateUserDto} dto - 用户创建数据
 * @param {string} dto.email - 用户邮箱
 * @param {string} dto.password - 用户密码
 * @returns {Promise<User>} 创建的用户对象
 * @throws {ConflictException} 当邮箱已存在时
 * @throws {BadRequestException} 当数据验证失败时
 * 
 * @example
 * const user = await userService.createUser({
 *   email: 'user@example.com',
 *   password: 'secure123'
 * });
 */
async createUser(dto: CreateUserDto): Promise<User> {
  // ...
}
```

### 属性注释

```typescript
/**
 * 用户ID
 * @readonly
 * @type {string}
 */
readonly id: string;

/**
 * 缓存过期时间（秒）
 * @default 3600
 * @type {number}
 */
private readonly cacheTTL: number = 3600;
```

### 接口注释

```typescript
/**
 * 用户数据接口
 * @interface IUser
 */
export interface IUser {
  /**
   * 用户唯一标识
   */
  id: string;
  
  /**
   * 用户邮箱地址
   */
  email: string;
  
  /**
   * 用户创建时间
   */
  createdAt: Date;
}
```

### 枚举注释

```typescript
/**
 * 用户角色枚举
 * @enum {string}
 */
export enum UserRole {
  /** 管理员 */
  ADMIN = 'admin',
  /** 普通用户 */
  USER = 'user',
  /** 访客 */
  GUEST = 'guest'
}
```

## 注释标签参考

| 标签 | 用途 | 示例 |
|------|------|------|
| `@param` | 参数说明 | `@param {string} name - 用户名` |
| `@returns` | 返回值说明 | `@returns {Promise<User>}` |
| `@throws` | 异常说明 | `@throws {Error} 错误描述` |
| `@deprecated` | 废弃标记 | `@deprecated 使用 newMethod 代替` |
| `@since` | 版本信息 | `@since 1.0.0` |
| `@example` | 使用示例 | `@example ...` |
| `@see` | 参考链接 | `@see {@link UserController}` |
| `@todo` | 待办事项 | `@todo 实现缓存逻辑` |
| `@async` | 异步方法 | `@async` |
| `@static` | 静态方法 | `@static` |
| `@override` | 重写方法 | `@override` |
| `@readonly` | 只读属性 | `@readonly` |
| `@private` | 私有成员 | `@private` |
| `@protected` | 受保护成员 | `@protected` |
| `@public` | 公共成员 | `@public` |

## 文件头注释

```typescript
/**
 * @file 用户服务实现
 * @module user
 * @author Creatoria Team
 * @copyright 2024 Creatoria
 * @license MIT
 */
```

## TODO 注释

```typescript
// TODO: 实现缓存逻辑
// FIXME: 修复并发问题
// HACK: 临时解决方案，需要重构
// NOTE: 注意这里的性能影响
// OPTIMIZE: 可以优化的地方
// WARNING: 不要修改这个值
```

## 最佳实践

1. **必须注释的内容**
   - 所有公共 API
   - 复杂的业务逻辑
   - 非显而易见的代码
   - 正则表达式
   - 魔法数字和常量

2. **避免注释的内容**
   - 显而易见的代码
   - 冗余的描述
   - 注释掉的代码（应该删除）

3. **注释质量**
   - 解释"为什么"而不是"什么"
   - 保持注释与代码同步
   - 使用完整的句子
   - 避免缩写

## 自动生成文档

使用 TypeDoc 生成文档：

```bash
# 安装 TypeDoc
npm install --save-dev typedoc

# 生成文档
npx typedoc --out docs/api src

# 配置文件 typedoc.json
{
  "entryPoints": ["src/main.ts"],
  "out": "docs/api",
  "theme": "default",
  "includeVersion": true,
  "excludePrivate": true
}
```