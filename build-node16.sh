#!/bin/bash

# Node.js 16 兼容构建脚本
# 为 CentOS 7 Node.js 16 环境提供 crypto polyfill

echo "🔧 为 Node.js 16 环境准备构建..."

# 创建临时的 polyfill 文件
cat > /tmp/crypto-polyfill.js << 'EOF'
// Node.js 16 crypto polyfill
if (typeof global !== 'undefined' && typeof process !== 'undefined' && !global.crypto) {
  const crypto = require('crypto');
  global.crypto = {
    getRandomValues: function(array) {
      const randomBytes = crypto.randomBytes(array.length);
      for (let i = 0; i < array.length; i++) {
        array[i] = randomBytes[i];
      }
      return array;
    }
  };
}
EOF

# 使用 Node.js 预加载模块运行构建
echo "🏗️  开始构建..."
NODE_OPTIONS="--require /tmp/crypto-polyfill.js" npx vite build --mode production

# 清理临时文件
rm -f /tmp/crypto-polyfill.js

echo "✅ 构建完成"
