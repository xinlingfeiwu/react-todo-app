import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'

export default [
  // 全局忽略文件
  {
    ignores: [
      'dist/**',
      'coverage/**',
      'test-results/**',
      'node_modules/**',
      '*.min.js',
      'playwright-report/**'
    ]
  },

  // React 组件和浏览器环境的配置
  {
    files: ['**/*.{js,jsx}'],
    ignores: [
      'scripts/**',
      'node-polyfill.js',
      'playwright.config.js',
      'vitest.config.js',
      'eslint.config.js'
    ],
    ...js.configs.recommended,
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
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
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
    },
  },

  // Node.js 脚本文件的配置
  {
    files: ['scripts/**/*.js', 'node-polyfill.js'],
    ...js.configs.recommended,
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.node,
        global: 'writable',
      },
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    rules: {
      'no-unused-vars': ['error', {
        varsIgnorePattern: '^[A-Z_]',
        argsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
      }],
      'no-undef': 'error',
    },
  },
]
