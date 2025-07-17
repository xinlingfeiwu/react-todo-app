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

# 1. 系统信息检查
print_info "检查系统信息..."
if [ -f /etc/os-release ]; then
    . /etc/os-release
    print_info "操作系统: $NAME $VERSION"
    
    # 验证是否为 AlmaLinux 9.x
    if [[ "$ID" == "almalinux" && "$VERSION_ID" =~ ^9\. ]]; then
        print_success "确认运行在 AlmaLinux 9.x 上"
    else
        print_warning "此脚本专为 AlmaLinux 9.x 优化，当前系统: $NAME $VERSION"
    fi
else
    print_warning "无法检测系统版本"
fi

# 2. Node.js 版本检查
print_info "检查 Node.js 版本..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    MAJOR_VERSION=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')
    print_info "当前 Node.js 版本: $NODE_VERSION"
    
    if [ "$MAJOR_VERSION" -ge 18 ]; then
        print_success "Node.js 版本满足要求 (>=18)"
    else
        print_error "需要 Node.js 18+，当前版本: $NODE_VERSION"
        print_info "在 AlmaLinux 9.5 上安装 Node.js 18..."
        
        # 使用 dnf 安装 Node.js 18
        if command -v dnf &> /dev/null; then
            print_info "使用 DNF 包管理器安装 Node.js 18..."
            sudo dnf update -y
            sudo dnf install -y nodejs npm
            
            # 验证安装
            if command -v node &> /dev/null; then
                NODE_VERSION=$(node --version)
                print_success "Node.js 安装成功: $NODE_VERSION"
            else
                error_exit "Node.js 安装失败"
            fi
        else
            error_exit "DNF 包管理器不可用"
        fi
    fi
else
    error_exit "Node.js 未安装"
fi

# 3. npm 版本检查
print_info "检查 npm 版本..."
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    print_info "npm 版本: $NPM_VERSION"
else
    error_exit "npm 未安装"
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
        
        # 测试配置
        if sudo nginx -t; then
            print_success "Nginx 配置测试通过"
            print_info "重启 Nginx..."
            sudo systemctl restart nginx
            sudo systemctl enable nginx
        else
            print_error "Nginx 配置测试失败"
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
        sudo dnf install -y certbot python3-certbot-nginx
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
                sudo mkdir -p /var/www/html/.well-known/acme-challenge
                sudo chown -R nginx:nginx /var/www/html
                
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

if [ -d "$WEB_DIR" ]; then
    print_info "备份现有部署..."
    sudo cp -r "$WEB_DIR" "$WEB_DIR.backup.$(date +%Y%m%d_%H%M%S)"
fi

print_info "创建 Web 目录..."
sudo mkdir -p "$WEB_DIR"

print_info "复制构建文件..."
sudo cp -r dist/* "$WEB_DIR/"

print_info "设置文件权限..."
sudo chown -R nginx:nginx "$WEB_DIR" 2>/dev/null || sudo chown -R apache:apache "$WEB_DIR" 2>/dev/null || sudo chown -R www-data:www-data "$WEB_DIR" 2>/dev/null
sudo chmod -R 755 "$WEB_DIR"

print_success "应用部署完成: $WEB_DIR"

# 8. 防火墙配置
print_step "配置防火墙..."
if command -v firewall-cmd &> /dev/null; then
    if sudo firewall-cmd --state &> /dev/null; then
        print_info "配置 firewalld 防火墙..."
        
        # 确保防火墙服务启动
        sudo systemctl start firewalld
        sudo systemctl enable firewalld
        
        # 开放必要端口
        sudo firewall-cmd --permanent --add-service=http
        sudo firewall-cmd --permanent --add-service=https
        sudo firewall-cmd --permanent --add-service=ssh
        
        # 重载防火墙配置
        sudo firewall-cmd --reload
        
        print_success "✅ 防火墙配置完成"
        
        # 显示当前防火墙状态
        print_info "当前开放的服务:"
        sudo firewall-cmd --list-services
    else
        print_info "防火墙未运行，启动中..."
        sudo systemctl start firewalld
        sudo systemctl enable firewalld
        # 递归调用防火墙配置
        print_info "重新配置防火墙..."
    fi
elif command -v ufw &> /dev/null; then
    print_info "配置 UFW 防火墙..."
    sudo ufw --force enable
    sudo ufw allow ssh
    sudo ufw allow http
    sudo ufw allow https
    print_success "✅ UFW 防火墙配置完成"
else
    print_warning "未检测到防火墙管理工具，请手动配置防火墙"
fi

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
