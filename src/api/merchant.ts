import { Product, TempOption } from '@/types'
import { request, IS_MOCK } from './request'
import { MOCK_PRODUCTS } from '@/mock/data'

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// 今日已发布的余量数据
export interface PublishedProduct {
  productId: string
  name: string
  originalPrice: number
  stock: number
  discount: number
  salePrice: number
  tempOptions: TempOption[]
}

// 内存中保存当日发布数据（模拟后端存储）
let todayPublished: PublishedProduct[] = []

// 获取今日已发布的余量数据
export async function getTodayPublished(): Promise<PublishedProduct[]> {
  if (IS_MOCK) {
    await delay(400)
    return todayPublished
  }
  return request<PublishedProduct[]>('/merchant/today-published')
}

// 商家发布今日余量
export async function publishProducts(
  items: Array<{
    productId: string
    name: string
    originalPrice: number
    stock: number
    discount: number
    salePrice: number
    tempOptions?: TempOption[]
  }>
): Promise<void> {
  if (IS_MOCK) {
    await delay(800)

    // 保存到内存（模拟后端持久化）
    todayPublished = items.map((item) => ({
      productId: item.productId,
      name: item.name,
      originalPrice: item.originalPrice,
      stock: item.stock,
      discount: item.discount,
      salePrice: item.salePrice,
      tempOptions: item.tempOptions ?? []
    }))

    items.forEach((item) => {
      const existing = MOCK_PRODUCTS.find((p) => p.id === item.productId)
      if (existing) {
        existing.stock = item.stock
        existing.discount = item.discount
        existing.salePrice = item.salePrice
        existing.isAvailable = item.stock > 0
        if (item.tempOptions && item.tempOptions.length > 0) {
          existing.tempOptions = item.tempOptions
        }
      } else {
        MOCK_PRODUCTS.push({
          id: item.productId,
          name: item.name,
          description: '',
          originalPrice: item.originalPrice,
          salePrice: item.salePrice,
          discount: item.discount,
          tempOptions: item.tempOptions ?? [],
          stock: item.stock,
          totalStock: item.stock,
          imageUrl: '',
          isAvailable: item.stock > 0
        })
      }
    })

    // 未发布的商品库存设为 0
    MOCK_PRODUCTS.forEach((p) => {
      const published = items.find((i) => i.productId === p.id)
      if (!published) {
        p.stock = 0
        p.isAvailable = false
      }
    })

    return
  }
  return request('/merchant/publish', { method: 'POST', data: { items } })
}

// 今日统计
export interface TodayStats {
  totalSold: number      // 售出杯数
  totalAmount: number    // 总金额（分）
  ranking: Array<{ product: Product; sold: number }>
}

export async function getTodayStats(): Promise<TodayStats> {
  if (IS_MOCK) {
    await delay(600)
    return {
      totalSold: 18,
      totalAmount: 28600,
      ranking: [
        { product: MOCK_PRODUCTS[1], sold: 6 },
        { product: MOCK_PRODUCTS[0], sold: 5 },
        { product: MOCK_PRODUCTS[4], sold: 4 },
        { product: MOCK_PRODUCTS[2], sold: 3 }
      ]
    }
  }
  return request<TodayStats>('/statistics/today')
}
