#!/bin/bash

# 应用更新测试脚本
# 用于测试模态对话框更新提示功能

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[0;33m'
NC='\033[0m'

print_info() {
    echo -e "${BLUE}[测试]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[成功]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[提示]${NC} $1"
}

echo "🧪 应用更新功能测试工具"
echo "时间: $(date)"
echo ""

print_info "当前功能已实现:"
echo "✅ 模态对话框更新提示（屏幕中央）"
echo "✅ 遮罩层阻止背景操作"
echo "✅ 用户必须选择'立即更新'或'稍后更新'"
echo "✅ 版本忽略功能（同版本不重复提醒）"
echo "✅ 开发环境手动测试按钮"
echo ""

print_info "测试步骤:"
echo ""
echo "1. 🌐 在浏览器中访问: http://localhost:5175/"
echo ""
echo "2. 🔧 在浏览器控制台中执行以下命令模拟更新:"
echo ""
echo "   // 模拟检测到新版本"
echo "   localStorage.setItem('app_update_available', JSON.stringify({"
echo "     currentVersion: '1.0.0',"
echo "     latestVersion: '1.0.1',"
echo "     detectedAt: Date.now(),"
echo "     serverInfo: { version: '1.0.1', buildHash: 'test123' }"
echo "   }));"
echo ""
echo "   // 然后刷新页面"
echo "   location.reload();"
echo ""
echo "3. 📱 应该看到模态对话框在屏幕中央显示"
echo ""
echo "4. 🧪 测试功能:"
echo "   - 点击遮罩层 → 无法关闭对话框"
echo "   - 点击'稍后更新' → 对话框关闭，不再显示"
echo "   - 点击'立即更新' → 页面刷新"
echo ""

print_warning "开发环境专用功能:"
echo "- 左下角有手动检查更新按钮"
echo "- 右下角会显示检查状态"
echo "- 控制台会有详细的调试信息"
echo ""

print_info "创建测试版本文件..."

# 创建一个测试版本文件
mkdir -p public
cat > public/version-test.json << EOF
{
  "name": "react-todo-app",
  "version": "1.0.1",
  "buildTime": "$(date -u +"%Y-%m-%dT%H:%M:%S.%3NZ")",
  "buildTimestamp": $(date +%s),
  "buildHash": "test123456",
  "git": {
    "hash": "test456",
    "branch": "main",
    "tag": "v1.0.1"
  },
  "timestamp": $(date +%s)
}
EOF

print_success "✅ 测试版本文件已创建: public/version-test.json"
echo ""

print_info "高级测试命令（在浏览器控制台中运行）:"
echo ""
echo "// 1. 查看当前版本信息"
echo "console.log('当前版本:', window.__APP_VERSION__);"
echo "console.log('构建哈希:', window.__BUILD_HASH__);"
echo ""
echo "// 2. 清除所有更新相关的存储"
echo "localStorage.removeItem('app_update_available');"
echo "localStorage.removeItem('app_update_dismissed');"
echo "localStorage.removeItem('app_etag');"
echo "localStorage.removeItem('app_last_modified');"
echo ""
echo "// 3. 模拟不同版本的更新"
echo "// 测试版本 1.0.1"
echo "localStorage.setItem('app_update_available', JSON.stringify({"
echo "  currentVersion: '1.0.0',"
echo "  latestVersion: '1.0.1',"
echo "  detectedAt: Date.now(),"
echo "  serverInfo: { version: '1.0.1', buildHash: 'abc123' }"
echo "}));"
echo ""
echo "// 测试版本 2.0.0 (大版本更新)"
echo "localStorage.setItem('app_update_available', JSON.stringify({"
echo "  currentVersion: '1.0.0',"
echo "  latestVersion: '2.0.0',"
echo "  detectedAt: Date.now(),"
echo "  serverInfo: { version: '2.0.0', buildHash: 'def456' }"
echo "}));"
echo ""
echo "// 4. 测试忽略功能"
echo "// 模拟已忽略版本 1.0.1"
echo "localStorage.setItem('app_update_dismissed', JSON.stringify({"
echo "  version: '1.0.1',"
echo "  dismissedAt: Date.now(),"
echo "  currentVersion: '1.0.0'"
echo "}));"
echo ""

print_success "🎉 测试环境已准备就绪！"
echo ""
print_warning "💡 使用提示:"
echo "1. 确保开发服务器运行在 http://localhost:5175/"
echo "2. 打开浏览器开发者工具查看控制台日志"
echo "3. 使用上面的命令进行各种场景测试"
echo "4. 测试完成后可以清除localStorage中的测试数据"
echo ""
echo "🚀 准备好测试您的新模态对话框更新功能了！"
