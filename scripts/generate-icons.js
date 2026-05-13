/**
 * 生成 TabBar 图标 PNG
 * 运行：node scripts/generate-icons.js
 */
const sharp = require('sharp')
const path = require('path')
const fs = require('fs')

const OUTPUT_DIR = path.resolve(__dirname, '../src/assets/icons')
fs.mkdirSync(OUTPUT_DIR, { recursive: true })

const SIZE = 81
const COLOR_NORMAL = '#999999'   // 未选中：灰色
const COLOR_ACTIVE = '#6F4E37'   // 选中：咖啡棕

// SVG 图标定义
const ICONS = {
  // 首页：房子形状
  'home': (color) => `
    <svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 81 81">
      <path d="M40.5 12 L70 38 L64 38 L64 66 L50 66 L50 50 L31 50 L31 66 L17 66 L17 38 L11 38 Z"
        fill="none" stroke="${color}" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
    </svg>`,

  // 首页激活：房子填充
  'home-active': (color) => `
    <svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 81 81">
      <path d="M40.5 12 L70 38 L64 38 L64 66 L50 66 L50 50 L31 50 L31 66 L17 66 L17 38 L11 38 Z"
        fill="${color}" stroke="${color}" stroke-width="2" stroke-linejoin="round"/>
    </svg>`,

  // 点咖啡：咖啡杯
  'menu': (color) => `
    <svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 81 81">
      <path d="M20 30 L55 30 L51 60 L24 60 Z"
        fill="none" stroke="${color}" stroke-width="4" stroke-linejoin="round"/>
      <path d="M55 35 Q68 35 68 45 Q68 55 55 55"
        fill="none" stroke="${color}" stroke-width="4" stroke-linecap="round"/>
      <line x1="15" y1="65" x2="60" y2="65" stroke="${color}" stroke-width="4" stroke-linecap="round"/>
      <path d="M30 24 Q32 18 30 13" fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round"/>
      <path d="M40 24 Q42 18 40 13" fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round"/>
    </svg>`,

  // 点咖啡激活
  'menu-active': (color) => `
    <svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 81 81">
      <path d="M20 30 L55 30 L51 60 L24 60 Z"
        fill="${color}" stroke="${color}" stroke-width="2" stroke-linejoin="round"/>
      <path d="M55 35 Q68 35 68 45 Q68 55 55 55"
        fill="none" stroke="${color}" stroke-width="4" stroke-linecap="round"/>
      <line x1="15" y1="65" x2="60" y2="65" stroke="${color}" stroke-width="4" stroke-linecap="round"/>
      <path d="M30 24 Q32 18 30 13" fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round"/>
      <path d="M40 24 Q42 18 40 13" fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round"/>
    </svg>`,

  // 订单：文档
  'orders': (color) => `
    <svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 81 81">
      <rect x="18" y="12" width="45" height="57" rx="4"
        fill="none" stroke="${color}" stroke-width="4"/>
      <line x1="28" y1="28" x2="53" y2="28" stroke="${color}" stroke-width="3.5" stroke-linecap="round"/>
      <line x1="28" y1="40" x2="53" y2="40" stroke="${color}" stroke-width="3.5" stroke-linecap="round"/>
      <line x1="28" y1="52" x2="43" y2="52" stroke="${color}" stroke-width="3.5" stroke-linecap="round"/>
    </svg>`,

  // 订单激活
  'orders-active': (color) => `
    <svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 81 81">
      <rect x="18" y="12" width="45" height="57" rx="4" fill="${color}"/>
      <line x1="28" y1="28" x2="53" y2="28" stroke="white" stroke-width="3.5" stroke-linecap="round"/>
      <line x1="28" y1="40" x2="53" y2="40" stroke="white" stroke-width="3.5" stroke-linecap="round"/>
      <line x1="28" y1="52" x2="43" y2="52" stroke="white" stroke-width="3.5" stroke-linecap="round"/>
    </svg>`,

  // 我的：人物
  'user': (color) => `
    <svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 81 81">
      <circle cx="40.5" cy="28" r="14"
        fill="none" stroke="${color}" stroke-width="4"/>
      <path d="M12 68 Q12 50 40.5 50 Q69 50 69 68"
        fill="none" stroke="${color}" stroke-width="4" stroke-linecap="round"/>
    </svg>`,

  // 我的激活
  'user-active': (color) => `
    <svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 81 81">
      <circle cx="40.5" cy="28" r="14" fill="${color}"/>
      <path d="M12 68 Q12 50 40.5 50 Q69 50 69 68"
        fill="none" stroke="${color}" stroke-width="4" stroke-linecap="round"/>
    </svg>`
}

async function generateIcon(name, svgFn, color) {
  const svg = svgFn(color)
  const outputPath = path.join(OUTPUT_DIR, `${name}.png`)
  await sharp(Buffer.from(svg))
    .png()
    .toFile(outputPath)
  console.log(`✅ ${name}.png`)
}

async function main() {
  console.log('🎨 开始生成 TabBar 图标...\n')
  const isActive = (name) => name.includes('active')
  for (const [name, svgFn] of Object.entries(ICONS)) {
    const color = isActive(name) ? COLOR_ACTIVE : COLOR_NORMAL
    await generateIcon(name, svgFn, color)
  }
  console.log(`\n✨ 完成！图标已生成到 src/assets/icons/`)
}

main().catch(console.error)
