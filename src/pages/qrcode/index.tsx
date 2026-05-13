import { View, Text } from '@tarojs/components'
import { useMemo } from 'react'
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

  // 每个格子的像素大小，向下取整保证不溢出
  const cellPx = Math.floor(QR_SIZE / count)
  // 实际渲染尺寸（可能比 QR_SIZE 略小，居中显示）
  const actualSize = cellPx * count

  return (
    <View style={{
      width: actualSize + 'px',
      height: actualSize + 'px',
      backgroundColor: '#ffffff',
      flexShrink: 0
    }}>
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

export default function QrCode() {
  const router = useRouter()
  const { verifyCode, orderNo, productName: rawProductName, expiredAt } = router.params
  const productName = rawProductName ? decodeURIComponent(rawProductName) : ''
  const timeLeft = expiredAt ? dayjs(decodeURIComponent(expiredAt)).format('HH:mm') : '20:00'

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

        <View className={styles.qrcodeWrap}>
          <QrCodeMatrix text={verifyCode} />
        </View>

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
            <Text className={styles.infoLabel}>截止时间</Text>
            <Text className={styles.infoValueWarn}>今日 {timeLeft} 前有效</Text>
          </View>
        </View>
      </View>

      <View className={styles.backBtn} onClick={() => Taro.navigateBack()}>
        <Text className={styles.backBtnText}>返回订单</Text>
      </View>
    </View>
  )
}
