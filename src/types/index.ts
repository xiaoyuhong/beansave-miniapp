// 用户角色
export type UserRole = 'user' | 'admin'

// 用户信息
export interface UserInfo {
  id: string
  openid: string
  nickName: string
  avatarUrl: string
  phone?: string
  role: UserRole
  token: string
}

// 温度选项
export type TempOption = '正常冰' | '少冰' | '不加冰' | '热'

// 咖啡商品
export interface Product {
  id: string
  name: string
  description: string
  originalPrice: number  // 原价（分）
  salePrice: number      // 实际售价（分，由商家设定折扣计算）
  discount: number       // 折扣（1~9，如 5 表示 5折）
  tempOptions: TempOption[]  // 可选温度，商家配置，空数组表示不限
  stock: number          // 剩余库存
  totalStock: number     // 今日总库存
  imageUrl: string
  isAvailable: boolean   // 是否可购买（15:00后且有库存）
}

// 订单状态
export type OrderStatus = 'pending' | 'verified' | 'expired'

// 订单
export interface Order {
  id: string
  orderNo: string        // 订单号
  userId: string
  product: Product
  quantity: number       // 购买数量
  tempOption?: TempOption // 用户选择的温度
  totalAmount: number    // 实付金额（分）
  status: OrderStatus
  verifyCode: string     // 核销码（用于生成二维码）
  createdAt: string      // ISO string
  expiredAt: string      // 过期时间（当日 20:00）
  verifiedAt?: string    // 核销时间
}

// 优惠券类型
export type CouponType = 'new_user' | 'share'

// 优惠券
export interface Coupon {
  id: string
  type: CouponType
  amount: number         // 优惠金额（分）
  minAmount: number      // 最低消费（分）
  expiredAt: string
  isUsed: boolean
}

// API 响应格式
export interface ApiResponse<T> {
  code: number
  message: string
  data: T
}
