#!/bin/bash

# 应用更新检测 - 版本信息生成脚本
# 在构建时生成版本信息文件

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

# 获取项目信息
PACKAGE_FILE="package.json"
VERSION_FILE="public/version.json"

print_info "生成应用版本信息文件..."

# 检查package.json是否存在
if [ ! -f "$PACKAGE_FILE" ]; then
    echo "❌ 错误: 找不到 package.json 文件"
    exit 1
fi

# 从package.json获取版本信息
VERSION=$(grep '"version"' package.json | cut -d'"' -f4)
NAME=$(grep '"name"' package.json | cut -d'"' -f4)

# 获取Git信息（如果可用）
GIT_HASH=""
GIT_BRANCH=""
GIT_TAG=""

if command -v git &> /dev/null && [ -d .git ]; then
    GIT_HASH=$(git rev-parse --short HEAD 2>/dev/null || echo "")
    GIT_BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "")
    GIT_TAG=$(git describe --tags --exact-match 2>/dev/null || echo "")
fi

# 生成构建信息
BUILD_TIME=$(date -u +"%Y-%m-%dT%H:%M:%S.%3NZ")
BUILD_TIMESTAMP=$(date +%s)
BUILD_HASH=$(echo "${BUILD_TIME}${VERSION}${GIT_HASH}" | shasum -a 256 | cut -c1-12)

# 创建public目录（如果不存在）
mkdir -p public

# 生成版本信息JSON
cat > "$VERSION_FILE" << EOF
{
  "name": "$NAME",
  "version": "$VERSION",
  "buildTime": "$BUILD_TIME",
  "buildTimestamp": $BUILD_TIMESTAMP,
  "buildHash": "$BUILD_HASH",
  "git": {
    "hash": "$GIT_HASH",
    "branch": "$GIT_BRANCH",
    "tag": "$GIT_TAG"
  },
  "environment": {
    "node": "$(node --version 2>/dev/null || echo 'unknown')",
    "npm": "$(npm --version 2>/dev/null || echo 'unknown')"
  },
  "timestamp": $BUILD_TIMESTAMP
}
EOF

print_success "✅ 版本信息文件已生成: $VERSION_FILE"

# 显示生成的信息
print_info "版本信息详情:"
echo "  📦 应用名称: $NAME"
echo "  🏷️  版本号: $VERSION"
echo "  🕒 构建时间: $BUILD_TIME"
echo "  🔗 构建哈希: $BUILD_HASH"

if [ -n "$GIT_HASH" ]; then
    echo "  🌿 Git分支: $GIT_BRANCH"
    echo "  📝 Git提交: $GIT_HASH"
    if [ -n "$GIT_TAG" ]; then
        echo "  🏷️  Git标签: $GIT_TAG"
    fi
fi

echo ""

# 创建环境变量文件供Vite使用
ENV_FILE=".env.local"
print_info "更新环境变量文件..."

# 备份现有的.env.local（如果存在）
if [ -f "$ENV_FILE" ]; then
    # 创建临时文件，移除所有版本相关的内容（包括注释和变量）
    awk '
    BEGIN { in_version_block = 0 }
    /^# 应用版本信息 \(自动生成\)$/ { in_version_block = 1; next }
    /^VITE_APP_VERSION=|^VITE_BUILD_TIME=|^VITE_BUILD_HASH=|^VITE_GIT_HASH=/ {
        if (in_version_block) next
        else next
    }
    /^$/ && in_version_block { next }
    {
        if (in_version_block && !/^VITE_/) in_version_block = 0
        if (!in_version_block) print
    }
    ' "$ENV_FILE" > "${ENV_FILE}.tmp"

    # 移除末尾的空行
    if [ -f "${ENV_FILE}.tmp" ]; then
        awk 'NF {p=1} p' "${ENV_FILE}.tmp" > "${ENV_FILE}.clean"
        mv "${ENV_FILE}.clean" "$ENV_FILE"
        rm -f "${ENV_FILE}.tmp"
    fi
fi

# 添加新的版本变量
# 确保文件末尾有且仅有一个空行，然后添加版本信息
if [ -s "$ENV_FILE" ]; then
    # 如果文件不为空，确保末尾有一个空行
    if [ "$(tail -c1 "$ENV_FILE" | wc -l)" -eq 0 ]; then
        echo "" >> "$ENV_FILE"
    fi
fi

cat >> "$ENV_FILE" << EOF
# 应用版本信息 (自动生成)
VITE_APP_VERSION=$VERSION
VITE_BUILD_TIME=$BUILD_TIME
VITE_BUILD_HASH=$BUILD_HASH
VITE_GIT_HASH=$GIT_HASH
EOF

print_success "✅ 环境变量已更新: $ENV_FILE"

# 生成版本常量文件
CONSTANTS_DIR="src/constants"
VERSION_CONSTANTS_FILE="$CONSTANTS_DIR/version.js"

mkdir -p "$CONSTANTS_DIR"

cat > "$VERSION_CONSTANTS_FILE" << EOF
// 应用版本信息常量 (自动生成，请勿手动修改)
// 生成时间: $BUILD_TIME

export const APP_VERSION = '$VERSION';
export const BUILD_TIME = '$BUILD_TIME';
export const BUILD_HASH = '$BUILD_HASH';
export const BUILD_TIMESTAMP = $BUILD_TIMESTAMP;

export const GIT_INFO = {
  hash: '$GIT_HASH',
  branch: '$GIT_BRANCH',
  tag: '$GIT_TAG'
};

export const VERSION_INFO = {
  name: '$NAME',
  version: '$VERSION',
  buildTime: '$BUILD_TIME',
  buildHash: '$BUILD_HASH',
  buildTimestamp: $BUILD_TIMESTAMP,
  git: GIT_INFO
};

// 设置全局变量供应用使用
if (typeof window !== 'undefined') {
  window.__APP_VERSION__ = '$VERSION';
  window.__BUILD_HASH__ = '$BUILD_HASH';
  window.__BUILD_TIME__ = '$BUILD_TIME';
}
EOF

print_success "✅ 版本常量文件已生成: $VERSION_CONSTANTS_FILE"

print_warning "💡 使用提示:"
echo "  1. 在构建前运行此脚本: ./scripts/generate-version.sh"
echo "  2. 或将其集成到package.json的构建脚本中"
echo "  3. 部署时确保version.json文件包含在构建输出中"

echo ""
print_success "🎉 版本信息生成完成！"
