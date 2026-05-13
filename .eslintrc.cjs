module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  },
  plugins: [
    '@typescript-eslint',
    'react',
    'react-hooks',
    'prettier'
  ],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:prettier/recommended'  // 必须放最后，覆盖其他格式规则
  ],
  settings: {
    react: {
      version: 'detect'
    }
  },
  rules: {
    // Prettier 作为 ESLint 规则运行
    'prettier/prettier': 'error',

    // React 18 不需要手动引入 React
    'react/react-in-jsx-scope': 'off',

    // 允许使用 any（Taro 项目中有时不可避免）
    '@typescript-eslint/no-explicit-any': 'warn',

    // 允许空函数
    '@typescript-eslint/no-empty-function': 'off',

    // 未使用变量警告而非报错
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],

    // hooks 规则
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn'
  },
  ignorePatterns: ['dist/', 'node_modules/', 'config/']
}
