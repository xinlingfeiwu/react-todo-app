#!/bin/bash

# 网站连接诊断脚本
# 专门排查 iOS Safari 访问问题

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

DOMAIN_NAME="todo.ylingtech.com"
APP_NAME="todo-app"
WEB_DIR="/var/www/$APP_NAME"

echo "🔍 网站连接诊断工具"
echo "域名: $DOMAIN_NAME"
echo "时间: $(date)"
echo ""

# 1. 基础网络连接测试
print_step "1. 基础网络连接测试"

print_info "检查域名解析..."
if nslookup $DOMAIN_NAME > /dev/null 2>&1; then
    IP_ADDRESS=$(nslookup $DOMAIN_NAME | grep -A 1 "Name:" | grep "Address:" | head -1 | awk '{print $2}')
    print_success "域名解析正常: $DOMAIN_NAME -> $IP_ADDRESS"
else
    print_error "域名解析失败"
    exit 1
fi

print_info "检查端口连通性..."
if timeout 5 bash -c "</dev/tcp/$DOMAIN_NAME/80" 2>/dev/null; then
    print_success "端口 80 (HTTP) 可达"
else
    print_error "端口 80 (HTTP) 不可达"
fi

if timeout 5 bash -c "</dev/tcp/$DOMAIN_NAME/443" 2>/dev/null; then
    print_success "端口 443 (HTTPS) 可达"
else
    print_error "端口 443 (HTTPS) 不可达"
fi

# 2. HTTP/HTTPS 响应测试
print_step "2. HTTP/HTTPS 响应测试"

print_info "测试 HTTP 响应..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 http://$DOMAIN_NAME/ 2>/dev/null || echo "000")
print_info "HTTP 状态码: $HTTP_CODE"

if [ "$HTTP_CODE" = "301" ] || [ "$HTTP_CODE" = "302" ]; then
    print_success "HTTP 重定向正常"
elif [ "$HTTP_CODE" = "403" ]; then
    print_error "HTTP 访问被禁止 (403)"
    print_warning "可能是 CDN/代理服务器阻止访问"
elif [ "$HTTP_CODE" = "200" ]; then
    print_success "HTTP 访问正常"
else
    print_error "HTTP 访问异常: $HTTP_CODE"
fi

print_info "测试 HTTPS 响应..."
HTTPS_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 https://$DOMAIN_NAME/ 2>/dev/null || echo "000")
print_info "HTTPS 状态码: $HTTPS_CODE"

if [ "$HTTPS_CODE" = "200" ]; then
    print_success "HTTPS 访问正常"
elif [ "$HTTPS_CODE" = "403" ]; then
    print_error "HTTPS 访问被禁止 (403)"
    print_warning "可能是 CDN/代理服务器阻止访问"
else
    print_error "HTTPS 访问异常: $HTTPS_CODE"
fi

# 3. 检查服务器状态
print_step "3. 服务器状态检查"

print_info "检查 Nginx 服务状态..."
if systemctl is-active nginx &> /dev/null; then
    print_success "Nginx 服务运行中"
    
    NGINX_VERSION=$(nginx -v 2>&1 | cut -d'/' -f2)
    print_info "Nginx 版本: $NGINX_VERSION"
else
    print_error "Nginx 服务未运行"
    print_info "尝试启动 Nginx..."
    sudo systemctl start nginx
fi

print_info "检查防火墙状态..."
if command -v firewall-cmd &> /dev/null; then
    if systemctl is-active firewalld &> /dev/null; then
        FIREWALL_SERVICES=$(firewall-cmd --list-services 2>/dev/null | grep -E "(http|https)" || echo "none")
        print_info "防火墙开放的 Web 服务: $FIREWALL_SERVICES"
        
        if [[ "$FIREWALL_SERVICES" == *"http"* ]]; then
            print_success "防火墙配置正常"
        else
            print_warning "防火墙可能阻止了 Web 访问"
            print_info "尝试开放 HTTP/HTTPS 端口..."
            sudo firewall-cmd --permanent --add-service=http
            sudo firewall-cmd --permanent --add-service=https
            sudo firewall-cmd --reload
        fi
    else
        print_info "防火墙未运行"
    fi
fi

# 4. 检查 Nginx 配置
print_step "4. Nginx 配置检查"

NGINX_CONFIG="/etc/nginx/conf.d/$APP_NAME.conf"
if [ -d "/etc/nginx/sites-available" ] && [ -f "/etc/nginx/sites-available/$APP_NAME.conf" ]; then
    NGINX_CONFIG="/etc/nginx/sites-available/$APP_NAME.conf"
fi

