#!/bin/bash

# AlmaLinux 9.5 部署脚本 (修复版)
# 针对现代 Linux 发行版和 Node.js 18+ 优化
# 支持二级域名和多应用部署

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
            echo "用法: $0 -d DOMAIN -a APP_NAME"
            echo "选项:"
            echo "  -d, --domain DOMAIN    域名 (例如: todo.ylingtech.com)"
            echo "  -a, --app APP_NAME     应用名称 (例如: todo-app)"
            echo "  -h, --help             显示帮助信息"
            exit 0
            ;;
        *)
            error_exit "未知选项: $1"
            ;;
    esac
done

# 交互式输入参数
if [ -z "$DOMAIN_NAME" ]; then
    read -p "请输入域名 (例如: todo.ylingtech.com): " DOMAIN_NAME
fi

if [ -z "$APP_NAME" ]; then
    read -p "请输入应用名称 (例如: todo-app): " APP_NAME
fi

# 验证参数
if [ -z "$DOMAIN_NAME" ] || [ -z "$APP_NAME" ]; then
    error_exit "域名和应用名称不能为空"
fi

# 设置工作目录
WEB_DIR="/var/www/$APP_NAME"

print_step "开始部署 $APP_NAME 到 $DOMAIN_NAME"
print_info "应用目录: $WEB_DIR"

# 1. 检测操作系统类型
print_step "检测操作系统..."
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

# 安装 Node.js 的函数
install_nodejs() {
    print_info "安装 Node.js 18+..."
    
    case $SYSTEM_TYPE in
        "rhel"|"fedora")
            # 移除旧版本 Node.js
            print_info "移除旧版本 Node.js..."
            sudo dnf remove -y nodejs npm || true
            
            # 使用 NodeSource 仓库安装 Node.js 18
            print_info "使用 NodeSource 仓库安装 Node.js 18..."
            curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
            sudo dnf install -y nodejs
            ;;
        "debian")
            # 移除旧版本 Node.js
            print_info "移除旧版本 Node.js..."
            sudo apt-get remove -y nodejs npm || true
            sudo apt-get autoremove -y || true
            
            # 使用 NodeSource 仓库安装 Node.js 18
            print_info "使用 NodeSource 仓库安装 Node.js 18..."
            curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
            sudo apt-get install -y nodejs
            ;;
        *)
            print_warning "未知系统类型，请手动安装 Node.js 18+"
            error_exit "请手动安装 Node.js 18+ 后重新运行脚本"
            ;;
    esac
    
    # 验证安装
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        print_success "Node.js 安装成功: $NODE_VERSION"
        
        # 验证版本
        MAJOR_VERSION=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')
        if [ "$MAJOR_VERSION" -ge 18 ]; then
            print_success "Node.js 版本满足要求 (>=18)"
        else
            error_exit "Node.js 版本仍然不满足要求: $NODE_VERSION"
        fi
    else
        error_exit "Node.js 安装失败"
    fi
}

# 2. Node.js 版本检查和安装
print_step "检查 Node.js 环境..."

if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    MAJOR_VERSION=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')
    print_info "当前 Node.js 版本: $NODE_VERSION"
    
    if [ "$MAJOR_VERSION" -ge 18 ]; then
        print_success "Node.js 版本满足要求 (>=18)"
    else
        print_error "需要 Node.js 18+，当前版本: $NODE_VERSION"
        install_nodejs
    fi
else
    print_info "Node.js 未安装，开始安装..."
    install_nodejs
fi

# 3. npm 版本检查
print_info "检查 npm 版本..."
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    print_info "当前 npm 版本: $NPM_VERSION"
    
    # 检查 Node.js 版本以确定兼容的 npm 版本
    NODE_VERSION=$(node --version)
    MAJOR_VERSION=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')
    
    if [ "$MAJOR_VERSION" -ge 20 ]; then
        # Node.js 20+ 可以使用最新的 npm
        print_info "更新 npm 到最新版本..."
        sudo npm install -g npm@latest
    elif [ "$MAJOR_VERSION" -eq 18 ]; then
        # Node.js 18 使用兼容版本的 npm
        print_info "更新 npm 到兼容版本 (npm 9.x)..."
        sudo npm install -g npm@9
    else
        print_warning "Node.js 版本太低，跳过 npm 更新"
    fi
    
    NEW_NPM_VERSION=$(npm --version)
    print_success "npm 当前版本: $NEW_NPM_VERSION"
