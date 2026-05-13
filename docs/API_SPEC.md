# 后端接口规范文档

## 📋 基础信息

- **Base URL**: `https://api.beansave.com`
- **协议**: HTTPS
- **数据格式**: JSON
- **字符编码**: UTF-8

---

## 🔐 认证方式

### Token 认证

所有需要登录的接口都需要在请求头中携带 Token：

```http
Authorization: Bearer <token>
```

### Token 获取

通过 `/user/wx-login` 接口获取 Token

### Token 过期

- Token 有效期：7 天
- 过期后返回 401 错误码
- 前端自动跳转登录页

---

## 📡 通用响应格式

### 成功响应

```json
{
  "code": 0,
  "message": "success",
  "data": {
    // 业务数据
  }
}
```

### 失败响应

```json
{
  "code": 400,
  "message": "错误描述",
  "data": null
}
```

### 错误码

| 错误码 | 说明 | HTTP 状态码 |
|--------|------|-------------|
| 0 | 成功 | 200 |
| 400 | 参数错误 | 400 |
| 401 | 未登录/登录过期 | 401 |
| 403 | 无权限 | 403 |
| 404 | 资源不存在 | 404 |
| 500 | 服务器错误 | 500 |
| 1001 | 库存不足 | 200 |
| 1002 | 超过限购数量 | 200 |
| 1003 | 订单已过期 | 200 |
| 1004 | 核销码无效 | 200 |
| 1005 | 订单已核销 | 200 |

---

## 👤 用户模块

### 1. 微信登录

**接口**: `POST /user/wx-login`

**描述**: 通过微信 code 登录，返回用户信息和 Token

**请求参数**:
```json
{
  "code": "string"  // 微信登录凭证
}
```

**响应数据**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": "user_001",
    "openid": "oxxxxxxxxxxxxxx",
    "nickName": "咖啡爱好者",
    "avatarUrl": "https://...",
    "phone": "138****8888",
    "role": "user",  // user | admin
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**错误示例**:
```json
{
  "code": 400,
  "message": "无效的微信登录凭证",
  "data": null
}
```

---

### 2. 获取用户信息

**接口**: `GET /user/info`

**描述**: 获取当前登录用户信息

**请求头**:
```http
Authorization: Bearer <token>
```

**响应数据**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": "user_001",
    "openid": "oxxxxxxxxxxxxxx",
    "nickName": "咖啡爱好者",
    "avatarUrl": "https://...",
    "phone": "138****8888",
    "role": "user"
  }
}
```

---

### 3. 绑定手机号

**接口**: `POST /user/phone`

**描述**: 绑定用户手机号

**请求头**:
```http
Authorization: Bearer <token>
```

**请求参数**:
```json
{
  "encryptedData": "string",  // 微信加密数据
  "iv": "string"              // 加密算法的初始向量
}
```

**响应数据**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "phone": "13800138000"
  }
}
```

---

## ☕ 商品模块

### 4. 获取今日商品列表

**接口**: `GET /products/today`

**描述**: 获取今日余量咖啡列表

**请求头**:
```http
Authorization: Bearer <token>
```

**响应数据**:
```json
{
  "code": 0,
  "message": "success",
  "data": [
    {
      "id": "1",
      "name": "经典美式",
      "description": "醇厚顺滑，低卡选择",
      "originalPrice": 2200,      // 原价（分）
      "salePrice": 1100,          // 售价（分）
      "discount": 5,              // 折扣（5 = 5折）
      "tempOptions": ["正常冰", "少冰", "不加冰", "热"],
      "stock": 8,                 // 剩余库存
      "totalStock": 10,           // 今日总库存
      "imageUrl": "https://...",
      "isAvailable": true         // 是否可购买
    }
  ]
}
```

---

### 5. 获取商品详情

**接口**: `GET /products/:productId`

**描述**: 获取指定商品详情

**请求头**:
```http
Authorization: Bearer <token>
```

**路径参数**:
- `productId`: 商品 ID

