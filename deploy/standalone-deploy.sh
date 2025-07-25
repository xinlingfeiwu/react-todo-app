#!/bin/bash

# React Todo App 独立部署脚本 - 基于 almalinux-deploy.sh 改进
# 可在任何位置执行，自动寻找 deploy 目录平级的 dist 目录进行部署
# 无需 Node.js 环境，只需要构建后的文件
# 支持 AlmaLinux、CentOS、Ubuntu、Debian 等主流 Linux 发行版

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

print_info() {
    echo -e "${BLUE}[信息]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[成功]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[警告]${NC} $1"
}

print_error() {
    echo -e "${RED}[错误]${NC} $1"
}

print_step() {
    echo -e "${PURPLE}[步骤]${NC} $1"
}

# 错误处理
error_exit() {
    print_error "$1"
    exit 1
}

# 配置参数
DOMAIN_NAME=""
APP_NAME=""
WEB_DIR=""
NGINX_CONFIG=""

# 解析命令行参数
while [[ $# -gt 0 ]]; do
    case $1 in
        -d|--domain)
            DOMAIN_NAME="$2"
            shift 2
            ;;
        -a|--app)
            APP_NAME="$2"
            shift 2
            ;;
        -h|--help)
            echo "用法: $0 [-d DOMAIN] [-a APP_NAME]"
            echo "选项:"
            echo "  -d, --domain DOMAIN    域名 (默认: todo.ylingtech.com)"
            echo "  -a, --app APP_NAME     应用名称 (默认: todo-app)"
            echo "  -h, --help             显示帮助信息"
            echo ""
            echo "示例:"
            echo "  $0                                    # 使用默认配置"
            echo "  $0 -d example.com -a my-app          # 自定义域名和应用名"
            exit 0
            ;;
        *)
            error_exit "未知选项: $1"
            ;;
    esac
done

# 设置默认值
if [ -z "$DOMAIN_NAME" ]; then
    DOMAIN_NAME="todo.ylingtech.com"
fi

if [ -z "$APP_NAME" ]; then
    APP_NAME="todo-app"
fi

# 设置工作目录
WEB_DIR="/var/www/$APP_NAME"

echo "🚀 React Todo App 独立部署脚本"
echo "域名: $DOMAIN_NAME"
echo "应用: $APP_NAME"
echo "时间: $(date)"
echo ""

# 1. 检测项目结构和构建文件
print_step "1. 检测项目结构"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
print_info "脚本位置: $SCRIPT_DIR"

# 检查是否在 deploy 目录中
if [[ "$SCRIPT_DIR" == *"/deploy" ]]; then
    PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
    print_info "项目根目录: $PROJECT_ROOT"
else
    error_exit "❌ 脚本必须在 deploy 目录中执行"
fi

# 检查 dist 目录
DIST_DIR="$PROJECT_ROOT/dist"
if [ -d "$DIST_DIR" ]; then
    print_success "✅ 找到构建目录: $DIST_DIR"
    
    # 检查 dist 目录内容
    if [ -f "$DIST_DIR/index.html" ]; then
        print_success "✅ 构建文件完整"
        DIST_SIZE=$(du -sh "$DIST_DIR" | cut -f1)
        print_info "构建目录大小: $DIST_SIZE"
        
        # 检查版本信息文件
        if [ -f "$DIST_DIR/version.json" ]; then
            VERSION_INFO=$(cat "$DIST_DIR/version.json" | grep '"version"' | cut -d'"' -f4 2>/dev/null || echo "未知")
            print_info "构建版本: $VERSION_INFO"
        else
            print_warning "⚠️ 未找到版本信息文件，应用更新检测可能无法正常工作"
        fi
    else
        print_error "❌ 构建文件不完整，缺少 index.html"
        print_info "请确保已正确构建项目并生成了 dist 目录"
        exit 1
    fi
