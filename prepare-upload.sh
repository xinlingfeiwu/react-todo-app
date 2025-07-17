#!/bin/bash

# GitHub 上传准备脚本
# 清理项目并准备上传到 GitHub

echo "🧹 开始清理项目..."

# 删除测试文件
echo "删除测试文件..."
rm -f test-*.json
rm -f test-*.js

# 删除构建产物
echo "删除构建产物..."
rm -rf dist/
rm -rf node_modules/

# 删除系统文件
echo "删除系统文件..."
find . -name ".DS_Store" -delete

# 删除备份文件
echo "删除备份文件..."
rm -f *.backup
rm -f *.bak

# 删除不必要的文档（保留核心文档）
echo "整理文档文件..."
rm -f CSS_FIX_REPORT.md
rm -f CSS_REFACTOR_FINAL_REPORT.md
rm -f CSS_REFACTOR_README.md
rm -f STORAGE_KEYS_REFACTOR.md
rm -f SHARE_ENHANCEMENT.md
rm -f DEPLOYMENT_CHECKLIST.md
rm -f DEPLOYMENT_CHECKLIST_NEW.md
rm -f CENTOS7_TROUBLESHOOTING.md
rm -f YLINGTECH_ARCHITECTURE.md

# 保留这些重要文档
# - README.md (已更新)
# - DEPLOY.md
# - FEEDBACK_SETUP.md
# - PRIVACY_ACCESS_GUIDE.md
# - PRIVACY_GUIDE.md
# - THANKYOU_LIST.md
# - CONTRIBUTING.md (新建)
# - LICENSE (新建)

echo "✅ 项目清理完成！"
echo ""
echo "📋 上传检查清单："
echo "✅ README.md - 已完善"
echo "✅ LICENSE - MIT许可证"
echo "✅ CONTRIBUTING.md - 贡献指南"
echo "✅ .gitignore - 完整配置"
echo "✅ package.json - 完整信息"
echo "✅ 清理测试文件"
echo "✅ 清理构建产物"
echo ""
echo "🚀 准备上传到 GitHub："
echo "1. git init"
echo "2. git add ."
echo "3. git commit -m 'Initial commit: React Todo App'"
echo "4. 在 GitHub 创建新仓库"
echo "5. git remote add origin https://github.com/yourusername/react-todo-app.git"
echo "6. git branch -M main"
echo "7. git push -u origin main"
