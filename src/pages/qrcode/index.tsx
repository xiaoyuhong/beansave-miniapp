import { View, Text } from '@tarojs/components'
import { useMemo, useEffect, useState } from 'react'
import Taro, { useRouter } from '@tarojs/taro'
import dayjs from 'dayjs'
import qrcode from 'qrcode-generator'
import styles from './index.module.scss'

// 获取屏幕宽度（px），二维码占屏幕宽度减去左右 padding
const { windowWidth } = Taro.getSystemInfoSync()
const QR_SIZE = windowWidth - 96  // 左右各 48px padding

function QrCodeMatrix({ text }: { text: string }) {
  const { cells, count } = useMemo(() => {
    const qr = qrcode(0, 'M')
    qr.addData(text)
    qr.make()
    const n = qr.getModuleCount()
    const cells: boolean[][] = []
    for (let r = 0; r < n; r++) {
      const row: boolean[] = []
      for (let c = 0; c < n; c++) {
        row.push(qr.isDark(r, c))
      }
      cells.push(row)
    }
    return { cells, count: n }
  }, [text])

  const cellPx = Math.floor(QR_SIZE / count)
  const actualSize = cellPx * count

  return (
    <View style={{ width: actualSize + 'px', height: actualSize + 'px', backgroundColor: '#ffffff', flexShrink: 0 }}>
      {cells.map((row, r) => (
        <View key={r} style={{ display: 'flex', flexDirection: 'row', height: cellPx + 'px' }}>
          {row.map((dark, c) => (
            <View
              key={c}
              style={{
                width: cellPx + 'px',
                height: cellPx + 'px',
                backgroundColor: dark ? '#1a1a1a' : '#ffffff',
                flexShrink: 0
              }}
            />
          ))}
        </View>
      ))}
    </View>
  )
}

// 计算距过期的剩余秒数
function getSecondsLeft(expiredAt: string): number {
  return Math.max(0, dayjs(decodeURIComponent(expiredAt)).diff(dayjs(), 'second'))
}

// 格式化为 mm:ss
function formatCountdown(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export default function QrCode() {
  const router = useRouter()
  const { verifyCode, orderNo, productName: rawProductName, expiredAt } = router.params
  const productName = rawProductName ? decodeURIComponent(rawProductName) : ''

  // 实时倒计时
  const [secondsLeft, setSecondsLeft] = useState(() =>
    expiredAt ? getSecondsLeft(expiredAt) : 0
  )

  useEffect(() => {
    if (!expiredAt) return
    const timer = setInterval(() => {
      const left = getSecondsLeft(expiredAt)
      setSecondsLeft(left)
      if (left === 0) clearInterval(timer)
    }, 1000)
    return () => clearInterval(timer)
  }, [expiredAt])

  const isExpiringSoon = secondsLeft > 0 && secondsLeft <= 300  // 5 分钟内变红
  const isExpired = secondsLeft === 0 && !!expiredAt

  if (!verifyCode) {
    return (
      <View className={styles.container}>
        <Text>参数错误</Text>
      </View>
    )
  }

  return (
    <View className={styles.container}>
      <View className={styles.card}>
        <Text className={styles.title}>出示核销码</Text>
        <Text className={styles.subtitle}>请将二维码出示给店员扫描</Text>

        {/* 二维码 + 四角装饰框 */}
        <View className={styles.qrcodeWrap}>
          <View className={styles.cornerTL} />
          <View className={styles.cornerTR} />
          <View className={styles.cornerBL} />
          <View className={styles.cornerBR} />
          <View className={styles.qrcodeInner}>
            <QrCodeMatrix text={verifyCode} />
          </View>
        </View>

        {/* 过期遮罩 */}
        {isExpired && (
          <View className={styles.expiredMask}>
            <Text className={styles.expiredMaskText}>核销码已过期</Text>
          </View>
        )}

        <View className={styles.info}>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>商品</Text>
            <Text className={styles.infoValue}>{productName}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>订单号</Text>
            <Text className={styles.infoValue}>{orderNo}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>剩余时间</Text>
            {isExpired ? (
              <Text className={styles.infoValueExpired}>已过期</Text>
            ) : (
              <Text className={[
                styles.infoValueCountdown,
                isExpiringSoon ? styles.infoValueWarn : ''
              ].join(' ')}>
                {formatCountdown(secondsLeft)}
              </Text>
            )}
          </View>
        </View>
      </View>

      <View className={styles.backBtn} onClick={() => Taro.navigateBack()}>
        <Text className={styles.backBtnText}>返回订单</Text>
      </View>
    </View>
  )
}
