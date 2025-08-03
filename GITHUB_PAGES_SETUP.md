# GitHub Pages 设置说明

## 🔧 仓库设置要求

为了确保GitHub Pages能够正常工作，请检查以下设置：

### 1. GitHub Pages 源设置

1. 进入仓库的 **Settings** 页面
2. 在左侧菜单中找到 **Pages**
3. 在 **Source** 部分，选择：
   - **Deploy from a branch**
   - **Branch**: `gh-pages`
   - **Folder**: `/ (root)`

### 2. Actions 权限设置

1. 在仓库的 **Settings** 页面
2. 在左侧菜单中找到 **Actions** > **General**
3. 确保以下设置：
   - **Actions permissions**: 选择 "Allow all actions and reusable workflows"
   - **Workflow permissions**: 选择 "Read and write permissions"
   - 勾选 "Allow GitHub Actions to create and approve pull requests"

### 3. 环境设置（可选）

如果您之前设置了 `github-pages` 环境：

1. 进入 **Settings** > **Environments**
2. 找到 `github-pages` 环境
3. 可以选择删除该环境，或者：
   - 在 **Deployment branches** 中添加 `gh-pages` 分支
   - 移除任何阻止部署的保护规则

## 🚀 工作流程说明

现在的部署流程：

1. **本地执行**: `npm run release:patch`
   - 推送 main 分支 → 触发 GitHub Pages 部署
   - 推送标签 → 触发 GitHub Release 创建

2. **GitHub Actions**:
   - `deploy-pages.yml`: 从 main 分支构建并推送到 `gh-pages` 分支
   - `release.yml`: 从标签创建 GitHub Release

## 🔍 故障排除

如果部署仍然失败：

1. **检查 Actions 日志**: 查看具体错误信息
2. **验证分支**: 确认 `gh-pages` 分支是否被创建
3. **检查权限**: 确认 GITHUB_TOKEN 有足够权限
4. **手动触发**: 在 Actions 页面手动触发 deploy-pages workflow

## 📞 联系方式

如果问题持续存在，请检查：

- GitHub Actions 的详细日志
- 仓库的 Settings > Pages 配置
- 是否有组织级别的限制