else
    print_error "❌ 未找到构建目录: $DIST_DIR"
    print_info "请确保构建文件已上传到正确位置"
    exit 1
fi

# 2. 检查执行权限
print_step "2. 检查执行权限"

if [ "$EUID" -ne 0 ]; then
    print_error "❌ 此脚本需要 root 权限运行"
    print_info "请使用: sudo $0"
    exit 1
fi

print_success "✅ 权限检查通过"

# 3. 检测操作系统类型
print_step "3. 检测操作系统"

if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS_NAME="$NAME"
    OS_VERSION="$VERSION_ID"
    print_info "操作系统: $OS_NAME $OS_VERSION"

    # 确定系统类型
    if [[ "$ID_LIKE" == *"rhel"* ]] || [[ "$ID" == "rhel" ]] || [[ "$ID" == "almalinux" ]] || [[ "$ID" == "rocky" ]] || [[ "$ID" == "centos" ]]; then
        SYSTEM_TYPE="rhel"
    elif [[ "$ID" == "fedora" ]]; then
        SYSTEM_TYPE="fedora"
    elif [[ "$ID_LIKE" == *"debian"* ]] || [[ "$ID" == "debian" ]] || [[ "$ID" == "ubuntu" ]]; then
        SYSTEM_TYPE="debian"
    else
        SYSTEM_TYPE="unknown"
        print_warning "未知的操作系统类型，将尝试通用安装方式"
    fi

    print_info "系统类型: $SYSTEM_TYPE"
else
    error_exit "无法检测操作系统类型"
fi

# 4. 安装和配置 Nginx
print_step "4. 安装和配置 Nginx"

case $SYSTEM_TYPE in
    "rhel")
        print_info "使用 DNF 包管理器安装基础软件..."
        dnf update -y
        dnf install -y curl wget git bind-utils nginx
        systemctl start nginx
        systemctl enable nginx
        mkdir -p /etc/nginx/conf.d
        mkdir -p /var/log/nginx
        print_success "✅ Nginx 安装完成"
        ;;

    "debian")
        print_info "使用 APT 包管理器安装基础软件..."
        apt-get update
        apt-get install -y curl wget git dnsutils nginx
        systemctl start nginx
        systemctl enable nginx
        mkdir -p /etc/nginx/sites-available
        mkdir -p /etc/nginx/sites-enabled
        mkdir -p /var/log/nginx
        print_success "✅ Nginx 安装完成"
        ;;

    "fedora")
        print_info "使用 DNF 包管理器安装基础软件..."
        dnf update -y
        dnf install -y curl wget git bind-utils nginx
        systemctl start nginx
        systemctl enable nginx
        mkdir -p /etc/nginx/conf.d
        mkdir -p /var/log/nginx
        print_success "✅ Nginx 安装完成"
        ;;

    *)
        print_warning "未知系统类型，尝试通用安装方式..."
        if command -v dnf &> /dev/null; then
            dnf update -y && dnf install -y nginx
        elif command -v yum &> /dev/null; then
            yum update -y && yum install -y nginx
        elif command -v apt-get &> /dev/null; then
            apt-get update && apt-get install -y nginx
        else
            error_exit "无法确定包管理器，请手动安装 Nginx"
        fi
        systemctl start nginx
        systemctl enable nginx
        ;;
esac

# 验证 Nginx 安装和运行状态
print_info "验证 Nginx 状态..."
if command -v nginx &> /dev/null; then
    NGINX_VERSION=$(nginx -v 2>&1 | cut -d'/' -f2)
    print_success "Nginx 版本: $NGINX_VERSION"

    # 检查 Nginx 是否运行
    if systemctl is-active nginx &> /dev/null; then
        print_success "Nginx 服务正在运行"
    else
        print_info "启动 Nginx 服务..."
        systemctl start nginx
        systemctl enable nginx
    fi
else
    error_exit "Nginx 安装失败或不在 PATH 中"
fi

