import { PropsWithChildren } from 'react'
import { useLaunch } from '@tarojs/taro'
import Taro from '@tarojs/taro'
import '@nutui/nutui-react-taro/dist/style.css'
import './app.scss'
import { useUserStore } from '@/store/useUserStore'
import { useCouponStore } from '@/store/useCouponStore'
import { useOrderStore } from '@/store/useOrderStore'

function App({ children }: PropsWithChildren) {
  useLaunch(() => {
    const restored = useUserStore.getState().restoreFromStorage()
    useCouponStore.getState().restoreFromStorage()
    useOrderStore.getState().restoreFromStorage()

    if (restored) {
      const role = useUserStore.getState().role
      setTimeout(() => {
        if (role === 'admin') {
          Taro.navigateTo({ url: '/pages/merchant/publish/index' })
        }
      }, 100)
    } else {
      setTimeout(() => {
        Taro.reLaunch({ url: '/pages/login/index' })
      }, 100)
    }
  })

  return children
}

export default App
