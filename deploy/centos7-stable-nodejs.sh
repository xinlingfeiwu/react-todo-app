#!/bin/bash

# CentOS 7 超级稳定的 Node.js 安装脚本
# 完全避免可能导致 Terminated 的命令

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

print_info "🔧 CentOS 7 超级稳定 Node.js 安装脚本"

# 1. 检查系统信息
print_info "📊 检查系统信息..."
echo "操作系统: $(cat /etc/redhat-release)"
echo "当前用户: $(whoami)"

# 2. 安全清理（每个命令都用 || true 避免错误）
print_info "🧹 安全清理..."
print_info "停止进程..."
pkill -f npm >/dev/null 2>&1 || true
pkill -f node >/dev/null 2>&1 || true

print_info "移除旧包..."
yum remove -y nodejs >/dev/null 2>&1 || true
yum remove -y npm >/dev/null 2>&1 || true

print_info "清理配置文件..."
rm -f /etc/yum.repos.d/nodesource*.repo >/dev/null 2>&1 || true

print_success "✅ 清理完成"

# 3. 直接使用二进制包安装（最稳定的方法）
print_info "📥 下载 Node.js 16 二进制包..."

# 确保在 /tmp 目录
cd /tmp || exit 1

# 使用稳定的 Node.js 16.20.2 版本
NODE_VERSION="16.20.2"
NODE_PACKAGE="node-v${NODE_VERSION}-linux-x64"
DOWNLOAD_URL="https://nodejs.org/dist/v${NODE_VERSION}/${NODE_PACKAGE}.tar.xz"

print_info "下载地址: $DOWNLOAD_URL"

# 删除可能存在的旧文件
rm -f ${NODE_PACKAGE}.tar.xz >/dev/null 2>&1 || true
rm -rf ${NODE_PACKAGE} >/dev/null 2>&1 || true

# 下载文件
print_info "正在下载..."
if wget --timeout=30 --tries=3 -q "$DOWNLOAD_URL"; then
    print_success "✅ 下载成功"
else
    print_error "❌ 下载失败，请检查网络连接"
    exit 1
fi

# 验证下载的文件
if [ ! -f "${NODE_PACKAGE}.tar.xz" ]; then
    print_error "❌ 下载的文件不存在"
    exit 1
fi

FILE_SIZE=$(ls -l ${NODE_PACKAGE}.tar.xz | awk '{print $5}')
if [ "$FILE_SIZE" -lt 1000000 ]; then  # 小于 1MB 说明下载不完整
    print_error "❌ 下载的文件不完整"
    exit 1
fi

print_success "✅ 文件验证通过"

# 4. 解压和安装
print_info "📦 解压安装包..."
if tar -xf ${NODE_PACKAGE}.tar.xz; then
    print_success "✅ 解压成功"
else
    print_error "❌ 解压失败"
    exit 1
fi

# 检查解压结果
if [ ! -d "${NODE_PACKAGE}" ]; then
    print_error "❌ 解压目录不存在"
    exit 1
fi

print_info "🚀 安装 Node.js..."

# 删除旧的安装
rm -rf /usr/local/node >/dev/null 2>&1 || true

# 移动到目标位置
if mv ${NODE_PACKAGE} /usr/local/node; then
    print_success "✅ 文件移动成功"
else
    print_error "❌ 文件移动失败"
    exit 1
fi

# 5. 创建软链接
print_info "🔗 创建软链接..."

# 删除可能存在的旧链接
rm -f /usr/local/bin/node >/dev/null 2>&1 || true
rm -f /usr/local/bin/npm >/dev/null 2>&1 || true
rm -f /usr/local/bin/npx >/dev/null 2>&1 || true

# 创建新链接
ln -s /usr/local/node/bin/node /usr/local/bin/node
ln -s /usr/local/node/bin/npm /usr/local/bin/npm
ln -s /usr/local/node/bin/npx /usr/local/bin/npx

print_success "✅ 软链接创建完成"

