import { UserInfo } from '@/types'
import { request, IS_MOCK } from './request'
import { MOCK_USER, MOCK_ADMIN } from '@/mock/data'

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export async function wxLogin(code: string, mockRole: 'user' | 'admin' = 'user'): Promise<UserInfo> {
  if (IS_MOCK) {
    await delay(800)
    return mockRole === 'admin' ? MOCK_ADMIN : MOCK_USER
  }
  return request<UserInfo>('/user/wx-login', { method: 'POST', data: { code } })
}

export async function bindPhone(encryptedData: string, iv: string): Promise<{ phone: string }> {
  if (IS_MOCK) {
    await delay(500)
    return { phone: '138****8888' }
  }
  return request<{ phone: string }>('/user/phone', { method: 'POST', data: { encryptedData, iv } })
}
