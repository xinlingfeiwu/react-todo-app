#!/bin/bash

# CentOS 系统快速修复脚本
# 专门解决 CentOS 7 部署中的常见问题

set -e

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

print_info "🔧 CentOS 系统环境修复脚本"
print_info "解决常见的部署问题..."

# 1. 安装 EPEL 仓库
print_info "📦 安装 EPEL 仓库..."
if ! yum repolist enabled | grep -q epel; then
    sudo yum install -y epel-release
    print_success "✅ EPEL 仓库安装完成"
else
    print_success "✅ EPEL 仓库已存在"
fi

# 2. 安装必要的网络工具
print_info "🌐 安装网络工具..."
sudo yum install -y bind-utils wget curl
print_success "✅ 网络工具安装完成"

# 3. 检查并安装 Node.js
print_info "📋 检查 Node.js 版本..."
if command -v node >/dev/null 2>&1; then
    NODE_VERSION=$(node --version | cut -d 'v' -f 2)
    MAJOR_VERSION=$(echo $NODE_VERSION | cut -d '.' -f 1)
    
    if [ $MAJOR_VERSION -lt 16 ]; then
        print_warning "⚠️  Node.js 版本过低 ($NODE_VERSION)，升级到兼容版本"
        print_info "🔄 安装 Node.js 16 LTS (兼容 CentOS 7)..."
        
        # 清理可能存在的冲突包
        sudo yum remove -y nodejs npm
        
        # 对于 CentOS 7，安装 Node.js 16 以兼容 glibc 2.17
        curl -fsSL https://rpm.nodesource.com/setup_16.x | sudo bash -
        sudo yum install -y nodejs
        
        print_success "✅ Node.js 升级完成"
    else
        print_success "✅ Node.js 版本符合要求 ($NODE_VERSION)"
    fi
else
    print_info "🆕 安装 Node.js 16 LTS (兼容 CentOS 7)..."
    
    # 检查 glibc 版本以确定 Node.js 版本
    GLIBC_VERSION=$(ldd --version | head -n1 | grep -oE '[0-9]+\.[0-9]+')
    print_info "系统 glibc 版本: $GLIBC_VERSION"
    
    # CentOS 7 的 glibc 是 2.17，只能安装 Node.js 16
    if [ "$(echo $GLIBC_VERSION | cut -d. -f1)" -eq 2 ] && [ "$(echo $GLIBC_VERSION | cut -d. -f2)" -lt 28 ]; then
        print_warning "⚠️  glibc 版本较低 ($GLIBC_VERSION)，安装 Node.js 16 LTS"
        curl -fsSL https://rpm.nodesource.com/setup_16.x | sudo bash -
    else
        print_info "安装 Node.js 18 LTS"
        curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
    fi
    
    sudo yum install -y nodejs
    print_success "✅ Node.js 安装完成"
fi

# 4. 安装和配置 Nginx
print_info "🌐 配置 Nginx..."
sudo yum install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx
print_success "✅ Nginx 配置完成"

# 5. 安装 Certbot
print_info "🔒 安装 SSL 证书工具..."
sudo yum install -y certbot python2-certbot-nginx
print_success "✅ Certbot 安装完成"

# 6. 配置 Firewalld
print_info "🔥 配置防火墙..."
sudo systemctl enable firewalld
sudo systemctl start firewalld

# 开放必要端口
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --reload

print_success "✅ 防火墙配置完成"

# 7. 处理 SELinux
if command -v getenforce >/dev/null 2>&1; then
    selinux_status=$(getenforce)
    print_info "🔒 SELinux 状态: $selinux_status"
    
    if [ "$selinux_status" != "Disabled" ]; then
        print_info "配置 SELinux 策略..."
        sudo setsebool -P httpd_can_network_connect on
        print_success "✅ SELinux 策略配置完成"
    fi
fi

# 8. 创建必要目录
print_info "📁 创建部署目录..."
sudo mkdir -p /var/www/html
sudo chown -R nginx:nginx /var/www/

print_success "✅ 目录创建完成"

# 9. 验证安装
print_info "🔍 验证安装结果..."

echo ""
echo "=================================="
print_info "📊 系统状态检查"
echo "=================================="

echo "Node.js 版本: $(node --version)"
echo "npm 版本: $(npm --version)"
echo "Nginx 状态: $(systemctl is-active nginx)"
echo "Firewalld 状态: $(systemctl is-active firewalld)"

if command -v getenforce >/dev/null 2>&1; then
    echo "SELinux 状态: $(getenforce)"
fi

echo ""
print_success "🎉 CentOS 环境修复完成！"
print_info "现在可以运行部署脚本："
echo "  ./deploy/check-env.sh todo"
echo "  ./deploy/deploy.sh todo"

# 10. 提供 CentOS 特定的建议
echo ""
print_info "💡 CentOS 特定建议："
echo "  - 确保域名 DNS 解析正确"
echo "  - 检查服务器安全组/防火墙设置"
echo "  - 如果使用云服务器，确保安全组开放 80/443 端口"
echo "  - SELinux 策略已自动配置"
echo "  - 使用 'nginx' 用户而非 'www-data'"
