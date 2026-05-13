import { View, Text } from '@tarojs/components'
import { useState } from 'react'
import Taro from '@tarojs/taro'
import { useUserStore } from '@/store/useUserStore'
import { verifyOrder } from '@/api/order'
import { Order } from '@/types'
import dayjs from 'dayjs'
import MerchantTabBar from '@/components/MerchantTabBar'
import styles from './index.module.scss'

export default function MerchantScan() {
  const { userInfo } = useUserStore()
  const [scanning, setScanning] = useState(false)
  const [lastVerified, setLastVerified] = useState<Order | null>(null)
  const [error, setError] = useState('')

  if (userInfo?.role !== 'admin') {
    return (
      <View className={styles.noPermission}>
        <Text className={styles.noPermissionText}>无商家权限</Text>
      </View>
    )
  }

  const handleScan = async () => {
    if (scanning) return
    setScanning(true)
    setError('')
    setLastVerified(null)

    try {
      // 调用微信扫码 API
      const { result } = await Taro.scanCode({
        onlyFromCamera: true,
        scanType: ['qrCode']
      })

      // result 就是二维码内容（核销码）
      const verifyCode = result

      // 调用核销接口
      const order = await verifyOrder(verifyCode)
      setLastVerified(order)
      Taro.showToast({ title: '核销成功 ✅', icon: 'success' })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '核销失败'
      if (msg !== 'cancel') {
        setError(msg)
        Taro.showToast({ title: msg, icon: 'none' })
      }
    } finally {
      setScanning(false)
    }
  }

  return (
    <View className={styles.container}>
      {/* 扫码区域 */}
      <View className={styles.scanSection}>
        <View className={styles.scanFrame} onClick={handleScan}>
          <View className={styles.scanCornerTL} />
          <View className={styles.scanCornerTR} />
          <View className={styles.scanCornerBL} />
          <View className={styles.scanCornerBR} />
          <Text className={styles.scanIcon}>📷</Text>
          <Text className={styles.scanText}>
            {scanning ? '扫描中...' : '点击扫描核销码'}
          </Text>
        </View>
        <Text className={styles.scanTip}>
          请扫描用户订单页面的核销二维码
        </Text>
      </View>

      {/* 错误提示 */}
      {error && (
        <View className={styles.errorCard}>
          <Text className={styles.errorIcon}>❌</Text>
          <Text className={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* 核销成功结果 */}
      {lastVerified && (
        <View className={styles.resultCard}>
          <View className={styles.resultHeader}>
            <Text className={styles.resultIcon}>✅</Text>
            <Text className={styles.resultTitle}>核销成功</Text>
          </View>
          <View className={styles.resultBody}>
            <View className={styles.resultRow}>
              <Text className={styles.resultLabel}>订单号</Text>
              <Text className={styles.resultValue}>{lastVerified.orderNo}</Text>
            </View>
            <View className={styles.resultRow}>
              <Text className={styles.resultLabel}>咖啡</Text>
              <Text className={styles.resultValue}>
                {lastVerified.product.name} × {lastVerified.quantity}
              </Text>
            </View>
            <View className={styles.resultRow}>
              <Text className={styles.resultLabel}>金额</Text>
              <Text className={styles.resultValue}>
                ¥{(lastVerified.totalAmount / 100).toFixed(2)}
              </Text>
            </View>
            <View className={styles.resultRow}>
              <Text className={styles.resultLabel}>核销时间</Text>
              <Text className={styles.resultValue}>
                {dayjs(lastVerified.verifiedAt).format('HH:mm:ss')}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* 继续扫码按钮 */}
      {lastVerified && (
        <View className={styles.continueBtn} onClick={handleScan}>
          <Text className={styles.continueBtnText}>继续扫码</Text>
        </View>
      )}
      <MerchantTabBar current='/pages/merchant/scan/index' />
    </View>
  )
}
