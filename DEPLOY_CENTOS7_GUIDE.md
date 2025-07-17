# CentOS 7 + Node.js 16 部署指南

## 概述

本指南专门解决在 CentOS 7 环境下使用 Node.js 16 部署 React Todo 应用时遇到的 `crypto.getRandomValues` 兼容性问题。

## 问题背景

- **错误症状**: `TypeError: crypto$2.getRandomValues is not a function`
- **根本原因**: Node.js 16 缺少 Web Crypto API 中的 `getRandomValues` 方法
- **影响环境**: CentOS 7 + Node.js 16.x

## 解决方案概览

我们通过三层兼容性保障来解决这个问题：

1. **Node.js 运行时 polyfill**: 在构建时注入 crypto 补丁
2. **浏览器端 polyfill**: 为客户端提供兼容性
3. **Vite 构建配置**: 优化打包和别名处理

## 部署步骤

### 1. 上传代码到服务器

```bash
# 上传项目文件到服务器
scp -r ./react-todo-app user@your-server:/path/to/deployment/
```

### 2. 安装依赖

```bash
cd /path/to/deployment/react-todo-app
npm install
```

### 3. 检查 Node.js 版本并选择构建命令

```bash
# 检查版本
node --version

# 如果是 Node.js 16.x，使用专用构建脚本
if [[ $(node --version | cut -d'.' -f1 | sed 's/v//') -eq 16 ]]; then
    echo "检测到 Node.js 16，使用兼容构建"
    chmod +x build-node16.sh
    ./build-node16.sh
else
    echo "使用标准构建"
    npm run build
fi
```

### 4. 或者使用自动化部署脚本

```bash
# 使用自动检测部署脚本
cd deploy
chmod +x pre-deploy-check.sh deploy.sh
./pre-deploy-check.sh && ./deploy.sh
```

## 技术细节

### build-node16.sh 脚本工作原理

1. **Module 拦截**: 使用 `Module._load` 拦截 crypto 模块加载
2. **全局注入**: 在 Node.js 启动时通过 `NODE_OPTIONS` 预加载 polyfill
3. **兼容性保障**: 为 `global.crypto` 和 `globalThis.crypto` 都提供支持

### Vite 配置优化

- **目标环境**: 设置为 `es2020` 确保兼容性
- **调试保留**: 暂时保留 console.log 用于故障排除
- **别名处理**: crypto -> crypto-browserify

### 浏览器端 polyfill

- **多环境支持**: 支持 window, global, self 环境
- **方法完整性**: 提供 getRandomValues 和 randomUUID
- **渐进增强**: 只在缺少时才添加 polyfill

## 故障排除

### 如果仍然出现 crypto 错误

1. **检查 Node.js 版本**:

   ```bash
   node --version
   ```

2. **验证 polyfill 加载**:
   查看构建日志中是否有 "Enhanced Node.js 16 crypto polyfill loaded" 消息

3. **检查构建输出**:

   ```bash
   ls -la dist/
   ```

4. **测试本地构建**:

   ```bash
   # 先在本地测试
   ./build-node16.sh
   ```

### 常见问题

**Q: 构建成功但运行时仍报错？**
A: 检查 nginx 配置是否正确指向 dist 目录，并确保静态文件服务正常。

**Q: polyfill 没有加载？**
A: 确保 `NODE_OPTIONS` 环境变量设置正确，重启 Node.js 进程。

**Q: 其他 Node.js 版本是否兼容？**
A: 是的，polyfill 对所有版本都是安全的，只在需要时才激活。

## 验证部署

### 1. 检查构建文件

```bash
ls -la dist/
# 应该看到：
# - index.html
# - assets/ 目录
# - 各种 .js 和 .css 文件
```

### 2. 测试应用加载

```bash
# 如果使用简单的 HTTP 服务器测试
cd dist
python3 -m http.server 8000
# 然后访问 http://your-server:8000
```

### 3. 检查浏览器控制台

- 应该看到 polyfill 加载消息
- 不应该有 crypto 相关错误
- 应用功能正常

## 性能考虑

- **构建时间**: Node.js 16 构建可能比标准构建稍慢（+10-20%）
- **包大小**: crypto-browserify 会增加约 10KB 的包大小
- **运行时性能**: polyfill 对运行时性能影响可忽略不计

## 长期建议

1. **升级 Node.js**: 考虑升级到 Node.js 18+ 获得原生 Web Crypto API 支持
2. **系统升级**: 考虑升级到更新的 CentOS 版本或其他现代 Linux 发行版
3. **容器化**: 使用 Docker 确保环境一致性

## 支持

如果遇到问题，请：

1. 检查构建日志中的错误信息
2. 确认 Node.js 版本和依赖安装
3. 查看浏览器开发者工具的控制台错误
4. 提供完整的错误堆栈信息

---

*最后更新: 2024年* - *为 CentOS 7 + Node.js 16 环境特别优化*
