import { View, Text, Image } from '@tarojs/components'
import { useEffect, useState } from 'react'
import Taro from '@tarojs/taro'
import { useUserStore } from '@/store/useUserStore'
import { useOrderStore } from '@/store/useOrderStore'
import { useCouponStore } from '@/store/useCouponStore'
import { getOrders } from '@/api/order'
import { MOCK_COUPONS } from '@/mock/data'
import styles from './index.module.scss'

export default function User() {
  const { userInfo, isLoggedIn, logout } = useUserStore()
  const { orders, setOrders } = useOrderStore()
  const { coupons, setCoupons, getAvailableCoupons } = useCouponStore()
  const [showAdminEntry, setShowAdminEntry] = useState(false)

  useEffect(() => {
    if (!isLoggedIn) {
      Taro.redirectTo({ url: '/pages/login/index' })
      return
    }
    // 初始化优惠券（Mock）
    if (coupons.length === 0) setCoupons(MOCK_COUPONS)
    // 拉取订单统计
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const data = await getOrders()
      setOrders(data)
    } catch {
      // 静默失败
    }
  }

  const pendingCount = orders.filter((o) => o.status === 'pending').length
  const verifiedCount = orders.filter((o) => o.status === 'verified').length
  const availableCoupons = getAvailableCoupons()

  const handleLogout = () => {
    Taro.showModal({
      title: '退出登录',
      content: '确定要退出登录吗？',
      confirmColor: '#F44336',
      success: (res) => {
        if (res.confirm) {
          logout()
          Taro.reLaunch({ url: '/pages/login/index' })
        }
      }
    })
  }

  const handleGoOrders = () => {
    Taro.switchTab({ url: '/pages/orders/index' })
  }

  // 连续点击头像 5 次显示商家入口（彩蛋式入口）
  const [tapCount, setTapCount] = useState(0)
  const handleAvatarTap = () => {
    const next = tapCount + 1
    setTapCount(next)
    if (next >= 5) {
      setShowAdminEntry(true)
      setTapCount(0)
      Taro.showToast({ title: '商家模式已解锁', icon: 'none' })
    }
  }

  const handleSwitchAdmin = () => {
    if (userInfo?.role === 'admin') {
      Taro.navigateTo({ url: '/pages/merchant/publish/index' })
    } else {
      Taro.showToast({ title: '您没有商家权限', icon: 'none' })
    }
  }

  return (
    <View className={styles.container}>
      {/* 用户信息头部 */}
      <View className={styles.header}>
        <View className={styles.avatarWrap} onClick={handleAvatarTap}>
          {userInfo?.avatarUrl ? (
            <Image
              className={styles.avatar}
              src={userInfo.avatarUrl}
              mode='aspectFill'
            />
          ) : (
            <View className={styles.avatarPlaceholder}>
              <Text className={styles.avatarEmoji}>👤</Text>
            </View>
          )}
          {userInfo?.role === 'admin' && (
            <View className={styles.adminTag}>
              <Text className={styles.adminTagText}>商家</Text>
            </View>
          )}
        </View>
        <View className={styles.userInfo}>
          <Text className={styles.nickName}>
            {userInfo?.nickName || '咖啡爱好者'}
          </Text>
          <Text className={styles.phone}>
            {userInfo?.phone || '未绑定手机号'}
          </Text>
        </View>
      </View>

      {/* 订单快捷入口 */}
      <View className={styles.orderCard}>
        <Text className={styles.orderCardTitle}>我的订单</Text>
        <View className={styles.orderStats}>
          <View className={styles.orderStatItem} onClick={() => handleGoOrders('pending')}>
            <Text className={styles.orderStatValue}>{pendingCount}</Text>
            <Text className={styles.orderStatLabel}>待核销</Text>
          </View>
          <View className={styles.orderStatDivider} />
          <View className={styles.orderStatItem} onClick={() => handleGoOrders('verified')}>
            <Text className={styles.orderStatValue}>{verifiedCount}</Text>
            <Text className={styles.orderStatLabel}>已核销</Text>
          </View>
          <View className={styles.orderStatDivider} />
          <View className={styles.orderStatItem} onClick={() => handleGoOrders()}>
            <Text className={styles.orderStatValue}>{orders.length}</Text>
            <Text className={styles.orderStatLabel}>全部</Text>
          </View>
        </View>
      </View>

      {/* 优惠券 */}
      <View className={styles.couponCard}>
        <View className={styles.couponCardHeader}>
          <Text className={styles.couponCardTitle}>🎫 我的优惠券</Text>
          <Text className={styles.couponCardCount}>
            {availableCoupons.length} 张可用
          </Text>
        </View>
        {availableCoupons.length === 0 ? (
          <Text className={styles.couponEmpty}>暂无可用优惠券</Text>
        ) : (
          availableCoupons.map((coupon) => (
            <View key={coupon.id} className={styles.couponItem}>
              <View className={styles.couponLeft}>
                <Text className={styles.couponAmount}>
                  ¥{(coupon.amount / 100).toFixed(0)}
                </Text>
                <Text className={styles.couponCondition}>
                  满¥{(coupon.minAmount / 100).toFixed(0)}可用
                </Text>
              </View>
              <View className={styles.couponRight}>
                <Text className={styles.couponType}>
                  {coupon.type === 'new_user' ? '新人专享' : '分享奖励'}
                </Text>
                <Text className={styles.couponExpiry}>
                  有效期至 {new Date(coupon.expiredAt).toLocaleDateString('zh-CN')}
                </Text>
              </View>
            </View>
          ))
        )}
      </View>

      {/* 功能菜单 */}
      <View className={styles.menuCard}>
        {/* 商家模式入口（role=admin 或彩蛋解锁后显示） */}
        {(userInfo?.role === 'admin' || showAdminEntry) && (
          <View className={styles.menuItem} onClick={handleSwitchAdmin}>
            <Text className={styles.menuIcon}>🏪</Text>
            <Text className={styles.menuText}>切换商家模式</Text>
            <Text className={styles.menuArrow}>›</Text>
          </View>
        )}

        <View
          className={styles.menuItem}
          onClick={() => Taro.switchTab({ url: '/pages/orders/index' })}
        >
          <Text className={styles.menuIcon}>📋</Text>
          <Text className={styles.menuText}>全部订单</Text>
          <Text className={styles.menuArrow}>›</Text>
        </View>

        <View
          className={styles.menuItem}
          onClick={() =>
            Taro.showModal({
              title: '联系我们',
              content: '电话：400-882-1234\n地址：上海市松江区文汇路 718 号',
              showCancel: false,
              confirmText: '知道了'
            })
          }
        >
          <Text className={styles.menuIcon}>📞</Text>
          <Text className={styles.menuText}>联系店铺</Text>
          <Text className={styles.menuArrow}>›</Text>
        </View>

        <View
          className={styles.menuItem}
          onClick={() =>
            Taro.showModal({
              title: '关于 BeanSave',
              content: 'BeanSave 咖啡（大学城店）\n每天 15:00 上架余量精品咖啡\n5 折起优惠，到店自提\n\nv1.0.0',
              showCancel: false,
              confirmText: '知道了'
            })
          }
        >
          <Text className={styles.menuIcon}>ℹ️</Text>
          <Text className={styles.menuText}>关于我们</Text>
          <Text className={styles.menuArrow}>›</Text>
        </View>

        <View className={styles.menuItem} onClick={handleLogout}>
          <Text className={styles.menuIcon}>🚪</Text>
          <Text className={[styles.menuText, styles.menuTextDanger].join(' ')}>
            退出登录
          </Text>
          <Text className={styles.menuArrow}>›</Text>
        </View>
      </View>

      <Text className={styles.version}>BeanSave v1.0.0</Text>
    </View>
  )
}
