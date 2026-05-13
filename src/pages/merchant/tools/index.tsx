import { View, Text } from '@tarojs/components'
import { useState, useEffect } from 'react'
import Taro from '@tarojs/taro'
import { Input } from '@nutui/nutui-react-taro'
import { useUserStore } from '@/store/useUserStore'
import { MOCK_PRODUCTS } from '@/mock/data'
import { saveStorage, loadStorage } from '@/utils/storage'
import { TempOption } from '@/types'
import MerchantTabBar from '@/components/MerchantTabBar'
import styles from './index.module.scss'

const ALL_TEMP_OPTIONS: TempOption[] = ['正常冰', '少冰', '不加冰', '热']

export interface ProductTemplate {
  id: string
  name: string
  originalPrice: number
  salePrice: number
  tempOptions: TempOption[]
  isCustom?: boolean
}

const STORAGE_KEY = 'bs_merchant_products'

export default function MerchantTools() {
  const { userInfo } = useUserStore()
  const [products, setProducts] = useState<ProductTemplate[]>([])
  const [newName, setNewName] = useState('')
  const [newPrice, setNewPrice] = useState('')
  const [newTempOptions, setNewTempOptions] = useState<TempOption[]>([...ALL_TEMP_OPTIONS])
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    const saved = loadStorage<ProductTemplate[]>(STORAGE_KEY)
    const templates = saved && saved.length > 0
      ? saved
      : MOCK_PRODUCTS.map((p) => ({
          id: p.id,
          name: p.name,
          originalPrice: p.originalPrice,
          salePrice: p.salePrice,
          tempOptions: p.tempOptions ?? [...ALL_TEMP_OPTIONS],
          isCustom: false
        }))
    setProducts(templates)
  }, [])

  if (userInfo?.role !== 'admin') {
    return (
      <View className={styles.noPermission}>
        <Text className={styles.noPermissionText}>无商家权限</Text>
      </View>
    )
  }

  // 新品类温度切换
  const handleNewTempToggle = (temp: TempOption) => {
    setNewTempOptions((prev) =>
      prev.includes(temp) ? prev.filter((t) => t !== temp) : [...prev, temp]
    )
  }

  // 已有品类温度切换
  const handleTempToggle = (productId: string, temp: TempOption) => {
    const updated = products.map((p) => {
      if (p.id !== productId) return p
      const has = p.tempOptions.includes(temp)
      return {
        ...p,
        tempOptions: has
          ? p.tempOptions.filter((t) => t !== temp)
          : [...p.tempOptions, temp]
      }
    })
    setProducts(updated)
    saveStorage(STORAGE_KEY, updated)
  }

  const handleAdd = () => {
    if (!newName.trim()) {
      Taro.showToast({ title: '请输入咖啡名称', icon: 'none' })
      return
    }
    const price = parseFloat(newPrice)
    if (isNaN(price) || price <= 0) {
      Taro.showToast({ title: '请输入有效价格', icon: 'none' })
      return
    }
    if (newTempOptions.length === 0) {
      Taro.showToast({ title: '请至少选择一个温度选项', icon: 'none' })
      return
    }

    const originalPrice = Math.round(price * 100)
    const salePrice = Math.floor(originalPrice * 0.5)

    const newProduct: ProductTemplate = {
      id: `custom_${Date.now()}`,
      name: newName.trim(),
      originalPrice,
      salePrice,
      tempOptions: [...newTempOptions],
      isCustom: true
    }

    const updated = [...products, newProduct]
    setProducts(updated)
    saveStorage(STORAGE_KEY, updated)
    setNewName('')
    setNewPrice('')
    setNewTempOptions([...ALL_TEMP_OPTIONS])
    setAdding(false)
    Taro.showToast({ title: '品类已添加 ✅', icon: 'none' })
  }

  const handleDelete = (id: string) => {
    Taro.showModal({
      title: '删除品类',
      content: '确定删除该品类？删除后发布余量时将不再显示。',
      confirmColor: '#F44336',
      success: (res) => {
        if (res.confirm) {
          const updated = products.filter((p) => p.id !== id)
          setProducts(updated)
          saveStorage(STORAGE_KEY, updated)
        }
      }
    })
  }

  return (
    <View className={styles.container}>
      {/* 添加品类区域 */}
      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>添加新品类</Text>
        </View>

        {adding ? (
          <View className={styles.addForm}>
            <View className={styles.formField}>
              <Text className={styles.formLabel}>咖啡名称</Text>
              <View className={styles.inputWrap}>
                <Input
                  placeholder='例如：燕麦拿铁'
                  value={newName}
                  onChange={setNewName}
                  className={styles.input}
                />
              </View>
            </View>
            <View className={styles.formField}>
              <Text className={styles.formLabel}>原价（元）</Text>
              <View className={styles.inputWrap}>
                <Input
                  type='digit'
                  placeholder='例如：32'
                  value={newPrice}
                  onChange={setNewPrice}
                  className={styles.input}
                />
              </View>
            </View>
            {newPrice && !isNaN(parseFloat(newPrice)) && (
              <View className={styles.pricePreview}>
                <Text className={styles.pricePreviewText}>
                  💡 售价预览：¥{Math.floor(parseFloat(newPrice) * 0.5).toFixed(0)}（5折起）
                </Text>
              </View>
            )}
            {/* 温度选项 */}
            <View className={styles.formField}>
              <Text className={styles.formLabel}>温度选项（可多选）</Text>
              <View className={styles.tempBtns}>
                {ALL_TEMP_OPTIONS.map((temp) => (
                  <View
                    key={temp}
                    className={[
                      styles.tempBtn,
                      newTempOptions.includes(temp) ? styles.tempBtnActive : ''
                    ].join(' ')}
                    onClick={() => handleNewTempToggle(temp)}
                  >
                    <Text className={styles.tempBtnText}>{temp}</Text>
                  </View>
                ))}
              </View>
            </View>
            <View className={styles.formBtns}>
              <View
                className={styles.cancelBtn}
                onClick={() => {
                  setAdding(false)
                  setNewName('')
                  setNewPrice('')
                  setNewTempOptions([...ALL_TEMP_OPTIONS])
                }}
              >
                <Text className={styles.cancelBtnText}>取消</Text>
              </View>
              <View className={styles.confirmBtn} onClick={handleAdd}>
                <Text className={styles.confirmBtnText}>确认添加</Text>
              </View>
            </View>
          </View>
        ) : (
          <View className={styles.addTrigger} onClick={() => setAdding(true)}>
            <Text className={styles.addTriggerIcon}>➕</Text>
            <Text className={styles.addTriggerText}>点击添加新品类</Text>
          </View>
        )}
      </View>

      {/* 品类列表 */}
      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>当前品类</Text>
          <Text className={styles.sectionCount}>{products.length} 款</Text>
        </View>

        {products.map((product) => (
          <View key={product.id} className={styles.productItem}>
            <View className={styles.productLeft}>
              <Text className={styles.productEmoji}>☕</Text>
              <View className={styles.productInfo}>
                <View className={styles.productNameRow}>
                  <Text className={styles.productName}>{product.name}</Text>
                  {product.isCustom && (
                    <View className={styles.customTag}>
                      <Text className={styles.customTagText}>自定义</Text>
                    </View>
                  )}
                </View>
                <Text className={styles.productPrice}>
                  原价 ¥{(product.originalPrice / 100).toFixed(0)} · 售价 ¥{(product.salePrice / 100).toFixed(0)}
                </Text>
                {/* 温度选项编辑 */}
                <View className={styles.tempRow}>
                  {ALL_TEMP_OPTIONS.map((temp) => (
                    <View
                      key={temp}
                      className={[
                        styles.tempTag,
                        product.tempOptions?.includes(temp) ? styles.tempTagActive : ''
                      ].join(' ')}
                      onClick={() => handleTempToggle(product.id, temp)}
                    >
                      <Text className={styles.tempTagText}>{temp}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
            {product.isCustom && (
              <View className={styles.deleteBtn} onClick={() => handleDelete(product.id)}>
                <Text className={styles.deleteBtnText}>删除</Text>
              </View>
            )}
          </View>
        ))}
      </View>

      <View className={styles.bottomPadding} />
      <MerchantTabBar current='/pages/merchant/tools/index' />
    </View>
  )
}
