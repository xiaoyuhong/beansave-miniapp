import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import styles from './index.module.scss'

const TABS = [
  { path: '/pages/merchant/publish/index', text: '发布余量', icon: '➕' },
  { path: '/pages/merchant/scan/index', text: '扫码核销', icon: '📷' },
  { path: '/pages/merchant/stats/index', text: '今日统计', icon: '📊' },
  { path: '/pages/merchant/tools/index', text: '功能', icon: '🔧' }
]

interface Props {
  current: string  // 当前页面路径
}

export default function MerchantTabBar({ current }: Props) {
  const handleTap = (path: string) => {
    if (path === current) return
    Taro.redirectTo({ url: path })
  }

  return (
    <View className={styles.tabBar}>
      {TABS.map((tab) => (
        <View
          key={tab.path}
          className={[styles.tabItem, current === tab.path ? styles.active : ''].join(' ')}
          onClick={() => handleTap(tab.path)}
        >
          <Text className={styles.tabIcon}>{tab.icon}</Text>
          <Text className={styles.tabText}>{tab.text}</Text>
        </View>
      ))}
    </View>
  )
}
