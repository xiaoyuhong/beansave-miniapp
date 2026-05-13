import { create } from 'zustand'
import { UserInfo, UserRole } from '@/types'
import { saveStorage, loadStorage, removeStorage, clearAllStorage, KEYS } from '@/utils/storage'

interface UserState {
  userInfo: UserInfo | null
  token: string
  role: UserRole
  isLoggedIn: boolean
  setUserInfo: (userInfo: UserInfo) => void
  setToken: (token: string) => void
  logout: () => void
  restoreFromStorage: () => boolean  // 从本地存储恢复登录态，返回是否成功
}

export const useUserStore = create<UserState>((set) => ({
  userInfo: null,
  token: '',
  role: 'user',
  isLoggedIn: false,

  setUserInfo: (userInfo) => {
    // 持久化到本地
    saveStorage(KEYS.USER_INFO, userInfo)
    saveStorage(KEYS.TOKEN, userInfo.token)
    set({
      userInfo,
      token: userInfo.token,
      role: userInfo.role,
      isLoggedIn: true
    })
  },

  setToken: (token) => {
    saveStorage(KEYS.TOKEN, token)
    set({ token })
  },

  logout: () => {
    // 清除本地存储
    removeStorage(KEYS.USER_INFO)
    removeStorage(KEYS.TOKEN)
    removeStorage(KEYS.ORDERS)
    removeStorage(KEYS.COUPONS)
    set({
      userInfo: null,
      token: '',
      role: 'user',
      isLoggedIn: false
    })
  },

  restoreFromStorage: () => {
    const userInfo = loadStorage<UserInfo>(KEYS.USER_INFO)
    const token = loadStorage<string>(KEYS.TOKEN)
    if (userInfo && token) {
      set({
        userInfo,
        token,
        role: userInfo.role,
        isLoggedIn: true
      })
      return true
    }
    return false
  }
}))
