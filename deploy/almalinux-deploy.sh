#!/bin/bash

# AlmaLinux 9.5 部署脚本
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
            echo "用法: $0 [选项]"
            echo "选项:"
            echo "  -d, --domain DOMAIN    域名 (例如: todo.ylingtech.com)"
            echo "  -a, --app APP_NAME     应用名称 (例如: todo-app)"
            echo "  -h, --help             显示此帮助信息"
            echo ""
            echo "示例:"
            echo "  $0 -d todo.ylingtech.com -a todo-app"
            echo "  $0 --domain blog.ylingtech.com --app blog-app"
            exit 0
            ;;
        *)
            print_error "未知参数: $1"
            print_info "使用 -h 或 --help 查看帮助"
            exit 1
            ;;
    esac
done

# 交互式配置
if [ -z "$DOMAIN_NAME" ]; then
    read -p "请输入域名 (例如: todo.ylingtech.com): " DOMAIN_NAME
fi

if [ -z "$APP_NAME" ]; then
    # 从域名自动推导应用名称
    if [[ "$DOMAIN_NAME" =~ ^([^.]+)\. ]]; then
        DEFAULT_APP_NAME="${BASH_REMATCH[1]}-app"
        read -p "请输入应用名称 [$DEFAULT_APP_NAME]: " APP_NAME
        APP_NAME="${APP_NAME:-$DEFAULT_APP_NAME}"
    else
        read -p "请输入应用名称 (例如: todo-app): " APP_NAME
    fi
fi

# 验证输入
if [ -z "$DOMAIN_NAME" ] || [ -z "$APP_NAME" ]; then
    error_exit "域名和应用名称不能为空"
fi

# 设置路径
WEB_DIR="/var/www/$APP_NAME"
NGINX_CONFIG="/etc/nginx/conf.d/$APP_NAME.conf"

print_step "开始部署 $APP_NAME 到 AlmaLinux 9.5 ($DOMAIN_NAME)..."

# 1. 系统信息检查和基础软件安装
print_info "检查系统信息..."

# 检测操作系统类型
SYSTEM_TYPE=""
if [ -f /etc/os-release ]; then
    . /etc/os-release
    print_info "操作系统: $NAME $VERSION"
    
    # 检测系统类型
    if [[ "$ID" == "almalinux" || "$ID" == "rhel" || "$ID" == "centos" || "$ID" == "rocky" ]]; then
        SYSTEM_TYPE="rhel"
        if [[ "$VERSION_ID" =~ ^9\. ]]; then
            print_success "确认运行在兼容的 RHEL 9.x 系发行版上"
        elif [[ "$VERSION_ID" =~ ^8\. ]]; then
            print_success "检测到 RHEL 8.x 系发行版，部分兼容"
        else
            print_warning "检测到旧版本 RHEL 系发行版: $VERSION_ID"
        fi
    elif [[ "$ID" == "ubuntu" || "$ID" == "debian" ]]; then
        SYSTEM_TYPE="debian"
        print_info "检测到 Debian 系发行版: $NAME $VERSION"
    elif [[ "$ID" == "fedora" ]]; then
        SYSTEM_TYPE="fedora"
        print_info "检测到 Fedora: $VERSION"
    else
        SYSTEM_TYPE="unknown"
        print_warning "未知的操作系统: $NAME $VERSION，脚本可能需要调整"
    fi
else
    print_warning "无法检测系统版本"
    SYSTEM_TYPE="unknown"
fi

# 安装基础软件包
print_step "安装基础软件包..."