# 6. 设置环境变量
print_info "⚙️  配置环境变量..."

# 为当前会话设置 PATH
export PATH="/usr/local/bin:$PATH"

# 添加到系统环境变量
if ! grep -q '/usr/local/bin' /etc/environment 2>/dev/null; then
    echo 'PATH="/usr/local/bin:$PATH"' >> /etc/environment
    print_info "已添加到 /etc/environment"
fi

# 添加到 profile
if ! grep -q '/usr/local/bin' /etc/profile 2>/dev/null; then
    echo 'export PATH="/usr/local/bin:$PATH"' >> /etc/profile
    print_info "已添加到 /etc/profile"
fi

print_success "✅ 环境变量配置完成"

# 7. 验证安装
print_info "🔍 验证安装..."

# 刷新命令缓存
hash -r >/dev/null 2>&1 || true

# 检查 Node.js
if /usr/local/bin/node --version >/dev/null 2>&1; then
    NODE_VERSION_INSTALLED=$(/usr/local/bin/node --version)
    print_success "Node.js 版本: $NODE_VERSION_INSTALLED"
else
    print_error "❌ Node.js 安装验证失败"
    exit 1
fi

# 检查 npm
if /usr/local/bin/npm --version >/dev/null 2>&1; then
    NPM_VERSION_INSTALLED=$(/usr/local/bin/npm --version)
    print_success "npm 版本: $NPM_VERSION_INSTALLED"
else
    print_error "❌ npm 安装验证失败"
    exit 1
fi

# 8. 安装必要工具
print_info "📦 安装必要工具..."

# 安装 EPEL（但不强制）
yum install -y epel-release >/dev/null 2>&1 || print_warning "EPEL 安装失败，继续..."

# 安装网络工具
print_info "安装网络工具..."
yum install -y bind-utils >/dev/null 2>&1 || print_warning "bind-utils 安装失败"
yum install -y wget >/dev/null 2>&1 || print_warning "wget 已安装"
yum install -y curl >/dev/null 2>&1 || print_warning "curl 已安装"
yum install -y git >/dev/null 2>&1 || print_warning "git 安装失败"

print_success "✅ 工具安装完成"

# 9. 清理临时文件
print_info "🧹 清理临时文件..."
cd /root || cd /
rm -f /tmp/${NODE_PACKAGE}.tar.xz >/dev/null 2>&1 || true

# 10. 最终验证
echo ""
echo "=================================="
print_info "📊 最终验证报告"
echo "=================================="

echo "✅ 操作系统: $(cat /etc/redhat-release)"
echo "✅ Node.js 版本: $NODE_VERSION_INSTALLED"
echo "✅ npm 版本: $NPM_VERSION_INSTALLED"
echo "✅ Node.js 路径: /usr/local/bin/node"
echo "✅ npm 路径: /usr/local/bin/npm"

# 检查命令可用性
if command -v dig >/dev/null 2>&1; then
    echo "✅ dig 命令: 可用"
else
    echo "❌ dig 命令: 不可用"
fi

# 测试 Node.js 功能
print_info "🧪 测试 Node.js 功能..."
if echo "console.log('Node.js 工作正常!');" | /usr/local/bin/node; then
    print_success "✅ Node.js 功能测试通过"
else
    print_warning "⚠️  Node.js 功能测试失败"
fi

echo ""
print_success "🎉 Node.js 安装完成！"
print_info "💡 下一步："
echo "  1. 运行: export PATH=\"/usr/local/bin:\$PATH\""
echo "  2. 运行: hash -r"
echo "  3. 运行: ./deploy/check-env.sh todo"
echo "  4. 然后: ./deploy/deploy.sh todo"

echo ""
print_info "📝 重要提示："
echo "  - Node.js 已安装到 /usr/local/node/"
echo "  - 软链接创建在 /usr/local/bin/"
echo "  - 环境变量已配置在 /etc/environment 和 /etc/profile"
echo "  - 如果命令找不到，重新登录或运行上述步骤1"
