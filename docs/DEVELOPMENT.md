# 开发指南

## 🚀 快速开始

### 1. 安装依赖
```bash
npm install
```

### 2. 启动开发服务器
```bash
npm run dev:weapp
```

### 3. 打开微信开发者工具
- 导入项目目录
- 选择 `dist` 作为小程序根目录
- AppID: `wx66e3ce0d3b19ffd5`

---

## 🔧 开发模式说明

### Mock 模式（当前默认）
项目默认使用 **Mock 模式**，所有数据都是本地模拟数据，不需要真实后端服务器。

**特点**:
- ✅ 无需后端服务器
- ✅ 数据存储在内存和 localStorage
- ✅ 适合前端开发和演示
- ⚠️ 刷新后部分数据会重置（已持久化的除外）

**判断条件**:
```typescript
const IS_MOCK = APP_ENV === 'development'
```

当 `NODE_ENV !== 'production'` 时，自动启用 Mock 模式。

---

## 🐛 常见问题

### 1. 网络请求错误 `ERR_CONNECTION_CLOSED`

**错误信息**:
```
POST https://api.beansave.com/user/wx-login net::ERR_CONNECTION_CLOSED
```

**原因**: 
- 虽然代码中有 Mock 判断，但某些情况下可能绕过了判断
- 或者是微信开发者工具的网络请求日志显示（实际未执行）

**解决方案**:
1. **确认 Mock 模式已启用**
   - 检查控制台是否有 `BeanSave App launched.` 日志
   - 登录页面应该显示 "🛠 开发调试" 区域

2. **清除缓存重新编译**
   ```bash
   # 停止开发服务器
   # 删除 dist 目录
   rm -rf dist
   # 重新启动
   npm run dev:weapp
   ```

3. **检查微信开发者工具设置**
   - 打开 `详情` → `本地设置`
   - 确保 "不校验合法域名" 已勾选
   - 关闭 "使用真机调试" 模式

4. **忽略该错误**
   - 如果功能正常（能登录、能下单），可以忽略该错误
   - 这可能只是微信开发者工具的日志显示问题

---

### 2. `webapi_getwxaasyncsecinfo:fail` 错误

**原因**: 微信开发者工具的内部问题

**解决方案**:
- 更新微信开发者工具到最新版本
- 或者忽略该错误（不影响功能）

---

### 3. 订单数据丢失

**已修复**: 订单数据现在会持久化到 localStorage

如果仍然丢失，检查：
- 是否清除了浏览器缓存
- 是否在不同的微信开发者工具实例中打开

---

### 4. 库存不更新

**已修复**: 创建订单时会自动扣减库存

如果仍然不更新：
- 刷新页面重新加载商品列表
- 检查控制台是否有错误

---

## 📱 测试账号

### 普通用户
- 昵称: 咖啡爱好者
- ID: user_001
- 功能: 浏览商品、下单、查看订单

### 商家账号
- 昵称: 店长
- ID: admin_001
- 功能: 发布余量、核销订单、查看统计

**切换方式**:
在登录页面点击 "🛠 开发调试" 区域的对应按钮

---

## 🔄 数据持久化

### 已持久化的数据
- ✅ 用户信息 (`bs_user_info`)
- ✅ Token (`bs_token`)
- ✅ 订单列表 (`bs_orders`)
- ✅ 优惠券 (`bs_coupons`)
- ✅ 今日发布数据 (`bs_today_publish`)

### 未持久化的数据（刷新会重置）
- ⚠️ 商品库存（存储在 `MOCK_PRODUCTS` 内存中）
- ⚠️ 商家统计数据

---

## 🏗️ 项目结构

```
src/
├── api/              # API 接口层
│   ├── request.ts    # 统一请求封装（含错误处理）
│   ├── user.ts       # 用户相关 API
│   ├── product.ts    # 商品相关 API
│   ├── order.ts      # 订单相关 API
│   └── merchant.ts   # 商家相关 API
├── store/            # 状态管理（Zustand）
│   ├── useUserStore.ts
│   ├── useOrderStore.ts
│   ├── useProductStore.ts
│   └── useCouponStore.ts
├── pages/            # 页面组件
│   ├── login/        # 登录页
│   ├── home/         # 首页
│   ├── menu/         # 菜单页
│   ├── order-confirm/# 确认订单页
│   ├── orders/       # 订单列表页
│   ├── user/         # 个人中心
│   └── merchant/     # 商家端页面
├── components/       # 公共组件
├── mock/            # Mock 数据
├── types/           # TypeScript 类型定义
└── utils/           # 工具函数
```

---

## 🚢 生产环境部署

### 1. 配置真实 API 地址
修改 `config/index.ts`:
```typescript
API_BASE_URL: JSON.stringify(process.env.NODE_ENV === 'production'
  ? 'https://your-real-api.com'  // 替换为真实 API 地址
  : 'http://localhost:3000')
```

### 2. 关闭 Mock 模式
确保生产环境 `NODE_ENV === 'production'`

### 3. 构建生产版本
```bash
npm run build:weapp
```

### 4. 上传到微信小程序后台
- 打开微信开发者工具
- 点击 "上传"
- 填写版本号和备注
- 提交审核

---

## ⚠️ 注意事项

### 开发环境
- Mock 模式下所有 API 调用都不会发送真实网络请求
- 如果看到网络错误日志，但功能正常，可以忽略
- 数据存储在内存和 localStorage，清除缓存会丢失

### 生产环境
- 必须配置真实后端 API
- 需要实现以下后端接口：
  - `POST /user/wx-login` - 微信登录
  - `GET /products/today` - 获取今日商品
  - `POST /order/create` - 创建订单
  - `GET /order/list` - 获取订单列表
  - `POST /order/verify` - 核销订单
  - `POST /merchant/publish` - 发布余量
  - `GET /merchant/today-published` - 获取今日发布
  - `GET /statistics/today` - 今日统计

### 安全性
- Token 存储在 localStorage（生产环境建议加密）
- 限购逻辑需要后端校验
- 核销码需要更安全的生成算法
- 库存扣减需要后端实现分布式锁

---

## 📚 相关文档

- [PRD 产品需求文档](./PRD.md)
- [FIXES 问题修复记录](./FIXES.md)
- [Taro 官方文档](https://taro-docs.jd.com/)
- [微信小程序文档](https://developers.weixin.qq.com/miniprogram/dev/framework/)

---

## 🆘 获取帮助

如果遇到问题：
1. 检查控制台错误信息
2. 查看本文档的"常见问题"部分
3. 查看 `docs/FIXES.md` 了解已修复的问题
4. 清除缓存重新编译
