#!/bin/bash

# Nginx 配置修复脚本
# 修复 gzip_proxied 指令中的无效值问题

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

echo "🔧 Nginx 配置修复脚本"
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
    # Ubuntu/Debian 风格
    NGINX_SITE_CONFIG="/etc/nginx/sites-available/$APP_NAME"
else
    # CentOS/RHEL 风格
    NGINX_SITE_CONFIG="/etc/nginx/conf.d/$APP_NAME.conf"
fi

print_info "Nginx 配置文件: $NGINX_SITE_CONFIG"

# 检查配置文件是否存在
if [ ! -f "$NGINX_SITE_CONFIG" ]; then
    print_error "❌ 未找到 Nginx 配置文件: $NGINX_SITE_CONFIG"
    print_info "请先运行独立部署脚本"
    exit 1
fi

# 备份现有配置
BACKUP_CONFIG="${NGINX_SITE_CONFIG}.backup-$(date +%Y%m%d-%H%M%S)"
print_info "备份现有配置: $BACKUP_CONFIG"
cp "$NGINX_SITE_CONFIG" "$BACKUP_CONFIG"

# 生成修复后的配置
print_info "生成修复后的 Nginx 配置..."

cat > "$NGINX_SITE_CONFIG" << EOF
server {
    listen 80;
    listen [::]:80;
    server_name $DOMAIN_NAME www.$DOMAIN_NAME;
    
    root $WEB_DIR;
    index index.html index.htm;
    
    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
    # Gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript application/json;
    
    # 静态文件缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files \$uri =404;
    }
    
    # SPA 路由支持
    location / {
        try_files \$uri \$uri/ /index.html;
    }
    
    # 健康检查
    location /health {
        access_log off;
        return 200 "healthy\\n";
        add_header Content-Type text/plain;
    }
    
    # 隐藏 Nginx 版本
    server_tokens off;
    
    # 日志配置
    access_log /var/log/nginx/$APP_NAME.access.log;
    error_log /var/log/nginx/$APP_NAME.error.log;
}
EOF

print_success "✅ 配置文件已更新"

# 测试 Nginx 配置
print_info "测试 Nginx 配置语法..."
if nginx -t; then
    print_success "✅ Nginx 配置语法正确"
else
    print_error "❌ Nginx 配置语法仍然有错误"
    print_info "恢复备份配置..."
    cp "$BACKUP_CONFIG" "$NGINX_SITE_CONFIG"
    exit 1
fi

# 重新加载 Nginx
print_info "重新加载 Nginx 配置..."
if systemctl reload nginx; then
    print_success "✅ Nginx 配置重新加载成功"
else
    print_error "❌ Nginx 重新加载失败"
    print_info "恢复备份配置..."
    cp "$BACKUP_CONFIG" "$NGINX_SITE_CONFIG"
    systemctl reload nginx
    exit 1
fi

# 测试连接
print_info "测试本地连接..."
sleep 2
LOCAL_HTTP=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 http://localhost/ 2>/dev/null || echo "000")
print_info "本地 HTTP 状态码: $LOCAL_HTTP"

if [ "$LOCAL_HTTP" = "200" ] || [ "$LOCAL_HTTP" = "301" ] || [ "$LOCAL_HTTP" = "302" ]; then
    print_success "✅ 本地连接正常"
else
    print_warning "⚠️ 本地连接异常，状态码: $LOCAL_HTTP"
fi

echo ""
print_success "🎉 Nginx 配置修复完成!"
print_info "📁 备份文件: $BACKUP_CONFIG"
print_info "🔧 如需回滚: cp $BACKUP_CONFIG $NGINX_SITE_CONFIG && systemctl reload nginx"
echo ""

print_info "🔍 验证部署:"
echo "   本地测试: curl -I http://localhost/"
echo "   外部测试: curl -I http://$DOMAIN_NAME/"
echo "   HTTPS测试: curl -I https://$DOMAIN_NAME/"
echo "   完整测试: curl -L -I http://$DOMAIN_NAME/"
echo "   健康检查: curl http://localhost/health"
echo ""