# 创建必要的目录
print_info "创建必要的系统目录..."
mkdir -p /var/www/html
mkdir -p /var/log/nginx
mkdir -p /etc/nginx/conf.d

# 设置 Web 服务器用户
WEB_USER="nginx"
if [ "$SYSTEM_TYPE" = "debian" ]; then
    WEB_USER="www-data"
fi

print_info "Web 服务器用户: $WEB_USER"

# 5. 配置 Web 服务器
print_step "5. 配置 Web 服务器 ($DOMAIN_NAME)"

# 确保 Nginx 配置目录存在
print_info "确保 Nginx 配置目录存在..."
mkdir -p /etc/nginx/conf.d
mkdir -p /var/log/nginx
mkdir -p /var/www/html

# 检测 Nginx 配置目录结构
NGINX_CONF_DIR="/etc/nginx/conf.d"
if [ "$SYSTEM_TYPE" = "debian" ]; then
    # Debian 系统可能使用 sites-available/sites-enabled 结构
    if [ -d "/etc/nginx/sites-available" ]; then
        NGINX_CONF_DIR="/etc/nginx/sites-available"
        mkdir -p /etc/nginx/sites-enabled
        print_info "使用 Debian 风格的 Nginx 配置结构"
    fi
fi

NGINX_CONFIG="$NGINX_CONF_DIR/$APP_NAME.conf"
print_info "Nginx 配置文件路径: $NGINX_CONFIG"

# 创建初始 HTTP 配置的函数
create_initial_nginx_config() {
    print_info "为 $DOMAIN_NAME 创建初始 HTTP Nginx 配置文件..."

    tee "$NGINX_CONFIG" > /dev/null << EOF
# $APP_NAME Nginx 配置 (临时 HTTP 配置)
# 域名: $DOMAIN_NAME

server {
    listen 80;
    listen [::]:80;
    server_name $DOMAIN_NAME;

    # 网站根目录
    root $WEB_DIR;
    index index.html;

    # Let's Encrypt 验证路径
    location /.well-known/acme-challenge/ {
        root /var/www/html;
        allow all;
    }

    # SPA 路由支持
    location / {
        try_files \\\$uri \\\$uri/ /index.html;
    }

    # 静态资源缓存优化
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header Vary "Accept-Encoding";
        access_log off;
    }

    # 其他静态文件
    location ~* \\.(ico|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)\\$ {
        expires 1M;
        add_header Cache-Control "public";
        access_log off;
    }

    # HTML 文件
    location ~* \\.(html)\\$ {
        expires 1h;
        add_header Cache-Control "public, no-cache, must-revalidate";
        add_header Vary "Accept-Encoding";
    }

    # 健康检查
    location /health {
        access_log off;
        return 200 "healthy\\n";
        add_header Content-Type text/plain;
    }

    # 安全配置
    location ~ /\\. {
        deny all;
        access_log off;
        log_not_found off;
    }

    # 禁止访问敏感文件
    location ~* \\.(htaccess|htpasswd|ini|log|sh|inc|bak)\\$ {
        deny all;
        access_log off;
        log_not_found off;
    }

    # 日志配置
    access_log /var/log/nginx/$APP_NAME-access.log;
    error_log /var/log/nginx/$APP_NAME-error.log;
}
EOF
}

# 创建 HTTPS 配置的函数
create_https_nginx_config() {
    print_info "创建完整的 HTTPS Nginx 配置文件（iOS Safari 兼容）..."

    tee "$NGINX_CONFIG" > /dev/null << EOF
# $APP_NAME Nginx 配置 (iOS Safari 兼容版本)
# 域名: $DOMAIN_NAME

# HTTP 重定向到 HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name $DOMAIN_NAME;

    # Let's Encrypt 验证路径
    location /.well-known/acme-challenge/ {
        root /var/www/html;
        allow all;
    }

    # HTTP 自动重定向到 HTTPS
    location / {
        return 301 https://\\\$server_name\\\$request_uri;
    }
}

