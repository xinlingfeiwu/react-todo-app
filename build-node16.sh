#!/bin/bash

# Node.js 16 兼容构建脚本
# 为 CentOS 7 Node.js 16 环境提供 crypto polyfill

set -e  # 遇到错误立即退出

echo "🔧 为 Node.js 16 环境准备构建..."

# 创建更强的 polyfill 文件
cat > /tmp/crypto-polyfill.js << 'EOF'
// 强化版 Node.js 16 crypto polyfill
const originalRequire = require;

// 拦截 crypto 模块的加载
const Module = require('module');
const originalLoad = Module._load;

Module._load = function(request, parent, isMain) {
  const result = originalLoad.apply(this, arguments);
  
  // 如果是 crypto 模块，确保它有 getRandomValues
  if (request === 'crypto' && result && !result.getRandomValues) {
    result.getRandomValues = function(array) {
      const randomBytes = result.randomBytes(array.length);
      for (let i = 0; i < array.length; i++) {
        array[i] = randomBytes[i];
      }
      return array;
    };
  }
  
  return result;
};

// 立即为 global 添加 crypto
if (!global.crypto) {
  try {
    const crypto = originalRequire('crypto');
    global.crypto = {
      getRandomValues: function(array) {
        const randomBytes = crypto.randomBytes(array.length);
        for (let i = 0; i < array.length; i++) {
          array[i] = randomBytes[i];
        }
        return array;
      },
      randomUUID: crypto.randomUUID || function() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          const r = Math.random() * 16 | 0;
          const v = c === 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });
      }
    };
    console.log('✅ Enhanced Node.js 16 crypto polyfill loaded');
  } catch (e) {
    console.log('⚠️  Could not load enhanced crypto polyfill:', e.message);
  }
}

// 为 globalThis 也添加
if (typeof globalThis !== 'undefined' && !globalThis.crypto) {
  globalThis.crypto = global.crypto;
}
EOF

# 使用 Node.js 预加载模块运行构建
echo "🏗️  开始构建..."
export NODE_OPTIONS="--require /tmp/crypto-polyfill.js"

# 运行构建并检查结果
if npx vite build --mode production; then
    echo "✅ 构建成功"
    BUILD_SUCCESS=true
else
    echo "❌ 构建失败"
    BUILD_SUCCESS=false
fi

# 清理临时文件
rm -f /tmp/crypto-polyfill.js

# 根据构建结果退出
if [ "$BUILD_SUCCESS" = "true" ]; then
    echo "🎉 Node.js 16 兼容构建完成"
    exit 0
else
    echo "💥 构建失败，请检查错误信息"
    exit 1
fi
