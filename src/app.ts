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
    console.log('BeanSave App launched.')

    // 恢复登录态
    const restored = useUserStore.getState().restoreFromStorage()

    // 恢复优惠券
    useCouponStore.getState().restoreFromStorage()

    // 恢复订单数据
    useOrderStore.getState().restoreFromStorage()

    if (restored) {
      console.log('[App] 登录态已恢复')
      const role = useUserStore.getState().role
      setTimeout(() => {
        if (role === 'admin') {
          Taro.navigateTo({ url: '/pages/merchant/publish/index' })
        }
        // 普通用户不跳转，默认进 TabBar 首页
      }, 100)
    } else {
      console.log('[App] 未登录，跳转登录页')
      // 延迟跳转，等待页面初始化完成
      setTimeout(() => {
        Taro.reLaunch({ url: '/pages/login/index' })
      }, 100)
    }
  })

  return children
}

export default App
