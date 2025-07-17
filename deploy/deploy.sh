#!/bin/bash

# React Todo 应用自动化部署脚本
# 专为 ylingtech.com 二级域名多应用架构设计
# 使用方法: ./deploy.sh [子域名] (默认: todo)

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印函数
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

# 检查是否为 root 用户
check_root() {
    if [[ $EUID -eq 0 ]]; then
        # 检查系统类型，CentOS/RHEL 允许 root 用户
        if command -v yum &> /dev/null; then
            print_warning "⚠️  检测到 root 用户运行，在 CentOS/RHEL 系统上继续执行"
            print_info "💡 注意：确保了解 root 权限的安全风险"
        else
            print_error "请不要使用 root 用户运行此脚本"
            print_info "💡 建议创建普通用户并添加到 sudo 组"
            exit 1
        fi
    fi
}

# 配置参数
SUBDOMAIN=${1:-"todo"}
BASE_DOMAIN="ylingtech.com"
FULL_DOMAIN="${SUBDOMAIN}.${BASE_DOMAIN}"
APP_NAME="${SUBDOMAIN}-app"
APP_DIR="/var/www/${APP_NAME}"
NGINX_CONF="/etc/nginx/sites-available/${APP_NAME}"
NGINX_ENABLED="/etc/nginx/sites-enabled/${APP_NAME}"
SSL_EMAIL="admin@${BASE_DOMAIN}"

print_info "🚀 开始部署 React Todo 应用"
print_info "📍 目标域名: ${FULL_DOMAIN}"
print_info "📁 应用目录: ${APP_DIR}"
print_info "⚙️  Nginx 配置: ${NGINX_CONF}"

# 检查权限
check_root

# 1. 系统环境检查和准备
print_info "🔍 检查系统环境..."

# 检查系统类型
if command -v yum &> /dev/null; then
    SYSTEM_TYPE="centos"
    print_success "检测到 CentOS/RHEL 系统"
elif command -v apt &> /dev/null; then
    SYSTEM_TYPE="ubuntu"
    print_success "检测到 Ubuntu/Debian 系统"
else
    print_error "不支持的操作系统，仅支持 CentOS/RHEL 和 Ubuntu/Debian"
    exit 1
fi

# 更新系统包
print_info "📦 更新系统包..."
if [ "$SYSTEM_TYPE" = "centos" ]; then
    sudo yum update -y
    
    # 安装 EPEL 仓库
    if ! yum repolist enabled | grep -q epel; then
        print_info "安装 EPEL 仓库..."
        sudo yum install -y epel-release
    fi
else
    sudo apt update && sudo apt upgrade -y
fi

# 安装必要的软件包
print_info "📥 安装必要软件包..."
if [ "$SYSTEM_TYPE" = "centos" ]; then
    # CentOS 不从 yum 安装 nodejs/npm，避免版本冲突
    sudo yum install -y nginx certbot python2-certbot-nginx git curl wget bind-utils
    
    # 启用 nginx 和 firewalld
    sudo systemctl enable nginx
    sudo systemctl enable firewalld
    sudo systemctl start firewalld
else
    sudo apt install -y nginx nodejs npm certbot python3-certbot-nginx git curl wget dnsutils
fi

# 检查 Node.js 版本
print_info "🔍 检查 Node.js 版本..."

# 确保使用正确的 PATH
export PATH="/usr/local/bin:$PATH"

if command -v node >/dev/null 2>&1; then
    NODE_VERSION=$(node --version | cut -d 'v' -f 2)
    MAJOR_VERSION=$(echo $NODE_VERSION | cut -d '.' -f 1)
    print_info "当前 Node.js 版本: v$NODE_VERSION"
else
    print_info "未检测到 Node.js，需要安装"
    MAJOR_VERSION=0
fi

