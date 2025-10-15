# Creatoria SaaS CLI - API 参考文档

## API 概览

基础 URL: `http://localhost:3000/api`  
Swagger 文档: `http://localhost:3000/api-docs`

认证方式: Bearer Token (JWT)

### 已测试验证的API (2025-09-03)
✅ 用户管理 CRUD API  
✅ 产品管理完整功能 API  
✅ 订单管理关联查询 API  
✅ 数据验证和错误处理  
✅ Swagger自动文档生成

## 认证相关 API

### 登录
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "password"
}
```

响应:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 604800,
    "user": {
      "id": "1",
      "username": "admin",
      "nickname": "管理员",
      "email": "admin@example.com"
    }
  }
}
```

### 刷新 Token
```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 登出
```http
POST /api/auth/logout
Authorization: Bearer {token}
```

## System 模块 API

### 用户管理

#### 获取用户列表
```http
GET /api/system/users?page=1&limit=10&keyword=admin
Authorization: Bearer {token}
```

响应:
```json
{
  "code": 200,
  "data": {
    "list": [
      {
        "id": "1",
        "username": "admin",
        "nickname": "管理员",
        "email": "admin@example.com",
        "mobile": "13800138000",
        "status": 1,
        "deptId": "1",
        "deptName": "技术部",
        "roleIds": ["1", "2"],
        "createTime": "2024-01-01T00:00:00Z"
      }
    ],
    "total": 100,
    "page": 1,
    "limit": 10
  }
}
```

#### 创建用户
```http
POST /api/system/users
Authorization: Bearer {token}
Content-Type: application/json

{
  "username": "user001",
  "password": "123456",
  "nickname": "测试用户",
  "email": "user@example.com",
  "mobile": "13900139000",
  "deptId": "1",
  "roleIds": ["2"],
  "status": 1
}
```

#### 更新用户
```http
PUT /api/system/users/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "nickname": "新昵称",
  "email": "newemail@example.com",
  "status": 1
}
```

#### 删除用户
```http
DELETE /api/system/users/{id}
Authorization: Bearer {token}
```

### 角色管理

#### 获取角色列表
```http
GET /api/system/roles
Authorization: Bearer {token}
```

#### 创建角色
```http
POST /api/system/roles
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "销售经理",
  "code": "sales_manager",
  "sort": 1,
  "status": 1,
  "menuIds": ["1", "2", "3"],
  "remark": "销售部门管理角色"
}
```

#### 分配权限
```http
PUT /api/system/roles/{id}/permissions
Authorization: Bearer {token}
Content-Type: application/json

{
  "menuIds": ["1", "2", "3", "4", "5"]
}
```

### 菜单管理

#### 获取菜单树
```http
GET /api/system/menus/tree
Authorization: Bearer {token}
```

响应:
```json
{
  "code": 200,
  "data": [
    {
      "id": "1",
      "name": "系统管理",
      "parentId": "0",
      "path": "/system",
      "component": "Layout",
      "icon": "system",
      "sort": 1,
      "visible": true,
      "children": [
        {
          "id": "2",
          "name": "用户管理",
          "parentId": "1",
          "path": "/system/user",
          "component": "system/user/index",
          "icon": "user",
          "sort": 1,
          "visible": true,
          "permissions": ["system:user:query", "system:user:create"]
        }
      ]
    }
  ]
}
```

## CRM 模块 API

### 客户管理

#### 获取客户列表
```http
GET /api/crm/customers?page=1&limit=10&name=&industry=&level=
Authorization: Bearer {token}
```

#### 创建客户
```http
POST /api/crm/customers
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "示例公司",
  "industry": "互联网",
  "level": "A",
  "source": "展会",
  "contactName": "张三",
  "contactMobile": "13800138000",
  "contactEmail": "contact@example.com",
  "address": "北京市朝阳区",
  "remark": "重要客户"
}
```

#### 转移客户
```http
POST /api/crm/customers/{id}/transfer
Authorization: Bearer {token}
Content-Type: application/json

{
  "newOwnerId": "2",
  "reason": "人员调整"
}
```

### 商机管理

#### 获取商机列表
```http
GET /api/crm/business?customerId=1&status=
Authorization: Bearer {token}
```

#### 创建商机
```http
POST /api/crm/business
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "ERP系统采购",
  "customerId": "1",
  "amount": 500000,
  "dealDate": "2024-12-31",
  "stage": "需求确认",
  "probability": 60,
  "remark": "客户有明确采购意向"
}
```

#### 更新商机阶段
```http
PUT /api/crm/business/{id}/stage
Authorization: Bearer {token}
Content-Type: application/json

{
  "stage": "商务谈判",
  "probability": 80,
  "remark": "价格基本谈妥"
}
```

### 合同管理

#### 创建合同
```http
POST /api/crm/contracts
Authorization: Bearer {token}
Content-Type: application/json

