import { create } from 'zustand'
import { Coupon } from '@/types'
import { saveStorage, loadStorage, KEYS } from '@/utils/storage'

interface CouponState {
  coupons: Coupon[]
  setCoupons: (coupons: Coupon[]) => void
  useCoupon: (couponId: string) => void
  getAvailableCoupons: () => Coupon[]
  restoreFromStorage: () => void
}

export const useCouponStore = create<CouponState>((set, get) => ({
  coupons: [],

  setCoupons: (coupons) => {
    saveStorage(KEYS.COUPONS, coupons)
    set({ coupons })
  },

  useCoupon: (couponId) => {
    const coupons = get().coupons.map((c) =>
      c.id === couponId ? { ...c, isUsed: true } : c
    )
    saveStorage(KEYS.COUPONS, coupons)
    set({ coupons })
  },

  getAvailableCoupons: () =>
    get().coupons.filter(
      (c) => !c.isUsed && new Date(c.expiredAt) > new Date()
    ),

  restoreFromStorage: () => {
    const coupons = loadStorage<Coupon[]>(KEYS.COUPONS)
    if (coupons && coupons.length > 0) {
      set({ coupons })
    }
  }
}))
