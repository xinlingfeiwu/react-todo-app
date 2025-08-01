import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const base = process.env.BUILD_BASE || '/';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base,
  css: {
    preprocessorOptions: {
      scss: {
        silenceDeprecations: ['legacy-js-api', 'import']
      }
    }
  },
  build: {
    // 生产环境优化
    minify: 'terser',
    // 目标环境 - AlmaLinux 9.5 + Node.js 18 支持现代特性
    target: 'es2022',
    // 代码分割优化
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // React 相关
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'vendor';
          }
          // 图标库
          if (id.includes('node_modules/react-icons')) {
            return 'icons';
          }
          // 大型组件分离
          if (id.includes('DataManager.jsx') ||
              id.includes('AppSettings.jsx') ||
              id.includes('FeedbackManager.jsx') ||
              id.includes('PrivacyPolicy.jsx') ||
              id.includes('Donate.jsx')) {
            return 'components';
          }
        },
        // 文件名优化
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]'
      }
    },
    // 输出目录
    outDir: 'dist',
    // 资源内联阈值 (4KB)
    assetsInlineLimit: 4096,
    // 压缩优化
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        // 删除未使用的代码
        pure_funcs: ['console.log', 'console.info'],
        // 优化常量
        evaluate: true,
        // 删除死代码
        dead_code: true
      },
      mangle: {
        // 混淆变量名
        safari10: true
      }
    },
    // Gzip 压缩大小报告
    reportCompressedSize: true,
    // chunk 大小警告限制
    chunkSizeWarningLimit: 500
  },
  // 预览服务器配置
  preview: {
    port: 4173,
    host: true
  },
  // 开发服务器配置
  server: {
    port: 5174,
    host: true,
    // 修复WebSocket连接问题
    hmr: {
      port: 5174,
      host: 'localhost'
    },
    // 处理CORS
    cors: true
  },
  // 依赖预构建优化
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-icons'],
    // 排除不需要预构建的依赖
    exclude: []
  }
})
