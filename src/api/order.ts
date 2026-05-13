import { Order, OrderStatus, TempOption } from '@/types'
import { request, IS_MOCK } from './request'
import { MOCK_ORDERS, MOCK_PRODUCTS } from '@/mock/data'
import { useUserStore } from '@/store/useUserStore'
import dayjs from 'dayjs'

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// 模拟订单库（内存中）
let mockOrders = [...MOCK_ORDERS]

// 创建订单
export async function createOrder(params: {
  productId: string
  quantity: number
  couponId?: string
  tempOption?: TempOption
}): Promise<Order> {
  if (IS_MOCK) {
    await delay(1000)
    const product = MOCK_PRODUCTS.find((p) => p.id === params.productId)
    if (!product) throw new Error('商品不存在')
    if (product.stock < params.quantity) throw new Error('库存不足')

    // 扣减库存（事务保护）
    const productIndex = MOCK_PRODUCTS.findIndex((p) => p.id === params.productId)
    if (productIndex !== -1) {
      MOCK_PRODUCTS[productIndex].stock -= params.quantity
      // 库存为 0 时标记为不可购买
      if (MOCK_PRODUCTS[productIndex].stock === 0) {
        MOCK_PRODUCTS[productIndex].isAvailable = false
      }
    }

    const userId = useUserStore.getState().userInfo?.id || 'user_001'
    const orderNo = `BS${dayjs().format('YYYYMMDDHHmmss')}${Math.floor(Math.random() * 1000)}`
    const newOrder: Order = {
      id: `order_${Date.now()}`,
      orderNo,
      userId,
      product: { ...product }, // 深拷贝商品信息，避免引用问题
      quantity: params.quantity,
      tempOption: params.tempOption,
      totalAmount: product.salePrice * params.quantity,
      status: 'pending',
      verifyCode: `VERIFY_${orderNo}`,
      createdAt: new Date().toISOString(),
      expiredAt: dayjs().hour(20).minute(0).second(0).toISOString()
    }
    mockOrders = [newOrder, ...mockOrders]
    return newOrder
  }
  return request<Order>('/order/create', { method: 'POST', data: params })
}

// 获取订单列表
export async function getOrders(status?: OrderStatus): Promise<Order[]> {
  if (IS_MOCK) {
    await delay(500)
    // 自动过期处理
    const now = new Date()
    mockOrders = mockOrders.map((o) =>
      o.status === 'pending' && new Date(o.expiredAt) < now
        ? { ...o, status: 'expired' as OrderStatus }
        : o
    )
    return status ? mockOrders.filter((o) => o.status === status) : mockOrders
  }
  return request<Order[]>('/order/list', { data: { status } })
}

// 核销订单（商家端）
export async function verifyOrder(verifyCode: string): Promise<Order> {
  if (IS_MOCK) {
    await delay(800)
    const order = mockOrders.find((o) => o.verifyCode === verifyCode)
    if (!order) throw new Error('核销码无效')
    if (order.status === 'verified') throw new Error('订单已核销')
    if (order.status === 'expired') throw new Error('订单已过期')

    const updated = {
      ...order,
      status: 'verified' as OrderStatus,
      verifiedAt: new Date().toISOString()
    }
    mockOrders = mockOrders.map((o) => (o.id === order.id ? updated : o))
    return updated
  }
  return request<Order>('/order/verify', { method: 'POST', data: { verifyCode } })
}
