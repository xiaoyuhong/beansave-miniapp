import { View, Text } from '@tarojs/components'
import { useState, useEffect } from 'react'
import Taro from '@tarojs/taro'
import { Input, Range } from '@nutui/nutui-react-taro'
import { useUserStore } from '@/store/useUserStore'
import { publishProducts, getTodayPublished } from '@/api/merchant'
import { MOCK_PRODUCTS } from '@/mock/data'
import { loadStorage } from '@/utils/storage'
import { TempOption } from '@/types'
import MerchantTabBar from '@/components/MerchantTabBar'
import styles from './index.module.scss'

const ALL_TEMP_OPTIONS: TempOption[] = ['正常冰', '少冰', '不加冰', '热']

interface ProductTemplate {
  id: string
  name: string
  originalPrice: number
  salePrice: number
  tempOptions?: TempOption[]  // 商品模板配置的温度选项
}

interface StockItem {
  productId: string
  name: string
  stock: number
  discount: number
  tempOptions: TempOption[]  // 商家为该款咖啡配置的温度选项
}

const STORAGE_KEY = 'bs_merchant_products'

// 根据折扣计算售价（向下取整到整元）
function calcSalePrice(originalPrice: number, discount: number): number {
  return Math.floor((originalPrice * discount) / 10 / 100) * 100
}

