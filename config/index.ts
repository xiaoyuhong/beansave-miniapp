import { defineConfig } from '@tarojs/cli'
import path from 'path'

export default defineConfig<'vite'>({
  projectName: 'beansave-miniapp',
  date: '2024-01-01',
  designWidth: 750,
  deviceRatio: {
    640: 2.34 / 2,
    750: 1,
    375: 2,
    828: 1.81 / 2
  },
  sourceRoot: 'src',
  outputRoot: 'dist',
  plugins: ['@tarojs/plugin-platform-weapp'],
  defineConstants: {
    // Mock 模式下使用本地 mock 数据，不需要真实 API
    API_BASE_URL: JSON.stringify(process.env.NODE_ENV === 'production'
      ? 'https://api.beansave.com'
      : 'http://localhost:3000'),  // 开发环境使用本地地址（实际不会调用，因为有 IS_MOCK）
    APP_ENV: JSON.stringify(process.env.NODE_ENV === 'production'
      ? 'production'
      : 'development')
  },
  copy: {
    patterns: [],
    options: {}
  },
  framework: 'react',
  compiler: 'vite',
  alias: {
    '@': path.resolve(__dirname, '..', 'src')
  },
  mini: {
    postcss: {
      pxtransform: {
        enable: true,
        config: {}
      },
      cssModules: {
        enable: true,
        config: {
          namingPattern: 'module',
          generateScopedName: '[name]__[local]___[hash:base64:5]'
        }
      }
    }
  },
  h5: {
    publicPath: '/',
    staticDirectory: 'static',
    postcss: {
      autoprefixer: {
        enable: true,
        config: {}
      },
      cssModules: {
        enable: true,
        config: {
          namingPattern: 'module',
          generateScopedName: '[name]__[local]___[hash:base64:5]'
        }
      }
    }
  }
})