if [ $MAJOR_VERSION -lt 16 ]; then
    print_warning "⚠️  检测到 Node.js 版本 $NODE_VERSION，需要 16+"
    print_info "🔄 升级 Node.js..."
    
    if [ "$SYSTEM_TYPE" = "centos" ]; then
        # CentOS 7 强制使用 Node.js 16 (兼容 glibc 2.17)
        GLIBC_VERSION=$(ldd --version | head -n1 | grep -oE '[0-9]+\.[0-9]+')
        print_info "检测到 glibc 版本: $GLIBC_VERSION"
        print_info "安装 Node.js 16 LTS (兼容 CentOS 7 / glibc $GLIBC_VERSION)"
        
        # 清理可能存在的 NodeSource 仓库
        sudo yum remove -y nodejs npm || true
        sudo rm -f /etc/yum.repos.d/nodesource*.repo
        
        # 使用手动安装避免依赖冲突
        print_info "使用预编译二进制文件安装 Node.js 16..."
        cd /tmp
        wget -q https://nodejs.org/dist/v16.20.2/node-v16.20.2-linux-x64.tar.xz
        tar -xf node-v16.20.2-linux-x64.tar.xz
        sudo mv node-v16.20.2-linux-x64 /opt/nodejs
        sudo ln -sf /opt/nodejs/bin/node /usr/local/bin/node
        sudo ln -sf /opt/nodejs/bin/npm /usr/local/bin/npm
        sudo ln -sf /opt/nodejs/bin/npx /usr/local/bin/npx
        
        # 验证安装
        export PATH="/usr/local/bin:$PATH"
        if /usr/local/bin/node --version | grep -q "v16"; then
            print_success "✅ Node.js 16 安装成功"
        else
            print_error "❌ Node.js 安装失败"
            exit 1
        fi
    else
        # Ubuntu/Debian 系统
        curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
        sudo apt-get install -y nodejs
    fi
    
    print_success "✅ Node.js 升级完成"
fi

print_success "✅ 系统环境准备完成"

# 2. 构建应用
print_info "🔨 构建 React 应用..."

# 检查当前目录是否为项目根目录
if [ ! -f "package.json" ]; then
    print_error "❌ 请在 React 项目根目录运行此脚本"
    exit 1
fi

# 安装依赖
print_info "📥 安装项目依赖..."
npm ci --production=false

# 运行预部署检查
if [ -f "deploy/pre-deploy-check.sh" ]; then
    print_info "🔍 运行预部署检查..."
    chmod +x deploy/pre-deploy-check.sh
    ./deploy/pre-deploy-check.sh
fi

# 构建生产版本
print_info "🏗️  构建生产版本..."

# 检查 Node.js 版本并选择合适的构建命令
NODE_VERSION=$(node --version | cut -d 'v' -f 2)
MAJOR_VERSION=$(echo $NODE_VERSION | cut -d '.' -f 1)

if [ $MAJOR_VERSION -le 16 ]; then
    print_info "检测到 Node.js $NODE_VERSION，使用兼容构建模式"
    npm run build:node16
else
    npm run build
fi

# 验证构建结果
if [ ! -d "dist" ]; then
    print_error "❌ 构建失败，未找到 dist 目录"
    exit 1
fi

print_success "✅ 应用构建完成"

# 3. 部署应用文件
print_info "📁 部署应用文件..."

# 创建应用目录
sudo mkdir -p ${APP_DIR}

# 备份现有应用（如果存在）
if [ -d "${APP_DIR}/dist" ]; then
    BACKUP_DIR="${APP_DIR}/backup-$(date +%Y%m%d-%H%M%S)"
    print_info "💾 备份现有应用到 ${BACKUP_DIR}"
    sudo mv ${APP_DIR}/dist ${BACKUP_DIR}
fi

# 复制新的构建文件
print_info "📋 复制构建文件..."
sudo cp -r dist ${APP_DIR}/

# 设置正确的所有者和权限
if [ "$SYSTEM_TYPE" = "centos" ]; then
    sudo chown -R nginx:nginx ${APP_DIR}
else
    sudo chown -R www-data:www-data ${APP_DIR}
fi
sudo chmod -R 755 ${APP_DIR}

# 如果是 CentOS，需要处理 SELinux
if [ "$SYSTEM_TYPE" = "centos" ]; then
    if command -v getenforce >/dev/null 2>&1 && [ "$(getenforce)" != "Disabled" ]; then
        print_info "🔒 配置 SELinux 上下文..."
        sudo setsebool -P httpd_can_network_connect on
        sudo restorecon -R ${APP_DIR}
        print_success "✅ SELinux 配置完成"
    fi
fi

print_success "✅ 应用文件部署完成"

# 4. 配置 Nginx
print_info "⚙️  配置 Nginx..."

# 创建 Nginx 配置文件
print_info "📝 创建 Nginx 配置文件..."
sudo tee ${NGINX_CONF} > /dev/null << EOF
# React Todo 应用 Nginx 配置
# 域名: ${FULL_DOMAIN}
# 应用: ${APP_NAME}

# HTTP 重定向到 HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name ${FULL_DOMAIN};
    
    # Let's Encrypt 验证路径
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }
    
    # 其他请求重定向到 HTTPS
    location / {
        return 301 https://\$server_name\$request_uri;
    }
}

