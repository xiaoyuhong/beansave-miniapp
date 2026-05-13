# 问题排查指南

## 🐛 网络请求错误：ERR_CONNECTION_CLOSED

### 问题描述
```
POST https://api.beansave.com/user/wx-login net::ERR_CONNECTION_CLOSED
```

### 原因分析
虽然代码中有 `IS_MOCK` 判断，但仍然看到网络请求错误。可能的原因：

1. **编译缓存问题** - 旧的编译文件还在使用
2. **微信开发者工具缓存** - 工具缓存了旧代码
3. **配置未生效** - defineConstants 未正确传递
4. **仅是日志显示** - 实际未发送请求，只是工具记录

---

## ✅ 解决方案

### 方案 1: 完全清除缓存并重新编译（推荐）

#### 步骤 1: 停止开发服务器
在终端按 `Ctrl + C` 停止 `npm run dev:weapp`

#### 步骤 2: 删除编译文件
```bash
cd /Users/yuhongxiao/Downloads/MyReact/beansave-miniapp
rm -rf dist
rm -rf node_modules/.vite
```

#### 步骤 3: 重新编译
```bash
npm run dev:weapp
```

#### 步骤 4: 清除微信开发者工具缓存
1. 打开微信开发者工具
2. 点击菜单 `工具` → `清除缓存`
3. 选择 `清除全部缓存`
4. 点击 `清除`

#### 步骤 5: 重新编译项目
在微信开发者工具中点击 `编译` 按钮

#### 步骤 6: 查看控制台日志
打开 `调试器` → `Console`，应该看到：
```
[Request] 配置信息: {
  BASE_URL: "http://localhost:3000",
  APP_ENV: "development",
  IS_MOCK: true,
  NODE_ENV: "development"
}
```

如果看到 `IS_MOCK: true`，说明 Mock 模式已正确启用。

---

### 方案 2: 检查功能是否正常

即使看到网络错误，如果功能正常，可以忽略该错误。

#### 测试步骤：

1. **测试登录**
   - 在登录页点击 "👤 普通用户登录"
   - 查看控制台日志：
     ```
     [wxLogin] 调用登录接口: {code: "mock_code", mockRole: "user", IS_MOCK: true}
     [wxLogin] 使用 Mock 数据
     [wxLogin] Mock 登录成功: {id: "user_001", ...}
     ```
   - 如果能成功跳转到首页，说明 Mock 模式工作正常

2. **测试下单**
   - 浏览商品列表
   - 选择商品下单
   - 查看订单列表
   - 如果能正常下单，说明功能正常

3. **测试商家功能**
   - 在登录页点击 "🏪 商家登录"
   - 发布余量
   - 如果能正常发布，说明功能正常

#### 结论：
如果所有功能都正常，那么网络错误只是微信开发者工具的日志显示问题，**可以安全忽略**。

---

### 方案 3: 验证配置是否正确

#### 检查 1: 查看编译后的代码
```bash
# 查看编译后的 app.js
cat dist/app.js | grep "API_BASE_URL"
```

应该看到类似：
```javascript
API_BASE_URL: "http://localhost:3000"
```

#### 检查 2: 查看控制台日志
在微信开发者工具的控制台中，应该看到：
```
BeanSave App launched.
[Request] 配置信息: {BASE_URL: "http://localhost:3000", APP_ENV: "development", IS_MOCK: true}
```

#### 检查 3: 测试登录流程
点击登录按钮，控制台应该显示：
```
[wxLogin] 调用登录接口: {code: "mock_code", mockRole: "user", IS_MOCK: true}
[wxLogin] 使用 Mock 数据
[wxLogin] Mock 登录成功: {...}
```

如果看到 `[wxLogin] 使用 Mock 数据`，说明 Mock 模式正常工作。

---

### 方案 4: 手动验证 IS_MOCK 值

在 `src/pages/login/index.tsx` 中添加临时调试代码：

```typescript
export default function Login() {
  // 添加这行
  console.log('[Login] IS_MOCK 状态:', { APP_ENV, IS_MOCK: APP_ENV === 'development' })
  
  // ... 其他代码
}
```

重新编译后，控制台应该显示：
```
[Login] IS_MOCK 状态: {APP_ENV: "development", IS_MOCK: true}
```

---

## 🔍 深入排查

### 如果 IS_MOCK 为 false

说明环境变量配置有问题，检查：

#### 1. 检查 config/index.ts
```typescript
defineConstants: {
  APP_ENV: JSON.stringify(process.env.NODE_ENV === 'production'
    ? 'production'
    : 'development')  // 确保这里是 'development'
}
```

#### 2. 检查 package.json 脚本
```json
{
  "scripts": {
    "dev:weapp": "taro build --type weapp --watch"
    // 不要有 NODE_ENV=production
  }
}
```

#### 3. 检查环境变量
```bash
# 在终端执行
echo $NODE_ENV
# 应该输出空或 development，不应该是 production
```

