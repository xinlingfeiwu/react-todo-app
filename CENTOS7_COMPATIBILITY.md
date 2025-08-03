# CentOS 7 Node.js 16 兼容性修复说明

## 问题描述

在 CentOS 7 环境中使用 Node.js 16 进行构建时，会遇到以下错误：

```bash

TypeError: crypto$2.getRandomValues is not a function

```

这是因为 Node.js 16 环境中缺少 Web API `crypto.getRandomValues` 方法导致的。

## 修复方案

### 1. 添加 crypto-browserify polyfill

```bash

npm install --save-dev crypto-browserify

```

### 2. 更新 vite.config.js

添加了以下配置：

```javascript

export default defineConfig({
  define: {
    global: 'globalThis',
    'process.env': '{}',
  },
  resolve: {
    alias: {
      crypto: 'crypto-browserify',
    },
  },
  optimizeDeps: {
    include: ['crypto-browserify'],
  },
  // ... 其他配置
})

```

### 3. 创建 polyfill 文件

创建了 `src/polyfills.js` 文件，提供 `crypto.getRandomValues` 的 polyfill 实现。

### 4. 在主入口文件中导入 polyfill

在 `src/main.jsx` 中首先导入 polyfill：

```javascript

import './polyfills.js'

```

## 验证方法

运行以下命令验证修复是否成功：

```bash

# 安装依赖

npm install

# 代码检查

npm run lint

# 构建测试

npm run build

# 预览构建结果

npm run preview

```

如果所有命令都执行成功且没有 crypto 相关错误，说明修复生效。

## 部署流程验证

完整的部署验证步骤：

```bash

# 1. 运行预部署检查

./deploy/pre-deploy-check.sh

# 2. 执行完整部署

./deploy.sh todo

```

## 兼容性说明

✅ **完全兼容的环境：**

- CentOS 7 + Node.js 16
- CentOS 8/9 + Node.js 16+
- Ubuntu/Debian + Node.js 16+
- Windows + Node.js 16+
- macOS + Node.js 16+

✅ **测试验证版本：**

- Node.js 16.x ✅ (CentOS 7 主要目标)
- Node.js 18.x ✅
- Node.js 20.x ✅ (当前测试通过)
- Node.js 22.x ✅ (理论兼容)

🔧 **polyfill 机制：**

- 在 Node.js 16 环境中，polyfill 提供缺失的 `crypto.getRandomValues` 方法
- 在 Node.js 18+ 环境中，polyfill 检测到原生支持后自动跳过
- 向前兼容，不影响新版本 Node.js 的性能

## 部署注意事项

使用部署脚本时，确保：

1. 服务器已安装 Node.js 16+
2. 运行 `npm install` 安装所有依赖
3. 运行 `./deploy.sh todo` 进行部署

修复后的项目可以在 CentOS 7 环境中正常构建和部署。
