#!/bin/bash

# React Todo 应用环境检查脚本
# 专为 ylingtech.com 多应用架构设计
# 使用方法: ./check-env.sh [子域名] (默认: todo)

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
    echo -e "${GREEN}[✓]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

# 配置参数
SUBDOMAIN=${1:-"todo"}
BASE_DOMAIN="ylingtech.com"
FULL_DOMAIN="${SUBDOMAIN}.${BASE_DOMAIN}"
APP_NAME="${SUBDOMAIN}-app"
APP_DIR="/var/www/${APP_NAME}"

print_info "🔍 检查 ${FULL_DOMAIN} 部署环境状态"
echo "=================================="

# 检查操作系统
print_info "检查操作系统..."
if [[ -f /etc/os-release ]]; then
    . /etc/os-release
    print_success "操作系统: $PRETTY_NAME"
else
    print_error "无法识别操作系统"
fi

# 检查是否为 root 用户
print_info "检查用户权限..."
if [[ $EUID -eq 0 ]]; then
    print_warning "当前为 root 用户，建议使用普通用户执行"
else
    print_success "当前用户: $USER"
fi

# 检查 sudo 权限
print_info "检查 sudo 权限..."
if sudo -n true 2>/dev/null; then
    print_success "sudo 权限正常"
else
    print_warning "需要 sudo 权限，请确保用户在 sudoers 中"
fi

# 检查网络连接
print_info "检查网络连接..."
if ping -c 1 8.8.8.8 >/dev/null 2>&1; then
    print_success "网络连接正常"
else
    print_error "网络连接失败"
fi

# 检查端口占用
print_info "检查端口占用..."
for port in 80 443; do
    if ss -tuln | grep ":$port " >/dev/null; then
        print_warning "端口 $port 已被占用"
    else
        print_success "端口 $port 可用"
    fi
done

# 检查磁盘空间
print_info "检查磁盘空间..."
available_space=$(df / | awk 'NR==2 {print $4}')
if [[ $available_space -gt 1048576 ]]; then  # 1GB
    print_success "磁盘空间充足: $(df -h / | awk 'NR==2 {print $4}') 可用"
else
    print_warning "磁盘空间不足，建议至少有 1GB 可用空间"
fi

# 检查内存
print_info "检查内存..."
total_mem=$(free -m | awk 'NR==2{printf "%.0f", $2}')
if [[ $total_mem -gt 512 ]]; then
    print_success "内存充足: ${total_mem}MB"
else
    print_warning "内存较小: ${total_mem}MB，建议至少 512MB"
fi

# 检查必要的命令
print_info "检查必要的命令..."
commands=("curl" "wget" "systemctl")
for cmd in "${commands[@]}"; do
    if command -v $cmd >/dev/null 2>&1; then
        print_success "$cmd 已安装"
    else
        print_error "$cmd 未安装"
    fi
done

# 检查包管理器
print_info "检查包管理器..."
if command -v yum >/dev/null 2>&1; then
    print_success "使用 YUM 包管理器 (CentOS/RHEL)"
    # 检查 EPEL 仓库
    if yum repolist enabled | grep -q epel; then
        print_success "EPEL 仓库已启用"
    else
        print_warning "EPEL 仓库未启用，建议安装: sudo yum install -y epel-release"
    fi
elif command -v dnf >/dev/null 2>&1; then
    print_success "使用 DNF 包管理器 (Fedora/CentOS 8+)"
elif command -v apt >/dev/null 2>&1; then
    print_success "使用 APT 包管理器 (Ubuntu/Debian)"
else
    print_error "未找到支持的包管理器"
fi

# 检查防火墙状态
print_info "检查防火墙状态..."
if command -v firewall-cmd >/dev/null 2>&1; then
    if systemctl is-active firewalld >/dev/null 2>&1; then
        print_success "Firewalld 已启用"
        # 检查必要端口
        for port in 80 443 22; do
            if sudo firewall-cmd --list-ports | grep -q "${port}/tcp"; then
                print_success "防火墙端口 ${port}/tcp 已开放"
            else
                print_warning "防火墙端口 ${port}/tcp 未开放"
            fi
        done
    else
        print_warning "Firewalld 未启用"
    fi
elif command -v ufw >/dev/null 2>&1; then
    ufw_status=$(sudo ufw status | grep "Status:" | awk '{print $2}')
    print_info "UFW 状态: $ufw_status"
elif command -v iptables >/dev/null 2>&1; then
    print_info "检测到 iptables"
    if sudo iptables -L | grep -q "ACCEPT.*dpt:http"; then
        print_success "iptables 允许 HTTP 访问"
    else
        print_warning "iptables 可能未配置 HTTP 访问"
    fi
else
    print_warning "未找到防火墙管理工具"
fi

# 检查应用相关
print_info "📱 检查应用配置..."

# 检查应用目录
if [ -d "${APP_DIR}" ]; then
    print_success "应用目录存在: ${APP_DIR}"
    
    # 检查应用文件
    if [ -f "${APP_DIR}/dist/index.html" ]; then
        print_success "应用文件已部署"
    else
        print_warning "应用文件未部署或路径不正确"
    fi
else
    print_info "应用目录不存在（首次部署正常）"
fi

# 检查 Nginx 配置
nginx_conf="/etc/nginx/sites-available/${APP_NAME}"
if [ -f "${nginx_conf}" ]; then
    print_success "Nginx 配置文件存在"
    
    # 检查配置是否启用
    if [ -L "/etc/nginx/sites-enabled/${APP_NAME}" ]; then
        print_success "Nginx 配置已启用"
    else
        print_warning "Nginx 配置未启用"
    fi