如果输出 `production`，执行：
```bash
unset NODE_ENV
npm run dev:weapp
```

---

### 如果 IS_MOCK 为 true 但仍然发送请求

这种情况很少见，可能是：

#### 1. 代码逻辑问题
检查 `src/api/user.ts` 中的 `wxLogin` 函数：
```typescript
export async function wxLogin(...) {
  console.log('[wxLogin] IS_MOCK:', IS_MOCK)  // 添加日志
  
  if (IS_MOCK) {
    // 应该进入这里
    console.log('[wxLogin] 使用 Mock')
    await delay(800)
    return mockRole === 'admin' ? MOCK_ADMIN : MOCK_USER
  }
  
  // 不应该执行到这里
  console.log('[wxLogin] 调用真实接口')
  return request(...)
}
```

#### 2. 多个 IS_MOCK 定义
搜索项目中是否有多个 `IS_MOCK` 定义：
```bash
grep -r "IS_MOCK" src/
```

确保只在 `src/api/request.ts` 中定义一次。

---

## 📊 调试日志说明

### 正常的日志流程

#### 1. 应用启动
```
BeanSave App launched.
[App] 未登录，跳转登录页
```

#### 2. 请求配置
```
[Request] 配置信息: {
  BASE_URL: "http://localhost:3000",
  APP_ENV: "development",
  IS_MOCK: true,
  NODE_ENV: "development"
}
```

#### 3. 登录流程
```
[wxLogin] 调用登录接口: {code: "mock_code", mockRole: "user", IS_MOCK: true}
[wxLogin] 使用 Mock 数据
[wxLogin] Mock 登录成功: {id: "user_001", nickName: "咖啡爱好者", ...}
[App] 登录态已恢复
```

### 异常的日志流程

#### 如果看到这个，说明有问题：
```
[wxLogin] 调用登录接口: {code: "mock_code", mockRole: "user", IS_MOCK: false}
[wxLogin] 调用真实接口
[Request] 发起请求: {url: "https://api.beansave.com/user/wx-login", ...}
POST https://api.beansave.com/user/wx-login net::ERR_CONNECTION_CLOSED
```

这说明 `IS_MOCK` 被错误地设置为 `false`。

---

## 🎯 最终确认

### 成功的标志

1. ✅ 控制台显示 `IS_MOCK: true`
2. ✅ 登录日志显示 `[wxLogin] 使用 Mock 数据`
3. ✅ 能成功登录并跳转
4. ✅ 能浏览商品、下单、查看订单
5. ✅ 商家能发布余量

### 可以忽略的错误

如果满足以上所有条件，但仍然看到网络错误日志，**可以安全忽略**。这只是微信开发者工具的日志显示问题，不影响实际功能。

---

## 🔧 临时禁用调试日志

如果调试完成，想要移除日志：

### 1. 移除 request.ts 中的日志
```typescript
// 删除这些行
console.log('[Request] 配置信息:', ...)
console.log('[Request] 发起请求:', ...)
console.log('[Request] 请求失败:', ...)
```

### 2. 移除 user.ts 中的日志
```typescript
// 删除这些行
console.log('[wxLogin] 调用登录接口:', ...)
console.log('[wxLogin] 使用 Mock 数据')
console.log('[wxLogin] Mock 登录成功:', ...)
console.log('[wxLogin] 调用真实接口')
```

### 3. 重新编译
```bash
npm run dev:weapp
```

---

## 📞 仍然无法解决？

### 最后的手段：完全重置

```bash
# 1. 停止开发服务器
# Ctrl + C

# 2. 删除所有缓存和编译文件
rm -rf dist
rm -rf node_modules/.vite
rm -rf node_modules/.cache

# 3. 重新安装依赖（可选）
rm -rf node_modules
npm install

# 4. 重新编译
npm run dev:weapp

# 5. 在微信开发者工具中
# - 关闭项目
# - 清除缓存
# - 重新打开项目
# - 点击编译
```

---

## 📝 总结

### 核心要点

1. **Mock 模式是默认启用的**
   - `APP_ENV === 'development'` 时自动启用
   - 所有 API 调用都会被拦截

2. **网络错误不一定是真的错误**
   - 可能只是微信开发者工具的日志显示
   - 关键是看功能是否正常

3. **清除缓存很重要**
   - 修改配置后必须清除缓存
   - 包括编译缓存和工具缓存

4. **查看控制台日志**
   - 日志会明确显示是否使用 Mock
   - `IS_MOCK: true` 是关键标志

### 快速检查清单

- [ ] 停止开发服务器
- [ ] 删除 dist 目录
- [ ] 重新编译
- [ ] 清除微信开发者工具缓存
- [ ] 查看控制台日志确认 `IS_MOCK: true`
- [ ] 测试登录功能
- [ ] 如果功能正常，忽略网络错误日志

---

**如果按照以上步骤操作后功能正常，就可以放心开发了！** ☕