case $SYSTEM_TYPE in
    "rhel")
        print_info "使用 DNF/YUM 包管理器安装基础软件..."
        
        # 更新包索引
        sudo dnf update -y || sudo yum update -y
        
        # 安装基础工具
        sudo dnf install -y curl wget git bind-utils || sudo yum install -y curl wget git bind-utils
        
        # 安装 Nginx
        if ! command -v nginx &> /dev/null; then
            print_info "安装 Nginx Web 服务器..."
            sudo dnf install -y nginx || sudo yum install -y nginx
            
            # 启动并启用 Nginx
            sudo systemctl start nginx
            sudo systemctl enable nginx
            
            # 创建 Nginx 配置目录
            sudo mkdir -p /etc/nginx/conf.d
            sudo mkdir -p /var/log/nginx
            
            print_success "✅ Nginx 安装完成"
        else
            print_info "Nginx 已安装"
        fi
        ;;
        
    "debian")
        print_info "使用 APT 包管理器安装基础软件..."
        
        # 更新包索引
        sudo apt update
        
        # 安装基础工具
        sudo apt install -y curl wget git dnsutils
        
        # 安装 Nginx
        if ! command -v nginx &> /dev/null; then
            print_info "安装 Nginx Web 服务器..."
            sudo apt install -y nginx
            
            # 启动并启用 Nginx
            sudo systemctl start nginx
            sudo systemctl enable nginx
            
            # 创建配置目录
            sudo mkdir -p /etc/nginx/sites-available
            sudo mkdir -p /etc/nginx/sites-enabled
            sudo mkdir -p /var/log/nginx
            
            print_success "✅ Nginx 安装完成"
        else
            print_info "Nginx 已安装"
        fi
        ;;
        
    "fedora")
        print_info "使用 DNF 包管理器安装基础软件..."
        
        # 更新包索引
        sudo dnf update -y
        
        # 安装基础工具和 Nginx
        sudo dnf install -y curl wget git bind-utils nginx
        
        # 启动并启用 Nginx
        sudo systemctl start nginx
        sudo systemctl enable nginx
        
        # 创建配置目录
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
    
    # 测试 Nginx 配置
    if sudo nginx -t &> /dev/null; then
        print_success "Nginx 配置文件语法正确"
    else
        print_error "Nginx 配置文件有语法错误"
        sudo nginx -t
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
        print_info "安装 Node.js 18..."
        
        case $SYSTEM_TYPE in
            "rhel"|"fedora")
                # 使用 dnf 安装 Node.js 18
                print_info "使用 DNF 安装 Node.js 18..."
                sudo dnf install -y nodejs npm
                ;;
            "debian")
                # 使用 NodeSource 仓库安装最新版本
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
        else
            error_exit "Node.js 安装失败"
        fi
    fi
else
    print_info "Node.js 未安装，开始安装..."
    
    case $SYSTEM_TYPE in
        "rhel"|"fedora")
            print_info "使用 DNF 安装 Node.js..."
            sudo dnf install -y nodejs npm
            ;;
        "debian")
            print_info "使用 NodeSource 仓库安装 Node.js 18..."
            curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
            sudo apt-get install -y nodejs
            ;;
        *)
            error_exit "未知系统类型，请手动安装 Node.js 18+"
            ;;
    esac
    
    # 验证安装
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        print_success "Node.js 安装成功: $NODE_VERSION"
    else
        error_exit "Node.js 安装失败"
    fi
fi

# 3. npm 版本检查
print_info "检查 npm 版本..."
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    print_info "npm 版本: $NPM_VERSION"
    
    # 更新 npm 到最新版本
    print_info "更新 npm 到最新版本..."
    sudo npm install -g npm@latest
    
    NEW_NPM_VERSION=$(npm --version)
    print_success "npm 更新完成: $NEW_NPM_VERSION"
else
    error_exit "npm 未安装或不在 PATH 中"
fi

# 4. 安装依赖
print_step "安装项目依赖..."
if [ -f "package.json" ]; then
    print_info "安装 npm 依赖..."
    npm ci || npm install
    print_success "依赖安装完成"
else
    error_exit "package.json 文件不存在"
fi

# 5. 运行构建
print_step "构建应用..."
print_info "使用 Vite 构建生产版本..."

if npm run build; then
    print_success "构建成功"
    
    # 检查构建输出
    if [ -d "dist" ]; then
        print_info "构建输出目录: dist/"
        BUILD_SIZE=$(du -sh dist/ | cut -f1)
        print_info "构建大小: $BUILD_SIZE"
        
        # 列出主要文件
        print_info "主要文件:"
        ls -la dist/ | head -10
    else
        error_exit "构建输出目录不存在"
    fi
