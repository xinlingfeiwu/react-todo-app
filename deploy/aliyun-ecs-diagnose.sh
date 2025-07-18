#!/bin/bash

# 阿里云ECS网站部署问题诊断和修复脚本
# 针对todo.ylingtech.com访问问题

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

echo "🔍 阿里云ECS网站访问问题诊断修复工具"
echo "域名: $DOMAIN_NAME"
echo "时间: $(date)"
echo ""

# 1. 检查服务器基础状态
print_step "1. 服务器基础状态检查"

print_info "检查公网IP配置..."
PUBLIC_IP=$(curl -s --max-time 5 http://checkip.amazonaws.com/ 2>/dev/null || echo "无法获取")
if [ "$PUBLIC_IP" != "无法获取" ]; then
    print_success "服务器公网IP: $PUBLIC_IP"
    if [ "$PUBLIC_IP" = "47.92.208.198" ]; then
        print_success "✅ IP地址匹配域名解析"
    else
        print_warning "⚠️ IP地址不匹配，域名解析可能有问题"
        print_info "域名解析IP: 47.92.208.198"
        print_info "实际服务器IP: $PUBLIC_IP"
    fi
else
    print_error "❌ 无法获取公网IP，可能网络连接有问题"
fi

print_info "检查网络接口配置..."
ip addr show | grep -E "(inet.*brd|inet.*scope global)" | head -5

# 2. 检查系统防火墙
print_step "2. 系统防火墙检查和配置"

# 检查并配置 firewalld
if command -v firewall-cmd &> /dev/null; then
    print_info "检查 firewalld 状态..."
    if systemctl is-active firewalld &> /dev/null; then
        print_info "firewalld 正在运行"
        
        # 检查当前规则
        CURRENT_SERVICES=$(firewall-cmd --list-services 2>/dev/null || echo "")
        print_info "当前开放的服务: $CURRENT_SERVICES"
        
        # 确保开放 HTTP/HTTPS
        if [[ "$CURRENT_SERVICES" != *"http"* ]]; then
            print_warning "HTTP 服务未开放，正在配置..."
            firewall-cmd --permanent --add-service=http
            firewall-cmd --permanent --add-service=https
            firewall-cmd --reload
            print_success "✅ HTTP/HTTPS 服务已开放"
        else
            print_success "✅ HTTP/HTTPS 服务已开放"
        fi
        
        # 显示当前规则
        print_info "当前防火墙规则:"
        firewall-cmd --list-all
    else
        print_info "firewalld 未运行，尝试启动..."
        systemctl start firewalld && systemctl enable firewalld
        firewall-cmd --permanent --add-service=http
        firewall-cmd --permanent --add-service=https
        firewall-cmd --reload
        print_success "✅ firewalld 已配置"
    fi
fi

# 检查 iptables (备用)
if command -v iptables &> /dev/null; then
    print_info "检查 iptables 规则..."
    IPTABLES_RULES=$(iptables -L INPUT -n | grep -E "(80|443)" || echo "无HTTP/HTTPS规则")
    print_info "iptables HTTP/HTTPS 规则: $IPTABLES_RULES"
fi

# 3. 检查 Nginx 状态和配置
print_step "3. Nginx 服务状态检查"

if command -v nginx &> /dev/null; then
    print_info "检查 Nginx 运行状态..."
    if systemctl is-active nginx &> /dev/null; then
        print_success "✅ Nginx 服务正在运行"
        
        NGINX_VERSION=$(nginx -v 2>&1 | cut -d'/' -f2)
        print_info "Nginx 版本: $NGINX_VERSION"
    else
        print_error "❌ Nginx 服务未运行"
        print_info "尝试启动 Nginx..."
        systemctl start nginx && systemctl enable nginx
        
        if systemctl is-active nginx &> /dev/null; then
            print_success "✅ Nginx 服务已启动"
        else
            print_error "❌ Nginx 启动失败"
            systemctl status nginx
        fi
    fi
    
    print_info "检查 Nginx 配置语法..."
    if nginx -t &> /dev/null; then
        print_success "✅ Nginx 配置语法正确"
    else
        print_error "❌ Nginx 配置语法错误"
        nginx -t
    fi
    
    print_info "检查 Nginx 监听端口..."
    NGINX_PORTS=$(netstat -tlnp 2>/dev/null | grep nginx | awk '{print $4}' | cut -d':' -f2 | sort -u | tr '\n' ' ' || echo "无法检测")
    print_info "Nginx 监听端口: $NGINX_PORTS"
    
    if [[ "$NGINX_PORTS" == *"80"* ]] && [[ "$NGINX_PORTS" == *"443"* ]]; then
        print_success "✅ Nginx 正确监听 80 和 443 端口"
    else
        print_warning "⚠️ Nginx 端口配置可能有问题"
    fi
else
    print_error "❌ Nginx 未安装"
    print_info "请先运行部署脚本安装 Nginx"
fi

# 4. 检查应用文件
print_step "4. 应用文件检查"

if [ -d "$WEB_DIR" ]; then
    print_success "✅ Web 目录存在: $WEB_DIR"
    
    if [ -f "$WEB_DIR/index.html" ]; then
        print_success "✅ 主页文件存在"
        
        FILE_SIZE=$(du -sh "$WEB_DIR" | cut -f1)
        print_info "Web 目录大小: $FILE_SIZE"
    else
        print_error "❌ 主页文件不存在: $WEB_DIR/index.html"
        print_info "需要重新构建和部署应用"
    fi
    
    # 检查文件权限
    WEB_USER="nginx"
    if [ -d "/etc/nginx/sites-available" ]; then
        WEB_USER="www-data"
    fi
    
    print_info "检查文件权限..."
    OWNER=$(stat -c '%U:%G' "$WEB_DIR" 2>/dev/null || echo "无法检测")
    print_info "Web 目录所有者: $OWNER"
    
    if [[ "$OWNER" == *"$WEB_USER"* ]]; then
        print_success "✅ 文件权限正确"
    else
        print_warning "⚠️ 文件权限可能有问题，尝试修复..."
        chown -R $WEB_USER:$WEB_USER "$WEB_DIR"
        chmod -R 755 "$WEB_DIR"
        print_success "✅ 文件权限已修复"
    fi
else
    print_error "❌ Web 目录不存在: $WEB_DIR"
    print_info "需要重新部署应用"
fi

# 5. 本地连接测试
print_step "5. 本地连接测试"

print_info "测试本地 HTTP 连接..."
LOCAL_HTTP=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 http://localhost/ 2>/dev/null || echo "000")
print_info "本地 HTTP 状态码: $LOCAL_HTTP"

if [ "$LOCAL_HTTP" = "200" ] || [ "$LOCAL_HTTP" = "301" ] || [ "$LOCAL_HTTP" = "302" ]; then
    print_success "✅ 本地 HTTP 连接正常"
else
    print_error "❌ 本地 HTTP 连接异常"
fi

print_info "测试本地 HTTPS 连接..."
LOCAL_HTTPS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 -k https://localhost/ 2>/dev/null || echo "000")
print_info "本地 HTTPS 状态码: $LOCAL_HTTPS"

if [ "$LOCAL_HTTPS" = "200" ] || [ "$LOCAL_HTTPS" = "301" ] || [ "$LOCAL_HTTPS" = "302" ]; then
    print_success "✅ 本地 HTTPS 连接正常"
else
    print_warning "⚠️ 本地 HTTPS 连接异常"
fi

# 6. 外部连接测试
print_step "6. 外部连接测试"

print_info "测试外部 HTTP 连接..."
EXTERNAL_HTTP=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 http://$DOMAIN_NAME/ 2>/dev/null || echo "000")
print_info "外部 HTTP 状态码: $EXTERNAL_HTTP"

print_info "测试外部 HTTPS 连接..."
EXTERNAL_HTTPS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 https://$DOMAIN_NAME/ 2>/dev/null || echo "000")
print_info "外部 HTTPS 状态码: $EXTERNAL_HTTPS"

# 7. 阿里云特定检查
print_step "7. 阿里云ECS特定检查"

print_info "检查是否为阿里云ECS..."
if curl -s --max-time 3 http://100.100.100.200/latest/meta-data/instance-id &> /dev/null; then
    INSTANCE_ID=$(curl -s --max-time 3 http://100.100.100.200/latest/meta-data/instance-id)
    print_success "✅ 确认为阿里云ECS实例: $INSTANCE_ID"
    
    # 获取更多元数据
    REGION=$(curl -s --max-time 3 http://100.100.100.200/latest/meta-data/region-id 2>/dev/null || echo "未知")
    ZONE=$(curl -s --max-time 3 http://100.100.100.200/latest/meta-data/zone-id 2>/dev/null || echo "未知")
    print_info "区域: $REGION, 可用区: $ZONE"
    
    print_warning "⚠️ 请检查阿里云ECS安全组设置!"
    echo ""
    echo "🔧 阿里云安全组配置步骤:"
    echo "1. 登录阿里云控制台: https://ecs.console.aliyun.com"
    echo "2. 找到实例: $INSTANCE_ID"
    echo "3. 点击'安全组配置'"
    echo "4. 确保以下入方向规则存在:"
    echo "   - 协议类型: TCP, 端口范围: 80/80, 授权对象: 0.0.0.0/0"
    echo "   - 协议类型: TCP, 端口范围: 443/443, 授权对象: 0.0.0.0/0"
    echo "5. 如果规则不存在，点击'添加规则'进行添加"
    
else
    print_info "非阿里云ECS或元数据服务不可用"
fi

# 8. SELinux 检查
print_step "8. SELinux 安全策略检查"

if command -v getenforce &> /dev/null; then
    SELINUX_STATUS=$(getenforce)
    print_info "SELinux 状态: $SELINUX_STATUS"
    
    if [ "$SELINUX_STATUS" = "Enforcing" ]; then
        print_warning "⚠️ SELinux 处于强制模式，可能阻止网络访问"
        
        # 检查 httpd 网络连接权限
        HTTPD_NETWORK=$(getsebool httpd_can_network_connect 2>/dev/null | cut -d' ' -f3 || echo "未知")
        print_info "httpd_can_network_connect: $HTTPD_NETWORK"
        
        if [ "$HTTPD_NETWORK" = "off" ]; then
            print_info "启用 httpd 网络连接..."
            setsebool -P httpd_can_network_connect on
            print_success "✅ SELinux httpd 网络权限已启用"
        fi
        
        # 设置正确的 SELinux 上下文
        if [ -d "$WEB_DIR" ]; then
            print_info "设置 Web 目录的 SELinux 上下文..."
            restorecon -Rv "$WEB_DIR"
            print_success "✅ SELinux 上下文已更新"
        fi
    fi
else
    print_info "系统未安装 SELinux"
fi

# 9. 生成修复报告
print_step "9. 问题诊断总结"

echo ""
print_info "🔍 诊断结果总结:"
echo ""

# 汇总问题
ISSUES=()

if [ "$LOCAL_HTTP" != "200" ] && [ "$LOCAL_HTTP" != "301" ] && [ "$LOCAL_HTTP" != "302" ]; then
    ISSUES+=("本地HTTP连接异常")
fi

if [ "$EXTERNAL_HTTP" = "403" ] || [ "$EXTERNAL_HTTPS" = "403" ]; then
    ISSUES+=("外部访问被禁止(403错误)")
fi

if [ "$EXTERNAL_HTTP" = "000" ] && [ "$EXTERNAL_HTTPS" = "000" ]; then
    ISSUES+=("无法建立外部连接")
fi

if [ ! -f "$WEB_DIR/index.html" ]; then
    ISSUES+=("应用文件缺失")
fi

if [ ${#ISSUES[@]} -eq 0 ]; then
    print_success "🎉 未发现明显问题，服务器配置正常!"
    echo ""
    print_info "如果仍然无法访问，请检查:"
    echo "1. 阿里云ECS安全组设置"
    echo "2. 域名DNS配置"
    echo "3. 可能的DDoS防护或WAF设置"
else
    print_warning "⚠️ 发现以下问题:"
    for issue in "${ISSUES[@]}"; do
        echo "   - $issue"
    done
    echo ""
    print_info "🔧 建议的修复步骤:"
    echo ""
    
    if [[ " ${ISSUES[@]} " =~ " 外部访问被禁止(403错误) " ]] || [[ " ${ISSUES[@]} " =~ " 无法建立外部连接 " ]]; then
        echo "1. 🚨 立即检查阿里云ECS安全组:"
        echo "   https://ecs.console.aliyun.com"
        echo "   确保开放 80 和 443 端口"
        echo ""
    fi
    
    if [[ " ${ISSUES[@]} " =~ " 应用文件缺失 " ]]; then
        echo "2. 📁 重新部署应用:"
        echo "   cd /path/to/project && npm run build"
        echo "   sudo cp -r dist/* $WEB_DIR/"
        echo ""
    fi
    
    if [[ " ${ISSUES[@]} " =~ " 本地HTTP连接异常 " ]]; then
        echo "3. 🔧 检查Nginx配置:"
        echo "   sudo nginx -t"
        echo "   sudo systemctl restart nginx"
        echo ""
    fi
fi

echo ""
print_success "✅ 诊断完成!"
print_info "📞 如需进一步协助，请提供此诊断报告"
