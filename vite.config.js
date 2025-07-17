import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // 为 Node.js 16 环境添加全局变量定义
    global: 'globalThis',
    // 确保 process.env 可用
    'process.env': '{}',
  },
  resolve: {
    alias: {
      // 为 Node.js 16 添加 crypto polyfill
      crypto: 'crypto-browserify',
    },
  },
  optimizeDeps: {
    include: ['crypto-browserify'],
  },
  build: {
    // 生产环境优化
    minify: 'terser',
    // 目标环境 - 确保与 Node.js 16 兼容
    target: 'es2020',
    // 代码分割优化
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          icons: ['react-icons']
        }
      }
    },
    // 输出目录
    outDir: 'dist',
    // 资源内联阈值 (4KB)
    assetsInlineLimit: 4096,
    // 移除 console.log - 但保留错误信息用于调试
    terserOptions: {
      compress: {
        drop_console: false, // 暂时保留 console.log 用于调试
        drop_debugger: true
      }
    }
  },
  // 预览服务器配置
  preview: {
    port: 4173,
    host: true
  },
  // 开发服务器配置
  server: {
    port: 5174,
    host: true
  }
})