else
    error_exit "构建失败"
fi

# 6. Nginx 配置（二级域名支持）
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
    
    # 创建 Nginx 配置
    if [ ! -f "$NGINX_CONFIG" ]; then
        print_info "为 $DOMAIN_NAME 创建 Nginx 配置文件..."
        
        sudo tee "$NGINX_CONFIG" > /dev/null << EOF
# $APP_NAME Nginx 配置
# 域名: $DOMAIN_NAME

# HTTP 重定向到 HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name $DOMAIN_NAME;
    
    # HTTP 自动重定向到 HTTPS
    return 301 https://\$server_name\$request_uri;
}

# HTTPS 配置
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name $DOMAIN_NAME;
    
    # SSL 证书配置 (需要 Let's Encrypt 或其他证书)
    ssl_certificate /etc/letsencrypt/live/$DOMAIN_NAME/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN_NAME/privkey.pem;
    
    # 现代 SSL 配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # 安全头
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    # 网站根目录
    root $WEB_DIR/dist;
    index index.html;
    
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
    
    # JSON 和其他文件
    location ~* \.(json|xml|txt)\$ {
        expires 1d;
        add_header Cache-Control "public";
        add_header Vary "Accept-Encoding";
    }
    
    # Gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
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
        image/svg+xml;
    
    # 健康检查
    location /health {
        access_log off;
        return 200 "healthy\\n";
        add_header Content-Type text/plain;
    }
    
    # 禁止访问隐藏文件
    location ~ /\\. {
        deny all;
        access_log off;
        log_not_found off;
    }
    
    # 日志配置
    access_log /var/log/nginx/$APP_NAME-access.log;
    error_log /var/log/nginx/$APP_NAME-error.log;
}
EOF
        
        print_success "Nginx 配置文件已创建: $NGINX_CONFIG"
        
        # 对于 Debian 系统，创建 sites-enabled 符号链接
        if [ "$SYSTEM_TYPE" = "debian" ] && [ "$NGINX_CONF_DIR" = "/etc/nginx/sites-available" ]; then
            print_info "创建 sites-enabled 符号链接..."
            sudo ln -sf "$NGINX_CONFIG" "/etc/nginx/sites-enabled/$APP_NAME.conf"
            
            # 禁用默认站点
            if [ -f "/etc/nginx/sites-enabled/default" ]; then
                sudo rm -f /etc/nginx/sites-enabled/default
                print_info "已禁用默认 Nginx 站点"
            fi
        fi
        
        # 测试配置
        print_info "测试 Nginx 配置..."
        if sudo nginx -t; then
            print_success "Nginx 配置测试通过"
            print_info "重启 Nginx..."
            sudo systemctl restart nginx
            sudo systemctl enable nginx
            
            # 验证 Nginx 运行状态
            if sudo systemctl is-active nginx &> /dev/null; then
                print_success "✅ Nginx 服务运行正常"
            else
                print_error "❌ Nginx 服务启动失败"
                sudo systemctl status nginx
            fi
        else
            print_error "❌ Nginx 配置测试失败"
            sudo nginx -t
            print_warning "请检查配置文件语法错误"
        fi
    else
        print_info "Nginx 配置文件已存在: $NGINX_CONFIG"
        print_warning "如需更新配置，请手动删除现有文件后重新运行"
    fi
    
    # SSL 证书提示
    print_step "SSL 证书配置..."
    
    # 检查 certbot 是否已安装
    if ! command -v certbot &> /dev/null; then
        print_info "安装 certbot..."
        
        case $SYSTEM_TYPE in
            "rhel"|"fedora")
                sudo dnf install -y certbot python3-certbot-nginx
                ;;
            "debian")
                sudo apt install -y certbot python3-certbot-nginx
                ;;
            *)
                print_warning "未知系统类型，请手动安装 certbot"
                print_info "安装命令示例："
                print_info "  RHEL/AlmaLinux: sudo dnf install -y certbot python3-certbot-nginx"
                print_info "  Debian/Ubuntu: sudo apt install -y certbot python3-certbot-nginx"
                ;;
        esac
        
        # 验证安装
        if command -v certbot &> /dev/null; then
            print_success "✅ certbot 安装成功"
        else
            print_warning "certbot 安装失败，将跳过自动 SSL 配置"
        fi
    fi
    
    # 检查证书是否已存在
    if [ -f "/etc/letsencrypt/live/$DOMAIN_NAME/fullchain.pem" ]; then
        print_info "📜 检测到现有 SSL 证书，检查有效期..."
        
        # 检查证书有效期
        CERT_EXPIRY=$(sudo openssl x509 -enddate -noout -in /etc/letsencrypt/live/$DOMAIN_NAME/fullchain.pem | cut -d= -f2)
        EXPIRY_TIMESTAMP=$(date -d "$CERT_EXPIRY" +%s)
        CURRENT_TIMESTAMP=$(date +%s)
        DAYS_UNTIL_EXPIRY=$(( (EXPIRY_TIMESTAMP - CURRENT_TIMESTAMP) / 86400 ))
        
        if [ $DAYS_UNTIL_EXPIRY -gt 30 ]; then
            print_success "✅ SSL 证书有效，剩余 $DAYS_UNTIL_EXPIRY 天"
        else
            print_warning "⚠️  SSL 证书即将过期（剩余 $DAYS_UNTIL_EXPIRY 天），尝试续期..."
            sudo certbot renew --nginx --cert-name $DOMAIN_NAME
        fi
    else
        print_warning "未找到 SSL 证书，需要获取新证书"
        print_info "⚠️  请确保域名 $DOMAIN_NAME 已正确解析到此服务器"
        
        # 询问是否自动获取证书
        read -p "是否现在自动获取 Let's Encrypt SSL 证书? [y/N]: " get_cert
        
        if [[ $get_cert =~ ^[Yy]$ ]]; then
            # 获取邮箱地址
            read -p "请输入邮箱地址 (用于 Let's Encrypt): " ssl_email
            
            if [ -n "$ssl_email" ]; then
                print_info "🆕 获取新的 SSL 证书..."
                
                # 创建临时 HTTP 配置用于验证
                sudo tee "$NGINX_CONFIG.temp" > /dev/null << EOF