else
    error_exit "npm 未安装或不在 PATH 中"
fi

# 4. 安装和配置 Nginx
print_step "安装和配置 Nginx..."

case $SYSTEM_TYPE in
    "rhel")
        print_info "使用 DNF 包管理器安装基础软件..."
        sudo dnf update -y
        sudo dnf install -y curl wget git bind-utils nginx
        sudo systemctl start nginx
        sudo systemctl enable nginx
        sudo mkdir -p /etc/nginx/conf.d
        sudo mkdir -p /var/log/nginx
        print_success "✅ Nginx 安装完成"
        ;;
        
    "debian")
        print_info "使用 APT 包管理器安装基础软件..."
        sudo apt-get update
        sudo apt-get install -y curl wget git dnsutils nginx
        sudo systemctl start nginx
        sudo systemctl enable nginx
        sudo mkdir -p /etc/nginx/sites-available
        sudo mkdir -p /etc/nginx/sites-enabled
        sudo mkdir -p /var/log/nginx
        print_success "✅ Nginx 安装完成"
        ;;
        
    "fedora")
        print_info "使用 DNF 包管理器安装基础软件..."
        sudo dnf update -y
        sudo dnf install -y curl wget git bind-utils nginx
        sudo systemctl start nginx
        sudo systemctl enable nginx
        sudo mkdir -p /etc/nginx/conf.d
        sudo mkdir -p /var/log/nginx
        print_success "✅ Nginx 安装完成"
        ;;
        
    *)
        print_warning "未知系统类型，请手动安装 Nginx 和基础工具"
        if ! command -v nginx &> /dev/null; then
            error_exit "Nginx 未安装，请手动安装后重新运行脚本"
        fi
        ;;
esac

# 验证 Nginx 安装和运行状态
print_info "验证 Nginx 状态..."
if command -v nginx &> /dev/null; then
    NGINX_VERSION=$(nginx -v 2>&1 | cut -d'/' -f2)
    print_success "Nginx 版本: $NGINX_VERSION"
    
    # 检查 Nginx 是否运行
    if sudo systemctl is-active nginx &> /dev/null; then
        print_success "Nginx 服务正在运行"
    else
        print_info "启动 Nginx 服务..."
        sudo systemctl start nginx
        sudo systemctl enable nginx
    fi
else
    error_exit "Nginx 安装失败或不在 PATH 中"
fi

# 创建必要的目录
print_info "创建必要的系统目录..."
sudo mkdir -p /var/www/html
sudo mkdir -p /var/log/nginx
sudo mkdir -p /etc/nginx/conf.d

# 设置 Web 服务器用户
WEB_USER="nginx"
if [ "$SYSTEM_TYPE" = "debian" ]; then
    WEB_USER="www-data"
fi

print_info "Web 服务器用户: $WEB_USER"

# 5. 配置 Web 服务器
print_step "配置 Web 服务器 ($DOMAIN_NAME)..."

# 确保 Nginx 配置目录存在
print_info "确保 Nginx 配置目录存在..."
sudo mkdir -p /etc/nginx/conf.d
sudo mkdir -p /var/log/nginx
sudo mkdir -p /var/www/html

# 检测 Nginx 配置目录结构
NGINX_CONF_DIR="/etc/nginx/conf.d"
if [ "$SYSTEM_TYPE" = "debian" ]; then
    # Debian 系统可能使用 sites-available/sites-enabled 结构
    if [ -d "/etc/nginx/sites-available" ]; then
        NGINX_CONF_DIR="/etc/nginx/sites-available"
        sudo mkdir -p /etc/nginx/sites-enabled
        print_info "使用 Debian 风格的 Nginx 配置结构"
    fi
fi

NGINX_CONFIG="$NGINX_CONF_DIR/$APP_NAME.conf"
print_info "Nginx 配置文件路径: $NGINX_CONFIG"

