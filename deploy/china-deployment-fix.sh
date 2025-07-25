#!/bin/bash

# 中国大陆部署环境适配脚本
# 解决 ICP 备案、网络访问等中国特有问题

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

echo "🇨🇳 中国大陆部署环境适配脚本"
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

print_step "1. 中国大陆网络环境检测"

# 检测服务器位置
print_info "检测服务器地理位置..."
SERVER_IP=$(curl -s --max-time 10 ifconfig.me 2>/dev/null || echo "未知")
print_info "服务器公网 IP: $SERVER_IP"

# 检测是否在中国大陆
if curl -s --max-time 10 "http://ip-api.com/json/$SERVER_IP" | grep -q '"country":"China"'; then
    IN_CHINA=true
    print_warning "⚠️ 检测到服务器位于中国大陆"
else
    IN_CHINA=false
    print_info "服务器位于海外"
fi

print_step "2. ICP 备案状态检查"

# 检查域名 ICP 备案状态
print_info "检查域名 ICP 备案状态..."
ICP_CHECK_URL="http://icp.chinaz.com/$DOMAIN_NAME"
print_info "可以访问以下网址查询备案状态: $ICP_CHECK_URL"

# 尝试解析域名
print_info "检查域名 DNS 解析..."
if nslookup "$DOMAIN_NAME" &>/dev/null; then
    DOMAIN_IP=$(nslookup "$DOMAIN_NAME" | grep "Address:" | tail -1 | awk '{print $2}')
    print_info "域名解析 IP: $DOMAIN_IP"
    
    if [ "$DOMAIN_IP" = "$SERVER_IP" ]; then
        print_success "✅ 域名解析指向当前服务器"
    else
        print_warning "⚠️ 域名解析不指向当前服务器"
    fi
else
    print_error "❌ 域名解析失败"
fi

print_step "3. 网络连通性测试"

# 测试国内网络连通性
print_info "测试国内主要网站连通性..."

# 测试百度
if curl -s --max-time 5 http://www.baidu.com &>/dev/null; then
    print_success "✅ 百度连通正常"
    BAIDU_OK=true
else
    print_error "❌ 百度连通失败"
    BAIDU_OK=false
fi

# 测试阿里云
if curl -s --max-time 5 http://www.aliyun.com &>/dev/null; then
    print_success "✅ 阿里云连通正常"
    ALIYUN_OK=true
else
    print_error "❌ 阿里云连通失败"
    ALIYUN_OK=false
fi

print_step "4. 部署建议和解决方案"

echo ""
print_info "🔍 环境分析结果:"

if [ "$IN_CHINA" = true ]; then
    echo "   📍 服务器位置: 中国大陆"
    echo "   🏛️  需要 ICP 备案: 是"
    echo "   🌐 访问限制: 域名必须完成 ICP 备案才能正常访问"
    echo ""
    
    print_warning "⚠️ 重要提醒: 在中国大陆部署需要完成以下步骤:"
    echo ""
    echo "📋 ICP 备案流程:"
    echo "   1. 选择备案服务商 (阿里云、腾讯云、华为云等)"
    echo "   2. 准备备案材料:"
    echo "      • 营业执照 (企业) 或身份证 (个人)"
    echo "      • 域名证书"
    echo "      • 服务器购买凭证"
    echo "      • 网站负责人身份证"
    echo "   3. 提交备案申请"
    echo "   4. 等待审核 (7-20 个工作日)"
    echo "   5. 备案通过后域名才能正常访问"
    echo ""
    
    print_info "🔧 临时解决方案:"
    echo "   • 使用 IP 地址访问: http://$SERVER_IP/"
    echo "   • 修改本地 hosts 文件进行测试"
    echo "   • 使用内网域名或测试域名"
    echo ""
    
else
    echo "   📍 服务器位置: 海外"
    echo "   🏛️  需要 ICP 备案: 否"
    echo "   🌐 访问限制: 无 (但中国大陆访问可能较慢)"
    echo ""
    
    print_info "🌍 海外部署优势:"
    echo "   ✅ 无需 ICP 备案"
    echo "   ✅ 部署更简单"
    echo "   ✅ 内容限制较少"
    echo ""
    
    print_warning "⚠️ 注意事项:"
    echo "   • 中国大陆用户访问速度可能较慢"
    echo "   • 建议使用 CDN 加速中国大陆访问"
    echo "   • 某些中国大陆网络可能无法访问"
fi

print_step "5. 修复部署脚本的外部测试"

# 修复独立部署脚本中的外部测试逻辑
STANDALONE_SCRIPT="/tmp/react-todo-deploy/deploy/standalone-deploy.sh"
if [ -f "$STANDALONE_SCRIPT" ]; then
    print_info "修复独立部署脚本的外部测试逻辑..."
    
    # 创建修复补丁
    cat > /tmp/china-fix.patch << 'EOF'
# 将外部测试修改为更智能的检测
print_info "测试外部连接..."

# 首先尝试域名访问
EXTERNAL_HTTP=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 http://$DOMAIN_NAME/ 2>/dev/null || echo "000")
print_info "外部 HTTP 状态码: $EXTERNAL_HTTP"

# 如果域名访问失败，尝试 IP 访问
if [ "$EXTERNAL_HTTP" = "000" ]; then
    print_warning "⚠️ 域名访问失败，尝试 IP 访问..."
    SERVER_IP=$(curl -s --max-time 5 ifconfig.me 2>/dev/null || echo "")
    if [ -n "$SERVER_IP" ]; then
        IP_HTTP=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 http://$SERVER_IP/ 2>/dev/null || echo "000")
        print_info "IP 访问状态码: $IP_HTTP"
        
        if [ "$IP_HTTP" = "200" ]; then
            print_success "✅ IP 访问正常: http://$SERVER_IP/"
            print_warning "⚠️ 域名访问失败可能是由于:"
            echo "   1. ICP 备案问题 (中国大陆)"
            echo "   2. DNS 解析问题"
            echo "   3. 防火墙或安全组配置"
        fi
    fi
fi
EOF
    
    print_success "✅ 外部测试逻辑修复补丁已创建"
fi

print_step "6. 实用工具和命令"

echo ""
print_info "🛠️ 常用诊断命令:"
echo ""
echo "# 检查域名解析"
echo "nslookup $DOMAIN_NAME"
echo ""
echo "# 检查服务器 IP"
echo "curl ifconfig.me"
echo ""
echo "# 测试 IP 直接访问"
echo "curl -I http://$SERVER_IP/"
echo ""
echo "# 检查 Nginx 状态"
echo "systemctl status nginx"
echo ""
echo "# 查看 Nginx 访问日志"
echo "tail -f /var/log/nginx/$APP_NAME-access.log"
echo ""
echo "# 查看 Nginx 错误日志"
echo "tail -f /var/log/nginx/$APP_NAME-error.log"
echo ""

print_info "🔗 有用的在线工具:"
echo "   • ICP 备案查询: http://icp.chinaz.com/"
echo "   • 域名解析检测: http://tool.chinaz.com/dns/"
echo "   • 网站速度测试: http://tool.chinaz.com/speedtest/"
echo "   • IP 地理位置查询: http://ip-api.com/"
echo ""

if [ "$IN_CHINA" = true ]; then
    print_warning "📢 中国大陆部署重要提醒:"
    echo "   1. 完成 ICP 备案是合规运营的必要条件"
    echo "   2. 未备案域名无法在中国大陆正常访问"
    echo "   3. 建议联系云服务商获取备案支持"
    echo "   4. 备案期间可以使用 IP 地址进行测试"
fi

echo ""
print_success "🎉 中国大陆部署环境检测完成！"
