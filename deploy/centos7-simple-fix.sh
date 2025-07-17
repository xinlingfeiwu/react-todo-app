#!/bin/bash

# CentOS 7 Node.js 简化安装脚本
# 专门为 root 用户设计，避免 sudo 相关问题

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

print_info "🔧 CentOS 7 Node.js 简化安装脚本"

# 1. 检查系统信息
print_info "📊 检查系统信息..."
echo "操作系统: $(cat /etc/redhat-release)"

GLIBC_VERSION=$(ldd --version | head -n1 | grep -oE '[0-9]+\.[0-9]+')
echo "glibc 版本: $GLIBC_VERSION"
echo "当前用户: $(whoami)"

# 2. 强制清理（忽略所有错误）
print_info "🧹 强制清理现有安装..."

# 杀死进程
pkill -f npm 2>/dev/null || true
pkill -f node 2>/dev/null || true

# 移除包
yum remove -y nodejs npm 2>/dev/null || true
yum remove -y nodesource-release 2>/dev/null || true

# 清理仓库文件
rm -rf /etc/yum.repos.d/nodesource* 2>/dev/null || true

# 清理缓存
yum clean all >/dev/null 2>&1 || true

print_success "✅ 清理完成"

# 3. 安装 Node.js 16（兼容 CentOS 7）
print_info "📥 安装 Node.js 16 LTS（兼容 CentOS 7）..."

# 强制清理任何残留的 NodeSource 配置
rm -rf /etc/yum.repos.d/nodesource* 2>/dev/null || true
yum clean all >/dev/null 2>&1 || true

# 手动创建 Node.js 16 仓库配置
print_info "手动配置 Node.js 16 仓库..."
cat > /etc/yum.repos.d/nodesource-el7.repo << 'EOF'
[nodesource]
name=Node.js Packages for Enterprise Linux 7 - $basearch
baseurl=https://rpm.nodesource.com/pub_16.x/el/7/$basearch
failovermethod=priority
enabled=1
gpgcheck=1
gpgkey=https://rpm.nodesource.com/pub/el/NODESOURCE-GPG-SIGNING-KEY-EL
EOF

# 导入 GPG 密钥
print_info "导入 NodeSource GPG 密钥..."
rpm --import https://rpm.nodesource.com/pub/el/NODESOURCE-GPG-SIGNING-KEY-EL 2>/dev/null || true

# 清理缓存并检查仓库
yum clean all
yum makecache fast

# 检查可用的 Node.js 版本
print_info "检查可用的 Node.js 版本..."
yum list available nodejs --showduplicates | grep nodesource || true

# 强制安装 Node.js 16.x
print_info "强制安装 Node.js 16.x..."
yum install -y nodejs-16* || yum install -y nodejs

if [ $? -eq 0 ]; then
    print_success "✅ Node.js 安装成功"
else
    print_error "❌ Node.js 安装失败"
    exit 1
fi

# 4. 验证安装
print_info "🔍 验证安装结果..."

if command -v node >/dev/null 2>&1; then
    NODE_VERSION=$(node --version)
    print_success "Node.js 版本: $NODE_VERSION"
else
    print_error "❌ Node.js 安装验证失败"
    exit 1
fi

if command -v npm >/dev/null 2>&1; then
    NPM_VERSION=$(npm --version)
    print_success "npm 版本: $NPM_VERSION"
else
    print_error "❌ npm 安装验证失败"
    exit 1
fi

# 5. 安装其他必要工具
print_info "📦 安装其他必要工具..."

# 安装 EPEL 仓库
if ! yum repolist enabled | grep -q epel; then
    yum install -y epel-release
    print_success "EPEL 仓库安装完成"
fi

# 安装网络工具
yum install -y bind-utils wget curl git

print_success "✅ 工具安装完成"

# 6. 最终验证
echo ""
echo "=================================="
print_info "📊 最终验证"
echo "=================================="

echo "✅ 操作系统: $(cat /etc/redhat-release)"
echo "✅ glibc 版本: $GLIBC_VERSION"
echo "✅ Node.js 版本: $(node --version)"
echo "✅ npm 版本: $(npm --version)"
echo "✅ 当前用户: $(whoami)"

# 检查 dig 命令
if command -v dig >/dev/null 2>&1; then
    echo "✅ dig 命令: 可用"
else
    echo "❌ dig 命令: 不可用"
fi

echo ""
print_success "🎉 Node.js 安装完成！"
print_info "💡 下一步："
echo "  1. 运行: ./deploy/check-env.sh todo"
echo "  2. 然后: ./deploy/deploy.sh todo"

echo ""
print_info "📝 提示："
echo "  - 由于您是 root 用户，无需 sudo"
echo "  - Node.js 16 完全兼容我们的 React 应用"
echo "  - 所有必要的网络工具已安装"
