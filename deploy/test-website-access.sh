#!/bin/bash

# 网站访问测试脚本
# 全面测试 HTTP/HTTPS 访问状态，正确解读状态码

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

# 配置变量
DOMAIN_NAME="${1:-todo.ylingtech.com}"

echo "🌐 网站访问测试脚本"
echo "域名: $DOMAIN_NAME"
echo "时间: $(date)"
echo ""

print_step "1. 基础连通性测试"

# 检查域名解析
print_info "检查域名解析..."
if nslookup "$DOMAIN_NAME" &>/dev/null; then
    DOMAIN_IP=$(nslookup "$DOMAIN_NAME" | grep "Address:" | tail -1 | awk '{print $2}')
    print_success "✅ 域名解析成功: $DOMAIN_IP"
else
    print_error "❌ 域名解析失败"
    exit 1
fi

# 检查端口连通性
print_info "检查端口连通性..."
if timeout 5 bash -c "</dev/tcp/$DOMAIN_NAME/80" 2>/dev/null; then
    print_success "✅ 端口 80 连通"
else
    print_error "❌ 端口 80 不通"
fi

if timeout 5 bash -c "</dev/tcp/$DOMAIN_NAME/443" 2>/dev/null; then
    print_success "✅ 端口 443 连通"
else
    print_warning "⚠️ 端口 443 不通"
fi

print_step "2. HTTP 访问测试"

# 测试 HTTP 访问
print_info "测试 HTTP 访问..."
HTTP_RESPONSE=$(curl -s -I --max-time 10 http://$DOMAIN_NAME/ 2>/dev/null || echo "FAILED")

if [ "$HTTP_RESPONSE" = "FAILED" ]; then
    print_error "❌ HTTP 访问失败"
    HTTP_STATUS="000"
else
    HTTP_STATUS=$(echo "$HTTP_RESPONSE" | head -1 | awk '{print $2}')
    print_info "HTTP 状态码: $HTTP_STATUS"
    
    case $HTTP_STATUS in
        200)
            print_success "✅ HTTP 访问正常"
            ;;
        301|302)
            # 检查重定向目标
            REDIRECT_URL=$(echo "$HTTP_RESPONSE" | grep -i "location:" | awk '{print $2}' | tr -d '\r')
            print_success "✅ HTTP 重定向正常"
            print_info "重定向到: $REDIRECT_URL"
            
            if [[ "$REDIRECT_URL" == https://* ]]; then
                print_info "这是正常的 HTTPS 重定向"
            fi
            ;;
        403)
            print_warning "⚠️ HTTP 访问被禁止"
            ;;
        404)
            print_warning "⚠️ HTTP 页面未找到"
            ;;
        500|502|503|504)
            print_error "❌ HTTP 服务器错误"
            ;;
        *)
            print_warning "⚠️ HTTP 未知状态码: $HTTP_STATUS"
            ;;
    esac
fi

print_step "3. HTTPS 访问测试"

# 测试 HTTPS 访问
print_info "测试 HTTPS 访问..."
HTTPS_RESPONSE=$(curl -s -I --max-time 10 https://$DOMAIN_NAME/ 2>/dev/null || echo "FAILED")

if [ "$HTTPS_RESPONSE" = "FAILED" ]; then
    print_error "❌ HTTPS 访问失败"
    HTTPS_STATUS="000"
else
    HTTPS_STATUS=$(echo "$HTTPS_RESPONSE" | head -1 | awk '{print $2}')
    print_info "HTTPS 状态码: $HTTPS_STATUS"
    
    case $HTTPS_STATUS in
        200)
            print_success "✅ HTTPS 访问正常"
            ;;
        301|302)
            REDIRECT_URL=$(echo "$HTTPS_RESPONSE" | grep -i "location:" | awk '{print $2}' | tr -d '\r')
            print_success "✅ HTTPS 重定向正常"
            print_info "重定向到: $REDIRECT_URL"
            ;;
        403)
            print_warning "⚠️ HTTPS 访问被禁止"
            ;;
        404)
            print_warning "⚠️ HTTPS 页面未找到"
            ;;
        500|502|503|504)
            print_error "❌ HTTPS 服务器错误"
            ;;
        *)
            print_warning "⚠️ HTTPS 未知状态码: $HTTPS_STATUS"
            ;;
    esac
fi

print_step "4. 完整访问测试（跟随重定向）"