server {
    listen 80;
    listen [::]:80;
    server_name $DOMAIN_NAME;
    
    root $WEB_DIR/dist;
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
                
                # 使用临时配置
                sudo cp "$NGINX_CONFIG.temp" "$NGINX_CONFIG"
                sudo systemctl reload nginx
                
                # 创建 webroot 目录
                print_info "创建 Let's Encrypt webroot 目录..."
                sudo mkdir -p /var/www/html/.well-known/acme-challenge
                
                # 设置正确的权限
                case $SYSTEM_TYPE in
                    "rhel"|"fedora")
                        sudo chown -R nginx:nginx /var/www/html
                        ;;
                    "debian")
                        sudo chown -R www-data:www-data /var/www/html
                        ;;
                    *)
                        sudo chown -R $WEB_USER:$WEB_USER /var/www/html
                        ;;
                esac
                sudo chmod -R 755 /var/www/html
                
                # 获取证书
                if sudo certbot certonly --webroot -w /var/www/html -d $DOMAIN_NAME --non-interactive --agree-tos --email "$ssl_email"; then
                    print_success "✅ SSL 证书获取成功"
                    
                    # 恢复完整的 HTTPS 配置
                    sudo tee "$NGINX_CONFIG" > /dev/null << EOF
# $APP_NAME Nginx 配置
# 域名: $DOMAIN_NAME

# HTTP 重定向到 HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name $DOMAIN_NAME;
    
    # Let's Encrypt 验证路径
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }
    
    # HTTP 自动重定向到 HTTPS
    location / {
        return 301 https://\$server_name\$request_uri;
    }
}