{
  "code": "HT202401001",
  "name": "软件采购合同",
  "customerId": "1",
  "businessId": "1",
  "amount": 500000,
  "startDate": "2024-01-01",
  "endDate": "2024-12-31",
  "signDate": "2024-01-01",
  "status": "履行中"
}
```

## ERP 模块 API

### 产品管理

#### 获取产品列表
```http
GET /api/erp/products?categoryId=&keyword=
Authorization: Bearer {token}
```

#### 创建产品
```http
POST /api/erp/products
Authorization: Bearer {token}
Content-Type: application/json

{
  "code": "P001",
  "name": "产品A",
  "categoryId": "1",
  "unitId": "1",
  "spec": "规格说明",
  "purchasePrice": 100,
  "salePrice": 150,
  "minStock": 10,
  "maxStock": 1000
}
```

### 采购管理

#### 创建采购订单
```http
POST /api/erp/purchase-orders
Authorization: Bearer {token}
Content-Type: application/json

{
  "code": "PO202401001",
  "supplierId": "1",
  "purchaseDate": "2024-01-01",
  "items": [
    {
      "productId": "1",
      "quantity": 100,
      "price": 100,
      "amount": 10000
    }
  ],
  "totalAmount": 10000,
  "remark": "常规采购"
}
```

#### 采购入库
```http
POST /api/erp/purchase-in
Authorization: Bearer {token}
Content-Type: application/json

{
  "purchaseOrderId": "1",
  "warehouseId": "1",
  "inDate": "2024-01-02",
  "items": [
    {
      "productId": "1",
      "quantity": 100
    }
  ]
}
```

### 销售管理

#### 创建销售订单
```http
POST /api/erp/sale-orders
Authorization: Bearer {token}
Content-Type: application/json

{
  "code": "SO202401001",
  "customerId": "1",
  "saleDate": "2024-01-01",
  "items": [
    {
      "productId": "1",
      "quantity": 10,
      "price": 150,
      "amount": 1500
    }
  ],
  "totalAmount": 1500
}
```

### 库存管理

#### 库存查询
```http
GET /api/erp/stocks?warehouseId=&productId=
Authorization: Bearer {token}
```

#### 库存盘点
```http
POST /api/erp/stock-check
Authorization: Bearer {token}
Content-Type: application/json

{
  "warehouseId": "1",
  "checkDate": "2024-01-01",
  "items": [
    {
      "productId": "1",
      "systemQuantity": 100,
      "actualQuantity": 98,
      "difference": -2
    }
  ]
}
```

## Mall 模块 API

### 商品管理

#### 获取商品列表
```http
GET /api/mall/products?categoryId=&brandId=&keyword=
Authorization: Bearer {token}
```

#### 创建商品
```http
POST /api/mall/products
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "iPhone 15",
  "categoryId": "1",
  "brandId": "1",
  "description": "商品描述",
  "mainImage": "https://example.com/image.jpg",
  "images": ["image1.jpg", "image2.jpg"],
  "skus": [
    {
      "properties": [
        {"name": "颜色", "value": "黑色"},
        {"name": "容量", "value": "128GB"}
      ],
      "price": 5999,
      "marketPrice": 6999,
      "costPrice": 4000,
      "stock": 100,
      "code": "SKU001"
    }
  ]
}
```

### 订单管理

#### 创建订单
```http
POST /api/mall/orders
Authorization: Bearer {token}
Content-Type: application/json

{
  "userId": "1",
  "items": [
    {
      "skuId": "1",
      "quantity": 1,
      "price": 5999
    }
  ],
  "address": {
    "name": "张三",
    "mobile": "13800138000",
    "province": "北京市",
    "city": "北京市",
    "district": "朝阳区",
    "detail": "某某街道1号"
  },
  "deliveryType": "express",
  "payType": "online",
  "remark": "请尽快发货"
}
```

#### 订单发货
```http
POST /api/mall/orders/{id}/deliver
Authorization: Bearer {token}
Content-Type: application/json

{
  "expressCompany": "顺丰速运",
  "expressNo": "SF1234567890"
}
```

### 购物车

#### 添加到购物车
```http
POST /api/mall/cart
Authorization: Bearer {token}
Content-Type: application/json

{
  "skuId": "1",
  "quantity": 2
}
```

#### 更新购物车数量
```http
PUT /api/mall/cart/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "quantity": 3
}
```

## BPM 模块 API

### 流程定义

#### 获取流程定义列表
```http
GET /api/bpm/process-definitions
Authorization: Bearer {token}
```

#### 部署流程
```http
POST /api/bpm/process-definitions/deploy
Authorization: Bearer {token}
Content-Type: multipart/form-data

file: process.bpmn20.xml
```

### 流程实例

#### 启动流程
```http
POST /api/bpm/process-instances
Authorization: Bearer {token}
Content-Type: application/json

{
  "processDefinitionKey": "leave",
  "businessKey": "LEAVE202401001",
  "variables": {
    "days": 3,
    "reason": "事假",
    "startDate": "2024-01-01",
    "endDate": "2024-01-03"
  }
}
```

#### 获取待办任务
```http
GET /api/bpm/tasks/todo
Authorization: Bearer {token}
```

#### 完成任务
```http
POST /api/bpm/tasks/{id}/complete
Authorization: Bearer {token}
Content-Type: application/json

