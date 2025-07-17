#!/bin/bash

# 多应用快速部署脚本
# 为 AlmaLinux 9.5 批量部署多个 React 应用到不同二级域名

set -e

# 颜色定义
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[0;33m'
NC='\033[0m'

print_info() {
    echo -e "${BLUE}[信息]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[成功]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[提示]${NC} $1"
}

echo "=============================================="
echo "🚀 多应用快速部署工具"
echo "=============================================="
echo ""

# 应用配置列表
APPS=(
    "todo.ylingtech.com:todo-app:React Todo 应用"
    "blog.ylingtech.com:blog-app:博客应用"
    "docs.ylingtech.com:docs-app:文档应用"
    "admin.ylingtech.com:admin-app:管理后台"
)

print_info "可部署的应用列表:"
echo ""

for i in "${!APPS[@]}"; do
    IFS=':' read -r domain app_name description <<< "${APPS[$i]}"
    echo "  $((i+1)). $description"
    echo "     域名: $domain"
    echo "     应用: $app_name"
    echo ""
done

echo "选择部署选项:"
echo "  a) 部署所有应用"
echo "  s) 选择特定应用"
echo "  c) 自定义应用配置"
echo "  q) 退出"
echo ""

read -p "请选择 [a/s/c/q]: " choice

case $choice in
    a|A)
        print_info "开始部署所有应用..."
        for app_config in "${APPS[@]}"; do
            IFS=':' read -r domain app_name description <<< "$app_config"
            print_info "部署 $description ($domain)..."
            ./almalinux-deploy.sh -d "$domain" -a "$app_name"
            echo ""
        done
        ;;
    s|S)
        echo "请选择要部署的应用编号 (用空格分隔，例如: 1 3):"
        read -p "编号: " -a selections
        
        for selection in "${selections[@]}"; do
            if [[ "$selection" =~ ^[0-9]+$ ]] && [ "$selection" -ge 1 ] && [ "$selection" -le "${#APPS[@]}" ]; then
                app_config="${APPS[$((selection-1))]}"
                IFS=':' read -r domain app_name description <<< "$app_config"
                print_info "部署 $description ($domain)..."
                ./almalinux-deploy.sh -d "$domain" -a "$app_name"
                echo ""
            else
                print_warning "跳过无效选择: $selection"
            fi
        done
        ;;
    c|C)
        print_info "自定义应用配置"
        read -p "请输入域名: " custom_domain
        read -p "请输入应用名称: " custom_app
        
        if [ -n "$custom_domain" ] && [ -n "$custom_app" ]; then
            print_info "部署自定义应用 $custom_app ($custom_domain)..."
            ./almalinux-deploy.sh -d "$custom_domain" -a "$custom_app"
        else
            print_warning "域名和应用名称不能为空"
        fi
        ;;
    q|Q)
        print_info "退出部署工具"
        exit 0
        ;;
    *)
        print_warning "无效选择: $choice"
        exit 1
        ;;
esac

print_success "部署任务完成！"

echo ""
echo "=============================================="
print_info "📋 部署后续步骤:"
echo "=============================================="
echo "1. 配置 DNS 记录，将域名指向服务器 IP"
echo "2. 获取 SSL 证书:"
echo "   sudo dnf install -y certbot python3-certbot-nginx"
echo "   sudo certbot --nginx -d your-domain.com"
echo ""
echo "3. 检查服务状态:"
echo "   sudo systemctl status nginx"
echo "   sudo nginx -t"
echo ""
echo "4. 查看日志:"
echo "   sudo tail -f /var/log/nginx/app-name-access.log"
echo "   sudo tail -f /var/log/nginx/app-name-error.log"
echo "=============================================="
