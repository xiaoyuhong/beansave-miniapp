import Taro from '@tarojs/taro'
import { ApiResponse } from '@/types'
import { useUserStore } from '@/store/useUserStore'

const BASE_URL = API_BASE_URL

// 开发环境自动启用 Mock
export const IS_MOCK = APP_ENV === 'development'

export async function request<T>(
  url: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
    data?: Record<string, unknown>
  } = {}
): Promise<T> {
  const { method = 'GET', data } = options
  const token = useUserStore.getState().token

  try {
    const res = await Taro.request<ApiResponse<T>>({
      url: `${BASE_URL}${url}`,
      method,
      data,
      header: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    })

    if (res.statusCode === 401 || res.statusCode === 403) {
      useUserStore.getState().logout()
      Taro.showToast({ title: '登录已过期，请重新登录', icon: 'none' })
      setTimeout(() => Taro.reLaunch({ url: '/pages/login/index' }), 1500)
      throw new Error('登录已过期')
    }

    if (res.statusCode === 404) throw new Error('请求的资源不存在')
    if (res.statusCode === 500) throw new Error('服务器错误，请稍后重试')
    if (res.statusCode !== 200) throw new Error('网络错误 (' + res.statusCode + ')')

    const body = res.data
    if (body.code !== 0) {
      if (body.code === 401) {
        useUserStore.getState().logout()
        Taro.showToast({ title: '登录已过期，请重新登录', icon: 'none' })
        setTimeout(() => Taro.reLaunch({ url: '/pages/login/index' }), 1500)
      }
      throw new Error(body.message || '请求失败')
    }

    return body.data
  } catch (error: any) {
    if (error.errMsg?.includes('timeout')) throw new Error('网络请求超时，请检查网络连接')
    if (error.errMsg?.includes('fail')) throw new Error('网络连接失败，请检查网络设置')
    throw error
  }
}
