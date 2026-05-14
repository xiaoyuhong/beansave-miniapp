import { View, Text, ScrollView, Image } from '@tarojs/components'
import { useEffect, useState } from 'react'
import Taro from '@tarojs/taro'
import dayjs from 'dayjs'
import { useUserStore } from '@/store/useUserStore'
import { useProductStore } from '@/store/useProductStore'
import { getTodayProducts, isSaleTime } from '@/api/product'
import { SHOP_INFO } from '@/mock/data'
import styles from './index.module.scss'

export default function Home() {
  const { userInfo, isLoggedIn } = useUserStore()
  const { products, setProducts, setLoading, loading } = useProductStore()
  const [countdown, setCountdown] = useState('')
  const [saleStarted, setSaleStarted] = useState(false)

  // 未登录跳转
  useEffect(() => {
    if (!isLoggedIn) {
      Taro.redirectTo({ url: '/pages/login/index' })
    }
  }, [isLoggedIn])

  // 拉取商品
  useEffect(() => {
    fetchProducts()
  }, [])

  // 倒计时
  useEffect(() => {
    const timer = setInterval(() => {
      const now = dayjs()
      const saleStart = dayjs().hour(15).minute(0).second(0)
      const started = isSaleTime()
      setSaleStarted(started)

      if (!started && now.isBefore(saleStart)) {
        const diff = saleStart.diff(now, 'second')
        const h = Math.floor(diff / 3600)
        const m = Math.floor((diff % 3600) / 60)
        const s = diff % 60
        setCountdown(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`)
      } else {
        setCountdown('')
      }
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const data = await getTodayProducts()
      setProducts(data)
    } catch {
      Taro.showToast({ title: '加载失败', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  const handleSubscribe = () => {
    Taro.requestSubscribeMessage({
      tmplIds: ['mock_template_id'],
      success: () => Taro.showToast({ title: '订阅成功 🎉', icon: 'none' }),
      fail: () => Taro.showToast({ title: '订阅失败', icon: 'none' })
    })
  }

  const handleGoMenu = () => {
    Taro.switchTab({ url: '/pages/menu/index' })
  }

  return (
    <ScrollView scrollY className={styles.container}>
      {/* 顶部 Banner */}
      <View className={styles.banner}>
        <View className={styles.bannerContent}>
          <View className={styles.bannerLeft}>
            <Text className={styles.greeting}>
              你好，{userInfo?.nickName || '咖啡爱好者'} 👋
            </Text>
            <Text className={styles.shopName}>{SHOP_INFO.name}</Text>
            <View className={styles.shopMeta}>
              <Text className={styles.shopMetaText}>📍 {SHOP_INFO.address}</Text>
            </View>
            <View className={styles.shopMeta}>
              <Text className={styles.shopMetaText}>🕐 {SHOP_INFO.businessHours}</Text>
            </View>
          </View>
          <Text className={styles.bannerEmoji}>☕</Text>
        </View>

        {/* 订阅提醒 Banner */}
        <View className={styles.subscribeBanner} onClick={handleSubscribe}>
          <Text className={styles.subscribeBannerText}>🔔 订阅提醒，每天 14:55 通知你开抢</Text>
          <Text className={styles.subscribeBannerArrow}>›</Text>
        </View>
      </View>

      {/* 今日状态卡片 */}
      <View className={styles.statusCard}>
        {saleStarted ? (
          <View className={styles.statusOnSale}>
            <Text className={styles.statusDot} /> 
            <Text className={styles.statusText}>余量咖啡正在热卖中</Text>
            <Text className={styles.statusSub}>截止今日 20:00，先到先得</Text>
          </View>
        ) : (
          <View className={styles.statusWaiting}>
            <Text className={styles.statusLabel}>距离开抢还有</Text>
            <Text className={styles.countdown}>{countdown || '即将开始'}</Text>
            <Text className={styles.statusSub}>每天 15:00 准时上架，5 折起抢购</Text>
          </View>
        )}
      </View>

      {/* 今日咖啡预览 */}
      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>今日余量咖啡</Text>
          <Text className={styles.sectionMore} onClick={handleGoMenu}>
            查看全部 ›
          </Text>
        </View>

        {loading ? (
          <View className={styles.loadingWrap}>
            <Text className={styles.loadingText}>加载中...</Text>
          </View>
        ) : (
          <ScrollView scrollX className={styles.productScroll}>
            {products.slice(0, 4).map((product) => (
              <View
                key={product.id}
                className={styles.productCard}
                onClick={handleGoMenu}
              >
                <View className={styles.productImagePlaceholder}>
                  {product.imageUrl ? (
                    <Image src={product.imageUrl} className={styles.productImg} mode='aspectFill' />
                  ) : (
                    <Text className={styles.productEmoji}>☕</Text>
                  )}
                </View>
                <Text className={styles.productName}>{product.name}</Text>
                <View className={styles.productPriceRow}>
                  <Text className={styles.productSalePrice}>
                    ¥{(product.salePrice / 100).toFixed(0)}
                  </Text>
                  <Text className={styles.productOriginalPrice}>
                    ¥{(product.originalPrice / 100).toFixed(0)}
                  </Text>
                </View>
                <View className={styles.productStock}>
                  <Text className={styles.productStockText}>
                    剩 {product.stock} 杯
                  </Text>
                </View>
                {!product.isAvailable && (
                  <View className={styles.productUnavailable}>
                    <Text className={styles.productUnavailableText}>
                      {product.stock === 0 ? '已售罄' : '未开售'}
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </ScrollView>
        )}
      </View>

      {/* 去点咖啡按钮 */}
      {saleStarted && (
        <View className={styles.ctaSection}>
          <View className={styles.ctaBtn} onClick={handleGoMenu}>
            <Text className={styles.ctaBtnText}>☕ 立即抢购</Text>
          </View>
        </View>
      )}

      {/* 店铺介绍 */}
      <View className={styles.section}>
        <Text className={styles.sectionTitle}>关于我们</Text>
        <View className={styles.aboutCard}>
          <Text className={styles.aboutText}>{SHOP_INFO.description}</Text>
          <View className={styles.aboutInfoList}>
            <View className={styles.aboutInfoItem}>
              <Text className={styles.aboutInfoLabel}>📞 联系电话</Text>
              <Text className={styles.aboutInfoValue}>{SHOP_INFO.phone}</Text>
            </View>
            <View className={styles.aboutInfoItem}>
              <Text className={styles.aboutInfoLabel}>⏰ 余量上架</Text>
              <Text className={styles.aboutInfoValue}>每天 {SHOP_INFO.saleStartTime}</Text>
            </View>
            <View className={styles.aboutInfoItem}>
              <Text className={styles.aboutInfoLabel}>🎯 折扣力度</Text>
              <Text className={styles.aboutInfoValue}>5 折起</Text>
            </View>
            <View className={styles.aboutInfoItem}>
              <Text className={styles.aboutInfoLabel}>🛒 每人限购</Text>
              <Text className={styles.aboutInfoValue}>3 杯/单</Text>
            </View>
          </View>
        </View>
      </View>

      <View className={styles.bottomPadding} />
    </ScrollView>
  )
}
