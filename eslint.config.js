import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),

  // React 组件和浏览器环境的配置
  {
    files: ['**/*.{js,jsx}'],
    ignores: ['scripts/**', 'node-polyfill.js'], // 排除 Node.js 脚本文件
    extends: [
      js.configs.recommended,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
    },
  },

  // Node.js 脚本文件的配置
  {
    files: ['scripts/**/*.js', 'node-polyfill.js'],
    extends: [js.configs.recommended],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.node, // Node.js 环境变量
        global: 'writable', // 添加 global 变量支持
      },
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    rules: {
      'no-unused-vars': ['error', {
        varsIgnorePattern: '^[A-Z_]',
        argsIgnorePattern: '^_', // 忽略以下划线开头的参数
        caughtErrorsIgnorePattern: '^_', // 忽略以下划线开头的 catch 错误参数
      }],
      'no-undef': 'error',
    },
  },
])
