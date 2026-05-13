# 真实接口接入指南

## 📋 目录
1. [接入步骤](#接入步骤)
2. [环境配置](#环境配置)
3. [接口规范](#接口规范)
4. [逐步迁移方案](#逐步迁移方案)
5. [测试验证](#测试验证)

---

## 🚀 接入步骤

### 第一步：配置环境变量

#### 1.1 创建环境配置文件

在项目根目录创建 `.env` 文件（不要提交到 Git）：

```bash
# .env.development (开发环境)
NODE_ENV=development
API_BASE_URL=http://localhost:3000
ENABLE_MOCK=true

# .env.production (生产环境)
NODE_ENV=production
API_BASE_URL=https://api.beansave.com
ENABLE_MOCK=false
```

#### 1.2 更新 config/index.ts

```typescript
import { defineConfig } from '@tarojs/cli'
import path from 'path'

export default defineConfig<'vite'>({
  // ... 其他配置
  defineConstants: {
    API_BASE_URL: JSON.stringify(
      process.env.API_BASE_URL || 
      (process.env.NODE_ENV === 'production'
        ? 'https://api.beansave.com'
        : 'http://localhost:3000')
    ),
    APP_ENV: JSON.stringify(process.env.NODE_ENV || 'development'),
    // 新增：是否启用 Mock（可以独立控制）
    ENABLE_MOCK: JSON.stringify(
      process.env.ENABLE_MOCK === 'true' || 
      process.env.NODE_ENV === 'development'
    )
  },
  // ... 其他配置
})
```

---

### 第二步：更新 API 请求层

#### 2.1 修改 src/api/request.ts

```typescript
import Taro from '@tarojs/taro'
import { ApiResponse } from '@/types'
import { useUserStore } from '@/store/useUserStore'

const BASE_URL = API_BASE_URL

// 是否启用 Mock（可以通过环境变量控制）
export const IS_MOCK = ENABLE_MOCK === 'true'

// 请求超时时间（毫秒）
const REQUEST_TIMEOUT = 10000

export async function request<T>(
  url: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
    data?: Record<string, unknown>
    timeout?: number
  } = {}
): Promise<T> {
  const { method = 'GET', data, timeout = REQUEST_TIMEOUT } = options
  const token = useUserStore.getState().token

  try {
    const res = await Taro.request<ApiResponse<T>>({
      url: `${BASE_URL}${url}`,
      method,
      data,
      timeout,
      header: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    })

    // 处理 HTTP 状态码错误
    if (res.statusCode === 401 || res.statusCode === 403) {
      useUserStore.getState().logout()
      Taro.showToast({ title: '登录已过期，请重新登录', icon: 'none' })
      setTimeout(() => {
        Taro.reLaunch({ url: '/pages/login/index' })
      }, 1500)
      throw new Error('登录已过期')
    }

    if (res.statusCode === 404) {
      throw new Error('请求的资源不存在')
    }

    if (res.statusCode === 500) {
      throw new Error('服务器错误，请稍后重试')
    }

    if (res.statusCode !== 200) {
      throw new Error(`网络错误 (${res.statusCode})`)
    }

    // 处理业务错误码
    const body = res.data
    if (body.code !== 0) {
      if (body.code === 401) {
        useUserStore.getState().logout()
        Taro.showToast({ title: '登录已过期，请重新登录', icon: 'none' })
        setTimeout(() => {
          Taro.reLaunch({ url: '/pages/login/index' })
        }, 1500)
      }
      throw new Error(body.message || '请求失败')
    }

    return body.data
  } catch (error: any) {
    // 网络异常处理
    if (error.errMsg) {
      if (error.errMsg.includes('timeout')) {
        throw new Error('网络请求超时，请检查网络连接')
      }
      if (error.errMsg.includes('fail')) {
        throw new Error('网络连接失败，请检查网络设置')
      }
    }
    throw error
  }
}

export { IS_MOCK }
```

---

### 第三步：逐个接口迁移

#### 3.1 用户接口 (src/api/user.ts)

```typescript
import { UserInfo } from '@/types'
import { request, IS_MOCK } from './request'
import { MOCK_USER, MOCK_ADMIN } from '@/mock/data'

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// 微信登录
export async function wxLogin(code: string, mockRole: 'user' | 'admin' = 'user'): Promise<UserInfo> {
  if (IS_MOCK) {
    await delay(800)
    return mockRole === 'admin' ? MOCK_ADMIN : MOCK_USER
  }
  
  // 真实接口调用
  return request<UserInfo>('/user/wx-login', {
    method: 'POST',
    data: { code }
  })
}

// 获取手机号
export async function bindPhone(encryptedData: string, iv: string): Promise<{ phone: string }> {
  if (IS_MOCK) {
    await delay(500)
    return { phone: '138****8888' }
  }
  
  // 真实接口调用
  return request<{ phone: string }>('/user/phone', {
    method: 'POST',
    data: { encryptedData, iv }
  })
}

// 获取用户信息
export async function getUserInfo(): Promise<UserInfo> {
  if (IS_MOCK) {
    await delay(300)
    const userInfo = useUserStore.getState().userInfo
    if (!userInfo) throw new Error('未登录')
    return userInfo
  }
  
  // 真实接口调用
  return request<UserInfo>('/user/info')
}
```

#### 3.2 商品接口 (src/api/product.ts)

```typescript
import { Product } from '@/types'
import { request, IS_MOCK } from './request'
import { MOCK_PRODUCTS } from '@/mock/data'
import dayjs from 'dayjs'

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// 判断当前是否在售卖时间
export function isSaleTime(): boolean {
  const now = dayjs()
  const start = dayjs().hour(0).minute(0).second(0)
  const end = dayjs().hour(23).minute(59).second(59)
  return now.isAfter(start) && now.isBefore(end)
}

// 获取今日余量列表
export async function getTodayProducts(): Promise<Product[]> {
  if (IS_MOCK) {
    await delay(600)
    const available = isSaleTime()
    return MOCK_PRODUCTS.map((p) => ({ ...p, isAvailable: available && p.stock > 0 }))
  }
  
  // 真实接口调用
  return request<Product[]>('/products/today')
}

// 获取商品详情
export async function getProductDetail(productId: string): Promise<Product> {
  if (IS_MOCK) {
    await delay(400)
    const product = MOCK_PRODUCTS.find(p => p.id === productId)
    if (!product) throw new Error('商品不存在')
    return product
  }
  
  // 真实接口调用
  return request<Product>(`/products/${productId}`)
}
```

#### 3.3 订单接口 (src/api/order.ts)

保持现有的 Mock 逻辑，真实接口部分已经正确实现。

#### 3.4 商家接口 (src/api/merchant.ts)

保持现有的 Mock 逻辑，真实接口部分已经正确实现。

---

## 🔧 环境配置

### 开发环境（Mock 模式）

```bash
# 启动开发服务器
npm run dev:weapp

# 环境变量
NODE_ENV=development
ENABLE_MOCK=true
API_BASE_URL=http://localhost:3000  # 不会真正调用
```

### 测试环境（真实接口）

```bash
# 1. 修改 package.json 添加测试命令
"scripts": {
  "dev:weapp": "taro build --type weapp --watch",
  "dev:weapp:real": "cross-env ENABLE_MOCK=false taro build --type weapp --watch",
  "build:weapp": "taro build --type weapp"
}

# 2. 安装 cross-env（跨平台环境变量）
npm install --save-dev cross-env

# 3. 启动真实接口模式
npm run dev:weapp:real
```

### 生产环境

```bash
# 构建生产版本
npm run build:weapp

# 环境变量
NODE_ENV=production
ENABLE_MOCK=false
API_BASE_URL=https://api.beansave.com
```

---

## 📡 接口规范

### 请求格式

所有接口统一使用 JSON 格式：

```typescript
// 请求头
{
  "Content-Type": "application/json",
  "Authorization": "Bearer <token>"  // 需要登录的接口
}

// 请求体
{
  // 具体参数
}
```

### 响应格式

```typescript
interface ApiResponse<T> {
  code: number      // 0 表示成功，其他表示失败
  message: string   // 错误信息
  data: T          // 业务数据
}

// 成功示例
{
  "code": 0,
  "message": "success",
  "data": {
    // 具体数据
  }
}

// 失败示例
{
  "code": 400,
  "message": "参数错误",
  "data": null
}
```

### 错误码规范

| 错误码 | 说明 | 前端处理 |
|--------|------|----------|
| 0 | 成功 | 正常处理 |
| 400 | 参数错误 | 提示用户 |
| 401 | 未登录/登录过期 | 跳转登录页 |
| 403 | 无权限 | 提示用户 |
| 404 | 资源不存在 | 提示用户 |
| 500 | 服务器错误 | 提示用户稍后重试 |
| 1001 | 库存不足 | 提示用户 |
| 1002 | 超过限购数量 | 提示用户 |
| 1003 | 订单已过期 | 提示用户 |

---

## 🔄 逐步迁移方案

### 方案 1: 全量切换（推荐用于测试环境）

```bash
# 1. 确保后端接口已部署
# 2. 修改环境变量
ENABLE_MOCK=false
API_BASE_URL=https://test-api.beansave.com

# 3. 重新编译
npm run dev:weapp:real

# 4. 全面测试所有功能
```

### 方案 2: 逐个接口切换（推荐用于生产环境）

#### 步骤 1: 创建接口开关配置

```typescript
// src/config/api-switch.ts
export const API_SWITCH = {
  user: {
    wxLogin: false,      // false = Mock, true = 真实接口
    bindPhone: false,
    getUserInfo: false
  },
  product: {
    getTodayProducts: false,
    getProductDetail: false
  },
  order: {
    createOrder: false,
    getOrders: false,
    verifyOrder: false
  },
  merchant: {
    publishProducts: false,
    getTodayPublished: false,
    getTodayStats: false
  }
}
```

#### 步骤 2: 修改 API 调用逻辑

```typescript
// src/api/user.ts
import { API_SWITCH } from '@/config/api-switch'

export async function wxLogin(code: string, mockRole: 'user' | 'admin' = 'user'): Promise<UserInfo> {
  // 优先检查接口开关，其次检查全局 Mock 开关
  const useMock = !API_SWITCH.user.wxLogin || IS_MOCK
  
  if (useMock) {
    await delay(800)
    return mockRole === 'admin' ? MOCK_ADMIN : MOCK_USER
  }
  
  return request<UserInfo>('/user/wx-login', {
    method: 'POST',
    data: { code }
  })
}
```

#### 步骤 3: 逐个开启接口

```typescript
// 第一批：用户相关接口
export const API_SWITCH = {
  user: {
    wxLogin: true,       // ✅ 已切换
    bindPhone: true,     // ✅ 已切换
    getUserInfo: true    // ✅ 已切换
  },
  // 其他保持 false
}

// 测试通过后，继续下一批
// 第二批：商品相关接口
// 第三批：订单相关接口
// 第四批：商家相关接口
```

### 方案 3: 混合模式（开发调试）

```typescript
// src/api/request.ts
export const IS_MOCK = (() => {
  // 1. 检查 URL 参数（方便调试）
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search)
    if (params.get('mock') === 'true') return true
    if (params.get('mock') === 'false') return false
  }
  
  // 2. 检查环境变量
  if (ENABLE_MOCK === 'true') return true
  if (ENABLE_MOCK === 'false') return false
  
  // 3. 默认根据环境判断
  return APP_ENV === 'development'
})()
```

---

## ✅ 测试验证

### 测试清单

#### 1. 用户模块
- [ ] 微信登录（普通用户）
- [ ] 微信登录（商家）
- [ ] 获取用户信息
- [ ] 绑定手机号
- [ ] 退出登录

#### 2. 商品模块
- [ ] 获取今日商品列表
- [ ] 商品详情
- [ ] 库存实时更新
- [ ] 售卖时间判断

#### 3. 订单模块
- [ ] 创建订单
- [ ] 获取订单列表
- [ ] 订单状态更新
- [ ] 订单过期处理
- [ ] 核销订单（商家）

#### 4. 商家模块
- [ ] 发布余量
- [ ] 修改余量
- [ ] 获取今日发布数据
- [ ] 今日统计数据

#### 5. 边界情况
- [ ] 网络超时
- [ ] Token 过期
- [ ] 库存不足
- [ ] 超过限购
- [ ] 并发下单

### 测试脚本

```bash
# 1. Mock 模式测试
npm run dev:weapp
# 测试所有功能

# 2. 真实接口测试
npm run dev:weapp:real
# 测试所有功能

# 3. 生产构建测试
npm run build:weapp
# 上传到微信小程序后台测试
```

---

## 🔐 安全注意事项

### 1. Token 管理
```typescript
// 生产环境建议加密存储
import CryptoJS from 'crypto-js'

const SECRET_KEY = 'your-secret-key'

export function saveToken(token: string) {
  const encrypted = CryptoJS.AES.encrypt(token, SECRET_KEY).toString()
  saveStorage(KEYS.TOKEN, encrypted)
}

export function loadToken(): string | null {
  const encrypted = loadStorage<string>(KEYS.TOKEN)
  if (!encrypted) return null
  const decrypted = CryptoJS.AES.decrypt(encrypted, SECRET_KEY)
  return decrypted.toString(CryptoJS.enc.Utf8)
}
```

### 2. 请求签名
```typescript
// 防止接口被恶意调用
export async function request<T>(url: string, options: any): Promise<T> {
  const timestamp = Date.now()
  const nonce = Math.random().toString(36).substring(2)
  const sign = generateSign({ ...options.data, timestamp, nonce })
  
  return Taro.request({
    // ...
    header: {
      'X-Timestamp': timestamp,
      'X-Nonce': nonce,
      'X-Sign': sign
    }
  })
}
```

### 3. 敏感数据加密
```typescript
// 手机号等敏感信息加密传输
export async function bindPhone(phone: string): Promise<void> {
  const encrypted = encryptData(phone)
  return request('/user/phone', {
    method: 'POST',
    data: { phone: encrypted }
  })
}
```

---

## 📚 后端接口文档

### 完整接口列表

详见 [API_SPEC.md](./API_SPEC.md)（需要创建）

---

## 🆘 常见问题

### Q1: 如何快速切换 Mock 和真实接口？

**A**: 使用环境变量
```bash
# Mock 模式
npm run dev:weapp

# 真实接口模式
npm run dev:weapp:real
```

### Q2: 部分接口用 Mock，部分用真实接口？

**A**: 使用接口开关配置（方案 2）

### Q3: 如何调试真实接口？

**A**: 
1. 使用微信开发者工具的网络面板
2. 在 `request.ts` 中添加日志
3. 使用抓包工具（Charles、Fiddler）

### Q4: 真实接口返回格式不一致怎么办？

**A**: 在 `request.ts` 中添加适配层
```typescript
export async function request<T>(url: string, options: any): Promise<T> {
  const res = await Taro.request(...)
  
  // 适配不同的响应格式
  if (res.data.success !== undefined) {
    // 格式 1: { success: true, result: {} }
    return res.data.result
  } else if (res.data.code !== undefined) {
    // 格式 2: { code: 0, data: {} }
    return res.data.data
  }
  
  return res.data
}
```

---

## 📝 总结

接入真实接口的关键步骤：
1. ✅ 配置环境变量
2. ✅ 更新 API 请求层
3. ✅ 逐个接口迁移测试
4. ✅ 全面测试验证
5. ✅ 上线监控

建议采用**逐步迁移**的方式，确保每个接口都经过充分测试后再切换下一个。
