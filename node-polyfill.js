// Node.js 16 crypto polyfill for Vite build process
// 此文件在 Vite 配置加载前执行，解决构建时的 crypto 问题

// 检查是否在 Node.js 环境中且缺少 crypto.getRandomValues
if (typeof global !== 'undefined' && typeof process !== 'undefined' && process.versions && process.versions.node) {
  // 如果没有 crypto 或缺少 getRandomValues
  if (!global.crypto || !global.crypto.getRandomValues) {
    const crypto = require('crypto');
    
    global.crypto = global.crypto || {};
    
    // 提供 getRandomValues polyfill
    if (!global.crypto.getRandomValues) {
      global.crypto.getRandomValues = function(array) {
        const randomBytes = crypto.randomBytes(array.length);
        for (let i = 0; i < array.length; i++) {
          array[i] = randomBytes[i];
        }
        return array;
      };
    }
    
    // 提供 randomUUID polyfill
    if (!global.crypto.randomUUID) {
      global.crypto.randomUUID = crypto.randomUUID || function() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          const r = Math.random() * 16 | 0;
          const v = c === 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });
      };
    }
  }
}
