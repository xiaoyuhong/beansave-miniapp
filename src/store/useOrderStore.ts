import { create } from 'zustand'
import { Order, OrderStatus } from '@/types'
import { saveStorage, loadStorage, KEYS } from '@/utils/storage'

interface OrderState {
  orders: Order[]
  loading: boolean
  setOrders: (orders: Order[]) => void
  addOrder: (order: Order) => void
  updateOrderStatus: (orderId: string, status: OrderStatus) => void
  setLoading: (loading: boolean) => void
  getOrdersByStatus: (status: OrderStatus) => Order[]
  restoreFromStorage: () => void  // 从本地存储恢复订单数据
}

export const useOrderStore = create<OrderState>((set, get) => ({
  orders: [],
  loading: false,

  setOrders: (orders) => {
    // 持久化到本地
    saveStorage(KEYS.ORDERS, orders)
    set({ orders })
  },

  addOrder: (order) => {
    const newOrders = [order, ...get().orders]
    // 持久化到本地
    saveStorage(KEYS.ORDERS, newOrders)
    set({ orders: newOrders })
  },

  updateOrderStatus: (orderId, status) => {
    const updatedOrders = get().orders.map((o) =>
      o.id === orderId
        ? {
            ...o,
            status,
            verifiedAt: status === 'verified' ? new Date().toISOString() : o.verifiedAt
          }
        : o
    )
    // 持久化到本地
    saveStorage(KEYS.ORDERS, updatedOrders)
    set({ orders: updatedOrders })
  },

  setLoading: (loading) => set({ loading }),

  getOrdersByStatus: (status) => get().orders.filter((o) => o.status === status),

  restoreFromStorage: () => {
    const orders = loadStorage<Order[]>(KEYS.ORDERS)
    if (orders && orders.length > 0) {
      set({ orders })
    }
  }
}))
