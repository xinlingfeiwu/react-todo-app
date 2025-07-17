#!/bin/bash

# CentOS 7 Node.js 清理脚本
# 清理失败的 NodeSource 安装和冲突的包

echo "🧹 清理 CentOS 7 Node.js 安装冲突..."

# 停止可能运行的服务
sudo systemctl stop nginx || true

# 移除冲突的 Node.js 包
echo "移除冲突的 Node.js 包..."
sudo yum remove -y nodejs npm || true

# 清理 NodeSource 仓库
echo "清理 NodeSource 仓库..."
sudo rm -f /etc/yum.repos.d/nodesource*.repo

# 清理 yum 缓存
echo "清理 yum 缓存..."
sudo yum clean all

# 移除可能存在的 Node.js 链接
sudo rm -f /usr/bin/node /usr/bin/npm /usr/bin/npx
sudo rm -f /usr/local/bin/node /usr/local/bin/npm /usr/local/bin/npx

# 移除可能存在的 Node.js 目录
sudo rm -rf /opt/nodejs

echo "✅ 清理完成！"
echo "💡 现在可以重新运行: ./deploy.sh todo"
