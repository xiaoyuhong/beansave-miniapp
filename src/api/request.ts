import Taro from '@tarojs/taro'
import { ApiResponse } from '@/types'
import { useUserStore } from '@/store/useUserStore'

const BASE_URL = API_BASE_URL

// 是否启用 Mock
const IS_MOCK = APP_ENV === 'development'

// 调试日志
console.log('[Request] BASE_URL=' + BASE_URL + ' APP_ENV=' + APP_ENV + ' IS_MOCK=' + String(IS_MOCK))

export async function request<T>(
  url: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
    data?: Record<string, unknown>
  } = {}
): Promise<T> {
  const { method = 'GET', data } = options
  const token = useUserStore.getState().token

  console.log('[Request] ' + method + ' ' + BASE_URL + url + ' IS_MOCK=' + String(IS_MOCK))

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

    // 处理 HTTP 状态码错误
    if (res.statusCode === 401 || res.statusCode === 403) {
      // Token 过期或无权限，清除登录态并跳转登录页
      useUserStore.getState().logout()
      Taro.showToast({ title: '登录已过期，请重新登录', icon: 'none' })
      setTimeout(() => {
        Taro.reLaunch({ url: '/pages/login/index' })
      }, 1500)
      throw new Error('登录已过期')
    }

    if (res.statusCode === 404) {
      throw new Error('请求的资源不存在')
    }

    if (res.statusCode === 500) {
      throw new Error('服务器错误，请稍后重试')
    }

    if (res.statusCode !== 200) {
      throw new Error(`网络错误 (${res.statusCode})`)
    }

    // 处理业务错误码
    const body = res.data
    if (body.code !== 0) {
      // 特殊业务错误码处理
      if (body.code === 401) {
        useUserStore.getState().logout()
        Taro.showToast({ title: '登录已过期，请重新登录', icon: 'none' })
        setTimeout(() => {
          Taro.reLaunch({ url: '/pages/login/index' })
        }, 1500)
      }
      throw new Error(body.message || '请求失败')
    }

    return body.data
  } catch (error: any) {
    console.log('[Request] 请求失败: ' + String(error))
    // 网络异常处理
    if (error.errMsg) {
      if (error.errMsg.includes('timeout')) {
        throw new Error('网络请求超时，请检查网络连接')
      }
      if (error.errMsg.includes('fail')) {
        throw new Error('网络连接失败，请检查网络设置')
      }
    }
    // 重新抛出错误，让调用方处理
    throw error
  }
}

export { IS_MOCK }
