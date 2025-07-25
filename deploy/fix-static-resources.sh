#!/bin/bash

# 静态资源路径修复脚本
# 解决 MIME 类型错误和资源路径问题

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
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

echo "🔧 静态资源路径修复脚本"
echo "时间: $(date)"
echo ""

# 检查权限
if [ "$EUID" -ne 0 ]; then
    print_error "❌ 此脚本需要 root 权限运行"
    print_info "请使用: sudo $0"
    exit 1
fi

# 配置变量
DOMAIN_NAME="todo.ylingtech.com"
APP_NAME="todo-app"
WEB_DIR="/var/www/$APP_NAME"

# 检测 Nginx 配置文件位置
if [ -d "/etc/nginx/sites-available" ]; then
    NGINX_CONFIG="/etc/nginx/sites-available/$APP_NAME.conf"
else
    NGINX_CONFIG="/etc/nginx/conf.d/$APP_NAME.conf"
fi

print_info "Nginx 配置文件: $NGINX_CONFIG"
print_info "Web 目录: $WEB_DIR"

# 检查文件是否存在
if [ ! -f "$NGINX_CONFIG" ]; then
    print_error "❌ 未找到 Nginx 配置文件: $NGINX_CONFIG"
    exit 1
fi

if [ ! -d "$WEB_DIR" ]; then
    print_error "❌ 未找到 Web 目录: $WEB_DIR"
    exit 1
fi

print_info "1. 检查当前问题..."

# 检查 index.html 中的资源路径
if [ -f "$WEB_DIR/index.html" ]; then
    print_info "检查 index.html 中的资源路径..."
    
    # 检查是否包含 /react-todo-app/ 路径
    if grep -q "/react-todo-app/" "$WEB_DIR/index.html"; then
        print_warning "⚠️ 发现问题：index.html 中包含 /react-todo-app/ 路径"
        print_info "显示问题路径："
        grep -n "/react-todo-app/" "$WEB_DIR/index.html" | head -5
        HAS_BASE_PATH=true
    else
        print_success "✅ index.html 中的路径看起来正常"
        HAS_BASE_PATH=false
    fi
else
    print_error "❌ 未找到 index.html 文件"
    exit 1
fi

# 检查实际的资源文件结构
print_info "检查实际的资源文件结构..."
if [ -d "$WEB_DIR/assets" ]; then
    print_success "✅ 找到 assets 目录"
    print_info "assets 目录内容："
    ls -la "$WEB_DIR/assets/" | head -10
else
    print_error "❌ 未找到 assets 目录"
    ls -la "$WEB_DIR/"
fi

print_info "2. 修复 Nginx 配置..."

# 备份现有配置
BACKUP_CONFIG="${NGINX_CONFIG}.backup-$(date +%Y%m%d-%H%M%S)"
cp "$NGINX_CONFIG" "$BACKUP_CONFIG"
print_info "备份现有配置: $BACKUP_CONFIG"

# 创建修复后的 Nginx 配置
print_info "创建修复后的 Nginx 配置..."

# 检查是否有 SSL 证书
if [ -f "/etc/letsencrypt/live/$DOMAIN_NAME/fullchain.pem" ]; then
    HAS_SSL=true
    print_info "检测到 SSL 证书，创建 HTTPS 配置"
else
    HAS_SSL=false
    print_info "未检测到 SSL 证书，创建 HTTP 配置"
fi

if [ "$HAS_SSL" = true ]; then
    # HTTPS 配置
    cat > "$NGINX_CONFIG" << EOF
# $APP_NAME Nginx 配置 (修复静态资源路径)
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

