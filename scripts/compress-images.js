/**
 * 压缩咖啡图片
 * 运行：node scripts/compress-images.js
 */
const sharp = require('sharp')
const path = require('path')
const fs = require('fs')

const DIR = path.resolve(__dirname, '../src/assets/images/coffee')
const TARGETS = [1, 2, 3, 4, 5,6]  // 只压缩这6张

async function compress(index) {
  const file = path.join(DIR, `${index}.png`)
  const tmp = path.join(DIR, `${index}_tmp.png`)

  const before = fs.statSync(file).size

  await sharp(file)
    .resize(300, 300, { fit: 'cover', position: 'centre' })
    .png({ quality: 80, compressionLevel: 9 })
    .toFile(tmp)

  const after = fs.statSync(tmp).size

  // 替换原文件
  fs.renameSync(tmp, file)

  console.log(`${index}.png: ${(before / 1024).toFixed(0)}KB → ${(after / 1024).toFixed(0)}KB`)
}

async function main() {
  console.log('🗜️  开始压缩图片...\n')
  for (const i of TARGETS) {
    await compress(i)
  }
  console.log('\n✅ 压缩完成！')
}

main().catch(console.error)