**响应数据**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": "1",
    "name": "经典美式",
    "description": "醇厚顺滑，低卡选择",
    "originalPrice": 2200,
    "salePrice": 1100,
    "discount": 5,
    "tempOptions": ["正常冰", "少冰", "不加冰", "热"],
    "stock": 8,
    "totalStock": 10,
    "imageUrl": "https://...",
    "isAvailable": true
  }
}
```

---

## 📦 订单模块

### 6. 创建订单

**接口**: `POST /order/create`

**描述**: 创建咖啡订单

**请求头**:
```http
Authorization: Bearer <token>
```

**请求参数**:
```json
{
  "productId": "1",
  "quantity": 2,
  "tempOption": "正常冰",  // 可选
  "couponId": "coupon_001"  // 可选
}
```

**响应数据**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": "order_001",
    "orderNo": "BS20260513150000123",
    "userId": "user_001",
    "product": {
      "id": "1",
      "name": "经典美式",
      "salePrice": 1100,
      "imageUrl": "https://..."
    },
    "quantity": 2,
    "tempOption": "正常冰",
    "totalAmount": 2200,
    "status": "pending",  // pending | verified | expired
    "verifyCode": "VERIFY_BS20260513150000123",
    "createdAt": "2026-05-13T15:00:00.000Z",
    "expiredAt": "2026-05-13T20:00:00.000Z"
  }
}
```

**错误示例**:
```json
{
  "code": 1001,
  "message": "库存不足",
  "data": null
}
```

```json
{
  "code": 1002,
  "message": "今日已购买 3 杯，超过限购数量",
  "data": null
}
```

---

### 7. 获取订单列表

**接口**: `GET /order/list`

**描述**: 获取用户订单列表

**请求头**:
```http
Authorization: Bearer <token>
```

**查询参数**:
- `status`: 订单状态（可选）`pending` | `verified` | `expired`
- `page`: 页码（可选，默认 1）
- `pageSize`: 每页数量（可选，默认 20）

**请求示例**:
```
GET /order/list?status=pending&page=1&pageSize=10
```

**响应数据**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [
      {
        "id": "order_001",
        "orderNo": "BS20260513150000123",
        "userId": "user_001",
        "product": {
          "id": "1",
          "name": "经典美式",
          "salePrice": 1100,
          "imageUrl": "https://..."
        },
        "quantity": 2,
        "tempOption": "正常冰",
        "totalAmount": 2200,
        "status": "pending",
        "verifyCode": "VERIFY_BS20260513150000123",
        "createdAt": "2026-05-13T15:00:00.000Z",
        "expiredAt": "2026-05-13T20:00:00.000Z",
        "verifiedAt": null
      }
    ],
    "total": 10,
    "page": 1,
    "pageSize": 10
  }
}
```

---

### 8. 核销订单（商家）

**接口**: `POST /order/verify`

**描述**: 商家核销用户订单

**请求头**:
```http
Authorization: Bearer <token>
```

**请求参数**:
```json
{
  "verifyCode": "VERIFY_BS20260513150000123"
}
```

**响应数据**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": "order_001",
    "orderNo": "BS20260513150000123",
    "userId": "user_001",
    "product": {
      "id": "1",
      "name": "经典美式",
      "salePrice": 1100
    },
    "quantity": 2,
    "tempOption": "正常冰",
    "totalAmount": 2200,
    "status": "verified",
    "verifyCode": "VERIFY_BS20260513150000123",
    "createdAt": "2026-05-13T15:00:00.000Z",
    "expiredAt": "2026-05-13T20:00:00.000Z",
    "verifiedAt": "2026-05-13T16:30:00.000Z"
  }
}
```

**错误示例**:
```json
{
  "code": 1004,
  "message": "核销码无效",
  "data": null
}
```

```json
{
  "code": 1005,
  "message": "订单已核销",
  "data": null
}
```

```json
{
  "code": 1003,
  "message": "订单已过期",
  "data": null
}
```

---

## 🏪 商家模块

### 9. 发布今日余量

**接口**: `POST /merchant/publish`

**描述**: 商家发布今日余量咖啡

**请求头**:
```http
Authorization: Bearer <token>
```

**权限**: 仅商家（role = admin）可调用

**请求参数**:
```json
{
  "items": [
    {
      "productId": "1",
      "name": "经典美式",
      "originalPrice": 2200,
      "stock": 10,
      "discount": 5,
      "salePrice": 1100,
      "tempOptions": ["正常冰", "少冰", "不加冰", "热"]
    },
    {
      "productId": "2",
      "name": "拿铁",
      "originalPrice": 2800,
      "stock": 8,
      "discount": 5,
      "salePrice": 1400,
      "tempOptions": ["正常冰", "少冰", "不加冰", "热"]
    }
  ]
}
```