# HTTPS 配置 - iOS Safari 优化
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name $DOMAIN_NAME;

    # SSL 证书配置
    ssl_certificate /etc/letsencrypt/live/$DOMAIN_NAME/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN_NAME/privkey.pem;

    # iOS Safari 兼容的 SSL 配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # 启用 OCSP Stapling (提高 iOS Safari 兼容性)
    ssl_stapling on;
    ssl_stapling_verify on;
    ssl_trusted_certificate /etc/letsencrypt/live/$DOMAIN_NAME/chain.pem;
    resolver 8.8.8.8 8.8.4.4 valid=300s;
    resolver_timeout 5s;

    # iOS Safari 兼容的安全头配置
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:; media-src 'self'; object-src 'none'; child-src 'self';" always;

    # 网站根目录
    root $WEB_DIR;
    index index.html;

    # SPA 路由支持 (iOS Safari 优化)
    location / {
        try_files \\\$uri \\\$uri/ /index.html;
    }

    # 静态资源缓存优化 (iOS Safari 兼容)
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header Vary "Accept-Encoding";
        access_log off;
    }

    # 其他静态文件 (iOS Safari 优化的 MIME 类型)
    location ~* \\.(ico|png|jpg|jpeg|gif|svg)\\$ {
        expires 1M;
        add_header Cache-Control "public";
        access_log off;
    }

    # 字体文件 (iOS Safari 需要 CORS 头)
    location ~* \\.(woff|woff2|ttf|eot)\\$ {
        expires 1M;
        add_header Cache-Control "public";
        add_header Access-Control-Allow-Origin "*";
        access_log off;
    }

    # HTML 文件 (iOS Safari 缓存策略)
    location ~* \\\\.html\\$ {
        add_header Content-Type "text/html; charset=utf-8";
        expires -1;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header Pragma "no-cache";
        add_header Expires "0";
        add_header Vary "Accept-Encoding";
    }

    # 健康检查
    location /health {
        access_log off;
        return 200 "healthy\\n";
        add_header Content-Type text/plain;
    }

    # iOS Safari 兼容的 Gzip 压缩配置
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/json
        application/xml+rss
        application/atom+xml
        image/svg+xml
        font/woff
        font/woff2;

    # 安全配置
    location ~ /\\. {
        deny all;
        access_log off;
        log_not_found off;
    }

    # 禁止访问敏感文件
    location ~* \\.(htaccess|htpasswd|ini|log|sh|inc|bak)\\$ {
        deny all;
        access_log off;
        log_not_found off;
    }

    # 日志配置
    access_log /var/log/nginx/$APP_NAME-access.log;
    error_log /var/log/nginx/$APP_NAME-error.log;
}
EOF
}

# 创建 Nginx 配置
if [ -f "$NGINX_CONFIG" ]; then
    print_info "检测到现有配置文件: $NGINX_CONFIG"

    # 检查现有配置是否包含 SSL 证书路径但证书不存在
    if grep -q "ssl_certificate.*fullchain.pem" "$NGINX_CONFIG" && [ ! -f "/etc/letsencrypt/live/$DOMAIN_NAME/fullchain.pem" ]; then
        print_warning "现有配置包含 SSL 证书路径但证书不存在，重新创建为 HTTP 配置..."
        create_initial_nginx_config
        print_success "Nginx 配置文件已重新创建: $NGINX_CONFIG"
    elif [ -f "/etc/letsencrypt/live/$DOMAIN_NAME/fullchain.pem" ] && ! grep -q "ssl_certificate.*fullchain.pem" "$NGINX_CONFIG"; then
        print_info "检测到 SSL 证书但配置文件为 HTTP，更新为 HTTPS 配置..."
        create_https_nginx_config
        print_success "Nginx 配置文件已更新为 HTTPS: $NGINX_CONFIG"
    else
        print_info "现有配置文件状态正常，保持不变"
    fi