else
    print_info "Nginx 配置文件不存在（首次部署正常）"
fi

# 检查 SSL 证书
if [ -f "/etc/letsencrypt/live/${FULL_DOMAIN}/fullchain.pem" ]; then
    print_success "SSL 证书存在"
    
    # 检查证书有效期
    cert_expiry=$(sudo openssl x509 -enddate -noout -in /etc/letsencrypt/live/${FULL_DOMAIN}/fullchain.pem | cut -d= -f2)
    expiry_timestamp=$(date -d "$cert_expiry" +%s)
    current_timestamp=$(date +%s)
    days_until_expiry=$(( (expiry_timestamp - current_timestamp) / 86400 ))
    
    if [ $days_until_expiry -gt 30 ]; then
        print_success "SSL 证书有效，剩余 $days_until_expiry 天"
    else
        print_warning "SSL 证书即将过期，剩余 $days_until_expiry 天"
    fi
else
    print_info "SSL 证书不存在（首次部署正常）"
fi

# 检查域名解析
print_info "🌐 检查域名解析..."

# 检查域名解析工具并安装（如果需要）
if ! command -v dig >/dev/null 2>&1; then
    print_warning "dig 命令未找到，尝试安装..."
    if command -v yum >/dev/null 2>&1; then
        # CentOS/RHEL 系统
        if sudo yum install -y bind-utils; then
            print_success "dig 工具安装成功"
        else
            print_warning "dig 工具安装失败，使用 nslookup 替代"
        fi
    elif command -v apt >/dev/null 2>&1; then
        # Ubuntu/Debian 系统
        if sudo apt install -y dnsutils; then
            print_success "dig 工具安装成功"
        else
            print_warning "dig 工具安装失败，使用 nslookup 替代"
        fi
    fi
fi

# 尝试解析域名
domain_ip=""
if command -v dig >/dev/null 2>&1; then
    domain_ip=$(dig +short ${FULL_DOMAIN} 2>/dev/null)
elif command -v nslookup >/dev/null 2>&1; then
    domain_ip=$(nslookup ${FULL_DOMAIN} 2>/dev/null | grep -A 1 "Name:" | tail -n 1 | awk '{print $2}')
elif command -v host >/dev/null 2>&1; then
    domain_ip=$(host ${FULL_DOMAIN} 2>/dev/null | awk '/has address/ {print $4}')
fi

if [ -n "$domain_ip" ]; then
    print_success "域名解析正常: ${FULL_DOMAIN} -> ${domain_ip}"
    
    # 检查是否解析到当前服务器
    server_ip=""
    if command -v curl >/dev/null 2>&1; then
        server_ip=$(curl -s --connect-timeout 5 ifconfig.me 2>/dev/null || curl -s --connect-timeout 5 icanhazip.com 2>/dev/null || curl -s --connect-timeout 5 ipinfo.io/ip 2>/dev/null)
    elif command -v wget >/dev/null 2>&1; then
        server_ip=$(wget -qO- --timeout=5 ifconfig.me 2>/dev/null || wget -qO- --timeout=5 icanhazip.com 2>/dev/null)
    fi
    
    if [ -n "$server_ip" ]; then
        if [ "$domain_ip" = "$server_ip" ]; then
            print_success "域名正确解析到当前服务器"
        else
            print_warning "域名未解析到当前服务器 (当前: $server_ip, 解析: $domain_ip)"
        fi
    else
        print_warning "无法获取服务器公网 IP，请手动验证域名解析"
    fi
else
    print_warning "域名 ${FULL_DOMAIN} 未解析或解析失败"
    print_info "请确保域名 DNS A 记录已正确配置"
fi

# 检查 SELinux（如果存在）
if command -v getenforce >/dev/null 2>&1; then
    print_info "🔒 检查 SELinux..."
    selinux_status=$(getenforce)
    print_info "SELinux 状态: $selinux_status"
fi

# 最终总结
echo ""
echo "=================================="
print_info "🏁 环境检查完成！"
echo "=================================="

# 提供部署建议
echo ""
print_info "📋 部署建议："

if [ -d "${APP_DIR}" ]; then
    echo "  ✅ 这是一个更新部署"
    echo "  📝 运行: ./deploy/deploy.sh ${SUBDOMAIN}"
else
    echo "  🆕 这是一个全新部署"
    echo "  📝 运行: ./deploy/deploy.sh ${SUBDOMAIN}"
fi

echo ""
print_info "🔧 多应用部署示例："
echo "  ./deploy/deploy.sh todo    # 部署到 todo.ylingtech.com"
echo "  ./deploy/deploy.sh blog    # 部署到 blog.ylingtech.com"  
echo "  ./deploy/deploy.sh api     # 部署到 api.ylingtech.com"
echo "  ./deploy/deploy.sh admin   # 部署到 admin.ylingtech.com"

echo ""
print_info "📚 更多信息："
echo "  - 部署文档: ./DEPLOYMENT_CHECKLIST.md"
echo "  - Nginx 配置: /etc/nginx/sites-available/${APP_NAME}"
echo "  - 应用目录: ${APP_DIR}"
echo "  - 日志文件: /var/log/nginx/${APP_NAME}-*.log"

echo ""
if [ -f "/etc/letsencrypt/live/${FULL_DOMAIN}/fullchain.pem" ]; then
    print_success "✨ 环境已准备就绪，可以开始部署！"
else
    print_warning "⚠️  首次部署需要配置 SSL 证书，部署脚本会自动处理"
fi
