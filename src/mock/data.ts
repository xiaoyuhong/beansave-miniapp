import img1 from '@/assets/images/coffee/1.png'
import img2 from '@/assets/images/coffee/2.png'
import img3 from '@/assets/images/coffee/3.png'
import img4 from '@/assets/images/coffee/4.png'
import img5 from '@/assets/images/coffee/5.png'
import img6 from '@/assets/images/coffee/6.png'
import { Product, Order, UserInfo, Coupon } from '@/types'
import dayjs from 'dayjs'

const coffeeImages: Record<string, string> = {
  '1': img1, '2': img2, '3': img3,
  '4': img4, '5': img5, '6': img6
}

// 今日过期时间：当日 20:00
const todayExpiredAt = dayjs().hour(20).minute(0).second(0).toISOString()

// 咖啡菜单（固定品类，库存每天随机）
const randomStock = () => Math.floor(Math.random() * 8) + 5 // 5~12

export const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: '经典美式',
    description: '醇厚顺滑，低卡选择',
    originalPrice: 2200,
    salePrice: 1100,
    discount: 5,
    tempOptions: ['正常冰', '少冰', '不加冰', '热'],
    stock: randomStock(),
    totalStock: 10,
    imageUrl: coffeeImages['1'],
    isAvailable: true
  },
  {
    id: '2',
    name: '拿铁',
    description: '牛奶与浓缩的经典融合',
    originalPrice: 2800,
    salePrice: 1400,
    discount: 5,
    tempOptions: ['正常冰', '少冰', '不加冰', '热'],
    stock: randomStock(),
    totalStock: 10,
    imageUrl: coffeeImages['2'],
    isAvailable: true
  },
  {
    id: '3',
    name: '卡布奇诺',
    description: '丰厚奶泡，绵密口感',
    originalPrice: 3000,
    salePrice: 1500,
    discount: 5,
    tempOptions: ['热', '少冰'],
    stock: randomStock(),
    totalStock: 10,
    imageUrl: coffeeImages['3'],
    isAvailable: true
  },
  {
    id: '4',
    name: '馥芮白',
    description: '澳洲风味，更浓咖啡',
    originalPrice: 3200,
    salePrice: 1600,
    discount: 5,
    tempOptions: ['正常冰', '少冰', '不加冰', '热'],
    stock: randomStock(),
    totalStock: 10,
    imageUrl: coffeeImages['4'],
    isAvailable: true
  },
  {
    id: '5',
    name: '焦糖玛奇朵',
    description: '甜蜜焦糖，女生最爱',
    originalPrice: 3400,
    salePrice: 1700,
    discount: 5,
    tempOptions: ['正常冰', '少冰', '不加冰'],
    stock: randomStock(),
    totalStock: 10,
    imageUrl: coffeeImages['5'],
    isAvailable: true
  },
  {
    id: '6',
    name: '摩卡',
    description: '巧克力与咖啡的碰撞',
    originalPrice: 3600,
    salePrice: 1800,
    discount: 5,
    tempOptions: ['正常冰', '少冰', '不加冰', '热'],
    stock: randomStock(),
    totalStock: 10,
    imageUrl: coffeeImages['6'],
    isAvailable: true
  }
]

// Mock 用户（C端）
export const MOCK_USER: UserInfo = {
  id: 'user_001',
  openid: 'mock_openid_001',
  nickName: '咖啡爱好者',
  avatarUrl: '',
  phone: '138****8888',
  role: 'user',
  token: 'mock_token_user_001'
}

// Mock 商家
export const MOCK_ADMIN: UserInfo = {
  id: 'admin_001',
  openid: 'mock_openid_admin',
  nickName: '店长',
  avatarUrl: '',
  phone: '400-882-1234',
  role: 'admin',
  token: 'mock_token_admin_001'
}

// Mock 订单（初始为空，由用户下单产生）
export const MOCK_ORDERS: Order[] = []

// Mock 优惠券
export const MOCK_COUPONS: Coupon[] = [
  {
    id: 'coupon_001',
    type: 'new_user',
    amount: 300,       // 3元
    minAmount: 1000,   // 满10元可用
    expiredAt: dayjs().add(30, 'day').toISOString(),
    isUsed: false
  }
]

// 店铺信息
export const SHOP_INFO = {
  name: 'BeanSave 咖啡（大学城店）',
  address: '上海市松江区文汇路 718 号（松江大学城二期）',
  phone: '400-882-1234',
  businessHours: '08:00 – 20:00',
  saleStartTime: '15:00',
  saleEndTime: '20:00',
  description: '位于大学城，每天下午 3 点上架余量精品咖啡，5 折抢购，到店自提。'
}
