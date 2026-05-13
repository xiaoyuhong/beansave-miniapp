import { create } from 'zustand'
import { UserInfo, UserRole } from '@/types'
import { saveStorage, loadStorage, removeStorage, KEYS } from '@/utils/storage'

interface UserState {
  userInfo: UserInfo | null
  token: string
  role: UserRole
  isLoggedIn: boolean
  setUserInfo: (userInfo: UserInfo) => void
  logout: () => void
  restoreFromStorage: () => boolean
}

export const useUserStore = create<UserState>((set) => ({
  userInfo: null,
  token: '',
  role: 'user',
  isLoggedIn: false,

  setUserInfo: (userInfo) => {
    saveStorage(KEYS.USER_INFO, userInfo)
    saveStorage(KEYS.TOKEN, userInfo.token)
    set({
      userInfo,
      token: userInfo.token,
      role: userInfo.role,
      isLoggedIn: true
    })
  },

  logout: () => {
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
      set({ userInfo, token, role: userInfo.role, isLoggedIn: true })
      return true
    }
    return false
  }
}))
