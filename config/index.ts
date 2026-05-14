import { defineConfig } from '@tarojs/cli'
import path from 'path'

export default defineConfig<'vite'>({
  // 通过 sass.resource 自动向所有 SCSS 文件注入全局变量
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
    API_BASE_URL: JSON.stringify('https://api.beansave.com'),
    APP_ENV: JSON.stringify(process.env.NODE_ENV === 'production' ? 'production' : 'development')
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
  // 自动向所有 SCSS 文件注入全局变量，无需每个文件手动声明
  sass: {
    resource: path.resolve(__dirname, '..', 'src/styles/_variables.scss')
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
