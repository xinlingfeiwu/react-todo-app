#!/bin/bash

# CentOS 7 Node.js 清理和重新安装脚本
# 解决 glibc 版本兼容性问题

# 移除 set -e，改为手动错误处理
set +e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 错误处理函数
handle_error() {
    local exit_code=$?
    local line_number=$1
    if [ $exit_code -ne 0 ]; then
        print_error "命令在第 $line_number 行失败，退出码: $exit_code"
        print_info "继续执行后续步骤..."
    fi
}

print_info "🔧 CentOS 7 Node.js 清理重装脚本"
print_warning "⚠️  这将清理现有的 Node.js 安装并重新安装兼容版本"

# 1. 检查系统信息
print_info "📊 检查系统信息..."
echo "操作系统: $(cat /etc/redhat-release)"

GLIBC_VERSION=$(ldd --version | head -n1 | grep -oE '[0-9]+\.[0-9]+')
echo "glibc 版本: $GLIBC_VERSION"

# 2. 清理现有 Node.js 安装
print_info "🧹 清理现有 Node.js 安装..."

# 停止可能的 npm 进程
print_info "停止 Node.js 相关进程..."
pkill -f npm 2>/dev/null || print_info "没有运行的 npm 进程"
pkill -f node 2>/dev/null || print_info "没有运行的 node 进程"

# 清理 yum 包（忽略错误）
print_info "移除现有的 Node.js 包..."
yum remove -y nodejs npm nodesource-release 2>/dev/null || print_info "没有找到要移除的包"

# 清理 NodeSource 仓库
print_info "清理 NodeSource 仓库配置..."
rm -f /etc/yum.repos.d/nodesource*.repo 2>/dev/null || print_info "没有找到 NodeSource 仓库文件"

# 清理缓存
print_info "清理 yum 缓存..."
yum clean all >/dev/null 2>&1 || print_info "yum 缓存清理完成"

print_success "✅ 清理完成"

# 3. 检查 glibc 兼容性并安装合适的 Node.js 版本
print_info "🔍 检查 glibc 兼容性..."

GLIBC_MAJOR=$(echo $GLIBC_VERSION | cut -d. -f1)
GLIBC_MINOR=$(echo $GLIBC_VERSION | cut -d. -f2)

if [ "$GLIBC_MAJOR" -eq 2 ] && [ "$GLIBC_MINOR" -lt 28 ]; then
    print_warning "⚠️  glibc $GLIBC_VERSION < 2.28，安装 Node.js 16 LTS"
    NODE_SETUP_VERSION="16"
else
    print_info "glibc $GLIBC_VERSION >= 2.28，可以安装 Node.js 18+"
    NODE_SETUP_VERSION="18"
fi

# 4. 安装兼容的 Node.js 版本
print_info "📥 安装 Node.js $NODE_SETUP_VERSION LTS..."

# 下载并安装 NodeSource 仓库
print_info "下载 NodeSource 仓库配置..."
if curl -fsSL https://rpm.nodesource.com/setup_${NODE_SETUP_VERSION}.x | bash -; then
    print_success "NodeSource 仓库配置成功"
else
    print_error "NodeSource 仓库配置失败"
    exit 1
fi

# 安装 Node.js
print_info "安装 Node.js..."
if yum install -y nodejs; then
    print_success "✅ Node.js 安装完成"
else
    print_error "❌ Node.js 安装失败"
    exit 1
fi

# 5. 验证安装
print_info "🔍 验证安装..."

if command -v node >/dev/null 2>&1; then
    NODE_VERSION=$(node --version)
    print_success "Node.js 版本: $NODE_VERSION"
else
    print_error "❌ Node.js 安装失败"
    exit 1
fi

if command -v npm >/dev/null 2>&1; then
    NPM_VERSION=$(npm --version)
    print_success "npm 版本: $NPM_VERSION"
else
    print_error "❌ npm 安装失败"
    exit 1
fi

# 6. 设置 npm 全局安装目录（避免权限问题）
print_info "⚙️  配置 npm 全局目录..."
mkdir -p ~/.npm-global
npm config set prefix '~/.npm-global'

# 添加到 PATH（如果还没有）
if ! grep -q 'npm-global/bin' ~/.bashrc; then
    echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
    print_info "已添加 npm 全局路径到 ~/.bashrc"
fi

print_success "✅ npm 配置完成"

# 7. 最终检查
echo ""
echo "=================================="
print_info "📊 安装验证"
echo "=================================="

echo "✅ 操作系统: $(cat /etc/redhat-release)"
echo "✅ glibc 版本: $GLIBC_VERSION"
echo "✅ Node.js 版本: $(node --version)"
echo "✅ npm 版本: $(npm --version)"

echo ""
print_success "🎉 Node.js 重新安装完成！"
print_info "💡 重要提示："
echo "  1. 重新登录或运行: source ~/.bashrc"
echo "  2. 现在可以运行: ./deploy/centos-fix.sh"
echo "  3. 然后运行: ./deploy/check-env.sh todo"
echo "  4. 最后运行: ./deploy/deploy.sh todo"

echo ""
print_info "🔧 如果仍有问题，可能需要："
echo "  - 重启终端会话"
echo "  - 检查 PATH 环境变量"
echo "  - 运行: hash -r 清理命令缓存"
