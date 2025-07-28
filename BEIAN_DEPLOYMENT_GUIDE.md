# 备案信息部署指南

## 🎯 概述

本应用已集成备案信息展示功能，支持ICP备案和公安备案信息的展示。通过环境变量配置，可以在不将敏感备案信息提交到代码仓库的情况下，在生产环境中正确显示备案信息。

## 📋 当前配置状态

### ✅ 已完成
- **ICP备案**: 已配置（示例：京ICP备12345678号-1）
- **备案信息组件**: 已集成到应用底部
- **环境变量配置**: 支持本地和生产环境配置

### ⏳ 待完成
- **公安备案**: 审核中，通过后需要添加配置
- **公安备案logo**: 需要从官方平台下载真实logo

## 🔧 本地开发配置

### 1. 环境变量文件

**文件**: `.env.local` (不会被提交到Git)

```bash
# ICP备案信息
VITE_ICP_BEIAN_NUMBER=京ICP备12345678号-1
VITE_ICP_BEIAN_URL=https://beian.miit.gov.cn

# 公安备案信息（审核通过后取消注释）
# VITE_POLICE_BEIAN_NUMBER=京公网安备11010802012345号
# VITE_POLICE_BEIAN_CODE=11010802012345
# VITE_POLICE_BEIAN_URL=https://beian.mps.gov.cn/#/query/webSearch?code=11010802012345
```

### 2. 示例文件

**文件**: `.env.example` (会被提交到Git，供其他开发者参考)

包含配置示例和说明，不包含真实备案信息。

## 🚀 生产环境部署

### 方案一：服务器环境变量

在服务器上设置环境变量：

```bash
# 设置环境变量
export VITE_ICP_BEIAN_NUMBER="京ICP备12345678号-1"
export VITE_ICP_BEIAN_URL="https://beian.miit.gov.cn"

# 公安备案通过后添加
export VITE_POLICE_BEIAN_NUMBER="京公网安备11010802012345号"
export VITE_POLICE_BEIAN_CODE="11010802012345"
export VITE_POLICE_BEIAN_URL="https://beian.mps.gov.cn/#/query/webSearch?code=11010802012345"

# 构建应用
npm run build
```

### 方案二：CI/CD配置

在GitHub Actions、Jenkins等CI/CD平台中配置环境变量：

```yaml
# GitHub Actions 示例
env:
  VITE_ICP_BEIAN_NUMBER: ${{ secrets.ICP_BEIAN_NUMBER }}
  VITE_ICP_BEIAN_URL: ${{ secrets.ICP_BEIAN_URL }}
  VITE_POLICE_BEIAN_NUMBER: ${{ secrets.POLICE_BEIAN_NUMBER }}
  VITE_POLICE_BEIAN_CODE: ${{ secrets.POLICE_BEIAN_CODE }}
  VITE_POLICE_BEIAN_URL: ${{ secrets.POLICE_BEIAN_URL }}
```

### 方案三：Docker部署

```dockerfile
# Dockerfile 示例
FROM node:18-alpine

# 设置环境变量
ENV VITE_ICP_BEIAN_NUMBER="京ICP备12345678号-1"
ENV VITE_ICP_BEIAN_URL="https://beian.miit.gov.cn"

# 构建应用
RUN npm run build
```

## 📱 公安备案配置步骤

### 1. 审核通过后

当公安备案审核通过后，您需要：

1. **获取备案信息**：
   - 备案号：如 `京公网安备11010802012345号`
   - 备案代码：如 `11010802012345`

2. **下载官方logo**：
   - 登录全国互联网安全管理服务平台
   - 下载官方公安备案logo图片
   - 替换 `public/beian-logo.svg` 文件

3. **更新环境变量**：
   ```bash
   # 在 .env.local 中取消注释并填写真实信息
   VITE_POLICE_BEIAN_NUMBER=京公网安备11010802012345号
   VITE_POLICE_BEIAN_CODE=11010802012345
   VITE_POLICE_BEIAN_URL=https://beian.mps.gov.cn/#/query/webSearch?code=11010802012345
   ```

### 2. 验证显示效果

配置完成后，备案信息将显示在应用底部：

```
京ICP备12345678号-1    [🛡️] 京公网安备11010802012345号
```

## 🔒 安全考虑

### 1. 信息保护

- ✅ 备案信息通过环境变量配置，不会提交到代码仓库
- ✅ `.env.local` 文件在 `.gitignore` 中，确保不会被意外提交
- ✅ 生产环境通过服务器环境变量或CI/CD secrets配置

### 2. 合规要求

- ✅ ICP备案号链接到官方备案查询网站
- ✅ 公安备案号链接到官方查询页面
- ✅ 备案信息显示在网站底部中间位置（符合要求）

## 🧪 测试验证

### 1. 本地测试

```bash
# 启动开发服务器
npm run dev

# 检查页面底部是否显示备案信息
# 点击备案号链接验证跳转是否正确
```

### 2. 生产测试

```bash
# 构建生产版本
npm run build

# 预览生产版本
npm run preview

# 验证备案信息显示和链接功能
```

## 📞 技术支持

如果在配置过程中遇到问题：

1. **检查环境变量**: 确保变量名拼写正确，以 `VITE_` 开头
2. **重启开发服务器**: 修改环境变量后需要重启
3. **检查构建输出**: 确认环境变量在构建时被正确注入
4. **验证链接**: 确保备案查询链接可以正常访问

## 📁 文件结构

### 核心文件
- `src/components/BeianInfo.jsx`: 备案信息展示组件
- `src/styles/components/BeianInfo.scss`: SCSS样式文件，支持深浅主题和移动端适配
- `src/styles/main.scss`: 统一样式导入管理（包含BeianInfo样式）
- `.env.example`: 环境变量配置示例
- `.env.local`: 本地环境变量（不会被提交到Git）
- `public/beian-logo.svg`: 公安备案logo占位符

### 布局特性
- **桌面端**: 公安备案在左，ICP备案在右
- **移动端**: 垂直排列，公安备案在上，ICP备案在下
- **响应式设计**: 自适应不同屏幕尺寸
- **主题适配**: 支持深色和浅色主题
- **无障碍支持**: 支持高对比度和减少动画模式

---

## 🔒 安全检查

为确保敏感信息不会被意外提交到代码仓库，项目包含了自动检查脚本：

```bash
# 检查是否有敏感信息
npm run check-sensitive
```

该脚本会检查：
- 真实的ICP备案号
- 真实的公安备案号
- 排除测试用的示例备案号

---

**更新时间**: 2025-01-28
**状态**: ICP备案已配置，公安备案待审核通过后配置
**样式**: 已升级为SCSS，支持完整的响应式设计
**安全**: 已添加敏感信息检查，确保真实备案信息不会被提交
