import { View, Text, ScrollView, Image } from '@tarojs/components'
import { useEffect } from 'react'
import Taro from '@tarojs/taro'
import { useProductStore } from '@/store/useProductStore'
import { useUserStore } from '@/store/useUserStore'
import { useOrderStore } from '@/store/useOrderStore'
import { getTodayProducts, isSaleTime } from '@/api/product'
import { Product } from '@/types'
import styles from './index.module.scss'

export default function Menu() {
  const { products, setProducts, setLoading, loading } = useProductStore()
  const { isLoggedIn } = useUserStore()
  const { orders } = useOrderStore()
  const saleStarted = isSaleTime()

  // 计算今日已购杯数
  const todayQty = orders
    .filter((o) => {
      const isToday = new Date(o.createdAt).toDateString() === new Date().toDateString()
      return isToday && o.status !== 'expired'
    })
    .reduce((sum, o) => sum + o.quantity, 0)

  const reachedLimit = todayQty >= 3

  useEffect(() => {
    if (!isLoggedIn) {
      Taro.redirectTo({ url: '/pages/login/index' })
      return
    }
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const data = await getTodayProducts()
      setProducts(data)
    } catch {
      Taro.showToast({ title: '加载失败，请重试', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  const handleOrder = (product: Product) => {
    if (reachedLimit) {
      Taro.showToast({ title: '今日已达 3 杯上限', icon: 'none' })
      return
    }
    if (!product.isAvailable) {
      if (product.stock === 0) {
        Taro.showToast({ title: '该咖啡已售罄', icon: 'none' })
      } else {
        Taro.showToast({ title: '余量咖啡 15:00 开售', icon: 'none' })
      }
      return
    }
    Taro.navigateTo({
      url: `/pages/order-confirm/index?productId=${product.id}`
    })
  }

  return (
    <View className={styles.container}>
      {/* 顶部状态栏 */}
      <View className={[styles.statusBar, saleStarted ? styles.statusOnSale : styles.statusWaiting].join(' ')}>
        <Text className={styles.statusIcon}>{saleStarted ? '🟢' : '⏳'}</Text>
        <Text className={styles.statusText}>
          {saleStarted ? '余量咖啡热卖中，截止今日 20:00' : '余量咖啡每天 15:00 开售'}
        </Text>
      </View>

      {/* 今日已购提示 */}
      {todayQty > 0 && (
        <View className={styles.quotaBar}>
          <Text className={styles.quotaText}>
            今日已购 {todayQty} 杯
            {reachedLimit ? '，已达每日上限（3杯）' : `，还可购买 ${3 - todayQty} 杯`}
          </Text>
        </View>
      )}

      {/* 商品列表 */}
      {loading ? (
        <View className={styles.loadingWrap}>
          <Text className={styles.loadingText}>加载中...</Text>
        </View>
      ) : (
        <ScrollView scrollY className={styles.list}>
          {products.map((product) => (
            <View key={product.id} className={styles.productCard}>
              {/* 左侧图片 */}
              <View className={styles.productImage}>
                {product.imageUrl ? (
                  <Image src={product.imageUrl} className={styles.productImg} mode='aspectFill' />
                ) : (
                  <Text className={styles.productEmoji}>☕</Text>
                )}
              </View>

              {/* 中间信息 */}
              <View className={styles.productInfo}>
                <Text className={styles.productName}>{product.name}</Text>
                <Text className={styles.productDesc}>{product.description}</Text>
                <View className={styles.productPriceRow}>
                  <Text className={styles.salePrice}>
                    ¥{(product.salePrice / 100).toFixed(0)}
                  </Text>
                  <View className={styles.discountBadge}>
                    <Text className={styles.discountText}>{product.discount}折</Text>
                  </View>
                  <Text className={styles.originalPrice}>
                    ¥{(product.originalPrice / 100).toFixed(0)}
                  </Text>
                </View>
                <View className={styles.stockRow}>
                  <Text
                    className={[
                      styles.stockText,
                      product.stock <= 3 ? styles.stockLow : ''
                    ].join(' ')}
                  >
                    {product.stock === 0
                      ? '已售罄'
                      : product.stock <= 3
                      ? `仅剩 ${product.stock} 杯`
                      : `剩余 ${product.stock} 杯`}
                  </Text>
                </View>
              </View>

              {/* 右侧按钮 */}
              <View
                className={[
                  styles.orderBtn,
                  (!product.isAvailable || reachedLimit) ? styles.orderBtnDisabled : ''
                ].join(' ')}
                onClick={() => handleOrder(product)}
              >
                <Text className={[
                  styles.orderBtnText,
                  (!product.isAvailable || reachedLimit) ? styles.orderBtnTextDisabled : ''
                ].join(' ')}>
                  {reachedLimit ? '已达限' : product.stock === 0 ? '售罄' : !saleStarted ? '未开售' : '下单'}
                </Text>
              </View>
            </View>
          ))}

          {/* 底部提示 */}
          <View className={styles.footer}>
            <Text className={styles.footerText}>· 每人限购 3 杯，先到先得 ·</Text>
            <Text className={styles.footerText}>· 当日 20:00 前到店自提 ·</Text>
          </View>
        </ScrollView>
      )}
    </View>
  )
}