**响应数据**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "publishedAt": "2026-05-13T14:00:00.000Z",
    "totalStock": 18
  }
}
```

---

### 10. 获取今日已发布数据

**接口**: `GET /merchant/today-published`

**描述**: 获取今日已发布的余量数据

**请求头**:
```http
Authorization: Bearer <token>
```

**权限**: 仅商家（role = admin）可调用

**响应数据**:
```json
{
  "code": 0,
  "message": "success",
  "data": [
    {
      "productId": "1",
      "name": "经典美式",
      "originalPrice": 2200,
      "stock": 8,
      "discount": 5,
      "salePrice": 1100,
      "tempOptions": ["正常冰", "少冰", "不加冰", "热"]
    }
  ]
}
```

---

### 11. 今日统计数据

**接口**: `GET /statistics/today`

**描述**: 获取今日销售统计

**请求头**:
```http
Authorization: Bearer <token>
```

**权限**: 仅商家（role = admin）可调用

**响应数据**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "totalSold": 18,        // 售出杯数
    "totalAmount": 28600,   // 总金额（分）
    "ranking": [
      {
        "product": {
          "id": "2",
          "name": "拿铁",
          "imageUrl": "https://..."
        },
        "sold": 6
      },
      {
        "product": {
          "id": "1",
          "name": "经典美式",
          "imageUrl": "https://..."
        },
        "sold": 5
      }
    ]
  }
}
```

---

## 🎫 优惠券模块（可选）

### 12. 获取优惠券列表

**接口**: `GET /coupon/list`

**描述**: 获取用户优惠券列表

**请求头**:
```http
Authorization: Bearer <token>
```

**响应数据**:
```json
{
  "code": 0,
  "message": "success",
  "data": [
    {
      "id": "coupon_001",
      "type": "new_user",  // new_user | share
      "amount": 300,       // 优惠金额（分）
      "minAmount": 1000,   // 最低消费（分）
      "expiredAt": "2026-06-13T00:00:00.000Z",
      "isUsed": false
    }
  ]
}
```

---

## 🔔 通知模块（可选）

### 13. 订阅消息模板

**模板 ID**: 需要在微信公众平台配置

**场景**:
1. 余量上架提醒（每天 14:55）
2. 订单即将过期提醒（19:30）
3. 订单核销成功通知

---

## 📊 数据类型定义

### UserInfo
```typescript
interface UserInfo {
  id: string
  openid: string
  nickName: string
  avatarUrl: string
  phone?: string
  role: 'user' | 'admin'
  token: string
}
```

### Product
```typescript
interface Product {
  id: string
  name: string
  description: string
  originalPrice: number  // 分
  salePrice: number      // 分
  discount: number       // 1-9
  tempOptions: TempOption[]
  stock: number
  totalStock: number
  imageUrl: string
  isAvailable: boolean
}

type TempOption = '正常冰' | '少冰' | '不加冰' | '热'
```

### Order
```typescript
interface Order {
  id: string
  orderNo: string
  userId: string
  product: Product
  quantity: number
  tempOption?: TempOption
  totalAmount: number
  status: 'pending' | 'verified' | 'expired'
  verifyCode: string
  createdAt: string  // ISO 8601
  expiredAt: string  // ISO 8601
  verifiedAt?: string  // ISO 8601
}
```

---

## 🔒 安全建议

### 1. 接口限流
- 登录接口：同一 IP 每分钟最多 10 次
- 创建订单：同一用户每分钟最多 5 次
- 其他接口：同一用户每分钟最多 60 次

### 2. 数据校验
- 所有输入参数必须校验
- 价格、库存等关键数据必须后端计算
- 限购逻辑必须后端校验

### 3. 幂等性
- 创建订单接口需要支持幂等性
- 建议使用订单号或客户端生成的唯一 ID

### 4. 事务处理
- 创建订单时扣减库存必须在事务中
- 使用数据库锁或分布式锁防止超卖

### 5. 日志记录
- 记录所有关键操作日志
- 包含用户 ID、操作时间、操作内容、IP 地址

---

## 📝 开发建议

### 1. 接口版本管理
```
/v1/user/wx-login
/v2/user/wx-login
```

### 2. 分页规范
```json
{
  "page": 1,
  "pageSize": 20,
  "total": 100,
  "list": []
}
```

### 3. 时间格式
统一使用 ISO 8601 格式：`2026-05-13T15:00:00.000Z`

### 4. 金额单位
统一使用"分"作为单位，避免浮点数精度问题

### 5. 图片 URL
建议使用 CDN，支持参数裁剪：
```
https://cdn.beansave.com/images/coffee1.jpg?w=200&h=200
```

---

## 🧪 测试环境

- **测试地址**: `https://test-api.beansave.com`
- **测试账号**: 
  - 普通用户: `test_user_001`
  - 商家: `test_admin_001`
- **测试 Token**: 永不过期

---

## 📞 联系方式

如有接口问题，请联系后端开发团队。
