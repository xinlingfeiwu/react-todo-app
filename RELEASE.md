# 📦 版本发布指南

## 🔢 版本号规则

本项目采用 [语义化版本控制 (SemVer)](https://semver.org/lang/zh-CN/) 规范：

### 版本格式：`MAJOR.MINOR.PATCH`

* **MAJOR (主版本号)**: 不兼容的 API 修改
  * 重大架构调整
  * 删除或大幅修改现有功能
  * 不向后兼容的更改
* **MINOR (次版本号)**: 向下兼容的功能性新增
  * 新增功能特性
  * 性能优化
  * UI/UX 改进
  * 向下兼容的 API 新增
* **PATCH (修订号)**: 向下兼容的问题修正
  * Bug 修复
  * 安全性修补
  * 小的优化调整
  * 文档更新

## 🚀 发布流程

### 1. 准备发布

```bash
# 确保代码已提交并推送
git add .
git commit -m "feat: 新功能描述"
git push origin main

# 运行检查（可选）
npm run prepare-release
```

### 2. 版本发布

根据更改类型选择对应的发布命令：

```bash
# 补丁版本 (1.0.0 -> 1.0.1)
npm run release:patch

# 次版本 (1.0.0 -> 1.1.0) 
npm run release:minor

# 主版本 (1.0.0 -> 2.0.0)
npm run release:major
```

### 3. 自动化处理

发布脚本会自动完成以下操作：

1. ✅ 更新 `package.json` 中的版本号
2. ✅ 生成版本信息文件 (`public/version.json`)
3. ✅ 提交版本更改到 Git
4. ✅ 创建版本标签
5. ✅ 推送代码和标签到 GitHub
6. ✅ 触发 GitHub Actions 工作流
7. ✅ 自动创建 GitHub Release
8. ✅ 部署到 GitHub Pages

## 📋 提交信息规范

建议使用 [约定式提交](https://www.conventionalcommits.org/zh-hans/) 格式：

```
<类型>[可选 范围]: <描述>

[可选 正文]

[可选 脚注]
```

### 常用类型：

* `feat`: 新功能
* `fix`: 修复问题
* `docs`: 文档更改
* `style`: 代码格式化
* `refactor`: 重构代码
* `perf`: 性能优化
* `test`: 添加测试
* `chore`: 构建过程或辅助工具的变动

### 示例：

```bash
git commit -m "feat: 添加任务优先级功能"
git commit -m "fix: 修复任务删除时的内存泄漏"
git commit -m "docs: 更新 README 安装说明"
```

## 🔧 手动发布

如果需要手动控制发布过程：

```bash
# 1. 更新版本号（不创建标签）
npm version patch --no-git-tag-version

# 2. 构建项目
npm run build

# 3. 手动提交和标签
git add .
git commit -m "chore: release v$(node -p require('./package.json').version)"
git tag v$(node -p "require('./package.json').version")

# 4. 推送
git push origin main --tags
```

## 📊 版本检查

应用内置了版本检查功能：

* ✅ 自动检测新版本
* ✅ 提示用户更新
* ✅ 显示当前版本信息
* ✅ 支持热更新

## 🛠️ 故障排除

### 发布失败的常见原因：

1. **工作目录不干净**
   ```bash
   git status
   git add .
   git commit -m "提交描述"
   ```
2. **没有推送权限**
   ```bash
   git remote -v
   # 确保使用正确的仓库地址和权限
   ```
3. **标签已存在**
   ```bash
   git tag -d v1.0.0  # 删除本地标签
   git push origin :refs/tags/v1.0.0  # 删除远程标签
   ```
4. **GitHub CLI 未安装**
   * 自动创建 Release 需要 [GitHub CLI](https://cli.github.com/)
   * 或手动在 GitHub 网站创建 Release

## 📈 版本历史

查看版本历史：

```bash
# 查看所有标签
git tag -l

# 查看标签详情
git show v1.0.0

# 查看两个版本间的变更
git log v1.0.0..v1.1.0 --oneline
```

## 🎯 最佳实践

1. **定期发布**: 建议每 1-2 周发布一次小版本
2. **测试充分**: 发布前确保功能测试通过
3. **文档同步**: 重大更改及时更新文档
4. **向后兼容**: 非必要不要破坏向后兼容性
5. **安全优先**: 安全问题应立即发布修复版本
