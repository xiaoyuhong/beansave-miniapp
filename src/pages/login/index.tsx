import { View, Text } from '@tarojs/components'
import { useState } from 'react'
import Taro from '@tarojs/taro'
import { wxLogin } from '@/api/user'
import { useUserStore } from '@/store/useUserStore'
import styles from './index.module.scss'

type MockRole = 'user' | 'admin'

export default function Login() {
  const { setUserInfo } = useUserStore()
  const [loading, setLoading] = useState(false)
  const [mockRole, setMockRole] = useState<MockRole>('user')

  const isDev = APP_ENV === 'development'

  const handleLogin = async (role: MockRole = mockRole) => {
    if (loading) return
    setLoading(true)
    try {
      // TODO: 后端就绪后取消注释，使用真实微信登录
      // const res = await Taro.login()
      // const code = res.code
      const code = 'mock_code'

      const userInfo = await wxLogin(code, role)
      setUserInfo(userInfo)
      if (userInfo.role === 'admin') {
        Taro.navigateTo({ url: '/pages/merchant/publish/index' })
      } else {
        Taro.switchTab({ url: '/pages/home/index' })
      }
    } catch (err) {
      Taro.showToast({ title: '登录失败，请重试', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <View className={styles.container}>
      {/* Logo 区域 */}
      <View className={styles.logoSection}>
        <View className={styles.logoCircle}>
          <Text className={styles.logoEmoji}>☕</Text>
        </View>
        <Text className={styles.appName}>BeanSave</Text>
        <Text className={styles.appSlogan}>每天下午 3 点，半价精品咖啡等你来</Text>
      </View>

      {/* 店铺信息 */}
      <View className={styles.shopInfo}>
        <View className={styles.shopInfoItem}>
          <Text className={styles.shopInfoIcon}>📍</Text>
          <Text className={styles.shopInfoText}>上海市松江区文汇路 718 号</Text>
        </View>
        <View className={styles.shopInfoItem}>
          <Text className={styles.shopInfoIcon}>🕐</Text>
          <Text className={styles.shopInfoText}>营业时间 08:00 – 20:00</Text>
        </View>
        <View className={styles.shopInfoItem}>
          <Text className={styles.shopInfoIcon}>☕</Text>
          <Text className={styles.shopInfoText}>余量咖啡 15:00 开抢，5 折起优惠</Text>
        </View>
      </View>

      {/* 登录按钮 */}
      <View className={styles.loginSection}>
        <View
          className={[styles.loginBtn, loading ? styles.loginBtnLoading : ''].join(' ')}
          onClick={() => handleLogin('user')}
        >
          <Text className={styles.loginBtnText}>
            {loading ? '登录中...' : '微信一键登录'}
          </Text>
        </View>
        <Text className={styles.loginTip}>登录即代表同意《用户协议》和《隐私政策》</Text>
      </View>

      {/* 开发调试入口（仅开发环境显示） */}
      {isDev && (
        <View className={styles.devSection}>
          <View className={styles.devHeader}>
            <Text className={styles.devTitle}>🛠 开发调试</Text>
          </View>
          <View className={styles.devBtns}>
            <View
              className={[
                styles.devBtn,
                mockRole === 'user' ? styles.devBtnActive : ''
              ].join(' ')}
              onClick={() => {
                setMockRole('user')
                handleLogin('user')
              }}
            >
              <Text className={styles.devBtnIcon}>👤</Text>
              <Text className={styles.devBtnText}>普通用户登录</Text>
              <Text className={styles.devBtnDesc}>C端功能</Text>
            </View>
            <View
              className={[
                styles.devBtn,
                mockRole === 'admin' ? styles.devBtnActive : ''
              ].join(' ')}
              onClick={() => {
                setMockRole('admin')
                handleLogin('admin')
              }}
            >
              <Text className={styles.devBtnIcon}>🏪</Text>
              <Text className={styles.devBtnText}>商家登录</Text>
              <Text className={styles.devBtnDesc}>商家端功能</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  )
}
