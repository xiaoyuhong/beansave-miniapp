import { View, Text, ScrollView } from '@tarojs/components'
import { useEffect } from 'react'
import Taro, { arrayBufferToBase64, offPageNotFound } from '@tarojs/taro'
import dayjs from 'dayjs'
import dayOfYear from 'dayjs/plugin/dayOfYear'
import { useUserStore } from '@/store/useUserStore'
import { isSaleTime } from '@/api/product'
import styles from './index.module.scss'
dayjs.extend(dayOfYear)

// 每日咖啡知识
const COFFEE_TIPS = [
  { emoji: '☕', title: '为什么美式叫美式？', content: '二战时美国士兵嫌意式浓缩太苦，加水稀释后带回国，由此得名 Americano。' },
  { emoji: '🥛', title: '拿铁和卡布的区别', content: '拿铁奶多泡少，口感顺滑；卡布奇诺奶泡厚实，咖啡味更突出，比例是 1:1:1。' },
  { emoji: '🫘', title: '精品咖啡是什么？', content: '精品咖啡指 SCA 评分 80 分以上的咖啡豆，注重产地溯源、处理方式和风味表达。' },
  { emoji: '❄️', title: '冷萃 vs 冰美式', content: '冷萃用冷水长时间浸泡（12h+），口感顺滑低酸；冰美式是热萃后加冰，风味更明亮。' },
  { emoji: '🌡️', title: '最佳萃取温度', content: '手冲咖啡最佳水温是 90–96°C，水温过高会过萃发苦，过低则萃取不足偏酸。' },
  { emoji: '🏆', title: '馥芮白的起源', content: '馥芮白（Flat White）起源于澳大利亚，用 Ristretto 浓缩加少量丝绒奶，咖啡感更强。' },
]

// 口味推荐问题
const FLAVOR_QUIZ = [
  {
    question: '你更喜欢哪种口感？',
    options: [
      { label: '清爽不腻', result: '经典美式', emoji: '☕' },
      { label: '顺滑奶香', result: '拿铁', emoji: '🥛' },
      { label: '浓郁甜蜜', result: '焦糖玛奇朵', emoji: '🍮' },
    ]
  }
]

export default function Discover(){
  const {isLoggedIn}=useUserStore()
  const saleStarted=isSaleTime()

  //未登录跳转
  useEffect(()=>{
    if(!isLoggedIn){
      Taro.redirectTo({url:'/page/login/index'})
    }
  },[isLoggedIn])

  //根据日期固定显示哪条知识（每天换一条）
  const tipIndex=dayjs().dayOfYear() % COFFEE_TIPS.length
  const todayTip= COFFEE_TIPS[tipIndex]

  const handleGoMenu = () => {
    Taro.switchTab({url:'/pages/menu/index'})
  }

  const handleShare = () => {
    Taro.showToast({title:'分享功能即将上线',icon:'none'})
  }
  
  const handleQuizSelect=(result:string) => {
    Taro.showToast({title:'`推荐你试试${result} ☕`',icon:'none',duration:2000})
  }

  return(
    <ScrollView scrollY className={styles.container}>
      {/* 顶部Banner */}
      <View className={styles.banner}>
        <Text  className={styles.bannerTitle}>发现好咖啡✨</Text>
        <Text  className={styles.bannerSub}>每天一点咖啡知识，喝得更懂</Text>
      </View>

      {/* 开抢倒计时提示 */}
      {!saleStarted && (
        <View className={styles.saleHint} onClick={handleGoMenu}>
          <Text className={styles.saleHintText}>⏰ 今日余量 15:00 开抢，点击提前看菜单</Text>
        </View>
      )}
      {saleStarted &&(
        <View className={styles.saleHintActive} onClick={handleGoMenu}>
          <Text className={styles.saleHintText}>🔥 余量咖啡正在热卖！立即抢购 →</Text>
        </View>
      )}

      {/* 今题咖啡知识 */}
      <View className={styles.section}>
        <Text className={styles.sectionTitle}>今日咖啡知识</Text>
        <View className={styles.tipCard}>
          <Text className={styles.tipEmoji}>{todayTip.emoji}</Text>
          <View className={styles.tipContent}>
             <Text className={styles.tipTitle}>{todayTip.title}</Text>
             <Text className={styles.tipText}>{todayTip.content}</Text>
          </View>
        </View>
      </View>
      
      {/* 口味测试 */}
      <View className={styles.section}>
        <Text className={styles.sectionTitle}>今天喝什么？</Text>
        <View className={styles.quizCard}>
          <Text className={styles.quizQuestion}>{FLAVOR_QUIZ[0].question}</Text>
          <View className={styles.quizOption}>
            FLAVOR_QUIZ[0].options.map( (opt) => (
              <View 
              key={opt.label}
              className={styles.quizOption} 
              onClick={() => handleQuizSelect}
              >
                <Text className={styles.quizOptionEmoji}>{opt.emoji}</Text>
                <Text className={styles.quizOptionLabel}>{opt.label}</Text>
                <Text className={styles.quizOptionResult}>{opt.result}</Text>
              </View>
            ))
          </View>
        </View>
      </View>

      {/* 分享得券 */}
      <View className={styles.section}>
        <View className={styles.shareCard} onClick={handleShare}>
          <View className={styles.shareLeft}>
            <Text className={styles.shareTitle}>分享给朋友</Text>
            <Text className={styles.shareSub}>每成功邀请 1 人，得 3 元优惠券</Text>
          </View>
          <View className={styles.shareArrow}></View>
        </View>
      </View>

      {/* 所有知识卡片 */}
      <View className={styles.section}>
        <Text className={styles.sectionTitle}></Text>
        {COFFEE_TIPS.map((tip,i)=>(
          <View key={i} className={styles.encyclopediaItem}>
            <Text className={styles.encyclopediaEmoji}>{tip.emoji}</Text>
            <View className={styles.encyclopediaContent}>
              <Text className={styles.encyclopediaTitle}>{tip.title}</Text>
              <Text className={styles.encyclopediaText}>{tip.content}</Text>
            </View>
          </View>
        ))}
      </View>

      <View className={styles.bottomPadding}></View>
    </ScrollView>
  )
}