# HTTPS 配置
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name ${FULL_DOMAIN};
    
    # SSL 证书配置
    ssl_certificate /etc/letsencrypt/live/${FULL_DOMAIN}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${FULL_DOMAIN}/privkey.pem;
    ssl_trusted_certificate /etc/letsencrypt/live/${FULL_DOMAIN}/chain.pem;
    
    # SSL 优化配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:50m;
    ssl_session_timeout 1d;
    ssl_session_tickets off;
    
    # OCSP Stapling
    ssl_stapling on;
    ssl_stapling_verify on;
    resolver 8.8.8.8 8.8.4.4 valid=300s;
    resolver_timeout 5s;
    
    # 安全头配置
    add_header Strict-Transport-Security "max-age=63072000" always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-Frame-Options DENY always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;
    
    # 应用根目录
    root ${APP_DIR}/dist;
    index index.html;
    
    # Gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;
    
    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header X-Content-Type-Options nosniff always;
        access_log off;
    }
    
    # 主要路由配置
    location / {
        try_files \$uri \$uri/ /index.html;
        add_header Cache-Control "no-cache";
    }
    
    # 健康检查
    location /health {
        access_log off;
        return 200 "healthy\\n";
        add_header Content-Type text/plain;
    }
    
    # 安全配置
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }
    
    location = /robots.txt {
        access_log off;
        log_not_found off;
    }
    
    location = /favicon.ico {
        access_log off;
        log_not_found off;
    }
}
EOF

# 启用配置
if [ -L ${NGINX_ENABLED} ]; then
    sudo rm ${NGINX_ENABLED}
fi

sudo ln -s ${NGINX_CONF} ${NGINX_ENABLED}

# 测试 Nginx 配置
print_info "🔍 测试 Nginx 配置..."
if sudo nginx -t; then
    print_success "✅ Nginx 配置测试通过"
else
    print_error "❌ Nginx 配置测试失败"
    exit 1
fi

print_success "✅ Nginx 配置完成"

# 5. 获取 SSL 证书
print_info "🔒 配置 SSL 证书..."

# 检查证书是否已存在
if [ -f "/etc/letsencrypt/live/${FULL_DOMAIN}/fullchain.pem" ]; then
    print_info "📜 检测到现有 SSL 证书，检查有效期..."
    
    # 检查证书有效期
    CERT_EXPIRY=$(sudo openssl x509 -enddate -noout -in /etc/letsencrypt/live/${FULL_DOMAIN}/fullchain.pem | cut -d= -f2)
    EXPIRY_TIMESTAMP=$(date -d "$CERT_EXPIRY" +%s)
    CURRENT_TIMESTAMP=$(date +%s)
    DAYS_UNTIL_EXPIRY=$(( (EXPIRY_TIMESTAMP - CURRENT_TIMESTAMP) / 86400 ))
    
    if [ $DAYS_UNTIL_EXPIRY -gt 30 ]; then
        print_success "✅ SSL 证书有效，剩余 $DAYS_UNTIL_EXPIRY 天"
    else
        print_warning "⚠️  SSL 证书即将过期（剩余 $DAYS_UNTIL_EXPIRY 天），尝试续期..."
        sudo certbot renew --nginx --cert-name ${FULL_DOMAIN}
    fi
else
    print_info "🆕 获取新的 SSL 证书..."
    print_warning "⚠️  请确保域名 ${FULL_DOMAIN} 已正确解析到此服务器"
    
    # 创建临时 HTTP 配置用于验证
    sudo tee ${NGINX_CONF}.temp > /dev/null << EOF
server {
    listen 80;
    listen [::]:80;
    server_name ${FULL_DOMAIN};
    
    root ${APP_DIR}/dist;
    index index.html;
    
    # Let's Encrypt 验证路径
    location /.well-known/acme-challenge/ {
        root /var/www/html;
        try_files \$uri =404;
    }
    
    location / {
        try_files \$uri \$uri/ /index.html;
    }
}
EOF
    
    # 暂时使用临时配置
    sudo cp ${NGINX_CONF}.temp ${NGINX_CONF}
    sudo systemctl reload nginx
    
    # 创建 webroot 目录
    sudo mkdir -p /var/www/html/.well-known/acme-challenge
    
    if [ "$SYSTEM_TYPE" = "centos" ]; then
        sudo chown -R nginx:nginx /var/www/html
    else
        sudo chown -R www-data:www-data /var/www/html
    fi
    
    # 获取证书
    if sudo certbot certonly --webroot -w /var/www/html -d ${FULL_DOMAIN} --non-interactive --agree-tos --email ${SSL_EMAIL}; then
        print_success "✅ SSL 证书获取成功"
        
        # 恢复完整的 HTTPS 配置
        sudo tee ${NGINX_CONF} > /dev/null << EOF
