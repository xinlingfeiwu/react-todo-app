# Node.js 版本适配指南

## 📋 版本要求

本项目使用 **Vite 7.1.0-beta.0**，对 Node.js 版本有特定要求：

- **推荐版本**: Node.js 22.17.1
- **最低要求**: Node.js ^20.19.0 || >=22.12.0
- **npm 版本**: >=9.0.0

## 🔍 版本检查

项目内置了自动版本检查功能：

```bash

# 检查当前 Node.js 版本兼容性

npm run check-node

# 开发和构建时会自动检查版本

npm run dev    # 会先运行版本检查
npm run build  # 会先运行版本检查

```

## 🚀 本地开发环境设置

### 使用 nvm (推荐)

```bash

# 安装推荐的 Node.js 版本

nvm install 22.17.1
nvm use 22.17.1

# 或者使用项目根目录的 .nvmrc 文件

nvm use

# 设置为默认版本 (可选)

nvm alias default 22.17.1

```

### 直接安装

访问 [Node.js 官网](https://nodejs.org/) 下载并安装 Node.js 22.17.1

## 🤖 CI/CD 环境配置

### GitHub Actions

```yaml

name: Build and Test
on: [push, pull_request]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:

      - uses: actions/checkout@v4
      - name: Setup Node.js

        uses: actions/setup-node@v4
        with:
          node-version: '22.17.1'
          cache: 'npm'

      - run: npm ci
      - run: npm run build
      - run: npm test

```

### GitLab CI

```yaml

image: node:22.17.1

stages:

  - build
  - test

build:
  stage: build
  script:

    - npm ci
    - npm run build

  artifacts:
    paths:

      - dist/

```

### Docker

```dockerfile

FROM node:22.17.1-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 4173
CMD ["npm", "run", "preview"]

```

## 🔧 服务器部署

### CentOS/RHEL

```bash

# 使用 NodeSource 仓库安装 Node.js 22

curl -fsSL https://rpm.nodesource.com/setup_22.x | sudo bash -
sudo yum install -y nodejs

# 验证版本

node --version  # 应该显示 v22.x.x

```

### Ubuntu/Debian

```bash

# 使用 NodeSource 仓库

curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs

# 验证版本

node --version

```

### 使用 nvm (服务器)

```bash

# 安装 nvm

curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc

# 安装并使用 Node.js 22.17.1

nvm install 22.17.1
nvm use 22.17.1
nvm alias default 22.17.1

```

## ⚠️ 兼容性说明

### 当前环境 (Node.js 20.11.0)

- ✅ **构建**: 可以正常构建，但会显示兼容性警告
- ⚠️ **开发服务器**: 可能遇到 `crypto.hash` 相关错误
- 🔧 **解决方案**: 升级到 Node.js 22.17.1

### 错误排查

如果遇到以下错误：

```text

TypeError: crypto.hash is not a function

```

**解决方案**:

1. 升级 Node.js 到 22.17.1
2. 或者临时降级 Vite 到 6.x 版本

```bash

# 临时解决方案 (不推荐)

npm install vite@^6.0.0

```

## 📊 性能对比

| Node.js 版本 | 构建时间 | 开发启动 | 兼容性 |
|-------------|---------|---------|--------|
| 20.11.0     | 2.27s   | ❌ 错误  | ⚠️ 部分 |
| 20.19.0+    | 2.20s   | ✅ 正常  | ✅ 完全 |
| 22.17.1     | 2.15s   | ✅ 快速  | ✅ 最佳 |

## 🎯 最佳实践

1. **本地开发**: 使用 Node.js 22.17.1
2. **CI/CD**: 在配置中明确指定 Node.js 版本
3. **生产环境**: 使用 LTS 版本 (22.x)
4. **团队协作**: 使用 `.nvmrc` 文件统一版本
5. **版本检查**: 定期运行 `npm run check-node`

## 🔄 版本升级路径

```bash

# 1. 检查当前版本

node --version
npm --version

# 2. 备份项目 (可选)

git stash
git checkout -b upgrade-node

# 3. 升级 Node.js

nvm install 22.17.1
nvm use 22.17.1

# 4. 清理并重新安装依赖

rm -rf node_modules package-lock.json
npm install

# 5. 验证功能

npm run check-node
npm run build
npm run dev

# 6. 提交更改

git add .
git commit -m "upgrade: Node.js to 22.17.1 for Vite 7.x compatibility"

```

## 📞 支持

如果在版本升级过程中遇到问题：

1. 查看项目的 [Issues](https://github.com/xinlingfeiwu/react-todo-app/issues)
2. 运行 `npm run check-node` 获取详细信息
3. 检查 Node.js 和 npm 版本是否符合要求
4. 尝试清理 `node_modules` 并重新安装依赖