export default function MerchantPublish() {
  const { userInfo } = useUserStore()
  const [productTemplates, setProductTemplates] = useState<ProductTemplate[]>([])
  const [stockList, setStockList] = useState<StockItem[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [hasPublishedToday, setHasPublishedToday] = useState(false)

  useEffect(() => {
    const saved = loadStorage<ProductTemplate[]>(STORAGE_KEY)
    const templates = saved && saved.length > 0
      ? saved
      : MOCK_PRODUCTS.map((p) => ({
          id: p.id,
          name: p.name,
          originalPrice: p.originalPrice,
          salePrice: p.salePrice,
          tempOptions: p.tempOptions  // 保留模板的温度选项
        }))
    setProductTemplates(templates)

    // 从接口获取今日已发布数据
    getTodayPublished().then((published) => {
      if (published.length > 0) {
        setHasPublishedToday(true)
        setStockList(templates.map((t) => {
          const p = published.find((i) => i.productId === t.id)
          return {
            productId: t.id,
            name: t.name,
            stock: p?.stock ?? 0,
            discount: p?.discount ?? 5,
            // 优先使用已发布的温度选项，其次使用模板的温度选项，最后使用全部选项
            tempOptions: p?.tempOptions?.length
              ? p.tempOptions
              : (t.tempOptions?.length ? t.tempOptions : [...ALL_TEMP_OPTIONS])
          }
        }))
      } else {
        setStockList(templates.map((t) => ({
          productId: t.id,
          name: t.name,
          stock: 0,
          discount: 5,
          // 使用模板的温度选项，如果没有则使用全部选项
          tempOptions: t.tempOptions?.length ? t.tempOptions : [...ALL_TEMP_OPTIONS]
        })))
      }
    })
  }, [])

  if (userInfo?.role !== 'admin') {
    return (
      <View className={styles.noPermission}>
        <Text className={styles.noPermissionText}>无商家权限</Text>
      </View>
    )
  }

  const handleStockChange = (productId: string, value: string) => {
    const num = parseInt(value) || 0
    setStockList((prev) =>
      prev.map((item) =>
        item.productId === productId ? { ...item, stock: Math.max(0, num) } : item
      )
    )
  }

  const handleQuickSet = (productId: string, value: number) => {
    setStockList((prev) =>
      prev.map((item) =>
        item.productId === productId ? { ...item, stock: value } : item
      )
    )
  }

  const handleDiscountChange = (productId: string, value: number | number[]) => {
    const discount = Array.isArray(value) ? value[0] : value
    setStockList((prev) =>
      prev.map((item) =>
        item.productId === productId ? { ...item, discount } : item
      )
    )
  }

  const handleTempToggle = (productId: string, temp: TempOption) => {
    setStockList((prev) =>
      prev.map((item) => {
        if (item.productId !== productId) return item
        const has = item.tempOptions.includes(temp)
        const tempOptions = has
          ? item.tempOptions.filter((t) => t !== temp)
          : [...item.tempOptions, temp]
        return { ...item, tempOptions }
      })
    )
  }

  const totalStock = stockList.reduce((sum, item) => sum + item.stock, 0)

  const handleSubmit = async () => {
    if (totalStock === 0) {
      Taro.showToast({ title: '请至少设置一款咖啡的库存', icon: 'none' })
      return
    }
    setSubmitting(true)
    try {
      const items = stockList
        .filter((item) => item.stock > 0)
        .map((item) => {
          const product = productTemplates.find((p) => p.id === item.productId)!
          return {
            productId: item.productId,
            name: item.name,
            originalPrice: product.originalPrice,
            stock: item.stock,
            discount: item.discount,
            salePrice: calcSalePrice(product.originalPrice, item.discount),
            tempOptions: item.tempOptions
          }
        })
      await publishProducts(items)
      setHasPublishedToday(true)
      Taro.showToast({ title: hasPublishedToday ? '修改成功 🎉' : '发布成功 🎉', icon: 'success' })
    } catch {
      Taro.showToast({ title: '发布失败，请重试', icon: 'none' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <View className={styles.container}>
      {/* 提示 */}
      <View className={styles.tipBar}>
        <Text className={styles.tipText}>
          {hasPublishedToday
            ? '✅ 今日余量已发布，可修改后重新提交'
            : '📢 请在 15:00 前完成发布，发布后用户即可下单'}
        </Text>
      </View>

      {/* 库存列表 */}
      <View className={styles.list}>
        {stockList.map((item) => {
          const product = productTemplates.find((p) => p.id === item.productId)!
          const salePrice = calcSalePrice(product.originalPrice, item.discount)
          return (
            <View key={item.productId} className={styles.stockCard}>
              {/* 商品信息 */}
              <View className={styles.stockCardLeft}>
                <View className={styles.productImage}>
                  <Text className={styles.productEmoji}>☕</Text>
                </View>
                <View className={styles.productInfo}>
                  <Text className={styles.productName}>{item.name}</Text>
                  <View className={styles.priceRow}>
                    <Text className={styles.salePrice}>
                      ¥{(salePrice / 100).toFixed(0)}
                    </Text>
                    <Text className={styles.originalPrice}>
                      原价¥{(product.originalPrice / 100).toFixed(0)}
                    </Text>
                    <View className={styles.discountBadge}>
                      <Text className={styles.discountBadgeText}>{item.discount}折</Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* 库存设置 */}
              <View className={styles.stockControl}>
                <View className={styles.stockRow}>
                  {[0, 5, 8, 10, 12].map((v) => (
                    <View
                      key={v}
                      className={[
                        styles.quickBtn,
                        item.stock === v ? styles.quickBtnActive : ''
                      ].join(' ')}
                      onClick={() => handleQuickSet(item.productId, v)}
                    >
                      <Text className={styles.quickBtnText}>{v}</Text>
                    </View>
                  ))}
                  <View className={styles.inputWrap}>
                    <Input
                      className={styles.stockInput}
                      type='number'
                      placeholder='自定义'
                      placeholderStyle='font-size: 24rpx; color: #999999;'
                      inputStyle={{ fontSize: '28rpx', fontWeight: '700', color: '#333333' }}
                      value={item.stock > 0 ? String(item.stock) : ''}
                      onChange={(val) => handleStockChange(item.productId, val)}
                    />
                    <Text className={styles.inputUnit}>杯</Text>
                  </View>
                </View>

                {/* 折扣滑块 */}
                <View className={styles.sliderSection}>
                  <View className={styles.sliderHeader}>
                    <Text className={styles.sliderLabel}>折扣</Text>
                    <Text className={styles.sliderValue}>{item.discount} 折</Text>
                  </View>
                  <Range
                    value={item.discount}
                    min={1}
                    max={9}
                    step={1}
                    activeColor='#6F4E37'
                    onChange={(val) => handleDiscountChange(item.productId, val)}
                  />
                </View>

                {/* 温度选项 */}
                <View className={styles.tempSection}>
                  <Text className={styles.tempLabel}>温度选项</Text>
                  <View className={styles.tempBtns}>
                    {ALL_TEMP_OPTIONS.map((temp) => (
                      <View
                        key={temp}
                        className={[
                          styles.tempBtn,
                          item.tempOptions.includes(temp) ? styles.tempBtnActive : ''
                        ].join(' ')}
                        onClick={() => handleTempToggle(item.productId, temp)}
                      >
                        <Text className={styles.tempBtnText}>{temp}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            </View>
          )
        })}
      </View>

      {/* 底部汇总 + 发布按钮 */}
      <View className={styles.footer}>
        <View className={styles.footerSummary}>
          <Text className={styles.footerLabel}>今日总余量</Text>
          <Text className={styles.footerValue}>{totalStock} 杯</Text>
        </View>
        <View
          className={[styles.submitBtn, submitting ? styles.submitBtnLoading : ''].join(' ')}
          onClick={handleSubmit}
        >
          <Text className={styles.submitBtnText}>
            {submitting ? '处理中...' : hasPublishedToday ? '确认修改' : '确认发布'}
          </Text>
        </View>
      </View>

      <MerchantTabBar current='/pages/merchant/publish/index' />
    </View>
  )
}