# HTTPS 配置
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name $DOMAIN_NAME;
    
    # SSL 证书配置 (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/$DOMAIN_NAME/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN_NAME/privkey.pem;
    ssl_trusted_certificate /etc/letsencrypt/live/$DOMAIN_NAME/chain.pem;
    
    # 现代 SSL/TLS 优化配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:50m;
    ssl_session_timeout 1d;
    ssl_session_tickets off;
    
    # OCSP Stapling - 在线证书状态协议
    ssl_stapling on;
    ssl_stapling_verify on;
    resolver 8.8.8.8 8.8.4.4 valid=300s;
    resolver_timeout 5s;
    
    # 强化安全头配置
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://formspree.io;" always;
    
    # 网站根目录
    root $WEB_DIR/dist;
    index index.html;
    
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
        etag on;
    }
    
    # 其他静态文件缓存
    location ~* \.(ico|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)\$ {
        expires 1M;
        add_header Cache-Control "public";
        add_header Vary "Accept-Encoding";
        access_log off;
        etag on;
    }
    
    # HTML 文件缓存策略
    location ~* \.(html)\$ {
        expires 1h;
        add_header Cache-Control "public, no-cache, must-revalidate";
        add_header Vary "Accept-Encoding";
        etag on;
    }
    
    # JSON 和其他配置文件
    location ~* \.(json|xml|txt)\$ {
        expires 1d;
        add_header Cache-Control "public";
        add_header Vary "Accept-Encoding";
        access_log off;
    }
    
    # 高效 Gzip 压缩配置
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        text/json
        application/javascript
        application/json
        application/xml+rss
        application/atom+xml
        image/svg+xml
        font/woff
        font/woff2;
    
    # 健康检查端点
    location /health {
        access_log off;
        return 200 "healthy\\n";
        add_header Content-Type text/plain;
    }
    
    # 禁止访问隐藏文件和敏感文件
    location ~ /\\. {
        deny all;
        access_log off;
        log_not_found off;
    }
    
    location ~ \\.(md|txt|log)\$ {
        deny all;
        access_log off;
        log_not_found off;
    }
    
    # 日志配置
    access_log /var/log/nginx/$APP_NAME-access.log;
    error_log /var/log/nginx/$APP_NAME-error.log;
}
EOF
                    
                    # 测试新配置
                    if sudo nginx -t; then
                        sudo systemctl reload nginx
                        print_success "✅ HTTPS 配置完成"
                    else
                        print_error "❌ Nginx 配置测试失败"
                        sudo cp "$NGINX_CONFIG.temp" "$NGINX_CONFIG"
                        sudo systemctl reload nginx
                    fi
                    
                    # 清理临时文件
                    sudo rm -f "$NGINX_CONFIG.temp"
                else
                    print_error "❌ SSL 证书获取失败"
                    print_info "请检查域名 DNS 解析和网络连接"
                fi
            else
                print_warning "未提供邮箱地址，跳过证书获取"
            fi
        else
            print_info "跳过 SSL 证书获取，可以稍后手动配置:"
            echo "  sudo certbot --nginx -d $DOMAIN_NAME"
        fi
    fi
    
    # 配置证书自动续期
    print_step "配置证书自动续期..."
    if ! sudo crontab -l 2>/dev/null | grep -q "certbot renew"; then
        print_info "设置 certbot 自动续期任务..."
        (sudo crontab -l 2>/dev/null; echo "0 2 * * * /usr/bin/certbot renew --quiet --post-hook 'systemctl reload nginx'") | sudo crontab -
        print_success "✅ 证书自动续期已配置 (每日凌晨2点检查)"
    else
        print_info "证书自动续期任务已存在"
    fi
elif command -v httpd &> /dev/null; then
    print_info "检测到 Apache HTTP Server"
    print_warning "请手动配置 Apache 以服务于 React 应用"
else
    print_warning "未检测到 Web 服务器，请手动配置"
fi