{
  "approved": true,
  "comment": "同意",
  "variables": {
    "approver": "manager"
  }
}
```

## AI 模块 API

### 对话管理

#### 创建对话
```http
POST /api/ai/conversations
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "新对话",
  "model": "gpt-4",
  "roleId": "1"
}
```

#### 发送消息
```http
POST /api/ai/conversations/{id}/messages
Authorization: Bearer {token}
Content-Type: application/json

{
  "content": "你好，请介绍一下自己",
  "stream": false
}
```

响应:
```json
{
  "code": 200,
  "data": {
    "id": "1",
    "conversationId": "1",
    "role": "assistant",
    "content": "你好！我是AI助手，可以帮助你处理各种任务...",
    "model": "gpt-4",
    "tokens": {
      "prompt": 10,
      "completion": 50,
      "total": 60
    }
  }
}
```

### 图像生成

#### 生成图像
```http
POST /api/ai/images/generate
Authorization: Bearer {token}
Content-Type: application/json

{
  "prompt": "一只可爱的猫咪在花园里玩耍",
  "model": "dall-e-3",
  "size": "1024x1024",
  "quality": "standard",
  "n": 1
}
```

### 知识库

#### 上传文档
```http
POST /api/ai/knowledge/documents
Authorization: Bearer {token}
Content-Type: multipart/form-data

file: document.pdf
knowledgeBaseId: 1
```

#### 搜索知识库
```http
POST /api/ai/knowledge/search
Authorization: Bearer {token}
Content-Type: application/json

{
  "knowledgeBaseId": "1",
  "query": "如何使用系统",
  "topK": 5
}
```

## 通用响应格式

### 成功响应
```json
{
  "code": 200,
  "message": "success",
  "data": {
    // 响应数据
  }
}
```

### 错误响应
```json
{
  "code": 400,
  "message": "参数错误",
  "errors": [
    {
      "field": "email",
      "message": "邮箱格式不正确"
    }
  ]
}
```

### 分页响应
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "list": [],
    "total": 100,
    "page": 1,
    "limit": 10,
    "pages": 10
  }
}
```

## 错误代码

| 代码 | 说明 |
|------|------|
| 200 | 成功 |
| 400 | 请求参数错误 |
| 401 | 未认证 |
| 403 | 权限不足 |
| 404 | 资源不存在 |
| 409 | 资源冲突 |
| 422 | 参数验证失败 |
| 429 | 请求过于频繁 |
| 500 | 服务器错误 |
| 503 | 服务不可用 |

## WebSocket API

### 连接
```javascript
const socket = io('ws://localhost:3000', {
  auth: {
    token: 'Bearer {token}'
  }
});
```

### 订阅事件
```javascript
// 订阅通知
socket.on('notification', (data) => {
  console.log('收到通知:', data);
});

// 订阅实时数据
socket.on('data:update', (data) => {
  console.log('数据更新:', data);
});
```

### 发送消息
```javascript
// 加入房间
socket.emit('join', { room: 'user:1' });

// 发送消息
socket.emit('message', {
  to: 'user:2',
  content: 'Hello'
});
```

## 文件上传

### 单文件上传
```http
POST /api/upload/single
Authorization: Bearer {token}
Content-Type: multipart/form-data

file: file.jpg
```

### 多文件上传
```http
POST /api/upload/multiple
Authorization: Bearer {token}
Content-Type: multipart/form-data

files: file1.jpg
files: file2.jpg
```

### 大文件分片上传
```http
POST /api/upload/chunk
Authorization: Bearer {token}
Content-Type: multipart/form-data

file: chunk
chunkNumber: 1
totalChunks: 10
identifier: "file-unique-id"
```

## 导出功能

### 导出 Excel
```http
GET /api/system/users/export?format=excel
Authorization: Bearer {token}
```

### 导出 PDF
```http
GET /api/crm/contracts/{id}/export?format=pdf
Authorization: Bearer {token}
```

## 批量操作

### 批量删除
```http
DELETE /api/system/users/batch
Authorization: Bearer {token}
Content-Type: application/json

{
  "ids": ["1", "2", "3"]
}
```

### 批量更新
```http
PUT /api/system/users/batch
Authorization: Bearer {token}
Content-Type: application/json

{
  "ids": ["1", "2", "3"],
  "data": {
    "status": 0
  }
}
```

## 统计 API

### 获取统计数据
```http
GET /api/statistics/dashboard
Authorization: Bearer {token}
```

响应:
```json
{
  "code": 200,
  "data": {
    "users": {
      "total": 1000,
      "active": 800,
      "new": 50
    },
    "orders": {
      "total": 5000,
      "pending": 100,
      "completed": 4800
    },
    "revenue": {
      "today": 10000,
      "month": 300000,
      "year": 3600000
    },
    "charts": {
      "sales": [/* 图表数据 */],
      "users": [/* 图表数据 */]
    }
  }
}
```

## 系统监控 API

### 获取系统状态
```http
GET /api/monitor/system
Authorization: Bearer {token}
```

### 获取应用指标
```http
GET /api/monitor/metrics
Authorization: Bearer {token}
```

---

文档版本: 1.0.0
更新日期: 2025-01-02
作者: Creatoria Team