import { UserInfo } from '@/types'
import { request, IS_MOCK } from './request'
import { MOCK_USER, MOCK_ADMIN } from '@/mock/data'

// 模拟延迟
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// 微信登录
export async function wxLogin(code: string, mockRole: 'user' | 'admin' = 'user'): Promise<UserInfo> {
  console.log('[wxLogin] 调用登录接口:', { code, mockRole, IS_MOCK })
  
  if (IS_MOCK) {
    console.log('[wxLogin] 使用 Mock 数据')
    await delay(800)
    const result = mockRole === 'admin' ? MOCK_ADMIN : MOCK_USER
    console.log('[wxLogin] Mock 登录成功:', result)
    return result
  }
  
  console.log('[wxLogin] 调用真实接口')
  return request<UserInfo>('/user/wx-login', {
    method: 'POST',
    data: { code }
  })
}

// 获取手机号
export async function bindPhone(encryptedData: string, iv: string): Promise<{ phone: string }> {
  if (IS_MOCK) {
    await delay(500)
    return { phone: '138****8888' }
  }
  return request<{ phone: string }>('/user/phone', {
    method: 'POST',
    data: { encryptedData, iv }
  })
}
