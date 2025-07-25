#!/bin/bash

# 准备独立部署文件脚本
# 用于在本地准备部署所需的文件，方便上传到服务器

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

echo "📦 准备独立部署文件"
echo "时间: $(date)"
echo ""

# 检查当前目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

print_info "项目根目录: $PROJECT_ROOT"
print_info "脚本目录: $SCRIPT_DIR"

# 检查是否在正确的位置
if [[ "$SCRIPT_DIR" != *"/deploy" ]]; then
    print_error "❌ 脚本必须在 deploy 目录中执行"
    exit 1
fi

# 检查 dist 目录
DIST_DIR="$PROJECT_ROOT/dist"
if [ ! -d "$DIST_DIR" ]; then
    print_warning "⚠️ 未找到 dist 目录，正在构建..."
    
    cd "$PROJECT_ROOT"
    
    # 检查 package.json
    if [ ! -f "package.json" ]; then
        print_error "❌ 未找到 package.json 文件"
        exit 1
    fi
    
    # 检查 node_modules
    if [ ! -d "node_modules" ]; then
        print_info "安装依赖..."
        npm install
    fi
    
    # 构建项目
    print_info "构建项目..."
    npm run build
    
    if [ ! -d "$DIST_DIR" ]; then
        print_error "❌ 构建失败，未生成 dist 目录"
        exit 1
    fi
    
    print_success "✅ 项目构建完成"
else
    print_success "✅ 找到 dist 目录"
fi

# 检查构建文件
if [ ! -f "$DIST_DIR/index.html" ]; then
    print_error "❌ 构建文件不完整，缺少 index.html"
    exit 1
fi

DIST_SIZE=$(du -sh "$DIST_DIR" | cut -f1)
print_info "构建目录大小: $DIST_SIZE"

# 创建部署包目录
DEPLOY_PACKAGE_DIR="$PROJECT_ROOT/deploy-package"
print_info "创建部署包目录: $DEPLOY_PACKAGE_DIR"

rm -rf "$DEPLOY_PACKAGE_DIR"
mkdir -p "$DEPLOY_PACKAGE_DIR"

# 复制必要的部署文件
print_info "复制部署脚本..."
mkdir -p "$DEPLOY_PACKAGE_DIR/deploy"

# 只复制独立部署需要的文件
cp "$SCRIPT_DIR/standalone-deploy.sh" "$DEPLOY_PACKAGE_DIR/deploy/"
cp "$SCRIPT_DIR/STANDALONE_DEPLOY.md" "$DEPLOY_PACKAGE_DIR/deploy/"

# 复制修复脚本（如果存在）
if [ -f "$SCRIPT_DIR/fix-nginx-config.sh" ]; then
    cp "$SCRIPT_DIR/fix-nginx-config.sh" "$DEPLOY_PACKAGE_DIR/deploy/"
fi

# 复制 nginx 配置目录（如果存在）
if [ -d "$SCRIPT_DIR/nginx" ]; then
    cp -r "$SCRIPT_DIR/nginx" "$DEPLOY_PACKAGE_DIR/deploy/"
fi

# 复制 dist 目录
print_info "复制构建文件..."
cp -r "$DIST_DIR" "$DEPLOY_PACKAGE_DIR/"

# 创建部署说明文件
print_info "生成部署说明..."
cat > "$DEPLOY_PACKAGE_DIR/README.md" << 'EOF'
# React Todo App 部署包

## 📋 部署说明

这是一个独立的部署包，包含了部署 React Todo App 所需的所有文件。

## 📁 目录结构

```
deploy-package/
├── deploy/
│   ├── standalone-deploy.sh      # 独立部署脚本
│   ├── STANDALONE_DEPLOY.md      # 详细使用指南
│   └── prepare-standalone-deploy.sh
└── dist/
    ├── index.html
    ├── assets/
    └── ...
```

## 🚀 快速部署

### 1. 上传到服务器
```bash
# 将整个 deploy-package 目录上传到服务器
scp -r deploy-package/ root@your-server-ip:/tmp/react-todo-deploy/
```