# 7. 部署到 Web 目录
print_step "部署到 Web 目录 ($WEB_DIR)..."

# 检查构建文件是否存在
if [ ! -d "dist" ]; then
    error_exit "构建目录 'dist' 不存在，请先运行构建命令"
fi

# 备份现有部署
if [ -d "$WEB_DIR" ]; then
    BACKUP_DIR="$WEB_DIR.backup.$(date +%Y%m%d_%H%M%S)"
    print_info "备份现有部署到: $BACKUP_DIR"
    sudo cp -r "$WEB_DIR" "$BACKUP_DIR"
fi

# 创建 Web 目录
print_info "创建 Web 目录..."
sudo mkdir -p "$WEB_DIR"

# 确保父目录权限正确
sudo mkdir -p /var/www
sudo chmod 755 /var/www

print_info "复制构建文件..."
sudo cp -r dist/* "$WEB_DIR/"

# 创建健康检查文件
print_info "创建健康检查文件..."
echo "healthy" | sudo tee "$WEB_DIR/health" > /dev/null

print_info "设置文件权限..."
# 设置正确的所有者
case $SYSTEM_TYPE in
    "rhel"|"fedora")
        sudo chown -R nginx:nginx "$WEB_DIR"
        ;;
    "debian")
        sudo chown -R www-data:www-data "$WEB_DIR"
        ;;
    *)
        # 尝试多种可能的用户
        sudo chown -R nginx:nginx "$WEB_DIR" 2>/dev/null || \
        sudo chown -R www-data:www-data "$WEB_DIR" 2>/dev/null || \
        sudo chown -R apache:apache "$WEB_DIR" 2>/dev/null || \
        sudo chown -R $USER:$USER "$WEB_DIR"
        ;;
esac

# 设置目录权限
sudo chmod -R 755 "$WEB_DIR"

# 设置 SELinux 上下文（如果需要）
if command -v getenforce &> /dev/null && [ "$(getenforce)" = "Enforcing" ]; then
    print_info "设置 SELinux 上下文..."
    sudo setsebool -P httpd_can_network_connect on
    sudo semanage fcontext -a -t httpd_exec_t "$WEB_DIR(/.*)?" 2>/dev/null || true
    sudo restorecon -Rv "$WEB_DIR"
fi

print_success "应用部署完成: $WEB_DIR"

# 验证部署
print_info "验证部署文件..."
if [ -f "$WEB_DIR/index.html" ]; then
    print_success "✅ index.html 存在"
else
    print_error "❌ index.html 不存在"
fi

if [ -d "$WEB_DIR/assets" ]; then
    ASSET_COUNT=$(find "$WEB_DIR/assets" -type f | wc -l)
    print_success "✅ assets 目录存在，包含 $ASSET_COUNT 个文件"
else
    print_warning "⚠️  assets 目录不存在"
fi

# 8. 防火墙配置
print_step "配置防火墙..."

case $SYSTEM_TYPE in
    "rhel"|"fedora")
        if command -v firewall-cmd &> /dev/null; then
            print_info "配置 firewalld 防火墙..."
            
            # 确保防火墙服务启动
            if ! sudo systemctl is-active firewalld &> /dev/null; then
                print_info "启动 firewalld 服务..."
                sudo systemctl start firewalld
                sudo systemctl enable firewalld
            fi
            
            # 开放必要端口
            sudo firewall-cmd --permanent --add-service=http
            sudo firewall-cmd --permanent --add-service=https
            sudo firewall-cmd --permanent --add-service=ssh
            
            # 重载防火墙配置
            sudo firewall-cmd --reload
            
            print_success "✅ firewalld 配置完成"
            
            # 显示当前防火墙状态
            print_info "当前开放的服务:"
            sudo firewall-cmd --list-services
        else
            print_warning "firewalld 未安装，请手动配置防火墙"
        fi
        ;;
        
    "debian")
        if command -v ufw &> /dev/null; then
            print_info "配置 UFW 防火墙..."
            sudo ufw --force enable
            sudo ufw allow ssh
            sudo ufw allow http
            sudo ufw allow https
            print_success "✅ UFW 防火墙配置完成"
            
            # 显示防火墙状态
            print_info "UFW 状态:"
            sudo ufw status
        else
            print_warning "UFW 未安装，请手动配置防火墙"
            print_info "安装 UFW: sudo apt install -y ufw"
        fi
        ;;
        
    *)
        print_warning "未知系统类型，请手动配置防火墙"
        print_info "需要开放的端口: 22 (SSH), 80 (HTTP), 443 (HTTPS)"
        ;;
esac

# 9. SELinux 配置（如果启用）
print_step "检查 SELinux 配置..."
if command -v getenforce &> /dev/null; then
    SELINUX_STATUS=$(getenforce)
    print_info "SELinux 状态: $SELINUX_STATUS"
    
    if [ "$SELINUX_STATUS" = "Enforcing" ]; then
        print_info "配置 SELinux 上下文..."
        
        # 允许 nginx 网络连接
        sudo setsebool -P httpd_can_network_connect on
        
        # 设置 Web 目录的 SELinux 上下文
        sudo semanage fcontext -a -t httpd_exec_t "$WEB_DIR(/.*)?" 2>/dev/null || true
        sudo restorecon -Rv "$WEB_DIR"
        
        # 允许 nginx 访问 Let's Encrypt 证书
        if [ -d "/etc/letsencrypt" ]; then
            sudo semanage fcontext -a -t cert_t "/etc/letsencrypt(/.*)?" 2>/dev/null || true
            sudo restorecon -Rv /etc/letsencrypt
        fi
        
        print_success "✅ SELinux 配置完成"
    elif [ "$SELINUX_STATUS" = "Permissive" ]; then
        print_warning "SELinux 处于 Permissive 模式，建议设为 Enforcing"
    else
        print_info "SELinux 已禁用"
    fi
else
    print_info "系统未安装 SELinux"
fi

# 10. 完成
echo ""
echo "=============================================="
print_success "🎉 $APP_NAME 部署完成！"
echo "=============================================="
print_info "应用名称: $APP_NAME"
print_info "域名: $DOMAIN_NAME"
print_info "Web 目录: $WEB_DIR"
print_info "Nginx 配置: $NGINX_CONFIG"
print_info "Node.js 版本: $(node --version)"
print_info "构建大小: $BUILD_SIZE"
echo ""
print_info "访问地址:"
print_info "  HTTP:  http://$DOMAIN_NAME/"
print_info "  HTTPS: https://$DOMAIN_NAME/ (需要 SSL 证书)"
echo ""
print_info "SSL 证书配置 (如未配置):"
print_info "  sudo dnf install -y certbot python3-certbot-nginx"
print_info "  sudo certbot --nginx -d $DOMAIN_NAME"
echo ""
print_info "证书续期检查:"
print_info "  sudo certbot certificates"
print_info "  sudo certbot renew --dry-run"
echo ""
print_info "服务管理命令:"
print_info "  sudo systemctl status nginx"
print_info "  sudo nginx -t"
print_info "  sudo systemctl reload nginx"
print_info "  sudo systemctl restart nginx"
echo ""
print_info "日志文件:"
print_info "  访问日志: /var/log/nginx/$APP_NAME-access.log"
print_info "  错误日志: /var/log/nginx/$APP_NAME-error.log"
print_info "  系统日志: sudo journalctl -u nginx -f"
echo ""
print_info "实用命令:"
print_info "  实时访问日志: sudo tail -f /var/log/nginx/$APP_NAME-access.log"
print_info "  实时错误日志: sudo tail -f /var/log/nginx/$APP_NAME-error.log"
print_info "  检查证书状态: sudo certbot certificates"
print_info "  测试证书续期: sudo certbot renew --dry-run"
echo "=============================================="

# 多应用部署提示
echo ""
print_info "📝 多应用部署提示:"
print_info "要部署更多应用到不同的二级域名，请运行:"
print_info "  $0 -d another.ylingtech.com -a another-app"
echo ""
