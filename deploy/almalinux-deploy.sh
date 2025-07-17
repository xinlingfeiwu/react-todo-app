#!/bin/bash

# AlmaLinux 9.5 部署脚本
# 针对现代 Linux 发行版和 Node.js 18+ 优化

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

print_step "开始 React Todo App 在 AlmaLinux 9.5 上的部署..."

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

# 6. Nginx 配置（如果需要）
print_step "检查 Web 服务器配置..."
if command -v nginx &> /dev/null; then
    print_info "检测到 Nginx"
    
    # 创建 Nginx 配置
    NGINX_CONFIG="/etc/nginx/conf.d/react-todo.conf"
    if [ ! -f "$NGINX_CONFIG" ]; then
        print_info "创建 Nginx 配置文件..."
        
        sudo tee "$NGINX_CONFIG" > /dev/null << 'EOF'
server {
    listen 80;
    server_name localhost;
    
    root /var/www/react-todo-app/dist;
    index index.html;
    
    # 处理单页应用路由
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # 静态资源缓存
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Gzip 压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    
    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
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
    fi
elif command -v httpd &> /dev/null; then
    print_info "检测到 Apache HTTP Server"
    print_warning "请手动配置 Apache 以服务于 React 应用"
else
    print_warning "未检测到 Web 服务器，请手动配置"
fi

# 7. 部署到 Web 目录
print_step "部署到 Web 目录..."
WEB_DIR="/var/www/react-todo-app"

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

print_success "部署完成"

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
print_success "🎉 React Todo App 部署完成！"
echo "=============================================="
print_info "Web 目录: $WEB_DIR"
print_info "Nginx 配置: $NGINX_CONFIG"
print_info "Node.js 版本: $(node --version)"
print_info "构建大小: $BUILD_SIZE"
echo ""
print_info "访问应用: http://your-server-ip/"
print_info "如需 HTTPS，请配置 SSL 证书"
echo ""
print_info "部署日志已记录，检查 Nginx 状态:"
print_info "  sudo systemctl status nginx"
print_info "  sudo nginx -t"
echo "=============================================="
