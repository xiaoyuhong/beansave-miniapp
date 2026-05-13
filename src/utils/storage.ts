import Taro from '@tarojs/taro'

const KEYS = {
  USER_INFO: 'bs_user_info',
  TOKEN: 'bs_token',
  ORDERS: 'bs_orders',
  COUPONS: 'bs_coupons'
} as const

export function saveStorage<T>(key: string, value: T): void {
  try {
    Taro.setStorageSync(key, JSON.stringify(value))
  } catch {
    console.warn(`[Storage] 写入失败: ${key}`)
  }
}

export function loadStorage<T>(key: string): T | null {
  try {
    const raw = Taro.getStorageSync(key)
    if (!raw) return null
    return JSON.parse(raw) as T
  } catch {
    console.warn(`[Storage] 读取失败: ${key}`)
    return null
  }
}

export function removeStorage(key: string): void {
  try {
    Taro.removeStorageSync(key)
  } catch {
    console.warn(`[Storage] 删除失败: ${key}`)
  }
}

export { KEYS }
