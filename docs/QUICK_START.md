# 快速开始指南

## 📦 安装依赖

```bash
npm install
```

---

## 🚀 启动项目

### Mock 模式（默认，推荐开发使用）
```bash
npm run dev:weapp
```
- ✅ 使用本地 Mock 数据
- ✅ 无需后端服务器
- ✅ 适合前端开发和演示

### 真实接口模式（需要后端支持）
```bash
# 1. 先安装 cross-env
npm install

# 2. 启动真实接口模式
npm run dev:weapp:real
```
- ⚠️ 需要配置真实 API 地址
- ⚠️ 需要后端服务器运行

### 生产构建
```bash
npm run build:weapp:prod
```

---

## 🔧 配置说明

### 当前配置（Mock 模式）
```typescript
// config/index.ts
defineConstants: {
  API_BASE_URL: 'http://localhost:3000',  // Mock 模式下不会真正调用
  APP_ENV: 'development',
  ENABLE_MOCK: 'true'  // 启用 Mock
}
```

### 切换到真实接口

#### 方法 1: 修改配置文件（推荐）
```typescript
// config/index.ts
defineConstants: {
  API_BASE_URL: JSON.stringify(
    process.env.API_BASE_URL || 
    'https://your-api-domain.com'  // 改为你的真实 API 地址
  ),
  APP_ENV: JSON.stringify(process.env.NODE_ENV || 'development'),
  ENABLE_MOCK: JSON.stringify(
    process.env.ENABLE_MOCK === 'true' || false  // 改为 false
  )
}
```

#### 方法 2: 使用环境变量
```bash
# 创建 .env 文件
ENABLE_MOCK=false
API_BASE_URL=https://your-api-domain.com

# 启动
npm run dev:weapp:real
```

---

## 📱 微信开发者工具配置

### 1. 导入项目
- 打开微信开发者工具
- 选择"导入项目"
- 项目目录：选择本项目根目录
- AppID：`wx66e3ce0d3b19ffd5`（或使用测试号）

### 2. 设置编译目录
- 点击"详情"
- "本地设置" → "编译目录"
- 选择 `dist` 目录

### 3. 开发设置
- ✅ 勾选"不校验合法域名"
- ✅ 勾选"不校验 TLS 版本"
- ✅ 勾选"不校验 HTTPS 证书"

---

## 🧪 测试账号

### Mock 模式下的测试账号

#### 普通用户
- 昵称：咖啡爱好者
- ID：user_001
- 功能：浏览商品、下单、查看订单

#### 商家账号
- 昵称：店长
- ID：admin_001
- 功能：发布余量、核销订单、查看统计

**切换方式**：在登录页点击对应的按钮

---

## 📂 项目结构

```
beansave-miniapp/
├── src/
│   ├── api/              # API 接口层
│   │   ├── request.ts    # 统一请求封装
│   │   ├── user.ts       # 用户接口
│   │   ├── product.ts    # 商品接口
│   │   ├── order.ts      # 订单接口
│   │   └── merchant.ts   # 商家接口
│   ├── store/            # 状态管理
│   ├── pages/            # 页面组件
│   ├── components/       # 公共组件
│   ├── mock/            # Mock 数据
│   ├── types/           # TypeScript 类型
│   └── utils/           # 工具函数
├── config/              # 配置文件
├── docs/               # 文档
│   ├── PRD.md          # 产品需求文档
│   ├── FIXES.md        # 问题修复记录
│   ├── DEVELOPMENT.md  # 开发指南
│   ├── API_INTEGRATION.md  # 接口接入指南
│   ├── API_SPEC.md     # 接口规范文档
│   └── QUICK_START.md  # 快速开始（本文档）
└── dist/               # 编译输出目录
```

---

## 🔍 常见问题

### Q1: 启动后看到网络错误？
**A**: 如果功能正常（能登录、能下单），可以忽略。这是微信开发者工具的日志显示问题。

### Q2: 如何切换用户角色？
**A**: 在登录页面点击"🛠 开发调试"区域的对应按钮。

### Q3: 订单数据丢失了？
**A**: 已修复，订单数据会持久化到 localStorage。如果仍然丢失，检查是否清除了缓存。

### Q4: 如何接入真实后端？
**A**: 查看 [API_INTEGRATION.md](./API_INTEGRATION.md) 详细说明。

### Q5: 需要安装 cross-env 吗？
**A**: 如果要使用 `npm run dev:weapp:real` 命令，需要安装。已在 package.json 中配置，运行 `npm install` 即可。

---

## 📚 相关文档

- [PRD 产品需求文档](./PRD.md) - 了解产品功能
- [DEVELOPMENT.md](./DEVELOPMENT.md) - 开发指南和常见问题
- [API_INTEGRATION.md](./API_INTEGRATION.md) - 真实接口接入指南
- [API_SPEC.md](./API_SPEC.md) - 后端接口规范
- [FIXES.md](./FIXES.md) - 已修复的问题记录

---

## 🎯 下一步

1. ✅ 启动项目：`npm run dev:weapp`
2. ✅ 打开微信开发者工具
3. ✅ 测试登录功能
4. ✅ 测试下单流程
5. ✅ 测试商家功能

---

## 💡 开发建议

### Mock 模式开发流程
1. 使用 Mock 模式完成前端开发
2. 测试所有功能和交互
3. 准备好后端接口文档（API_SPEC.md）
4. 后端开发完成后，逐步切换到真实接口

### 真实接口接入流程
1. 阅读 [API_INTEGRATION.md](./API_INTEGRATION.md)
2. 配置环境变量
3. 逐个接口测试
4. 全面回归测试
5. 上线部署

---

## 🆘 获取帮助

遇到问题？
1. 查看 [DEVELOPMENT.md](./DEVELOPMENT.md) 的"常见问题"部分
2. 查看 [FIXES.md](./FIXES.md) 了解已修复的问题
3. 检查控制台错误信息
4. 清除缓存重新编译

---

**祝开发顺利！☕**