if command -v nginx &> /dev/null; then
    print_info "检测到 Nginx"
    
    # 创建初始 HTTP 配置的函数
    create_initial_nginx_config() {
        print_info "为 $DOMAIN_NAME 创建初始 HTTP Nginx 配置文件..."
        
        sudo tee "$NGINX_CONFIG" > /dev/null << EOF
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
        try_files \$uri \$uri/ /index.html;
    }
    
    # 静态资源缓存优化
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header Vary "Accept-Encoding";
        access_log off;
    }
    
    # 其他静态文件
    location ~* \.(ico|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)\$ {
        expires 1M;
        add_header Cache-Control "public";
        access_log off;
    }
    
    # HTML 文件
    location ~* \.(html)\$ {
        expires 1h;
        add_header Cache-Control "public, no-cache, must-revalidate";
        add_header Vary "Accept-Encoding";
    }
    
    # 安全配置
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }
    
    # 禁止访问敏感文件
    location ~* \.(htaccess|htpasswd|ini|log|sh|inc|bak)\$ {
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
        
        sudo tee "$NGINX_CONFIG" > /dev/null << EOF
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
        return 301 https://\$server_name\$request_uri;
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
    # 添加 iOS Safari 支持的加密套件
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
    # iOS Safari 特定的安全策略
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:; media-src 'self'; object-src 'none'; child-src 'self';" always;
    
    # 网站根目录
    root $WEB_DIR;
    index index.html;
    
    # iOS Safari 特定的 MIME 类型配置
    location ~* \\.js\$ {
        add_header Content-Type "application/javascript; charset=utf-8";
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header Vary "Accept-Encoding";
        access_log off;
    }
    
    location ~* \\.css\$ {
        add_header Content-Type "text/css; charset=utf-8";
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header Vary "Accept-Encoding";
        access_log off;
    }
    
    # SPA 路由支持 (iOS Safari 优化)
    location / {
        # iOS Safari 需要正确的 MIME 类型
        location ~* \\.html\$ {
            add_header Content-Type "text/html; charset=utf-8";
            add_header Cache-Control "no-cache, no-store, must-revalidate";
            add_header Pragma "no-cache";
            add_header Expires "0";
        }
        
        try_files \$uri \$uri/ /index.html;
    }
    
    # 静态资源缓存优化 (iOS Safari 兼容)
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header Vary "Accept-Encoding";
        access_log off;
        
        # 为不同文件类型设置正确的 MIME 类型
        location ~* \\.woff2?\$ {
            add_header Content-Type "font/woff2";
            add_header Access-Control-Allow-Origin "*";
        }
        
        location ~* \\.ttf\$ {
            add_header Content-Type "font/ttf";
            add_header Access-Control-Allow-Origin "*";
        }
    }
    
    # 其他静态文件 (iOS Safari 优化的 MIME 类型)
    location ~* \.(ico|png|jpg|jpeg|gif|svg)\$ {
        expires 1M;
        add_header Cache-Control "public";
        access_log off;
        
        # SVG 特殊处理 (iOS Safari 需要正确的 Content-Type)
        location ~* \\.svg\$ {
            add_header Content-Type "image/svg+xml";
            add_header Vary "Accept-Encoding";
        }
    }
    
    # 字体文件 (iOS Safari 需要 CORS 头)
    location ~* \.(woff|woff2|ttf|eot)\$ {
        expires 1M;
        add_header Cache-Control "public";
        add_header Access-Control-Allow-Origin "*";
        access_log off;
    }
    
    # HTML 文件 (iOS Safari 缓存策略)
    location ~* \\.html\$ {
        add_header Content-Type "text/html; charset=utf-8";
        expires -1;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header Pragma "no-cache";
        add_header Expires "0";
        add_header Vary "Accept-Encoding";
    }
    
    # JSON 和其他文件 (iOS Safari MIME 类型)
    location ~* \\.json\$ {
        add_header Content-Type "application/json; charset=utf-8";
        expires 1d;
        add_header Cache-Control "public";
        add_header Vary "Accept-Encoding";
    }
    
    location ~* \.(xml|txt)\$ {
        expires 1d;
        add_header Cache-Control "public";
        add_header Vary "Accept-Encoding";
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
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }
    
    # 禁止访问敏感文件
    location ~* \.(htaccess|htpasswd|ini|log|sh|inc|bak)\$ {
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
        sudo ln -sf "$NGINX_CONFIG" "/etc/nginx/sites-enabled/$APP_NAME.conf"
        
        # 禁用默认站点
        if [ -f "/etc/nginx/sites-enabled/default" ]; then
            print_info "禁用默认 Nginx 站点..."
            sudo rm -f /etc/nginx/sites-enabled/default
        fi
    fi
    
    # 测试 Nginx 配置
    print_info "测试 Nginx 配置..."
    if sudo nginx -t; then
        print_success "✅ Nginx 配置测试通过"
    else
        print_error "❌ Nginx 配置测试失败"
        sudo nginx -t
        error_exit "Nginx 配置有误，请检查配置文件"
    fi
    
else
    error_exit "未检测到 Nginx"
fi

# 6. 构建和部署应用
print_step "构建和部署应用..."

print_info "在项目目录中构建应用..."
if [ -f "package.json" ]; then
    print_info "安装依赖..."
    npm install
    
    print_info "构建应用..."
    npm run build
    
    if [ -d "dist" ]; then
        print_success "构建完成"
        
        # 创建 Web 目录
        print_info "创建 Web 目录: $WEB_DIR"
        sudo mkdir -p "$WEB_DIR"
        
        # 复制构建文件
        print_info "复制构建文件到 $WEB_DIR"
        sudo cp -r dist/* "$WEB_DIR/"
        
        # 设置权限
        sudo chown -R $WEB_USER:$WEB_USER "$WEB_DIR"
        sudo chmod -R 755 "$WEB_DIR"
        
        # 创建健康检查文件
        sudo bash -c "echo 'OK' > $WEB_DIR/health"
        
        print_success "应用文件部署完成"
    else
        error_exit "构建失败：找不到 dist 目录"
    fi
else
    error_exit "找不到 package.json 文件，请确保在项目根目录运行此脚本"
fi

# 7. SSL 证书配置
print_step "配置 SSL 证书..."

# 安装 certbot
print_info "安装 certbot..."
case $SYSTEM_TYPE in
    "rhel")
        # RHEL 系列需要启用 EPEL 仓库
        print_info "启用 EPEL 仓库..."
        sudo dnf install -y epel-release
        
        print_info "安装 certbot 和 nginx 插件..."
        sudo dnf install -y certbot python3-certbot-nginx
        ;;
    "fedora")
        print_info "安装 certbot 和 nginx 插件..."
        sudo dnf install -y certbot python3-certbot-nginx
        ;;
    "debian")
        print_info "安装 certbot 和 nginx 插件..."
        sudo apt-get install -y certbot python3-certbot-nginx
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
    print_warning "Certbot 安装可能失败，尝试手动获取证书..."
fi

# 检查现有证书
if [ -f "/etc/letsencrypt/live/$DOMAIN_NAME/fullchain.pem" ]; then
    print_info "检测到现有 SSL 证书"
    
    # 检查证书有效期
    CERT_EXPIRY=$(sudo openssl x509 -enddate -noout -in /etc/letsencrypt/live/$DOMAIN_NAME/fullchain.pem | cut -d= -f2)
    EXPIRY_DATE=$(date -d "$CERT_EXPIRY" +%s)
    CURRENT_DATE=$(date +%s)
    DAYS_LEFT=$(( (EXPIRY_DATE - CURRENT_DATE) / 86400 ))
    
    print_info "证书有效期剩余: $DAYS_LEFT 天"
    
    if [ $DAYS_LEFT -lt 30 ]; then
        print_warning "证书即将到期，尝试续期..."
        sudo certbot renew
    else
        print_success "证书仍然有效"
    fi
else
    print_info "获取新的 SSL 证书..."
    
    # 重新加载 Nginx 以确保 HTTP 配置生效
    sudo systemctl reload nginx
    
    # 获取证书
    if sudo certbot --nginx -d "$DOMAIN_NAME" --non-interactive --agree-tos --email admin@"$DOMAIN_NAME"; then
        print_success "SSL 证书获取成功"
        
        # 更新为 HTTPS 配置
        create_https_nginx_config
        
        # 重新加载 Nginx
        sudo nginx -t && sudo systemctl reload nginx
        print_success "HTTPS 配置已启用"
    else
        print_warning "SSL 证书获取失败，将继续使用 HTTP"
    fi
fi

# 8. 防火墙配置
print_step "配置防火墙..."

case $SYSTEM_TYPE in
    "rhel"|"fedora")
        if command -v firewall-cmd &> /dev/null; then
            print_info "配置 firewalld..."
            
            # 检查防火墙状态
            if sudo systemctl is-active firewalld &> /dev/null; then
                print_info "防火墙正在运行，配置端口..."
                sudo firewall-cmd --permanent --add-service=http
                sudo firewall-cmd --permanent --add-service=https
                sudo firewall-cmd --reload
                print_success "防火墙配置完成"
            else
                print_warning "防火墙未运行，尝试启动..."
                if sudo systemctl start firewalld && sudo systemctl enable firewalld; then
                    print_info "防火墙已启动，配置端口..."
                    sudo firewall-cmd --permanent --add-service=http
                    sudo firewall-cmd --permanent --add-service=https
                    sudo firewall-cmd --reload
                    print_success "防火墙配置完成"
                else
                    print_warning "无法启动防火墙，请手动配置端口访问"
                    print_info "手动命令: sudo firewall-cmd --permanent --add-service=http"
                    print_info "手动命令: sudo firewall-cmd --permanent --add-service=https"
                fi
            fi
        else
            print_warning "未检测到 firewalld，请手动配置防火墙"
        fi
        ;;
    "debian")
        if command -v ufw &> /dev/null; then
            print_info "配置 UFW..."
            sudo ufw allow 'Nginx Full'
            sudo ufw --force enable
            print_success "防火墙配置完成"
        else
            print_warning "未检测到 UFW，请手动配置防火墙"
        fi
        ;;
esac

# 9. 最终验证
print_step "最终验证..."

# 测试 Nginx 配置
print_info "验证 Nginx 配置..."
if sudo nginx -t; then
    print_success "Nginx 配置正确"
    sudo systemctl reload nginx
else
    print_error "Nginx 配置有误"
    sudo nginx -t
fi

# 检查服务状态
print_info "检查服务状态..."
if sudo systemctl is-active nginx &> /dev/null; then
    print_success "Nginx 服务运行正常"
else
    print_error "Nginx 服务未运行"
    sudo systemctl status nginx
fi

# 检查文件权限
print_info "检查文件权限..."
if [ -r "$WEB_DIR/index.html" ]; then
    print_success "应用文件可访问"
else
    print_warning "应用文件可能无法访问"
    ls -la "$WEB_DIR/"
fi

# 10. iOS Safari 兼容性诊断和修复
print_step "iOS Safari 兼容性诊断..."

# 诊断函数
diagnose_ios_safari() {
    print_info "🔍 正在诊断 iOS Safari 兼容性问题..."
    
    # 检查 SSL 证书链
    if [ -f "/etc/letsencrypt/live/$DOMAIN_NAME/fullchain.pem" ]; then
        print_info "检查 SSL 证书链完整性..."
        if sudo openssl verify -CAfile /etc/letsencrypt/live/$DOMAIN_NAME/chain.pem /etc/letsencrypt/live/$DOMAIN_NAME/cert.pem &>/dev/null; then
            print_success "SSL 证书链完整"
        else
            print_warning "SSL 证书链可能有问题，这会影响 iOS Safari"
        fi
        
        # 检查证书算法
        CERT_ALGORITHM=$(sudo openssl x509 -in /etc/letsencrypt/live/$DOMAIN_NAME/cert.pem -text -noout | grep "Signature Algorithm" | head -1)
        print_info "证书签名算法: $CERT_ALGORITHM"
        
        if [[ "$CERT_ALGORITHM" == *"sha256"* ]]; then
            print_success "证书使用 SHA-256，iOS Safari 兼容"
        else
            print_warning "证书算法可能与 iOS Safari 不兼容"
        fi
    fi
    
    # 检查 HTTP/2 支持
    print_info "检查 HTTP/2 配置..."
    if grep -q "http2" "$NGINX_CONFIG"; then
        print_success "HTTP/2 已启用，有助于 iOS Safari 性能"
    else
        print_warning "HTTP/2 未启用，建议启用以提高 iOS 兼容性"
    fi
    
    # 检查 MIME 类型配置
    print_info "检查 MIME 类型配置..."
    if [ -f "/etc/nginx/mime.types" ]; then
        # 检查关键的 MIME 类型
        if grep -q "application/javascript" /etc/nginx/mime.types; then
            print_success "JavaScript MIME 类型配置正确"
        else
            print_warning "JavaScript MIME 类型可能配置不当"
        fi
        
        if grep -q "font/woff2" /etc/nginx/mime.types; then
            print_success "字体 MIME 类型配置正确"
        else
            print_warning "字体 MIME 类型需要更新"
        fi
    fi
    
    # 检查内容安全策略
    print_info "检查内容安全策略..."
    if grep -q "Content-Security-Policy" "$NGINX_CONFIG"; then
        print_success "CSP 已配置，有助于 iOS Safari 安全"
    else
        print_warning "建议配置 CSP 以提高 iOS Safari 兼容性"
    fi
}

# 运行诊断
diagnose_ios_safari

# iOS Safari 修复建议
print_step "iOS Safari 修复建议..."

print_info "📱 如果 iOS Safari 仍然无法访问，请尝试以下步骤："
echo ""
echo "1. 🔧 客户端诊断："
echo "   - 在 iOS Safari 中清除缓存和 Cookie"
echo "   - 尝试在 iOS Safari 的私人浏览模式下访问"
echo "   - 检查 iOS 设备的日期和时间是否正确"
echo "   - 尝试重启 iOS 设备的网络连接"
echo ""
echo "2. 🌐 DNS 和网络检查："
echo "   - 确认域名 $DOMAIN_NAME 的 DNS 解析正确"
echo "   - 检查是否存在 CDN 或代理服务干扰"
echo "   - 验证防火墙设置允许 HTTPS 流量"
echo ""
echo "3. 📱 iOS 特定问题："
echo "   - iOS Safari 对自签名证书很敏感，确保使用 Let's Encrypt"
echo "   - 检查证书是否包含完整的证书链"
echo "   - 验证 SNI (Server Name Indication) 配置"
echo ""
echo "4. 🔍 高级诊断命令："
echo "   # 在服务器上运行以下命令进行诊断："
echo "   sudo openssl s_client -connect $DOMAIN_NAME:443 -servername $DOMAIN_NAME"
echo "   sudo nginx -T | grep -A 20 -B 5 '$DOMAIN_NAME'"
echo "   sudo tail -f /var/log/nginx/$APP_NAME-error.log"
echo ""

# 添加 iOS Safari 特定的测试脚本
create_ios_safari_test() {
    print_info "创建 iOS Safari 兼容性测试页面..."
    
    sudo tee "$WEB_DIR/ios-test.html" > /dev/null << 'EOF'
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>iOS Safari 兼容性测试</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            min-height: 100vh;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            text-align: center;
        }
        .test-item {
            background: rgba(255, 255, 255, 0.1);
            margin: 10px 0;
            padding: 15px;
            border-radius: 10px;
            backdrop-filter: blur(10px);
        }
        .success { background: rgba(76, 175, 80, 0.3); }
        .error { background: rgba(244, 67, 54, 0.3); }
        button {
            background: #4CAF50;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 6px;
            font-size: 16px;
            cursor: pointer;
            margin: 10px;
        }
        .info {
            background: rgba(255, 255, 255, 0.2);
            padding: 20px;
            border-radius: 10px;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🍎 iOS Safari 兼容性测试</h1>
        
        <div class="info">
            <h3>设备信息</h3>
            <p id="userAgent"></p>
            <p id="deviceInfo"></p>
        </div>
        
        <div class="test-item" id="httpsTest">
            <h3>🔒 HTTPS 连接测试</h3>
            <p id="httpsStatus">检测中...</p>
        </div>
        
        <div class="test-item" id="jsTest">
            <h3>📜 JavaScript 执行测试</h3>
            <p>如果您能看到这个页面，JavaScript 正常工作！</p>
        </div>
        
        <div class="test-item" id="fetchTest">
            <h3>🌐 网络请求测试</h3>
            <p id="fetchStatus">准备测试...</p>
            <button onclick="testFetch()">测试 API 连接</button>
        </div>
        
        <div class="test-item" id="fontTest">
            <h3>🔤 字体渲染测试</h3>
            <p style="font-family: 'Custom Font', sans-serif;">自定义字体渲染测试</p>
        </div>
        
        <div class="test-item">
            <h3>📋 诊断信息</h3>
            <p>时间: <span id="timestamp"></span></p>
            <p>协议: <span id="protocol"></span></p>
            <p>主机: <span id="hostname"></span></p>
        </div>
        
        <button onclick="location.href='/'">返回主页</button>
    </div>

    <script>
        // 设备信息检测
        document.getElementById('userAgent').textContent = 'User Agent: ' + navigator.userAgent;
        
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
        
        document.getElementById('deviceInfo').innerHTML = 
            '设备类型: ' + (isIOS ? 'iOS 设备' : '其他设备') + 
            ' | 浏览器: ' + (isSafari ? 'Safari' : '其他浏览器');
        
        // HTTPS 检测
        const isHTTPS = location.protocol === 'https:';
        const httpsTest = document.getElementById('httpsTest');
        if (isHTTPS) {
            httpsTest.classList.add('success');
            document.getElementById('httpsStatus').textContent = '✅ HTTPS 连接正常';
        } else {
            httpsTest.classList.add('error');
            document.getElementById('httpsStatus').textContent = '❌ 使用 HTTP 连接，建议使用 HTTPS';
        }
        
        // 网络请求测试
        async function testFetch() {
            const status = document.getElementById('fetchStatus');
            const testDiv = document.getElementById('fetchTest');
            
            try {
                status.textContent = '测试中...';
                const response = await fetch('/health');
                
                if (response.ok) {
                    status.textContent = '✅ 网络请求正常';
                    testDiv.classList.add('success');
                } else {
                    status.textContent = '⚠️ 网络请求异常: ' + response.status;
                    testDiv.classList.add('error');
                }
            } catch (error) {
                status.textContent = '❌ 网络请求失败: ' + error.message;
                testDiv.classList.add('error');
            }
        }
        
        // 基本信息
        document.getElementById('timestamp').textContent = new Date().toLocaleString();
        document.getElementById('protocol').textContent = location.protocol;
        document.getElementById('hostname').textContent = location.hostname;
        
        // 自动运行网络测试
        setTimeout(testFetch, 1000);
    </script>
</body>
</html>
EOF
    
    sudo chown $WEB_USER:$WEB_USER "$WEB_DIR/ios-test.html"
    sudo chmod 644 "$WEB_DIR/ios-test.html"
    
    print_success "iOS Safari 测试页面已创建: https://$DOMAIN_NAME/ios-test.html"
}

# 创建测试页面
create_ios_safari_test

# 11. 完成信息
print_step "部署完成！"

print_success "🎉 部署成功完成！"
echo ""
echo "📋 部署信息："
echo "   域名: $DOMAIN_NAME"
echo "   应用: $APP_NAME"
echo "   目录: $WEB_DIR"
echo "   配置: $NGINX_CONFIG"
echo ""
echo "🌐 访问地址："
if [ -f "/etc/letsencrypt/live/$DOMAIN_NAME/fullchain.pem" ]; then
    echo "   https://$DOMAIN_NAME"
    echo "   http://$DOMAIN_NAME (自动重定向到 HTTPS)"
else
    echo "   http://$DOMAIN_NAME"
fi
echo ""
echo "📊 管理命令："
echo "   检查状态: sudo systemctl status nginx"
echo "   重新加载: sudo systemctl reload nginx"
echo "   查看日志: sudo tail -f /var/log/nginx/$APP_NAME-*.log"
echo ""
print_success "✅ 部署流程全部完成！"
