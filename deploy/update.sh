#!/bin/bash

# React Todo 应用更新脚本
# 用于快速更新已部署的应用

set -e

# 颜色定义
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[0;33m'
NC='\033[0m'

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

APP_NAME="todo-app"
APP_DIR="/var/www/${APP_NAME}"
BACKUP_DIR="/var/backups/${APP_NAME}"

print_info "开始更新 React Todo 应用..."

# 1. 检查 dist 目录
if [ ! -d "./dist" ]; then
    print_warning "未找到 dist 目录，开始构建..."
    npm run build
fi

# 2. 创建备份
print_info "创建当前版本备份..."
sudo mkdir -p ${BACKUP_DIR}
BACKUP_NAME="backup-$(date +%Y%m%d-%H%M%S)"
sudo cp -r ${APP_DIR} ${BACKUP_DIR}/${BACKUP_NAME}
print_success "备份创建完成: ${BACKUP_DIR}/${BACKUP_NAME}"

# 3. 更新应用文件
print_info "更新应用文件..."
sudo rm -rf ${APP_DIR}/*
sudo cp -r ./dist/* ${APP_DIR}/
sudo chown -R www-data:www-data ${APP_DIR}

# 4. 测试 nginx 配置
if sudo nginx -t; then
    print_success "Nginx 配置验证成功"
    sudo systemctl reload nginx
    print_success "Nginx 重新加载完成"
else
    print_warning "Nginx 配置验证失败，恢复备份..."
    sudo rm -rf ${APP_DIR}/*
    sudo cp -r ${BACKUP_DIR}/${BACKUP_NAME}/* ${APP_DIR}/
    sudo systemctl reload nginx
    exit 1
fi

# 5. 清理旧备份（保留最近5个）
print_info "清理旧备份..."
sudo find ${BACKUP_DIR} -maxdepth 1 -name "backup-*" -type d | sort -r | tail -n +6 | sudo xargs rm -rf

print_success "应用更新完成！"
print_info "当前备份: ${BACKUP_DIR}/${BACKUP_NAME}"
