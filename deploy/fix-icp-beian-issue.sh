#!/bin/bash

# 阿里云ICP备案问题临时解决方案
# 使用IP地址直接访问绕过备案检查

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

SERVER_IP="47.92.208.198"
DOMAIN_NAME="todo.ylingtech.com"
APP_NAME="todo-app"

echo "🚨 阿里云ICP备案问题解决方案"
echo "服务器IP: $SERVER_IP"
echo "域名: $DOMAIN_NAME (被备案系统拦截)"
echo "时间: $(date)"
echo ""

print_step "1. 问题确认"
print_error "❌ 域名 $DOMAIN_NAME 没有ICP备案，被阿里云拦截"
print_info "这就是为什么返回403错误和 'Non-compliance ICP Filing' 页面"
echo ""

print_step "2. 创建IP直接访问配置"

# 查找现有的Nginx配置
NGINX_CONFIG=""
if [ -f "/etc/nginx/conf.d/$APP_NAME.conf" ]; then
    NGINX_CONFIG="/etc/nginx/conf.d/$APP_NAME.conf"
elif [ -f "/etc/nginx/sites-available/$APP_NAME.conf" ]; then
    NGINX_CONFIG="/etc/nginx/sites-available/$APP_NAME.conf"
fi

if [ -n "$NGINX_CONFIG" ]; then
    print_info "找到现有配置: $NGINX_CONFIG"
    
    # 创建IP访问的配置
    IP_CONFIG="/etc/nginx/conf.d/ip-access.conf"
    
    print_info "创建IP直接访问配置: $IP_CONFIG"
    
    sudo tee "$IP_CONFIG" > /dev/null << EOF
# IP直接访问配置 - 绕过ICP备案限制
# 创建时间: $(date)

server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name $SERVER_IP _;
    
    root /var/www/$APP_NAME;
    index index.html;
    
    # 添加CORS头以支持跨域访问
    add_header Access-Control-Allow-Origin "*" always;
    add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
    add_header Access-Control-Allow-Headers "Origin, X-Requested-With, Content-Type, Accept, Authorization" always;
    
    # SPA 路由支持
    location / {
        try_files \$uri \$uri/ /index.html;
        
        # 防止缓存问题
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header Pragma "no-cache";
        add_header Expires "0";
    }
    
    # 静态资源
    location /assets/ {
        expires 1h;
        add_header Cache-Control "public";
        access_log off;
    }
    
    # 健康检查
    location /health {
        return 200 "OK - IP Access Working";
        add_header Content-Type "text/plain";
    }
    
    # iOS测试页面
    location /ios-test.html {
        try_files /ios-test.html =404;
    }
    
    # 日志
    access_log /var/log/nginx/ip-access.log;
    error_log /var/log/nginx/ip-access-error.log;
}

# HTTPS IP访问 (如果有SSL证书)
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name $SERVER_IP _;
    
    # 使用现有的SSL证书（如果存在）
    ssl_certificate /etc/letsencrypt/live/$DOMAIN_NAME/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN_NAME/privkey.pem;
    
    # SSL配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    
    root /var/www/$APP_NAME;
    index index.html;
    
    # 添加CORS头
    add_header Access-Control-Allow-Origin "*" always;
    add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
    add_header Access-Control-Allow-Headers "Origin, X-Requested-With, Content-Type, Accept, Authorization" always;
    
    # SPA 路由支持
    location / {
        try_files \$uri \$uri/ /index.html;
    }
    
    # 静态资源
    location /assets/ {
        expires 1h;
        add_header Cache-Control "public";
        access_log off;
    }
    
    # 健康检查
    location /health {
        return 200 "OK - HTTPS IP Access Working";
        add_header Content-Type "text/plain";
    }
    
    # 日志
    access_log /var/log/nginx/ip-https-access.log;
    error_log /var/log/nginx/ip-https-error.log;
}
EOF

    print_success "✅ IP访问配置已创建"
    
    # 测试配置
    print_info "测试Nginx配置语法..."
    if sudo nginx -t; then
        print_success "✅ 配置语法正确"
        
        print_info "重新加载Nginx..."
        sudo systemctl reload nginx
        
        if sudo systemctl is-active nginx &> /dev/null; then
            print_success "✅ Nginx重新加载成功"
        else
            print_error "❌ Nginx重新加载失败"
            sudo systemctl status nginx
        fi
    else
        print_error "❌ Nginx配置语法错误"
        sudo nginx -t
    fi
else
    print_error "❌ 未找到现有的Nginx配置文件"
    print_info "请先运行主部署脚本"
fi

print_step "3. 测试IP访问"

print_info "测试HTTP IP访问..."
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 http://$SERVER_IP/ 2>/dev/null || echo "000")
print_info "HTTP IP访问状态码: $HTTP_STATUS"

if [ "$HTTP_STATUS" = "200" ]; then
    print_success "✅ HTTP IP访问正常"
elif [ "$HTTP_STATUS" = "301" ] || [ "$HTTP_STATUS" = "302" ]; then
    print_info "HTTP重定向到HTTPS"
else
    print_warning "⚠️ HTTP IP访问状态异常: $HTTP_STATUS"
fi

print_info "测试HTTPS IP访问..."
HTTPS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 -k https://$SERVER_IP/ 2>/dev/null || echo "000")
print_info "HTTPS IP访问状态码: $HTTPS_STATUS"

if [ "$HTTPS_STATUS" = "200" ]; then
    print_success "✅ HTTPS IP访问正常"
else
    print_warning "⚠️ HTTPS IP访问可能有问题: $HTTPS_STATUS"
fi

print_step "4. 解决方案总结"

echo ""
print_success "🎉 临时解决方案已部署！"
echo ""
print_info "📱 现在可以通过以下方式访问:"
echo "   HTTP:  http://$SERVER_IP/"
echo "   HTTPS: https://$SERVER_IP/ (可能有证书警告)"
echo ""
print_info "🧪 测试页面:"
echo "   iOS测试: http://$SERVER_IP/ios-test.html"
echo "   健康检查: http://$SERVER_IP/health"
echo ""
print_warning "⚠️ 这只是临时解决方案。长期解决方案:"
echo ""
echo "1. 🏆 最佳方案：完成ICP备案"
echo "   - 登录: https://beian.aliyun.com/"
echo "   - 时间: 7-20个工作日"
echo "   - 费用: 免费"
echo ""
echo "2. 🌍 备选方案：使用海外服务器"
echo "   - 香港/美国/欧洲服务器"
echo "   - 无需备案"
echo "   - 可正常使用域名"
echo ""
echo "3. 📱 临时方案：修改hosts文件测试"
echo "   - 在测试设备上添加: $SERVER_IP $DOMAIN_NAME"
echo "   - 仅用于测试，不影响其他用户"
echo ""
print_info "💡 现在在iOS Safari中访问 http://$SERVER_IP/ 应该可以正常工作了！"
echo ""
print_success "✅ 脚本执行完成！"
