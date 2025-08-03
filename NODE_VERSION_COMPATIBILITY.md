# Node.js 版本兼容性说明

## 🚨 重要变更：移除 Node.js 16.x 支持

### 📋 问题描述

在GitHub Actions CI中，Node.js 16.x版本在运行ESLint时失败，错误信息：

```

Run linter
Process completed with exit code 2.

```

### 🔍 根本原因

**ESLint 9.x 版本要求**：

- **最低Node.js版本**: 18.18.0+
- **当前项目使用**: ESLint ^9.30.1
- **不兼容版本**: Node.js 16.x (任何版本)

### 🛠️ 解决方案

#### 1. 更新CI配置

**修改前**:

```yaml

strategy:
  matrix:
    node-version: [16.x, 18.x, 20.x]  # ❌ 包含不兼容的16.x

```

**修改后**:

```yaml

strategy:
  matrix:
    node-version: [18.x, 20.x]  # ✅ 只使用兼容版本

```

#### 2. 添加engines字段

在`package.json`中明确版本要求：

```json

{
  "engines": {
    "node": ">=18.18.0",
    "npm": ">=9.0.0"
  }
}

```

### 📊 版本兼容性矩阵

| Node.js版本 | ESLint 9.x | 状态 | 说明 |
|------------|------------|------|------|
| 16.x       | ❌         | 不兼容 | ESLint 9.x不支持 |
| 18.18.0+   | ✅         | 兼容   | 推荐版本 |
| 20.x       | ✅         | 兼容   | 最新LTS |

### 🎯 影响范围

#### ✅ 不受影响的工作流

- `deploy-pages.yml` - 已使用Node.js 18
- `release.yml` - 已使用Node.js 18
- `test.yml` - 已使用Node.js 18.x, 20.x

#### 🔧 已修复的工作流

- `ci.yml` - 移除Node.js 16.x支持

### 📝 开发环境建议

#### 本地开发

```bash

# 检查当前Node.js版本

node --version

# 如果版本低于18.18.0，请升级

# 使用nvm (推荐)

nvm install 18
nvm use 18

# 或使用n

n 18

```

#### Docker环境

```dockerfile

# 使用Node.js 18 LTS

FROM node:18-alpine

# 或使用Node.js 20 LTS

FROM node:20-alpine

```

### 🚀 验证修复

修复后，CI应该能够成功通过：

1. **Node.js 18.x**: ✅ ESLint检查通过
2. **Node.js 20.x**: ✅ ESLint检查通过
3. **构建过程**: ✅ 正常完成
4. **部署流程**: ✅ 正常执行

### 📚 相关文档

- [ESLint 9.x 发布说明](https://eslint.org/blog/2024/04/eslint-v9.0.0-released/)
- [Node.js 版本支持策略](https://nodejs.org/en/about/releases/)
- [GitHub Actions Node.js 设置](https://github.com/actions/setup-node)

### 🔄 未来升级路径

当需要升级到更新版本时：

1. **ESLint 10.x**: 可能需要Node.js 20+
2. **Node.js 22**: 下一个LTS版本
3. **定期检查**: 每6个月检查依赖兼容性

---

**修复提交**: fix: 移除Node.js 16.x支持以兼容ESLint 9.x
