import { View, Text, ScrollView } from '@tarojs/components'
import { useEffect, useState } from 'react'
import Taro from '@tarojs/taro'
import { useUserStore } from '@/store/useUserStore'
import { getTodayStats, TodayStats } from '@/api/merchant'
import dayjs from 'dayjs'
import MerchantTabBar from '@/components/MerchantTabBar'
import styles from './index.module.scss'

export default function MerchantStats() {
  const { userInfo } = useUserStore()
  const [stats, setStats] = useState<TodayStats | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (userInfo?.role !== 'admin') return
    fetchStats()
  }, [])

  const fetchStats = async () => {
    setLoading(true)
    try {
      const data = await getTodayStats()
      setStats(data)
    } catch {
      Taro.showToast({ title: '加载失败', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  if (userInfo?.role !== 'admin') {
    return (
      <View className={styles.noPermission}>
        <Text className={styles.noPermissionText}>无商家权限</Text>
      </View>
    )
  }

  return (
    <ScrollView scrollY className={styles.container}>
      {/* 日期标题 */}
      <View className={styles.dateHeader}>
        <Text className={styles.dateText}>
          {dayjs().format('YYYY年MM月DD日')} 统计
        </Text>
        <Text className={styles.refreshBtn} onClick={fetchStats}>
          刷新
        </Text>
      </View>

      {loading ? (
        <View className={styles.loadingWrap}>
          <Text className={styles.loadingText}>加载中...</Text>
        </View>
      ) : stats ? (
        <>
          {/* 核心数据卡片 */}
          <View className={styles.summaryRow}>
            <View className={styles.summaryCard}>
              <Text className={styles.summaryValue}>{stats.totalSold}</Text>
              <Text className={styles.summaryLabel}>售出杯数</Text>
            </View>
            <View className={styles.summaryCard}>
              <Text className={[styles.summaryValue, styles.summaryValuePrimary].join(' ')}>
                ¥{(stats.totalAmount / 100).toFixed(0)}
              </Text>
              <Text className={styles.summaryLabel}>今日营收</Text>
            </View>
          </View>

          {/* 热销排行 */}
          <View className={styles.section}>
            <Text className={styles.sectionTitle}>☕ 热销排行</Text>
            {stats.ranking.map((item, index) => {
              const maxSold = stats.ranking[0]?.sold || 1
              const percent = (item.sold / maxSold) * 100
              return (
                <View key={item.product.id} className={styles.rankItem}>
                  <View className={styles.rankLeft}>
                    <View
                      className={[
                        styles.rankNo,
                        index === 0 ? styles.rankNo1 :
                        index === 1 ? styles.rankNo2 :
                        index === 2 ? styles.rankNo3 : ''
                      ].join(' ')}
                    >
                      <Text className={styles.rankNoText}>{index + 1}</Text>
                    </View>
                    <Text className={styles.rankName}>{item.product.name}</Text>
                  </View>
                  <View className={styles.rankRight}>
                    <View className={styles.rankBar}>
                      <View
                        className={styles.rankBarFill}
                        style={{ width: `${percent}%` }}
                      />
                    </View>
                    <Text className={styles.rankSold}>{item.sold} 杯</Text>
                  </View>
                </View>
              )
            })}
          </View>

          {/* 营业时间提示 */}
          <View className={styles.tipCard}>
            <Text className={styles.tipText}>
              📊 数据统计截至当前时间，每 5 分钟自动更新
            </Text>
            <Text className={styles.tipText}>
              ⏰ 余量咖啡售卖时间：15:00 – 20:00
            </Text>
          </View>
        </>
      ) : null}

      <View className={styles.bottomPadding} />
      <MerchantTabBar current='/pages/merchant/stats/index' />
    </ScrollView>
  )
}
