import { create } from 'zustand'
import { Product } from '@/types'

interface ProductState {
  products: Product[]
  loading: boolean
  lastFetchDate: string  // 记录最后拉取日期，避免重复请求
  setProducts: (products: Product[]) => void
  setLoading: (loading: boolean) => void
  updateStock: (productId: string, delta: number) => void
}

export const useProductStore = create<ProductState>((set) => ({
  products: [],
  loading: false,
  lastFetchDate: '',

  setProducts: (products) =>
    set({
      products,
      lastFetchDate: new Date().toDateString()
    }),

  setLoading: (loading) => set({ loading }),

  updateStock: (productId, delta) =>
    set((state) => ({
      products: state.products.map((p) =>
        p.id === productId
          ? { ...p, stock: Math.max(0, p.stock + delta) }
          : p
      )
    }))
}))