else
    # 检查是否已有 SSL 证书
    if [ -f "/etc/letsencrypt/live/$DOMAIN_NAME/fullchain.pem" ]; then
        print_info "检测到现有 SSL 证书，创建 HTTPS 配置..."
        create_https_nginx_config
    else
        print_info "未检测到 SSL 证书，创建临时 HTTP 配置..."
        create_initial_nginx_config
    fi

    print_success "Nginx 配置文件已创建: $NGINX_CONFIG"
fi

# 对于 Debian 系统，创建 sites-enabled 符号链接
if [ "$SYSTEM_TYPE" = "debian" ] && [ "$NGINX_CONF_DIR" = "/etc/nginx/sites-available" ]; then
    print_info "创建 sites-enabled 符号链接..."
    ln -sf "$NGINX_CONFIG" "/etc/nginx/sites-enabled/$APP_NAME.conf"

    # 禁用默认站点
    if [ -f "/etc/nginx/sites-enabled/default" ]; then
        print_info "禁用默认 Nginx 站点..."
        rm -f /etc/nginx/sites-enabled/default
    fi
fi

# 测试 Nginx 配置
print_info "测试 Nginx 配置..."
if nginx -t; then
    print_success "✅ Nginx 配置测试通过"
else
    print_error "❌ Nginx 配置测试失败"
    nginx -t
    error_exit "Nginx 配置有误，请检查配置文件"
fi

# 6. 部署应用文件
print_step "6. 部署应用文件"

print_info "创建 Web 目录: $WEB_DIR"
mkdir -p "$WEB_DIR"

print_info "备份现有文件..."
if [ -d "$WEB_DIR" ] && [ "$(ls -A $WEB_DIR)" ]; then
    BACKUP_DIR="/var/backups/$APP_NAME-$(date +%Y%m%d-%H%M%S)"
    mkdir -p "$(dirname "$BACKUP_DIR")"
    cp -r "$WEB_DIR" "$BACKUP_DIR"
    print_success "✅ 备份完成: $BACKUP_DIR"
fi

