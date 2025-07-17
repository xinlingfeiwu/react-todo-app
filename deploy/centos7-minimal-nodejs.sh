#!/bin/bash

# CentOS 7 最简化 Node.js 安装脚本
# 完全跳过所有可能导致 Terminated 的命令

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

print_info "🔧 CentOS 7 最简化 Node.js 安装脚本"
print_info "跳过所有清理步骤，直接安装"

# 1. 系统信息
echo "操作系统: $(cat /etc/redhat-release)"
echo "当前用户: $(whoami)"

# 2. 直接开始下载和安装（跳过所有清理）
print_info "📥 直接下载 Node.js 16.20.2..."

# 进入 /tmp 目录
cd /tmp

# Node.js 配置
NODE_VERSION="16.20.2"
NODE_PACKAGE="node-v${NODE_VERSION}-linux-x64"
DOWNLOAD_URL="https://nodejs.org/dist/v${NODE_VERSION}/${NODE_PACKAGE}.tar.xz"

print_info "下载地址: $DOWNLOAD_URL"

# 如果文件已存在，直接使用
if [ -f "${NODE_PACKAGE}.tar.xz" ]; then
    print_info "发现已存在的下载文件，直接使用"
else
    print_info "开始下载..."
    wget --timeout=30 --tries=3 -q "$DOWNLOAD_URL"
    
    if [ $? -ne 0 ]; then
        print_error "❌ 下载失败"
        print_info "尝试使用 curl 下载..."
        curl -L -o "${NODE_PACKAGE}.tar.xz" "$DOWNLOAD_URL"
        
        if [ $? -ne 0 ]; then
            print_error "❌ curl 下载也失败"
            exit 1
        fi
    fi
fi

# 验证文件
if [ ! -f "${NODE_PACKAGE}.tar.xz" ]; then
    print_error "❌ 下载文件不存在"
    exit 1
fi

print_success "✅ 下载完成"

# 3. 解压
print_info "📦 解压文件..."

# 如果目录已存在，删除
if [ -d "${NODE_PACKAGE}" ]; then
    rm -rf ${NODE_PACKAGE}
fi

tar -xf ${NODE_PACKAGE}.tar.xz

if [ $? -ne 0 ]; then
    print_error "❌ 解压失败"
    exit 1
fi

if [ ! -d "${NODE_PACKAGE}" ]; then
    print_error "❌ 解压后目录不存在"
    exit 1
fi

print_success "✅ 解压成功"

# 4. 安装
print_info "🚀 安装 Node.js..."

# 如果目标目录存在，删除
if [ -d "/usr/local/node" ]; then
    rm -rf /usr/local/node
fi

# 移动到目标位置
mv ${NODE_PACKAGE} /usr/local/node

if [ $? -ne 0 ]; then
    print_error "❌ 移动失败"
    exit 1
fi

print_success "✅ 安装完成"

# 5. 创建软链接
print_info "🔗 创建软链接..."

# 确保 /usr/local/bin 目录存在
mkdir -p /usr/local/bin

# 如果链接已存在，删除
if [ -L "/usr/local/bin/node" ]; then
    rm /usr/local/bin/node
fi

if [ -L "/usr/local/bin/npm" ]; then
    rm /usr/local/bin/npm
fi

if [ -L "/usr/local/bin/npx" ]; then
    rm /usr/local/bin/npx
fi

# 创建新链接
ln -s /usr/local/node/bin/node /usr/local/bin/node
ln -s /usr/local/node/bin/npm /usr/local/bin/npm
ln -s /usr/local/node/bin/npx /usr/local/bin/npx

print_success "✅ 软链接创建完成"

# 6. 设置环境变量
print_info "⚙️  配置环境变量..."

# 为当前会话设置
export PATH="/usr/local/bin:$PATH"

# 写入到 bashrc（如果不存在）
if ! grep -q '/usr/local/bin' ~/.bashrc 2>/dev/null; then
    echo 'export PATH="/usr/local/bin:$PATH"' >> ~/.bashrc
    print_info "已添加到 ~/.bashrc"
fi

# 写入到 profile（如果不存在）
if ! grep -q '/usr/local/bin' /etc/profile 2>/dev/null; then
    echo 'export PATH="/usr/local/bin:$PATH"' >> /etc/profile
    print_info "已添加到 /etc/profile"
fi

print_success "✅ 环境变量配置完成"

# 7. 测试安装
print_info "🔍 测试安装结果..."

# 使用绝对路径测试
if [ -x "/usr/local/bin/node" ]; then
    NODE_VERSION_RESULT=$(/usr/local/bin/node --version)
    print_success "Node.js 版本: $NODE_VERSION_RESULT"
else
    print_error "❌ Node.js 不可执行"
    exit 1
fi

if [ -x "/usr/local/bin/npm" ]; then
    NPM_VERSION_RESULT=$(/usr/local/bin/npm --version)
    print_success "npm 版本: $NPM_VERSION_RESULT"
else
    print_error "❌ npm 不可执行"
    exit 1
fi

# 8. 简单功能测试
print_info "🧪 功能测试..."
echo "console.log('Hello from Node.js!');" | /usr/local/bin/node

if [ $? -eq 0 ]; then
    print_success "✅ Node.js 功能正常"
else
    print_warning "⚠️  Node.js 功能测试失败"
fi

# 9. 安装基本工具（可选）
print_info "📦 安装基本工具..."

# 只安装最必要的工具
which wget >/dev/null 2>&1 || yum install -y wget 2>/dev/null || print_warning "wget 安装失败"
which curl >/dev/null 2>&1 || yum install -y curl 2>/dev/null || print_warning "curl 安装失败"
which dig >/dev/null 2>&1 || yum install -y bind-utils 2>/dev/null || print_warning "dig 安装失败"

# 10. 清理
print_info "🧹 清理下载文件..."
cd /root
rm -f /tmp/${NODE_PACKAGE}.tar.xz 2>/dev/null || true

# 11. 最终报告
echo ""
echo "=================================="
print_success "🎉 安装完成！"
echo "=================================="

echo "✅ Node.js 版本: $NODE_VERSION_RESULT"
echo "✅ npm 版本: $NPM_VERSION_RESULT"
echo "✅ 安装路径: /usr/local/node/"
echo "✅ 可执行文件: /usr/local/bin/node, /usr/local/bin/npm"

echo ""
print_info "💡 使用方法："
echo "  方法1: 使用绝对路径"
echo "    /usr/local/bin/node --version"
echo "    /usr/local/bin/npm --version"
echo ""
echo "  方法2: 设置环境变量后使用"
echo "    export PATH=\"/usr/local/bin:\$PATH\""
echo "    node --version"
echo "    npm --version"

echo ""
print_info "🚀 下一步："
echo "  1. 运行: export PATH=\"/usr/local/bin:\$PATH\""
echo "  2. 运行: /usr/local/bin/node --version  # 验证"
echo "  3. 运行: ./deploy/check-env.sh todo"
echo "  4. 运行: ./deploy/deploy.sh todo"

echo ""
print_success "✨ Node.js 安装成功完成！"
