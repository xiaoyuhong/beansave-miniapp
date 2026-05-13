# Bugfix Requirements Document

## Introduction

OrderStore 缺少本地存储持久化机制，导致用户刷新小程序后订单数据全部丢失，同时存在接口数据覆盖本地数据的冲突问题。本次修复将实现订单数据持久化、设计合理的数据同步策略，确保数据一致性和用户体验。

**影响范围：** `src/store/useOrderStore.ts`

**问题严重性：** 高 - 直接影响用户体验，导致订单数据丢失

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN 用户刷新小程序 THEN 系统清空所有订单数据（内存中的 orders 数组被重置为空）

1.2 WHEN 用户创建新订单后立即调用 `getOrders()` 接口 THEN 系统用接口返回的数据覆盖本地数据，导致刚创建的新订单消失（因为接口可能还未同步）

1.3 WHEN 商家核销订单后用户查看订单列表 THEN 系统显示的订单状态仍为 "pending"（本地状态未更新，与服务端状态不一致）

1.4 WHEN 订单在服务端自动过期后 THEN 系统本地状态仍显示为 "pending"（本地状态不准确）

1.5 WHEN 用户登出后重新登录 THEN 系统仍保留上一个用户的订单数据（未清除本地存储）

### Expected Behavior (Correct)

2.1 WHEN 用户刷新小程序 THEN 系统应从本地存储恢复订单数据，保持用户的订单历史可见

2.2 WHEN 用户创建新订单后立即调用 `getOrders()` 接口 THEN 系统应合并本地新订单和接口返回的订单数据，保留所有订单（以订单 ID 去重，优先保留接口数据）

2.3 WHEN 商家核销订单后用户查看订单列表 THEN 系统应显示最新的 "verified" 状态（接口数据更新本地状态）

2.4 WHEN 订单在服务端自动过期后调用 `getOrders()` 接口 THEN 系统应将本地订单状态更新为 "expired"（接口数据同步到本地）

2.5 WHEN 用户登出 THEN 系统应清除本地存储中的订单数据，避免数据泄露

### Unchanged Behavior (Regression Prevention)

3.1 WHEN 用户调用 `addOrder()` 添加新订单 THEN 系统应继续将订单添加到 orders 数组的开头（保持现有行为）

3.2 WHEN 用户调用 `updateOrderStatus()` 更新订单状态 THEN 系统应继续更新对应订单的状态和 verifiedAt 字段（保持现有行为）

3.3 WHEN 用户调用 `getOrdersByStatus()` 筛选订单 THEN 系统应继续返回指定状态的订单列表（保持现有行为）

3.4 WHEN 用户在 UserStore 和 CouponStore 中使用持久化功能 THEN 系统应继续正常工作，不受 OrderStore 修改影响（保持现有行为）

3.5 WHEN 订单数据结构（Order 类型）保持不变 THEN 系统应继续正常序列化和反序列化订单数据（保持现有行为）
