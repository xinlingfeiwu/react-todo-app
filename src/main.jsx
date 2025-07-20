import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

// 只在生产环境注册 Service Worker
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('Service Worker 注册成功:', registration.scope);
        
        // 检查更新
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('新的 Service Worker 可用，考虑提示用户刷新');
            }
          });
        });
      })
      .catch((error) => {
        console.log('Service Worker 注册失败:', error);
      });
  });
} else if (import.meta.env.DEV) {
  console.log('开发环境：跳过 Service Worker 注册');
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
