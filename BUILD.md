# 🏗️ 构建配置说明

## 📦 构建脚本对比

| 脚本 | 用途 | 环境变量 | 优化程度 | 使用场景 |
| -------------------- | -------- | --------------------- | -------- | -------------- |
| `npm run build`      | 开发构建 | 默认                  | 普通     | 本地测试、预览 |
| `npm run build:prod` | 生产构建 | `NODE_ENV=production` | 高度优化 | 正式发布、部署 |

## 🎯 版本发布构建策略

### 生产发布 (推荐)

```bash

npm run release:patch   # 使用 build:prod
npm run release:minor   # 使用 build:prod
npm run release:major   # 使用 build:prod

```

### 快速测试发布

```bash

# 如果只是想快速测试发布流程，可以临时使用

npm version patch --no-git-tag-version && npm run build

```

## 🔧 build:prod 的优化特性

1. **代码压缩**
   * JavaScript/CSS 文件压缩
   * 移除注释和空白字符
   * 变量名混淆
2. **环境优化**
   * `NODE_ENV=production` 设置
   * 移除开发环境调试代码
   * 启用生产模式优化
3. **资源优化**
   * Tree Shaking 移除未使用代码
   * 静态资源压缩
   * 代码分割优化
4. **性能提升**
   * 更小的包体积
   * 更快的加载速度
   * 更好的运行性能

## 📊 构建产物对比

使用 `npm run analyze` 可以分析构建产物：

```bash

# 分析构建包大小

npm run analyze

# 预览构建结果

npm run preview

```

## 🚀 CI/CD 构建配置

GitHub Actions 自动使用生产构建：

```yaml

- name: 🏗️ Build

  run: npm run build:prod  # 确保生产优化

```

## ⚙️ 环境变量配置

如果需要区分不同环境的配置，可以创建：

```bash

# .env.production

VITE_APP_ENV=production
VITE_API_URL=https://api.example.com
VITE_APP_VERSION=$npm_package_version

# .env.development

VITE_APP_ENV=development
VITE_API_URL=http://localhost:3000
VITE_APP_VERSION=dev

```

## 🔍 构建验证

发布前可以手动验证构建：

```bash

# 1. 生产构建

npm run build:prod

# 2. 本地预览

npm run preview

# 3. 检查构建产物

ls -la dist/

```

## 📈 最佳实践

1. **正式发布**: 始终使用 `build:prod`
2. **本地测试**: 使用 `build` 即可
3. **CI/CD**: 统一使用 `build:prod`
4. **性能监控**: 定期检查构建产物大小
5. **环境隔离**: 明确区分开发和生产环境