### 2. 执行部署
```bash
# 连接服务器
ssh root@your-server-ip

# 进入部署目录
cd /tmp/react-todo-deploy

# 执行部署脚本
sudo ./deploy/standalone-deploy.sh
```

## 📖 详细说明

请查看 `deploy/STANDALONE_DEPLOY.md` 获取详细的部署指南。

## ⚙️ 配置修改

如需修改域名或其他配置，请编辑 `deploy/standalone-deploy.sh` 文件中的配置变量：

```bash
DOMAIN_NAME="todo.ylingtech.com"  # 修改为您的域名
APP_NAME="todo-app"               # 修改应用名称
WEB_DIR="/var/www/$APP_NAME"      # 修改 Web 目录
```

## 🔧 故障排除

如果部署过程中遇到问题，请：

1. 检查服务器权限（需要 root 权限）
2. 确保网络连接正常
3. 检查阿里云 ECS 安全组设置（如果使用阿里云）
4. 查看详细的部署日志

## 📞 技术支持

如需技术支持，请提供：
- 操作系统版本
- 部署脚本执行日志
- 错误信息截图
EOF

# 创建快速部署脚本
print_info "生成快速部署脚本..."
cat > "$DEPLOY_PACKAGE_DIR/quick-deploy.sh" << 'EOF'
#!/bin/bash

# 快速部署脚本
# 用于在服务器上快速执行部署

echo "🚀 React Todo App 快速部署"
echo "时间: $(date)"
echo ""

# 检查权限
if [ "$EUID" -ne 0 ]; then
    echo "❌ 此脚本需要 root 权限运行"
    echo "请使用: sudo $0"
    exit 1
fi

# 检查文件结构
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [ ! -f "$SCRIPT_DIR/deploy/standalone-deploy.sh" ]; then
    echo "❌ 未找到部署脚本"
    echo "请确保在正确的目录中执行此脚本"
    exit 1
fi

if [ ! -d "$SCRIPT_DIR/dist" ]; then
    echo "❌ 未找到构建文件"
    echo "请确保 dist 目录存在"
    exit 1
fi

echo "✅ 文件检查通过，开始部署..."
echo ""

# 执行部署脚本
exec "$SCRIPT_DIR/deploy/standalone-deploy.sh" "$@"
EOF

chmod +x "$DEPLOY_PACKAGE_DIR/quick-deploy.sh"

# 生成压缩包
print_info "生成压缩包..."
cd "$PROJECT_ROOT"
PACKAGE_NAME="react-todo-deploy-$(date +%Y%m%d-%H%M%S).tar.gz"
tar -czf "$PACKAGE_NAME" -C deploy-package .

PACKAGE_SIZE=$(du -sh "$PACKAGE_NAME" | cut -f1)
print_success "✅ 压缩包已生成: $PACKAGE_NAME ($PACKAGE_SIZE)"

# 显示部署包信息
echo ""
print_success "🎉 部署包准备完成!"
echo ""
print_info "📁 部署包目录: $DEPLOY_PACKAGE_DIR"
print_info "📦 压缩包文件: $PACKAGE_NAME"
print_info "📊 压缩包大小: $PACKAGE_SIZE"
echo ""

print_info "📋 部署包内容:"
echo "   📁 deploy/               - 部署脚本和配置"
echo "   📁 dist/                 - 构建后的应用文件"
echo "   📄 README.md             - 部署说明"
echo "   🚀 quick-deploy.sh       - 快速部署脚本"
echo ""

print_info "🚀 下一步操作:"
echo ""
echo "方式1 - 使用目录:"
echo "   scp -r $DEPLOY_PACKAGE_DIR/ root@your-server-ip:/tmp/react-todo-deploy/"
echo "   ssh root@your-server-ip"
echo "   cd /tmp/react-todo-deploy && sudo ./quick-deploy.sh"
echo ""
echo "方式2 - 使用压缩包:"
echo "   scp $PACKAGE_NAME root@your-server-ip:/tmp/"
echo "   ssh root@your-server-ip"
echo "   cd /tmp && tar -xzf $PACKAGE_NAME && sudo ./quick-deploy.sh"
echo ""

print_success "✅ 准备完成，可以开始部署了!"
