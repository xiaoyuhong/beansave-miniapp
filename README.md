# BeanSave 咖啡余量小程序

> 每天下午 3 点，半价精品咖啡等你来 ☕

基于 Taro 4 + React 18 + TypeScript + NutUI + Zustand 构建的微信小程序，包含 C 端用户和商家端功能。

---

## ✨ 功能特性

### C 端用户功能
- 🏠 **首页**: 倒计时、今日余量预览、店铺信息
- ☕ **点咖啡**: 商品列表、库存实时显示、温度选项
- 📦 **确认订单**: 数量选择、优惠券、限购提示
- 📋 **订单管理**: 待核销、已核销、已过期订单
- 👤 **个人中心**: 用户信息、优惠券、订单统计

### 商家端功能
- 📢 **发布余量**: 设置库存、折扣、温度选项
- 📱 **扫码核销**: 扫描用户二维码核销订单
- 📊 **今日统计**: 销售数据、商品排行
- 🛠️ **商家工具**: 批量操作、数据导出

---

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

详细步骤请查看 [快速开始指南](./docs/QUICK_START.md)

---

## 📦 技术栈

- **框架**: Taro 4.2.0
- **UI 库**: React 18 + NutUI
- **语言**: TypeScript 5.4
- **状态管理**: Zustand 4.5
- **样式**: SCSS + CSS Modules
- **构建工具**: Vite 4
- **代码规范**: ESLint + Prettier

---

## 📂 项目结构

```
beansave-miniapp/
├── src/
│   ├── api/              # API 接口层
│   │   ├── request.ts    # 统一请求封装（含错误处理）
│   │   ├── user.ts       # 用户相关接口
│   │   ├── product.ts    # 商品相关接口
│   │   ├── order.ts      # 订单相关接口
│   │   └── merchant.ts   # 商家相关接口
│   ├── store/            # Zustand 状态管理
│   │   ├── useUserStore.ts      # 用户状态（含持久化）
│   │   ├── useOrderStore.ts     # 订单状态（含持久化）
│   │   ├── useProductStore.ts   # 商品状态
│   │   └── useCouponStore.ts    # 优惠券状态（含持久化）
│   ├── pages/            # 页面组件
│   │   ├── login/        # 登录页
│   │   ├── home/         # 首页
│   │   ├── menu/         # 菜单页
│   │   ├── order-confirm/# 确认订单页
│   │   ├── orders/       # 订单列表页
│   │   ├── user/         # 个人中心
│   │   └── merchant/     # 商家端页面
│   ├── components/       # 公共组件
│   ├── mock/            # Mock 数据
│   ├── types/           # TypeScript 类型定义
│   ├── utils/           # 工具函数
│   └── assets/          # 静态资源
├── config/              # Taro 配置
├── docs/               # 项目文档
└── dist/               # 编译输出目录
```

---

## 📖 文档

- [📋 快速开始](./docs/QUICK_START.md) - 快速上手指南
- [📝 产品需求文档](./docs/PRD.md) - 完整的产品功能说明
- [🔧 开发指南](./docs/DEVELOPMENT.md) - 开发模式和常见问题
- [🔌 接口接入指南](./docs/API_INTEGRATION.md) - 如何接入真实后端
- [📡 接口规范文档](./docs/API_SPEC.md) - 后端接口详细规范
- [✅ 问题修复记录](./docs/FIXES.md) - 已修复的问题列表

---

## 🎯 开发模式

### Mock 模式（默认）
```bash
npm run dev:weapp
```
- ✅ 使用本地 Mock 数据
- ✅ 无需后端服务器
- ✅ 适合前端开发和演示

### 真实接口模式
```bash
npm run dev:weapp:real
```
- ⚠️ 需要配置真实 API 地址
- ⚠️ 需要后端服务器运行

详细说明请查看 [接口接入指南](./docs/API_INTEGRATION.md)

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

**切换方式**：在登录页点击"🛠 开发调试"区域的对应按钮

---

## ✅ 已完成功能

### P0 问题修复（全部完成）
- ✅ 订单状态持久化
- ✅ API 统一错误处理
- ✅ 库存扣减事务保护
- ✅ 类型安全问题修复

### 核心功能
- ✅ 用户登录（微信授权）
- ✅ 商品列表展示
- ✅ 订单创建和管理
- ✅ 商家发布余量
- ✅ 订单核销
- ✅ 数据持久化
- ✅ 状态管理
- ✅ 错误处理

---

## 📊 代码质量

```
✅ TypeScript 严格模式
✅ ESLint 代码检查
✅ Prettier 代码格式化
✅ 无 'as any' 类型断言
✅ 完整的类型定义
✅ 统一的错误处理
```

---

## 🔄 数据持久化

### 已持久化的数据
- ✅ 用户信息 (`bs_user_info`)
- ✅ Token (`bs_token`)
- ✅ 订单列表 (`bs_orders`)
- ✅ 优惠券 (`bs_coupons`)
- ✅ 今日发布数据 (`bs_today_publish`)

---

## 🚢 部署

### 开发环境
```bash
npm run dev:weapp
```

### 生产构建
```bash
npm run build:weapp:prod
```

### 上传到微信小程序
1. 使用微信开发者工具打开项目
2. 点击"上传"按钮
3. 填写版本号和备注
4. 提交审核

---

## 🔐 安全注意事项

### 开发环境
- Mock 模式下所有数据都是本地模拟
- 不会发送真实网络请求
- 数据存储在内存和 localStorage

### 生产环境
- ⚠️ Token 建议加密存储
- ⚠️ 限购逻辑必须后端校验
- ⚠️ 库存扣减需要分布式锁
- ⚠️ 核销码需要更安全的生成算法
- ⚠️ 订单过期应由后端定时任务处理

详细说明请查看 [接口接入指南](./docs/API_INTEGRATION.md)

---

## 📝 NPM 脚本

```bash
# 开发
npm run dev:weapp          # Mock 模式开发
npm run dev:weapp:real     # 真实接口模式开发
npm run dev:h5             # H5 开发

# 构建
npm run build:weapp        # 小程序构建
npm run build:weapp:prod   # 生产环境构建
npm run build:h5           # H5 构建

# 代码质量
npm run lint               # 代码检查
npm run lint:fix           # 自动修复
npm run format             # 代码格式化
```

---

## 🐛 问题反馈

遇到问题？
1. 查看 [开发指南](./docs/DEVELOPMENT.md) 的"常见问题"部分
2. 查看 [问题修复记录](./docs/FIXES.md)
3. 检查控制台错误信息
4. 清除缓存重新编译

---

## 📄 许可证

MIT License

---

## 🙏 致谢

- [Taro](https://taro-docs.jd.com/) - 多端统一开发框架
- [React](https://react.dev/) - 用户界面库
- [NutUI](https://nutui.jd.com/) - 京东风格的移动端组件库
- [Zustand](https://zustand-demo.pmnd.rs/) - 轻量级状态管理
- [微信小程序](https://developers.weixin.qq.com/miniprogram/dev/framework/) - 小程序平台

---

**Made with ☕ by BeanSave Team**
