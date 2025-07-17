// Polyfills for Node.js 16 compatibility
// 为 CentOS 7 Node.js 16 环境提供兼容性支持

// 简化但更可靠的 polyfill 实现
if (typeof globalThis === 'undefined') {
  if (typeof global !== 'undefined') {
    global.globalThis = global;
  } else if (typeof window !== 'undefined') {
    window.globalThis = window;
  } else if (typeof self !== 'undefined') {
    self.globalThis = self;
  }
}

// 为 crypto.getRandomValues 提供 polyfill
if (typeof globalThis !== 'undefined' && !globalThis.crypto) {
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
