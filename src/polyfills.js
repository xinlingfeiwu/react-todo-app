// Polyfills for Node.js 16 compatibility
// 为 CentOS 7 Node.js 16 环境提供兼容性支持

// 确保 globalThis 可用
if (typeof globalThis === 'undefined') {
  if (typeof window !== 'undefined') {
    window.globalThis = window;
  } else if (typeof self !== 'undefined') {
    self.globalThis = self;
  }
}

// crypto.getRandomValues polyfill
if (typeof globalThis !== 'undefined' && typeof globalThis.crypto === 'undefined') {
  // 使用基础的 Math.random 实现
  globalThis.crypto = {
    getRandomValues: function(array) {
      for (let i = 0; i < array.length; i++) {
        array[i] = Math.floor(Math.random() * 256);
      }
      return array;
    },
    randomUUID: function() {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    }
  };
}
