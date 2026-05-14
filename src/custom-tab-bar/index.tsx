import { View, Text } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { useState } from 'react'
import { useUserStore } from '@/store/useUserStore'
import styles from './index.module.scss'

const USER_TABS = [
  { pagePath: '/pages/home/index', text: '首页', icon: '🏠' },
  { pagePath: '/pages/menu/index', text: '点咖啡', icon: '☕' },
  { pagePath: '/pages/discover/index', text: '发现', icon: '📋' },
  { pagePath: '/pages/orders/index', text: '订单', icon: '📋' },
  { pagePath: '/pages/user/index', text: '我的', icon: '👤' }
]

const ADMIN_TABS = [
  { pagePath: '/pages/merchant/publish/index', text: '发布余量', icon: '➕' },
  { pagePath: '/pages/merchant/scan/index', text: '扫码核销', icon: '📷' },
  { pagePath: '/pages/merchant/stats/index', text: '统计', icon: '📊' },
  { pagePath: '/pages/user/index', text: '我的', icon: '👤' }
]

export default function CustomTabBar() {
  const { role } = useUserStore()
  const tabs = role === 'admin' ? ADMIN_TABS : USER_TABS
  const [selected, setSelected] = useState(0)

  useDidShow(() => {
    const pages = Taro.getCurrentPages()
    const currentPage = pages[pages.length - 1]
    if (!currentPage) return
    const currentPath = `/${currentPage.route}`
    const index = tabs.findIndex((t) => t.pagePath === currentPath)
    if (index !== -1) setSelected(index)
  })

  const handleTabClick = (index: number, pagePath: string) => {
    if (selected === index) return
    setSelected(index)
    Taro.switchTab({ url: pagePath })
  }

  return (
    <View className={styles.tabBar}>
      {tabs.map((tab, index) => (
        <View
          key={tab.pagePath}
          className={[styles.tabItem, selected === index ? styles.active : ''].join(' ')}
          onClick={() => handleTabClick(index, tab.pagePath)}
        >
          <Text className={styles.tabIcon}>{tab.icon}</Text>
          <Text className={styles.tabText}>{tab.text}</Text>
          {role === 'admin' && index === 0 && (
            <View className={styles.adminBadge}>
              <Text className={styles.adminBadgeText}>商家</Text>
            </View>
          )}
        </View>
      ))}
    </View>
  )
}