# React Todo 应用 Nginx 配置
# 域名: ${FULL_DOMAIN}
# 应用: ${APP_NAME}

# HTTP 重定向到 HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name ${FULL_DOMAIN};
    
    # Let's Encrypt 验证路径
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }
    
    # 其他请求重定向到 HTTPS
    location / {
        return 301 https://\$server_name\$request_uri;
    }
}

# HTTPS 配置
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name ${FULL_DOMAIN};
    
    # SSL 证书配置
    ssl_certificate /etc/letsencrypt/live/${FULL_DOMAIN}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${FULL_DOMAIN}/privkey.pem;
    ssl_trusted_certificate /etc/letsencrypt/live/${FULL_DOMAIN}/chain.pem;
    
    # SSL 优化配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:50m;
    ssl_session_timeout 1d;
    ssl_session_tickets off;
    
    # OCSP Stapling
    ssl_stapling on;
    ssl_stapling_verify on;
    resolver 8.8.8.8 8.8.4.4 valid=300s;
    resolver_timeout 5s;
    
    # 安全头配置
    add_header Strict-Transport-Security "max-age=63072000" always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-Frame-Options DENY always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;
    
    # 应用根目录
    root ${APP_DIR}/dist;
    index index.html;
    
    # Gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;
    
    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header X-Content-Type-Options nosniff always;
        access_log off;
    }
    
    # 主要路由配置
    location / {
        try_files \$uri \$uri/ /index.html;
        add_header Cache-Control "no-cache";
    }
    
    # 健康检查
    location /health {
        access_log off;
        return 200 "healthy\\n";
        add_header Content-Type text/plain;
    }
    
    # 访问日志
    access_log /var/log/nginx/${APP_NAME}-access.log;
    error_log /var/log/nginx/${APP_NAME}-error.log;
    
    # 安全配置
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }
    
    location = /robots.txt {
        access_log off;
        log_not_found off;
    }
    
    location = /favicon.ico {
        access_log off;
        log_not_found off;
    }
}
EOF
        
    else
        print_error "❌ SSL 证书获取失败，继续使用 HTTP 配置"
        sudo cp ${NGINX_CONF}.temp ${NGINX_CONF}
    fi
    
    # 清理临时文件
    sudo rm -f ${NGINX_CONF}.temp
fi

print_success "✅ SSL 配置完成"

# 6. 设置自动续期和最终配置
print_info "🔄 设置证书自动续期..."

# 配置 certbot 自动续期
if ! sudo crontab -l 2>/dev/null | grep -q "certbot renew"; then
    (sudo crontab -l 2>/dev/null; echo "0 2 * * * /usr/bin/certbot renew --quiet --post-hook 'systemctl reload nginx'") | sudo crontab -
    print_success "✅ 证书自动续期已配置"
fi

# 最终测试 Nginx 配置
print_info "🔍 最终测试 Nginx 配置..."
if sudo nginx -t; then
    print_success "✅ Nginx 配置最终测试通过"
    sudo systemctl reload nginx
else
    print_error "❌ Nginx 配置最终测试失败"
    exit 1
fi

# 7. 配置防火墙
print_info "🔥 配置防火墙..."

if [ "$SYSTEM_TYPE" = "centos" ]; then
    # CentOS/RHEL 使用 firewalld
    print_info "配置 firewalld..."
    
    # 确保 firewalld 运行
    sudo systemctl start firewalld
    sudo systemctl enable firewalld
    
    # 开放必要端口
    sudo firewall-cmd --permanent --add-service=http
    sudo firewall-cmd --permanent --add-service=https
    sudo firewall-cmd --permanent --add-service=ssh
    
    # 重载防火墙配置
    sudo firewall-cmd --reload
    
    print_success "✅ Firewalld 配置完成"
    
    # 显示当前防火墙状态
    print_info "当前防火墙状态:"
    sudo firewall-cmd --list-services
else
    # Ubuntu/Debian 使用 ufw
    print_info "配置 UFW..."
    
    sudo ufw allow 'Nginx Full'
    sudo ufw allow ssh
    
    if ! sudo ufw status | grep -q "Status: active"; then
        print_warning "⚠️  UFW 防火墙未启用，强烈建议启用"
        read -p "是否立即启用防火墙？(y/N): " enable_firewall
        if [[ $enable_firewall == [yY] ]]; then
            sudo ufw --force enable
            print_success "✅ UFW 防火墙已启用"
        fi
    else
        print_success "✅ UFW 防火墙配置完成"
    fi
fi

# 8. 启动和启用服务
print_info "🚀 启动服务..."
sudo systemctl enable nginx
sudo systemctl restart nginx

