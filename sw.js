/**
 * @description Service Worker for PWA caching
 * 提供离线缓存和性能优化
 */

const CACHE_NAME = 'todo-app-v1.4.2'; // 更新缓存版本
const CACHE_URLS = [
  './',
  './manifest.json',
  './favicon.svg',
  './todo-icon.svg',
  // 不预缓存 index.html，让备案信息能够动态更新
];

// 安装事件：预缓存资源
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: 缓存资源');
        return cache.addAll(CACHE_URLS);
      })
      .then(() => self.skipWaiting())
  );
});

// 激活事件：清理旧缓存
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('Service Worker: 清理旧缓存', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// 网络请求拦截：缓存策略
self.addEventListener('fetch', (event) => {
  // 只处理GET请求
  if (event.request.method !== 'GET') {
    return;
  }

  // 过滤掉不需要缓存的请求
  const url = new URL(event.request.url);
  
  // 跳过chrome扩展、开发工具等非HTTP(S)协议
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return;
  }
  
  // 跳过websocket连接
  if (url.pathname.includes('__vite_ping') || url.search.includes('token=')) {
    return;
  }

  event.respondWith(
    // 对于HTML文档，使用网络优先策略，确保备案信息等动态内容能够更新
    event.request.destination === 'document' 
      ? networkFirstStrategy(event.request)
      : cacheFirstStrategy(event.request)
  );
});

// 网络优先策略：优先尝试网络请求，失败时使用缓存
function networkFirstStrategy(request) {
  return fetch(request)
    .then((response) => {
      // 网络请求成功，更新缓存并返回响应
      if (response && response.status === 200) {
        const responseToCache = response.clone();
        caches.open(CACHE_NAME)
          .then((cache) => {
            cache.put(request, responseToCache).catch((error) => {
              console.warn('缓存更新失败:', error, request.url);
            });
          });
      }
      return response;
    })
    .catch(() => {
      // 网络失败，使用缓存
      return caches.match(request)
        .then((response) => response || caches.match('./index.html'));
    });
}

// 缓存优先策略：优先使用缓存，缓存未命中时请求网络
function cacheFirstStrategy(request) {
  return caches.match(request)
    .then((response) => {
      // 如果有缓存，返回缓存
      if (response) {
        return response;
      }

      // 否则发起网络请求
      return fetch(request)
        .then((response) => {
          // 检查响应是否有效
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // 只缓存同源资源
          const url = new URL(request.url);
          if (url.origin !== location.origin) {
            return response;
          }

          // 克隆响应用于缓存
          const responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then((cache) => {
              // 进一步检查请求URL是否适合缓存
              if (url.protocol === 'http:' || url.protocol === 'https:') {
                cache.put(request, responseToCache).catch((error) => {
                  console.warn('缓存写入失败:', error, request.url);
                });
              }
            });

          return response;
        });
    });
}

// 消息处理：支持手动更新缓存
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
