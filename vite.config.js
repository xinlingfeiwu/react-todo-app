import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // 生产环境优化
    minify: 'terser',
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
    // 移除 console.log
    terserOptions: {
      compress: {
        drop_console: true,
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