if sudo systemctl is-active --quiet nginx; then
    print_success "✅ Nginx 服务运行正常"
else
    print_error "❌ Nginx 服务启动失败"
    sudo systemctl status nginx
    exit 1
fi

# 9. 验证部署
print_info "🔍 验证部署状态..."
sleep 3

# 检查 HTTP 访问
print_info "检查 HTTP 访问..."
if curl -s -o /dev/null -w "%{http_code}" http://${FULL_DOMAIN} | grep -q "301\|200"; then
    print_success "✅ HTTP 访问正常（重定向或直接访问）"
else
    print_warning "⚠️  HTTP 访问可能有问题"
fi

# 检查 HTTPS 访问
print_info "检查 HTTPS 访问..."
if curl -s -k -o /dev/null -w "%{http_code}" https://${FULL_DOMAIN} | grep -q "200"; then
    print_success "✅ HTTPS 访问正常"
else
    print_warning "⚠️  HTTPS 访问可能有问题，请检查证书配置"
fi

# 检查应用健康状态
print_info "检查应用健康状态..."
if curl -s https://${FULL_DOMAIN}/health 2>/dev/null | grep -q "healthy"; then
    print_success "✅ 应用健康检查通过"
else
    print_warning "⚠️  应用健康检查未通过"
fi

# 10. 清理和输出部署信息
print_info "🧹 清理临时文件..."
sudo rm -f ${NGINX_CONF}.temp

print_success "🎉 部署完成！"
echo ""
echo "=================================="
echo "🚀 部署信息摘要"
echo "=================================="
echo "📍 应用访问地址: https://${FULL_DOMAIN}"
echo "📁 应用目录: ${APP_DIR}"
echo "⚙️  Nginx 配置: ${NGINX_CONF}"
echo "📊 访问日志: /var/log/nginx/${APP_NAME}-access.log"
echo "❌ 错误日志: /var/log/nginx/${APP_NAME}-error.log"
echo ""
echo "🔧 常用管理命令:"
echo "  查看 Nginx 状态: sudo systemctl status nginx"
echo "  重新加载 Nginx: sudo systemctl reload nginx"
echo "  重启 Nginx: sudo systemctl restart nginx"
echo "  查看访问日志: sudo tail -f /var/log/nginx/${APP_NAME}-access.log"
echo "  查看错误日志: sudo tail -f /var/log/nginx/${APP_NAME}-error.log"
echo "  测试 Nginx 配置: sudo nginx -t"
echo ""
echo "📜 SSL 证书管理:"
echo "  查看证书状态: sudo certbot certificates"
echo "  手动续期证书: sudo certbot renew"
echo "  测试续期流程: sudo certbot renew --dry-run"
echo ""
echo "🔄 应用更新流程:"
echo "  1. 在项目目录运行: npm run build"
echo "  2. 备份当前版本: sudo mv ${APP_DIR}/dist ${APP_DIR}/backup-\$(date +%Y%m%d-%H%M%S)"
echo "  3. 复制新版本: sudo cp -r dist ${APP_DIR}/"
if [ "$SYSTEM_TYPE" = "centos" ]; then
    echo "  4. 设置权限: sudo chown -R nginx:nginx ${APP_DIR}"
else
    echo "  4. 设置权限: sudo chown -R www-data:www-data ${APP_DIR}"
fi
echo ""
echo "🌐 多应用部署:"
echo "  部署其他应用: ./deploy.sh [子域名]"
echo "  例如: ./deploy.sh blog  # 部署到 blog.ylingtech.com"
echo "       ./deploy.sh api   # 部署到 api.ylingtech.com"
echo ""

# 显示系统状态
echo "📊 当前系统状态:"
echo "  服务器时间: $(date)"
echo "  磁盘使用: $(df -h / | awk 'NR==2{printf "%s/%s (%s)", $3,$2,$5}')"
echo "  内存使用: $(free -h | awk 'NR==2{printf "%s/%s", $3,$2}')"
echo "  Nginx 版本: $(nginx -v 2>&1 | cut -d' ' -f3)"

if [ -f "/etc/letsencrypt/live/${FULL_DOMAIN}/fullchain.pem" ]; then
    CERT_EXPIRY=$(sudo openssl x509 -enddate -noout -in /etc/letsencrypt/live/${FULL_DOMAIN}/fullchain.pem | cut -d= -f2)
    echo "  SSL 证书到期: ${CERT_EXPIRY}"
fi

echo ""
print_success "✨ 部署脚本执行完成！应用已成功部署到 https://${FULL_DOMAIN}"
