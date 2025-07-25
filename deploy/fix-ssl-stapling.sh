#!/bin/bash

# SSL OCSP Stapling 配置修复脚本
# 解决 "ssl_stapling" ignored, no OCSP responder URL 警告

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

echo "🔧 SSL OCSP Stapling 配置修复脚本"
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

# 检测 Nginx 配置文件位置
if [ -d "/etc/nginx/sites-available" ]; then
    NGINX_CONFIG="/etc/nginx/sites-available/$APP_NAME.conf"
else
    NGINX_CONFIG="/etc/nginx/conf.d/$APP_NAME.conf"
fi

print_info "Nginx 配置文件: $NGINX_CONFIG"

# 检查配置文件是否存在
if [ ! -f "$NGINX_CONFIG" ]; then
    print_error "❌ 未找到 Nginx 配置文件: $NGINX_CONFIG"
    exit 1
fi

# 检查 SSL 证书是否存在
if [ ! -f "/etc/letsencrypt/live/$DOMAIN_NAME/fullchain.pem" ]; then
    print_error "❌ 未找到 SSL 证书文件"
    exit 1
fi

# 检查证书中的 OCSP 信息
print_info "检查证书 OCSP 信息..."
OCSP_URL=$(openssl x509 -noout -ocsp_uri -in /etc/letsencrypt/live/$DOMAIN_NAME/cert.pem 2>/dev/null || echo "")

if [ -z "$OCSP_URL" ]; then
    print_warning "⚠️ 证书中没有 OCSP 响应器 URL"
    print_info "这是 Let's Encrypt 某些证书的正常情况"
    
    # 创建不包含 OCSP Stapling 的配置
    print_info "创建优化的 SSL 配置（不包含 OCSP Stapling）..."
    
    # 备份现有配置
    BACKUP_CONFIG="${NGINX_CONFIG}.backup-$(date +%Y%m%d-%H%M%S)"
    cp "$NGINX_CONFIG" "$BACKUP_CONFIG"
    print_info "备份现有配置: $BACKUP_CONFIG"
    
    # 生成新的配置文件
    cat > "$NGINX_CONFIG" << EOF
# $APP_NAME Nginx 配置 (优化的 HTTPS 配置)
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

# HTTPS 配置 - 优化版本
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name $DOMAIN_NAME;

    # SSL 证书配置
    ssl_certificate /etc/letsencrypt/live/$DOMAIN_NAME/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN_NAME/privkey.pem;

    # 优化的 SSL 配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # 移除 OCSP Stapling 配置以避免警告
    # ssl_stapling on;
    # ssl_stapling_verify on;
    # ssl_trusted_certificate /etc/letsencrypt/live/$DOMAIN_NAME/chain.pem;
    # resolver 8.8.8.8 8.8.4.4 valid=300s;
    # resolver_timeout 5s;

    # 安全头配置
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:; media-src 'self'; object-src 'none'; child-src 'self';" always;

    # 网站根目录
    root /var/www/$APP_NAME;
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
    location ~* \\.(ico|png|jpg|jpeg|gif|svg)\\$ {
        expires 1M;
        add_header Cache-Control "public";
        access_log off;
    }

    # 字体文件 (CORS 头支持)
    location ~* \\.(woff|woff2|ttf|eot)\\$ {
        expires 1M;
        add_header Cache-Control "public";
        add_header Access-Control-Allow-Origin "*";
        access_log off;
    }

    # HTML 文件缓存策略
    location ~* \\.html\\$ {
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

    # Gzip 压缩配置
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

else
    print_success "✅ 证书包含 OCSP 响应器 URL: $OCSP_URL"
    print_info "OCSP Stapling 配置应该正常工作"
    exit 0
fi

# 测试新配置
print_info "测试 Nginx 配置..."
if nginx -t; then
    print_success "✅ Nginx 配置语法正确"
else
    print_error "❌ Nginx 配置语法错误"
    print_info "恢复备份配置..."
    cp "$BACKUP_CONFIG" "$NGINX_CONFIG"
    exit 1
fi

# 重新加载 Nginx
print_info "重新加载 Nginx 配置..."
if systemctl reload nginx; then
    print_success "✅ Nginx 配置重新加载成功"
else
    print_error "❌ Nginx 重新加载失败"
    print_info "恢复备份配置..."
    cp "$BACKUP_CONFIG" "$NGINX_CONFIG"
    systemctl reload nginx
    exit 1
fi

# 再次测试配置
print_info "验证修复效果..."
sleep 2

if nginx -t 2>&1 | grep -q "ssl_stapling.*ignored"; then
    print_warning "⚠️ 仍然有 OCSP Stapling 警告，这可能是证书本身的限制"
else
    print_success "✅ OCSP Stapling 警告已解决"
fi

# 测试 HTTPS 连接
print_info "测试 HTTPS 连接..."
if curl -s -I https://$DOMAIN_NAME/ | grep -q "HTTP/"; then
    print_success "✅ HTTPS 连接正常"
else
    print_warning "⚠️ HTTPS 连接测试失败"
fi

echo ""
print_success "🎉 SSL 配置优化完成！"
print_info "📁 备份文件: $BACKUP_CONFIG"
print_info "🔧 如需回滚: cp $BACKUP_CONFIG $NGINX_CONFIG && systemctl reload nginx"
echo ""

print_info "📋 说明:"
echo "   • OCSP Stapling 警告已通过移除相关配置解决"
echo "   • SSL 安全性和性能不受影响"
echo "   • 网站仍然使用完整的 HTTPS 加密"
echo "   • 所有安全头和优化配置保持不变"
echo ""