if [ -f "$NGINX_CONFIG" ]; then
    print_success "找到 Nginx 配置文件: $NGINX_CONFIG"
    
    print_info "测试 Nginx 配置语法..."
    if nginx -t &> /dev/null; then
        print_success "Nginx 配置语法正确"
    else
        print_error "Nginx 配置语法错误"
        nginx -t
    fi
    
    print_info "检查配置中的域名..."
    if grep -q "$DOMAIN_NAME" "$NGINX_CONFIG"; then
        print_success "配置中包含域名: $DOMAIN_NAME"
    else
        print_error "配置中未找到域名: $DOMAIN_NAME"
    fi
    
    print_info "检查 Web 目录..."
    if [ -d "$WEB_DIR" ]; then
        print_success "Web 目录存在: $WEB_DIR"
        
        if [ -f "$WEB_DIR/index.html" ]; then
            print_success "主页文件存在"
        else
            print_error "主页文件不存在: $WEB_DIR/index.html"
        fi
    else
        print_error "Web 目录不存在: $WEB_DIR"
    fi
else
    print_error "未找到 Nginx 配置文件"
fi

# 5. SSL 证书检查
print_step "5. SSL 证书检查"

if [ -f "/etc/letsencrypt/live/$DOMAIN_NAME/fullchain.pem" ]; then
    print_success "SSL 证书文件存在"
    
    print_info "检查证书有效期..."
    CERT_EXPIRY=$(openssl x509 -enddate -noout -in /etc/letsencrypt/live/$DOMAIN_NAME/fullchain.pem | cut -d= -f2)
    EXPIRY_DATE=$(date -d "$CERT_EXPIRY" +%s)
    CURRENT_DATE=$(date +%s)
    DAYS_LEFT=$(( (EXPIRY_DATE - CURRENT_DATE) / 86400 ))
    
    if [ $DAYS_LEFT -gt 0 ]; then
        print_success "证书有效，剩余 $DAYS_LEFT 天"
    else
        print_error "证书已过期"
    fi
    
    print_info "测试 SSL 连接..."
    if echo | timeout 10 openssl s_client -connect $DOMAIN_NAME:443 -servername $DOMAIN_NAME &>/dev/null; then
        print_success "SSL 连接正常"
    else
        print_error "SSL 连接失败"
    fi
else
    print_warning "未找到 SSL 证书文件"
fi

# 6. 检查 CDN/代理
print_step "6. CDN/代理检查"

print_info "检查响应头中的服务器信息..."
SERVER_HEADER=$(curl -s -I http://$DOMAIN_NAME/ 2>/dev/null | grep -i "server:" | head -1 || echo "无法获取")
print_info "Server 头: $SERVER_HEADER"

if [[ "$SERVER_HEADER" == *"nginx"* ]]; then
    print_success "直接连接到 Nginx 服务器"
elif [[ "$SERVER_HEADER" == *"cloudflare"* ]] || [[ "$SERVER_HEADER" == *"Beaver"* ]]; then
    print_warning "检测到 CDN/代理服务器"
    print_info "可能需要在 CDN 控制面板中配置 SSL 或安全设置"
else
    print_info "未知的服务器类型，可能使用了代理"
fi

# 7. 生成修复建议
print_step "7. 修复建议"

echo ""
print_info "🔧 基于诊断结果的修复建议："

if [ "$HTTP_CODE" = "403" ] || [ "$HTTPS_CODE" = "403" ]; then
    echo ""
    print_warning "⚠️ 主要问题：访问被禁止 (403 错误)"
    echo ""
    echo "可能的原因和解决方案："
    echo ""
    echo "1. 🌐 CDN/代理服务器问题："
    echo "   - 检查 Cloudflare 或其他 CDN 的安全设置"
    echo "   - 临时关闭 CDN 直接访问源服务器"
    echo "   - 检查 CDN 的 SSL/TLS 设置"
    echo ""
    echo "2. 🔧 服务器配置问题："
    echo "   - 检查 Nginx 配置中的 allow/deny 规则"
    echo "   - 验证 Web 目录权限设置"
    echo "   - 检查 SELinux 或 AppArmor 安全策略"
    echo ""
    echo "3. 🛡️ 防火墙问题："
    echo "   - 确认防火墙允许 HTTP/HTTPS 流量"
    echo "   - 检查云服务器安全组设置"
    echo ""
    echo "立即尝试的解决方案："
    echo "sudo systemctl restart nginx"
    echo "sudo firewall-cmd --permanent --add-service=http"
    echo "sudo firewall-cmd --permanent --add-service=https"
    echo "sudo firewall-cmd --reload"
fi

if [ ! -f "$WEB_DIR/index.html" ]; then
    echo ""
    print_warning "⚠️ Web 文件缺失"
    echo "建议重新部署应用文件："
    echo "cd /path/to/your/project"
    echo "npm run build"
    echo "sudo cp -r dist/* $WEB_DIR/"
fi

if [ ! -f "/etc/letsencrypt/live/$DOMAIN_NAME/fullchain.pem" ]; then
    echo ""
    print_warning "⚠️ SSL 证书缺失"
    echo "建议获取 SSL 证书："
    echo "sudo certbot --nginx -d $DOMAIN_NAME"
fi

echo ""
print_info "📞 如需进一步帮助，请提供以上诊断结果"
echo ""
print_success "✅ 诊断完成！"
