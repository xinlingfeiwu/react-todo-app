#!/bin/bash

# CentOS 7 原生 Node.js 安装脚本
# 使用 CentOS 官方和兼容的第三方仓库

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

print_info "🔧 CentOS 7 原生 Node.js 安装脚本"

# 1. 检查系统信息
print_info "📊 检查系统信息..."
echo "操作系统: $(cat /etc/redhat-release)"
echo "当前用户: $(whoami)"

# 2. 强制清理 NodeSource
print_info "🧹 清理 NodeSource 配置..."
pkill -f npm 2>/dev/null || true
pkill -f node 2>/dev/null || true
yum remove -y nodejs npm 2>/dev/null || true
rm -rf /etc/yum.repos.d/nodesource* 2>/dev/null || true
yum clean all

# 3. 方案1：尝试安装 EPEL 中的 Node.js
print_info "📦 方案1：安装 EPEL 仓库..."
yum install -y epel-release

print_info "检查 EPEL 中的 Node.js 版本..."
if yum info nodejs 2>/dev/null | grep -q "Available"; then
    EPEL_NODEJS_VERSION=$(yum info nodejs 2>/dev/null | grep "Version" | head -1 | awk '{print $3}')
    print_info "EPEL 中的 Node.js 版本: $EPEL_NODEJS_VERSION"
    
    if [[ "$EPEL_NODEJS_VERSION" =~ ^[0-9]+\. ]]; then
        MAJOR_VERSION=$(echo $EPEL_NODEJS_VERSION | cut -d. -f1)
        if [ "$MAJOR_VERSION" -ge 10 ]; then
            print_info "安装 EPEL 的 Node.js..."
            yum install -y nodejs npm
            
            if command -v node >/dev/null 2>&1; then
                print_success "✅ EPEL Node.js 安装成功"
                NODE_INSTALLED=true
            fi
        fi
    fi
fi

# 4. 方案2：如果 EPEL 失败，使用二进制包
if [ "$NODE_INSTALLED" != "true" ]; then
    print_info "📥 方案2：下载 Node.js 二进制包..."
    
    cd /tmp
    
    # 下载 Node.js 16 二进制包（兼容 CentOS 7）
    NODE_VERSION="16.20.2"
    NODE_PACKAGE="node-v${NODE_VERSION}-linux-x64"
    
    print_info "下载 Node.js $NODE_VERSION..."
    wget -q https://nodejs.org/dist/v${NODE_VERSION}/${NODE_PACKAGE}.tar.xz
    
    if [ $? -eq 0 ]; then
        print_success "下载成功"
        
        # 解压到 /usr/local
        print_info "安装到 /usr/local..."
        tar -xf ${NODE_PACKAGE}.tar.xz
        
        # 移动到目标目录
        rm -rf /usr/local/node 2>/dev/null || true
        mv ${NODE_PACKAGE} /usr/local/node
        
        # 创建软链接
        ln -sf /usr/local/node/bin/node /usr/local/bin/node
        ln -sf /usr/local/node/bin/npm /usr/local/bin/npm
        ln -sf /usr/local/node/bin/npx /usr/local/bin/npx
        
        # 添加到 PATH
        if ! grep -q '/usr/local/bin' /etc/environment 2>/dev/null; then
            echo 'PATH="/usr/local/bin:$PATH"' >> /etc/environment
        fi
        
        # 为当前会话设置 PATH
        export PATH="/usr/local/bin:$PATH"
        
        # 清理下载文件
        rm -f ${NODE_PACKAGE}.tar.xz
        
        NODE_INSTALLED=true
        print_success "✅ 二进制 Node.js 安装成功"
    else
        print_error "❌ 下载失败"
    fi
fi

# 5. 方案3：编译安装（最后的选择）
if [ "$NODE_INSTALLED" != "true" ]; then
    print_warning "前两种方案失败，尝试从源码编译（这需要较长时间）..."
    
    # 安装编译依赖
    yum groupinstall -y "Development Tools"
    yum install -y python3 make gcc gcc-c++
    
    cd /tmp
    NODE_SOURCE_VERSION="16.20.2"
    wget -q https://nodejs.org/dist/v${NODE_SOURCE_VERSION}/node-v${NODE_SOURCE_VERSION}.tar.gz
    
    if [ $? -eq 0 ]; then
        tar -xf node-v${NODE_SOURCE_VERSION}.tar.gz
        cd node-v${NODE_SOURCE_VERSION}
        
        print_info "配置编译环境..."
        ./configure --prefix=/usr/local/node
        
        print_info "编译 Node.js（这可能需要 20-30 分钟）..."
        make -j$(nproc)
        
        print_info "安装 Node.js..."
        make install
        
        # 创建软链接
        ln -sf /usr/local/node/bin/node /usr/local/bin/node
        ln -sf /usr/local/node/bin/npm /usr/local/bin/npm
        
        export PATH="/usr/local/bin:$PATH"
        NODE_INSTALLED=true
        print_success "✅ 源码编译安装成功"
    fi
fi

# 6. 验证安装
print_info "🔍 验证安装..."

# 刷新命令缓存
hash -r

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

# 7. 安装其他必要工具
print_info "📦 安装其他必要工具..."
yum install -y bind-utils wget curl git nginx

# 8. 最终验证
echo ""
echo "=================================="
print_info "📊 最终验证"
echo "=================================="

echo "✅ 操作系统: $(cat /etc/redhat-release)"
echo "✅ Node.js 版本: $(node --version)"
echo "✅ npm 版本: $(npm --version)"
echo "✅ Node.js 路径: $(which node)"
echo "✅ npm 路径: $(which npm)"

# 检查 dig 命令
if command -v dig >/dev/null 2>&1; then
    echo "✅ dig 命令: 可用"
else
    echo "❌ dig 命令: 不可用"
fi

echo ""
print_success "🎉 Node.js 安装完成！"
print_info "💡 下一步："
echo "  1. 重新登录或运行: source /etc/environment"
echo "  2. 运行: hash -r"
echo "  3. 运行: ./deploy/check-env.sh todo"
echo "  4. 然后: ./deploy/deploy.sh todo"

echo ""
print_info "📝 重要提示："
echo "  - Node.js 安装在 /usr/local/bin/"
echo "  - 确保 /usr/local/bin 在您的 PATH 中"
echo "  - 如果命令找不到，运行: export PATH=\"/usr/local/bin:\$PATH\""