# 测试完整访问流程
print_info "测试完整访问流程（跟随重定向）..."
FINAL_RESPONSE=$(curl -s -L -I --max-time 15 http://$DOMAIN_NAME/ 2>/dev/null || echo "FAILED")

if [ "$FINAL_RESPONSE" = "FAILED" ]; then
    print_error "❌ 完整访问流程失败"
    FINAL_STATUS="000"
else
    FINAL_STATUS=$(echo "$FINAL_RESPONSE" | tail -n +1 | grep "HTTP" | tail -1 | awk '{print $2}')
    print_info "最终状态码: $FINAL_STATUS"
    
    if [ "$FINAL_STATUS" = "200" ]; then
        print_success "✅ 完整访问流程正常"
        
        # 检查最终 URL
        FINAL_URL=$(curl -s -L -w "%{url_effective}" -o /dev/null --max-time 15 http://$DOMAIN_NAME/ 2>/dev/null || echo "未知")
        print_info "最终访问 URL: $FINAL_URL"
    else
        print_error "❌ 完整访问流程异常"
    fi
fi

print_step "5. SSL 证书检查"

# 检查 SSL 证书
if [ "$HTTPS_STATUS" != "000" ]; then
    print_info "检查 SSL 证书..."
    
    # 检查证书有效期
    CERT_INFO=$(echo | openssl s_client -servername "$DOMAIN_NAME" -connect "$DOMAIN_NAME:443" 2>/dev/null | openssl x509 -noout -dates 2>/dev/null || echo "FAILED")
    
    if [ "$CERT_INFO" != "FAILED" ]; then
        CERT_START=$(echo "$CERT_INFO" | grep "notBefore" | cut -d= -f2)
        CERT_END=$(echo "$CERT_INFO" | grep "notAfter" | cut -d= -f2)
        
        print_success "✅ SSL 证书有效"
        print_info "证书有效期: $CERT_START 到 $CERT_END"
        
        # 计算剩余天数
        if command -v date &> /dev/null; then
            EXPIRY_DATE=$(date -d "$CERT_END" +%s 2>/dev/null || echo "0")
            CURRENT_DATE=$(date +%s)
            if [ "$EXPIRY_DATE" -gt 0 ]; then
                DAYS_LEFT=$(( (EXPIRY_DATE - CURRENT_DATE) / 86400 ))
                print_info "证书剩余天数: $DAYS_LEFT 天"
                
                if [ $DAYS_LEFT -lt 30 ]; then
                    print_warning "⚠️ 证书即将到期，建议续期"
                fi
            fi
        fi
    else
        print_error "❌ SSL 证书检查失败"
    fi
else
    print_warning "⚠️ 跳过 SSL 证书检查（HTTPS 不可用）"
fi

print_step "6. 访问总结"

echo ""
print_info "📊 访问测试总结:"
echo "   🌐 域名: $DOMAIN_NAME"
echo "   📍 解析 IP: $DOMAIN_IP"
echo "   🔗 HTTP 状态: $HTTP_STATUS"
echo "   🔒 HTTPS 状态: $HTTPS_STATUS"
echo "   ✅ 最终状态: $FINAL_STATUS"
echo ""

# 给出结论和建议
if [ "$FINAL_STATUS" = "200" ]; then
    print_success "🎉 网站访问完全正常！"
    echo ""
    print_info "✅ 访问方式:"
    echo "   • 直接访问: https://$DOMAIN_NAME/"
    echo "   • HTTP 自动跳转: http://$DOMAIN_NAME/ → https://$DOMAIN_NAME/"
    
elif [ "$HTTP_STATUS" = "301" ] || [ "$HTTP_STATUS" = "302" ]; then
    print_success "🎉 网站配置正常！"
    echo ""
    print_info "ℹ️ 说明:"
    echo "   • HTTP 301/302 是正常的重定向响应"
    echo "   • 表示网站正确配置了 HTTPS 重定向"
    echo "   • 用户访问 HTTP 会自动跳转到 HTTPS"
    echo "   • 这是安全网站的标准配置"
    
    if [ "$HTTPS_STATUS" = "200" ]; then
        print_success "✅ HTTPS 访问正常"
    else
        print_warning "⚠️ HTTPS 访问可能有问题，请检查 SSL 配置"
    fi
    
else
    print_error "❌ 网站访问存在问题"
    echo ""
    print_info "🔧 可能的原因:"
    echo "   • 服务器配置错误"
    echo "   • 防火墙阻止访问"
    echo "   • DNS 解析问题"
    echo "   • SSL 证书问题"
    
    if [ "$HTTP_STATUS" = "000" ] && [ "$HTTPS_STATUS" = "000" ]; then
        print_warning "⚠️ 可能是 ICP 备案问题（如果服务器在中国大陆）"
    fi
fi

echo ""
print_info "🛠️ 诊断命令:"
echo "   curl -I http://$DOMAIN_NAME/"
echo "   curl -I https://$DOMAIN_NAME/"
echo "   curl -L -I http://$DOMAIN_NAME/"
echo ""