# HTTPS 配置
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name $DOMAIN_NAME;

    # SSL 证书配置
    ssl_certificate /etc/letsencrypt/live/$DOMAIN_NAME/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN_NAME/privkey.pem;

    # SSL 配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # 安全头配置
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # 网站根目录
    root $WEB_DIR;
    index index.html;

    # 处理带有 /react-todo-app/ 前缀的请求（兼容性处理）
    location /react-todo-app/ {
        alias $WEB_DIR/;
        try_files \$uri \$uri/ /index.html;
    }

    # SPA 路由支持
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # 静态资源优化配置
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header Vary "Accept-Encoding";
        access_log off;
        
        # 确保正确的 MIME 类型
        location ~* \\.css\$ {
            add_header Content-Type text/css;
        }
        location ~* \\.js\$ {
            add_header Content-Type application/javascript;
        }
    }

    # CSS 文件
    location ~* \\.css\$ {
        expires 1y;
        add_header Content-Type text/css;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # JavaScript 文件
    location ~* \\.js\$ {
        expires 1y;
        add_header Content-Type application/javascript;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # 其他静态文件
    location ~* \\.(ico|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)\$ {
        expires 1M;
        add_header Cache-Control "public";
        access_log off;
    }

    # HTML 文件
    location ~* \\.html\$ {
        expires -1;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header Pragma "no-cache";
        add_header Expires "0";
    }

    # 健康检查
    location /health {
        access_log off;
        return 200 "healthy\\n";
        add_header Content-Type text/plain;
    }

    # Gzip 压缩
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
        image/svg+xml;

    # 安全配置
    location ~ /\\. {
        deny all;
        access_log off;
        log_not_found off;
    }

    # 禁止访问敏感文件
    location ~* \\.(htaccess|htpasswd|ini|log|sh|inc|bak)\$ {
        deny all;
        access_log off;
        log_not_found off;
    }

    # 日志配置
    access_log /var/log/nginx/$APP_NAME-access.log;
    error_log /var/log/nginx/$APP_NAME-error.log;
}
EOF
else
    # HTTP 配置
    cat > "$NGINX_CONFIG" << EOF
# $APP_NAME Nginx 配置 (修复静态资源路径)
# 域名: $DOMAIN_NAME

server {
    listen 80;
    listen [::]:80;
    server_name $DOMAIN_NAME;

    # 网站根目录
    root $WEB_DIR;
    index index.html;

    # 处理带有 /react-todo-app/ 前缀的请求（兼容性处理）
    location /react-todo-app/ {
        alias $WEB_DIR/;
        try_files \$uri \$uri/ /index.html;
    }

    # SPA 路由支持
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # 静态资源优化配置
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header Vary "Accept-Encoding";
        access_log off;
        
        # 确保正确的 MIME 类型
        location ~* \\.css\$ {
            add_header Content-Type text/css;
        }
        location ~* \\.js\$ {
            add_header Content-Type application/javascript;
        }
    }

    # CSS 文件
    location ~* \\.css\$ {
        expires 1y;
        add_header Content-Type text/css;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # JavaScript 文件
    location ~* \\.js\$ {
        expires 1y;
        add_header Content-Type application/javascript;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # 其他静态文件
    location ~* \\.(ico|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)\$ {
        expires 1M;
        add_header Cache-Control "public";
        access_log off;
    }

    # HTML 文件
    location ~* \\.html\$ {
        expires -1;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header Pragma "no-cache";
        add_header Expires "0";
    }

    # 健康检查
    location /health {
        access_log off;
        return 200 "healthy\\n";
        add_header Content-Type text/plain;
    }

    # 日志配置
    access_log /var/log/nginx/$APP_NAME-access.log;
    error_log /var/log/nginx/$APP_NAME-error.log;
}
EOF
fi

print_success "✅ Nginx 配置已更新"

print_info "3. 修复构建文件路径..."

if [ "$HAS_BASE_PATH" = true ]; then
    print_info "修复 index.html 中的资源路径..."

    # 备份 index.html
    cp "$WEB_DIR/index.html" "$WEB_DIR/index.html.backup-$(date +%Y%m%d-%H%M%S)"

    # 修复路径：移除 /react-todo-app/ 前缀
    sed -i 's|/react-todo-app/|/|g' "$WEB_DIR/index.html"

    print_success "✅ index.html 路径已修复"

    # 显示修复后的路径
    print_info "修复后的资源路径："
    grep -n "assets/" "$WEB_DIR/index.html" | head -3
else
    print_info "index.html 路径无需修复"
fi

print_info "4. 测试 Nginx 配置..."

# 测试 Nginx 配置
if nginx -t; then
    print_success "✅ Nginx 配置语法正确"
else
    print_error "❌ Nginx 配置语法错误"
    print_info "恢复备份配置..."
    cp "$BACKUP_CONFIG" "$NGINX_CONFIG"
    exit 1
fi

print_info "5. 重新加载 Nginx..."

# 重新加载 Nginx
if systemctl reload nginx; then
    print_success "✅ Nginx 重新加载成功"
else
    print_error "❌ Nginx 重新加载失败"
    print_info "恢复备份配置..."
    cp "$BACKUP_CONFIG" "$NGINX_CONFIG"
    systemctl reload nginx
    exit 1
fi

print_info "6. 验证修复效果..."

# 等待服务重启
sleep 3

# 测试静态资源访问
print_info "测试静态资源访问..."

# 查找一个 CSS 文件进行测试
CSS_FILE=$(find "$WEB_DIR/assets" -name "*.css" -type f | head -1)
if [ -n "$CSS_FILE" ]; then
    CSS_NAME=$(basename "$CSS_FILE")
    CSS_PATH="/assets/css/$CSS_NAME"

    print_info "测试 CSS 文件: $CSS_PATH"

    # 测试本地访问
    LOCAL_CSS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "http://localhost$CSS_PATH" 2>/dev/null || echo "000")
    print_info "本地 CSS 访问状态码: $LOCAL_CSS"

    if [ "$LOCAL_CSS" = "200" ]; then
        print_success "✅ CSS 文件本地访问正常"

        # 检查 MIME 类型
        MIME_TYPE=$(curl -s -I --max-time 5 "http://localhost$CSS_PATH" 2>/dev/null | grep -i "content-type" | cut -d: -f2 | tr -d ' \r')
        print_info "CSS MIME 类型: $MIME_TYPE"

        if [[ "$MIME_TYPE" == *"text/css"* ]]; then
            print_success "✅ CSS MIME 类型正确"
        else
            print_warning "⚠️ CSS MIME 类型可能不正确: $MIME_TYPE"
        fi
    else
        print_warning "⚠️ CSS 文件本地访问异常: $LOCAL_CSS"
    fi
fi

# 查找一个 JS 文件进行测试
JS_FILE=$(find "$WEB_DIR/assets" -name "*.js" -type f | head -1)
if [ -n "$JS_FILE" ]; then
    JS_NAME=$(basename "$JS_FILE")
    JS_PATH="/assets/js/$JS_NAME"

    print_info "测试 JS 文件: $JS_PATH"

    # 测试本地访问
    LOCAL_JS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "http://localhost$JS_PATH" 2>/dev/null || echo "000")
    print_info "本地 JS 访问状态码: $LOCAL_JS"

    if [ "$LOCAL_JS" = "200" ]; then
        print_success "✅ JS 文件本地访问正常"

        # 检查 MIME 类型
        MIME_TYPE=$(curl -s -I --max-time 5 "http://localhost$JS_PATH" 2>/dev/null | grep -i "content-type" | cut -d: -f2 | tr -d ' \r')
        print_info "JS MIME 类型: $MIME_TYPE"

        if [[ "$MIME_TYPE" == *"javascript"* ]]; then
            print_success "✅ JS MIME 类型正确"
        else
            print_warning "⚠️ JS MIME 类型可能不正确: $MIME_TYPE"
        fi
    else
        print_warning "⚠️ JS 文件本地访问异常: $LOCAL_JS"
    fi
