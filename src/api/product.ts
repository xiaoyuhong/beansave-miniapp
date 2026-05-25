import { Product } from '@/types'
import { request, IS_MOCK } from './request'
import { MOCK_PRODUCTS } from '@/mock/data'
import dayjs from 'dayjs'

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// 判断当前是否在售卖时间（15:00 - 20:00）
export function isSaleTime(): boolean {
  const now = dayjs()
  const start = dayjs().hour(12).minute(0).second(0) 
  const end = dayjs().hour(23).minute(59).second(0)
  return now.isAfter(start) && now.isBefore(end)
}

// 获取今日余量列表
export async function getTodayProducts(): Promise<Product[]> {
  if (IS_MOCK) {
    await delay(600)
    const available = isSaleTime()
    return MOCK_PRODUCTS.map((p) => ({ ...p, isAvailable: available && p.stock > 0 }))
  }
  return request<Product[]>('/products/today') 
}
