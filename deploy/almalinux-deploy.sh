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
    if [ ! -f "/etc/letsencrypt/live/$DOMAIN_NAME/fullchain.pem" ]; then
        print_warning "未找到 SSL 证书，需要配置 Let's Encrypt"
        print_info "运行以下命令获取免费 SSL 证书:"
        echo "  sudo dnf install -y certbot python3-certbot-nginx"
        echo "  sudo certbot --nginx -d $DOMAIN_NAME"
        echo ""
        print_info "或者手动配置其他 SSL 证书"
    else
        print_success "SSL 证书已存在: $DOMAIN_NAME"
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
print_step "检查防火墙配置..."
if command -v firewall-cmd &> /dev/null; then
    if sudo firewall-cmd --state &> /dev/null; then
        print_info "配置防火墙允许 HTTP/HTTPS..."
        sudo firewall-cmd --permanent --add-service=http
        sudo firewall-cmd --permanent --add-service=https
        sudo firewall-cmd --reload
        print_success "防火墙配置完成"
    else
        print_info "防火墙未运行"
    fi
else
    print_info "未检测到 firewalld"
fi

# 9. SELinux 配置（如果启用）
if command -v getenforce &> /dev/null; then
    SELINUX_STATUS=$(getenforce)
    if [ "$SELINUX_STATUS" = "Enforcing" ]; then
        print_info "配置 SELinux 上下文..."
        sudo setsebool -P httpd_can_network_connect on
        sudo semanage fcontext -a -t httpd_exec_t "$WEB_DIR(/.*)?" 2>/dev/null || true
        sudo restorecon -Rv "$WEB_DIR"
        print_success "SELinux 配置完成"
    fi
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
print_info "服务管理命令:"
print_info "  sudo systemctl status nginx"
print_info "  sudo nginx -t"
print_info "  sudo systemctl reload nginx"
echo ""
print_info "日志文件:"
print_info "  访问日志: /var/log/nginx/$APP_NAME-access.log"
print_info "  错误日志: /var/log/nginx/$APP_NAME-error.log"
echo "=============================================="

# 多应用部署提示
echo ""
print_info "📝 多应用部署提示:"
print_info "要部署更多应用到不同的二级域名，请运行:"
print_info "  $0 -d another.ylingtech.com -a another-app"
echo ""