print_info "复制构建文件到 $WEB_DIR"
rm -rf "$WEB_DIR"/*
cp -r "$DIST_DIR"/* "$WEB_DIR"/

# 确保版本信息文件存在且可访问
if [ -f "$WEB_DIR/version.json" ]; then
    print_success "✅ 版本信息文件已部署: $WEB_DIR/version.json"
    # 显示版本信息
    VERSION_INFO=$(cat "$WEB_DIR/version.json" | grep '"version"' | cut -d'"' -f4 2>/dev/null || echo "未知")
    print_info "部署版本: $VERSION_INFO"
else
    print_warning "⚠️ 版本信息文件未找到，应用更新检测可能无法正常工作"
fi

# 设置权限
chown -R $WEB_USER:$WEB_USER "$WEB_DIR"
chmod -R 755 "$WEB_DIR"

# 创建健康检查文件
bash -c "echo 'OK' > $WEB_DIR/health"

print_success "应用文件部署完成"

# 7. 配置防火墙
print_step "7. 配置防火墙"

case $SYSTEM_TYPE in
    "rhel"|"fedora")
        if command -v firewall-cmd &> /dev/null; then
            print_info "配置 firewalld..."

            # 检查防火墙状态
            if systemctl is-active firewalld &> /dev/null; then
                print_info "防火墙正在运行，配置端口..."
                firewall-cmd --permanent --add-service=http
                firewall-cmd --permanent --add-service=https
                firewall-cmd --reload
                print_success "防火墙配置完成"
            else
                print_warning "防火墙未运行，尝试启动..."
                if systemctl start firewalld && systemctl enable firewalld; then
                    print_info "防火墙已启动，配置端口..."
                    firewall-cmd --permanent --add-service=http
                    firewall-cmd --permanent --add-service=https
                    firewall-cmd --reload
                    print_success "防火墙配置完成"
                else
                    print_warning "无法启动防火墙，请手动配置端口访问"
                fi
            fi
        else
            print_warning "未检测到 firewalld，请手动配置防火墙"
        fi
        ;;
    "debian")
        if command -v ufw &> /dev/null; then
            print_info "配置 UFW..."
            ufw allow 'Nginx Full'
            ufw --force enable
            print_success "防火墙配置完成"
        else
            print_warning "未检测到 UFW，请手动配置防火墙"
        fi
        ;;
esac

# 8. SSL 证书配置
print_step "8. 配置 SSL 证书"

# 安装 certbot
print_info "安装 certbot..."
case $SYSTEM_TYPE in
    "rhel")
        # RHEL 系列需要启用 EPEL 仓库
        print_info "启用 EPEL 仓库..."
        dnf install -y epel-release

        print_info "安装 certbot 和 nginx 插件..."
        dnf install -y certbot python3-certbot-nginx
        ;;
    "fedora")
        print_info "安装 certbot 和 nginx 插件..."
        dnf install -y certbot python3-certbot-nginx
        ;;
    "debian")
        print_info "安装 certbot 和 nginx 插件..."
        apt-get install -y certbot python3-certbot-nginx
        ;;
    *)
        print_warning "请手动安装 certbot"
        ;;
esac

# 验证 certbot 安装
if command -v certbot &> /dev/null; then
    CERTBOT_VERSION=$(certbot --version 2>&1 | head -n1)
    print_success "Certbot 安装成功: $CERTBOT_VERSION"
else
    print_warning "Certbot 安装可能失败，将跳过 SSL 证书配置..."
fi

# 检查现有证书
if [ -f "/etc/letsencrypt/live/$DOMAIN_NAME/fullchain.pem" ]; then
    print_info "检测到现有 SSL 证书"

    # 检查证书有效期
    CERT_EXPIRY=$(openssl x509 -enddate -noout -in /etc/letsencrypt/live/$DOMAIN_NAME/fullchain.pem | cut -d= -f2)
    EXPIRY_DATE=$(date -d "$CERT_EXPIRY" +%s)
    CURRENT_DATE=$(date +%s)
    DAYS_LEFT=$(( (EXPIRY_DATE - CURRENT_DATE) / 86400 ))

    print_info "证书有效期剩余: $DAYS_LEFT 天"

    if [ $DAYS_LEFT -lt 30 ]; then
        print_warning "证书即将到期，尝试续期..."
        if command -v certbot &> /dev/null; then
            certbot renew
        fi
    else
        print_success "证书仍然有效"
    fi
else
    print_info "获取新的 SSL 证书..."

    # 重新加载 Nginx 以确保 HTTP 配置生效
    systemctl reload nginx

    # 获取证书
    if command -v certbot &> /dev/null; then
        if certbot --nginx -d "$DOMAIN_NAME" --non-interactive --agree-tos --email admin@"$DOMAIN_NAME"; then
            print_success "SSL 证书获取成功"

            # 更新为 HTTPS 配置
            create_https_nginx_config

            # 重新加载 Nginx
            nginx -t && systemctl reload nginx
            print_success "HTTPS 配置已启用"
        else
            print_warning "SSL 证书获取失败，将继续使用 HTTP"
        fi
    else
        print_warning "Certbot 未安装，跳过 SSL 证书配置"
    fi
fi

# 9. 最终验证
print_step "9. 最终验证"

# 测试 Nginx 配置
print_info "验证 Nginx 配置..."
if nginx -t; then
    print_success "Nginx 配置正确"
    systemctl reload nginx
else
    print_error "Nginx 配置有误"
    nginx -t
fi

# 检查服务状态
print_info "检查服务状态..."
if systemctl is-active nginx &> /dev/null; then
    print_success "Nginx 服务运行正常"
else
    print_error "Nginx 服务未运行"
    systemctl status nginx
fi

# 检查文件权限
print_info "检查文件权限..."
if [ -r "$WEB_DIR/index.html" ]; then
    print_success "应用文件可访问"
else
    print_warning "应用文件可能无法访问"
    ls -la "$WEB_DIR/"
fi

# 连接测试
print_info "等待服务启动..."
sleep 3

print_info "测试本地 HTTP 连接..."
LOCAL_HTTP=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 http://localhost/ 2>/dev/null || echo "000")
print_info "本地 HTTP 状态码: $LOCAL_HTTP"

if [ "$LOCAL_HTTP" = "200" ]; then
    print_success "✅ 本地 HTTP 连接正常"
elif [ "$LOCAL_HTTP" = "301" ] || [ "$LOCAL_HTTP" = "302" ]; then
    print_success "✅ 本地 HTTP 重定向正常（HTTPS 重定向）"
else
    print_error "❌ 本地 HTTP 连接异常"
fi

print_info "测试外部连接..."
EXTERNAL_HTTP=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 http://$DOMAIN_NAME/ 2>/dev/null || echo "000")
print_info "外部 HTTP 状态码: $EXTERNAL_HTTP"

# 10. 完成信息
print_step "10. 部署完成"

print_success "🎉 部署成功完成！"
echo ""
echo "📋 部署信息："
echo "   域名: $DOMAIN_NAME"
echo "   应用: $APP_NAME"
echo "   目录: $WEB_DIR"
echo "   配置: $NGINX_CONFIG"
echo "   构建大小: $DIST_SIZE"
echo ""
echo "🌐 访问地址："
if [ -f "/etc/letsencrypt/live/$DOMAIN_NAME/fullchain.pem" ]; then
    echo "   https://$DOMAIN_NAME"
    echo "   http://$DOMAIN_NAME (自动重定向到 HTTPS)"
else
    echo "   http://$DOMAIN_NAME"
fi
echo ""

if [ "$LOCAL_HTTP" = "200" ]; then
    print_success "✅ 本地访问正常: http://localhost/"
else
    print_warning "⚠️ 本地访问异常，请检查配置"
fi

if [ "$EXTERNAL_HTTP" = "200" ]; then
    print_success "✅ 外部访问正常: http://$DOMAIN_NAME/"
elif [ "$EXTERNAL_HTTP" = "301" ] || [ "$EXTERNAL_HTTP" = "302" ]; then
    print_success "✅ 外部访问正常: http://$DOMAIN_NAME/ (HTTPS 重定向)"
    print_info "网站配置了 HTTPS 重定向，这是安全网站的标准配置"

    # 测试 HTTPS 访问
    print_info "测试 HTTPS 访问..."
    EXTERNAL_HTTPS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 https://$DOMAIN_NAME/ 2>/dev/null || echo "000")
    if [ "$EXTERNAL_HTTPS" = "200" ]; then
        print_success "✅ HTTPS 访问正常: https://$DOMAIN_NAME/"
    else
        print_warning "⚠️ HTTPS 访问状态码: $EXTERNAL_HTTPS"
    fi
elif [ "$EXTERNAL_HTTP" = "000" ]; then
    print_warning "⚠️ 外部访问失败，请检查:"
    echo "   1. 防火墙配置"
    echo "   2. 域名DNS配置"
    echo "   3. 云服务器安全组设置"
    echo "   4. ICP备案状态（如果服务器在中国大陆）"
else
    print_warning "⚠️ 外部访问状态码: $EXTERNAL_HTTP"
fi

echo ""
echo "📊 管理命令："
echo "   检查状态: systemctl status nginx"
echo "   重新加载: systemctl reload nginx"
echo "   查看日志: tail -f /var/log/nginx/$APP_NAME-*.log"
echo "   测试配置: nginx -t"
echo ""
print_success "✅ 独立部署脚本执行完成！"
