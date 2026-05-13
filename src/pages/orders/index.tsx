import { View, Text } from '@tarojs/components'
import { useEffect, useState } from 'react'
import Taro from '@tarojs/taro'
import { useOrderStore } from '@/store/useOrderStore'
import { useUserStore } from '@/store/useUserStore'
import { getOrders } from '@/api/order'
import { Order, OrderStatus } from '@/types'
import dayjs from 'dayjs'
import styles from './index.module.scss'

const TABS: { label: string; status: OrderStatus }[] = [
  { label: '待核销', status: 'pending' },
  { label: '已核销', status: 'verified' },
  { label: '已过期', status: 'expired' }
]

export default function Orders() {
  const { isLoggedIn } = useUserStore()
  const { orders, setOrders, loading, setLoading } = useOrderStore()
  const [activeTab, setActiveTab] = useState<OrderStatus>('pending')

  useEffect(() => {
    if (!isLoggedIn) {
      Taro.redirectTo({ url: '/pages/login/index' })
      return
    }
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const data = await getOrders()
      setOrders(data)
    } catch {
      Taro.showToast({ title: '加载失败', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  const filteredOrders = orders.filter((o) => o.status === activeTab)

  const handleShowQrCode = (order: Order) => {
    Taro.showModal({
      title: '核销码',
      content: `订单号：${order.orderNo}\n核销码：${order.verifyCode}\n\n请出示此码给店员扫描`,
      showCancel: false,
      confirmText: '知道了'
    })
  }

  return (
    <View className={styles.container}>
      {/* Tab 切换 */}
      <View className={styles.tabs}>
        {TABS.map((tab) => {
          const count = orders.filter((o) => o.status === tab.status).length
          return (
            <View
              key={tab.status}
              className={[styles.tab, activeTab === tab.status ? styles.tabActive : ''].join(' ')}
              onClick={() => setActiveTab(tab.status)}
            >
              <Text className={styles.tabText}>{tab.label}</Text>
              {count > 0 && (
                <View className={styles.tabBadge}>
                  <Text className={styles.tabBadgeText}>{count}</Text>
                </View>
              )}
            </View>
          )
        })}
      </View>

      {/* 订单列表 */}
      {loading ? (
        <View className={styles.loadingWrap}>
          <Text className={styles.loadingText}>加载中...</Text>
        </View>
      ) : filteredOrders.length === 0 ? (
        <View className={styles.empty}>
          <Text className={styles.emptyEmoji}>📋</Text>
          <Text className={styles.emptyText}>暂无{TABS.find((t) => t.status === activeTab)?.label}订单</Text>
          {activeTab === 'pending' && (
            <View
              className={styles.emptyBtn}
              onClick={() => Taro.switchTab({ url: '/pages/menu/index' })}
            >
              <Text className={styles.emptyBtnText}>去点咖啡</Text>
            </View>
          )}
        </View>
      ) : (
        <View className={styles.list}>
          {filteredOrders.map((order) => (
            <View key={order.id} className={styles.orderCard}>
              {/* 订单头部 */}
              <View className={styles.orderHeader}>
                <Text className={styles.orderNo}>订单号：{order.orderNo}</Text>
                <View className={[
                  styles.orderStatus,
                  order.status === 'pending' ? styles.statusPending :
                  order.status === 'verified' ? styles.statusVerified :
                  styles.statusExpired
                ].join(' ')}>
                  <Text className={styles.orderStatusText}>
                    {order.status === 'pending' ? '待核销' :
                     order.status === 'verified' ? '已核销' : '已过期'}
                  </Text>
                </View>
              </View>

              {/* 商品信息 */}
              <View className={styles.orderProduct}>
                <View className={styles.orderProductImage}>
                  <Text className={styles.orderProductEmoji}>☕</Text>
                </View>
                <View className={styles.orderProductInfo}>
                  <Text className={styles.orderProductName}>{order.product.name}</Text>
                  <View className={styles.orderProductMeta}>
                    <Text className={styles.orderProductQty}>x{order.quantity}</Text>
                    {order.tempOption && (
                      <View className={styles.tempTag}>
                        <Text className={styles.tempTagText}>{order.tempOption}</Text>
                      </View>
                    )}
                  </View>
                </View>
                <Text className={styles.orderAmount}>
                  ¥{(order.totalAmount / 100).toFixed(2)}
                </Text>
              </View>

              {/* 时间信息 */}
              <View className={styles.orderMeta}>
                <Text className={styles.orderMetaText}>
                  下单时间：{dayjs(order.createdAt).format('MM-DD HH:mm')}
                </Text>
                {order.status === 'pending' && (
                  <Text className={styles.orderMetaText}>
                    截止：{dayjs(order.expiredAt).format('HH:mm')}
                  </Text>
                )}
                {order.status === 'verified' && order.verifiedAt && (
                  <Text className={styles.orderMetaText}>
                    核销：{dayjs(order.verifiedAt).format('MM-DD HH:mm')}
                  </Text>
                )}
              </View>

              {/* 操作按钮 */}
              {order.status === 'pending' && (
                <View className={styles.orderActions}>
                  <View
                    className={styles.qrBtn}
                    onClick={() => handleShowQrCode(order)}
                  >
                    <Text className={styles.qrBtnText}>📱 出示核销码</Text>
                  </View>
                </View>
              )}

              {order.status === 'expired' && (
                <View className={styles.refundTip}>
                  <Text className={styles.refundTipText}>
                    💰 订单已过期，退款将在 1-3 个工作日内原路退回
                  </Text>
                </View>
              )}
            </View>
          ))}
        </View>
      )}
    </View>
  )
}