fi

print_info "7. 清理浏览器缓存建议..."

echo ""
print_success "🎉 静态资源路径修复完成！"
echo ""
print_info "📋 修复内容："
echo "   ✅ 修复了 Nginx 配置中的静态资源处理"
echo "   ✅ 添加了正确的 MIME 类型设置"
echo "   ✅ 添加了 /react-todo-app/ 路径的兼容性处理"
if [ "$HAS_BASE_PATH" = true ]; then
echo "   ✅ 修复了 index.html 中的资源路径"
fi
echo ""

print_warning "⚠️ 重要提醒："
echo "   1. 请清除浏览器缓存后重新访问网站"
echo "   2. 可以使用 Ctrl+F5 或 Cmd+Shift+R 强制刷新"
echo "   3. 或者使用浏览器的无痕模式访问"
echo ""

print_info "🔧 验证命令："
echo "   # 测试主页访问"
echo "   curl -I https://$DOMAIN_NAME/"
echo ""
echo "   # 测试 CSS 文件"
echo "   curl -I https://$DOMAIN_NAME/assets/css/"
echo ""
echo "   # 测试 JS 文件"
echo "   curl -I https://$DOMAIN_NAME/assets/js/"
echo ""

print_info "📁 备份文件："
echo "   Nginx 配置备份: $BACKUP_CONFIG"
if [ "$HAS_BASE_PATH" = true ]; then
echo "   index.html 备份: $WEB_DIR/index.html.backup-*"
fi
echo ""

print_success "✅ 修复脚本执行完成！"
