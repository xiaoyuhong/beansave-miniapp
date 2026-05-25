import { View, Text, Image } from '@tarojs/components'
import { useEffect, useState } from 'react'
import Taro, { useRouter } from '@tarojs/taro'
import { useProductStore } from '@/store/useProductStore'
import { useOrderStore } from '@/store/useOrderStore'
import { useCouponStore } from '@/store/useCouponStore'
import { createOrder } from '@/api/order'
import { Product, Coupon, TempOption } from '@/types'
import styles from './index.module.scss'

export default function OrderConfirm() {
  const router = useRouter()
  const productId = router.params.productId || ''

  const { products, updateStock } = useProductStore()
  const { addOrder } = useOrderStore()
  const { getAvailableCoupons, useCoupon } = useCouponStore()

  // useState-React的状态 Hook,声明一个组件内的状态变量，返回[当前值，修改函数]
  const [product, setProduct] = useState<Product | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null)
  const [selectedTemp, setSelectedTemp] = useState<TempOption | null>(null)
  const [paying, setPaying] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [confirmedTemp, setConfirmedTemp] = useState<string>('')  // 下单时锁定的温度

  const availableCoupons = getAvailableCoupons()

  useEffect(() => {
    const found = products.find((p) => p.id === productId)
    if (!found) {
      Taro.showToast({ title: '商品不存在', icon: 'none' })
      Taro.navigateBack()
      return
    }
    setProduct(found)
    // 自动选第一个温度选项
    if (found.tempOptions && found.tempOptions.length > 0) {
      setSelectedTemp(found.tempOptions[0])
    }
    // 自动选择可用优惠券
    const coupon = availableCoupons.find(
      (c) => found.salePrice >= c.minAmount
    )
    if (coupon) setSelectedCoupon(coupon)
  }, [productId, products])

  if (!product) return null

  const subtotal = product.salePrice * quantity
  const discount = selectedCoupon && subtotal >= selectedCoupon.minAmount
    ? selectedCoupon.amount
    : 0
  const total = Math.max(0, subtotal - discount)

  const handleQuantityChange = (delta: number) => {
    const next = quantity + delta
    if (next < 1) return
    if (next > 3) {
      Taro.showToast({ title: '每人限购 3 杯', icon: 'none' })
      return
    }
    if (next > product.stock) {
      Taro.showToast({ title: '库存不足', icon: 'none' })
      return
    }
    setQuantity(next)
  }

  const handlePay = async () => {
    if (paying) return

    // 校验今日已购杯数
    const todayOrders = useOrderStore.getState().orders.filter((o) => {
      const isToday = new Date(o.createdAt).toDateString() === new Date().toDateString()
      return isToday && o.status !== 'expired'
    })
    const todayQty = todayOrders.reduce((sum, o) => sum + o.quantity, 0)
    if (todayQty + quantity > 3) {
      Taro.showToast({
        title: `今日已购 ${todayQty} 杯，每天限购 3 杯`,
        icon: 'none'
      })
      return
    }

    setPaying(true)

    try {
      // 模拟支付弹窗
      await new Promise<void>((resolve, reject) => {
        Taro.showModal({
          title: '模拟支付',
          content: `确认支付 ¥${(total / 100).toFixed(2)}？\n（当前为模拟支付，不会扣款）`,
          confirmText: '确认支付',
          success: (res) => {
            if (res.confirm) resolve()
            else reject(new Error('cancel'))
          }
        })
      })

      // 创建订单
      const order = await createOrder({
        productId: product.id,
        quantity,
        couponId: selectedCoupon?.id,
        tempOption: selectedTemp ?? undefined
      })

      // 更新库存
      updateStock(product.id, -quantity)

      // 使用优惠券
      if (selectedCoupon) useCoupon(selectedCoupon.id)

      // 保存订单
      addOrder(order)

      // 锁定当前温度，显示成功动画
      setConfirmedTemp(selectedTemp ?? '')
      setShowSuccess(true)
      setTimeout(() => {
        Taro.switchTab({ url: '/pages/orders/index' })
      }, 2000)
    } catch (err: unknown) {
      if (err instanceof Error && err.message !== 'cancel') {
        Taro.showToast({ title: '下单失败，请重试', icon: 'none' })
      }
    } finally {
      setPaying(false)
    }
  }

  return (
    <View className={styles.container}>
      {/* 下单成功动画覆盖层 */}
      {showSuccess && (
        <View className={styles.successOverlay}>
          <View className={styles.successCard}>
            <View className={styles.successIconWrap}>
              <Text className={styles.successIcon}>✓</Text>
            </View>
            <Text className={styles.successTitle}>下单成功！</Text>
            <Text className={styles.successSub}>
              {product?.name} × {quantity}
              {confirmedTemp ? `  ${confirmedTemp}` : ''}
            </Text>
            <Text className={styles.successAmount}>
              ¥{(total / 100).toFixed(2)}
            </Text>
            <Text className={styles.successTip}>正在跳转订单页...</Text>
          </View>
        </View>
      )}
      {/* 商品信息 */}
      <View className={styles.productCard}>
        <View className={styles.productImage}>
          {product.imageUrl ? (
            <Image src={product.imageUrl} className={styles.productImg} mode='aspectFill' />
          ) : (
            <Text className={styles.productEmoji}>☕</Text>
          )}
        </View>
        <View className={styles.productInfo}>
          <Text className={styles.productName}>{product.name}</Text>
          <Text className={styles.productDesc}>{product.description}</Text>
          <View className={styles.priceRow}>
            <Text className={styles.salePrice}>
              ¥{(product.salePrice / 100).toFixed(0)}
            </Text>
            <Text className={styles.originalPrice}>
              原价 ¥{(product.originalPrice / 100).toFixed(0)}
            </Text>
          </View>
        </View>
      </View>

      {/* 数量选择 */}
      <View className={styles.section}>
        <Text className={styles.sectionLabel}>购买数量</Text>
        <View className={styles.quantityControl}>
          <View
            className={[styles.quantityBtn, quantity <= 1 ? styles.quantityBtnDisabled : ''].join(' ')}
            onClick={() => handleQuantityChange(-1)}
          >
            <Text className={styles.quantityBtnText}>−</Text>
          </View>
          <Text className={styles.quantityValue}>{quantity}</Text>
          <View
            className={[styles.quantityBtn, quantity >= 3 ? styles.quantityBtnDisabled : ''].join(' ')}
            onClick={() => handleQuantityChange(1)}
          >
            <Text className={styles.quantityBtnText}>+</Text>
          </View>
          <Text className={styles.quantityLimit}>每人限购 3 杯</Text>
        </View>
      </View>

      {/* 温度选择 */}
      {product.tempOptions && product.tempOptions.length > 0 && (
        <View className={styles.section}>
          <Text className={styles.sectionLabel}>温度选择</Text>
          <View className={styles.tempOptionList}>
            {product.tempOptions.map((temp) => (
              <View
                key={temp}
                className={[
                  styles.tempOption,
                  selectedTemp === temp ? styles.tempOptionActive : ''
                ].join(' ')}
                onClick={() => setSelectedTemp(temp)}
              >
                <Text className={styles.tempOptionText}>{temp}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* 优惠券 */}
      {availableCoupons.length > 0 && (
        <View className={styles.section}>
          <Text className={styles.sectionLabel}>优惠券</Text>
          {availableCoupons.map((coupon) => {
            const applicable = subtotal >= coupon.minAmount
            const isSelected = selectedCoupon?.id === coupon.id
            return (
              <View
                key={coupon.id}
                className={[
                  styles.couponItem,
                  isSelected ? styles.couponSelected : '',
                  !applicable ? styles.couponDisabled : ''
                ].join(' ')}
                onClick={() => applicable && setSelectedCoupon(isSelected ? null : coupon)}
              >
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
                    {coupon.type === 'new_user' ? '新人券' : '分享券'}
                  </Text>
                  {!applicable && (
                    <Text className={styles.couponNotApplicable}>不满足条件</Text>
                  )}
                </View>
                {isSelected && <Text className={styles.couponCheck}>✓</Text>}
              </View>
            )
          })}
        </View>
      )}

      {/* 费用明细 */}
      <View className={styles.section}>
        <Text className={styles.sectionLabel}>费用明细</Text>
        <View className={styles.feeList}>
          <View className={styles.feeItem}>
            <Text className={styles.feeLabel}>商品金额</Text>
            <Text className={styles.feeValue}>
              ¥{(subtotal / 100).toFixed(2)}
            </Text>
          </View>
          {discount > 0 && (
            <View className={styles.feeItem}>
              <Text className={styles.feeLabel}>优惠券</Text>
              <Text className={[styles.feeValue, styles.feeDiscount].join(' ')}>
                -¥{(discount / 100).toFixed(2)}
              </Text>
            </View>
          )}
          <View className={[styles.feeItem, styles.feeTotal].join(' ')}>
            <Text className={styles.feeTotalLabel}>实付金额</Text>
            <Text className={styles.feeTotalValue}>
              ¥{(total / 100).toFixed(2)}
            </Text>
          </View>
        </View>
      </View>

      {/* 自提提示 */}
      <View className={styles.tipCard}>
        <Text className={styles.tipText}>
          📍 到店自提：上海市松江区文汇路 718 号
        </Text>
        <Text className={styles.tipText}>
          ⏰ 请于今日 20:00 前凭核销码到店取咖啡
        </Text>
        <Text className={styles.tipText}>
          💰 当前为模拟支付，不会产生真实扣款
        </Text>
      </View>

      {/* 底部支付栏 */}
      <View className={styles.payBar}>
        <View className={styles.payBarLeft}>
          <Text className={styles.payBarLabel}>实付</Text>
          <Text className={styles.payBarAmount}>
            ¥{(total / 100).toFixed(2)}
          </Text>
        </View>
        <View
          className={[styles.payBtn, paying ? styles.payBtnLoading : ''].join(' ')}
          onClick={handlePay}
        >
          <Text className={styles.payBtnText}>
            {paying ? '处理中...' : '确认支付'}
          </Text>
        </View>
      </View>
    </View>
  )
}
