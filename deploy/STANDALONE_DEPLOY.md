# 独立部署脚本使用指南

## 📋 概述

`standalone-deploy.sh` 是一个独立的部署脚本，基于 `aliyun-ecs-diagnose.sh` 改进而来。它可以在任何位置执行，自动寻找与 deploy 目录平级的 dist 目录进行部署，大大减轻了服务器部署的复杂性。

## ✨ 主要特点

- **🚀 独立执行**: 不需要完整的项目代码在服务器上
- **📁 自动检测**: 自动寻找 deploy 目录平级的 dist 目录
- **🔧 全自动配置**: 自动安装和配置 Nginx、防火墙等
- **🛡️ 安全优化**: 包含 SELinux、安全头等安全配置
- **☁️ 云平台支持**: 特别优化阿里云 ECS 部署
- **📊 详细反馈**: 提供详细的部署过程和结果反馈

## 🎯 使用场景

### 传统部署方式的问题
- 需要将整个项目代码上传到服务器
- 服务器需要安装 Node.js、npm 等开发环境
- 需要在服务器上执行构建过程
- 增加了服务器的复杂性和安全风险

### 独立部署的优势
- 只需要上传构建后的 dist 目录和 deploy 脚本
- 服务器只需要运行环境（Nginx），不需要开发环境
- 减少服务器存储空间占用
- 提高部署安全性和效率

## 📦 部署准备

### 1. 本地构建
在本地开发环境中构建项目：

```bash
# 在项目根目录执行
npm run build

# 确保生成了 dist 目录
ls -la dist/
```

### 2. 上传文件
将以下文件/目录上传到服务器：

```
server-deployment/
├── deploy/
│   ├── standalone-deploy.sh
│   └── nginx/              # (可选) Nginx 配置模板
└── dist/
    ├── index.html
    ├── assets/
    └── ...
```

## 🚀 部署步骤

### 1. 连接服务器
```bash
ssh root@your-server-ip
```

### 2. 上传部署文件
```bash
# 方式1: 使用 scp
scp -r deploy/ dist/ root@your-server-ip:/tmp/react-todo-deploy/

# 方式2: 使用 rsync
rsync -av deploy/ dist/ root@your-server-ip:/tmp/react-todo-deploy/
```

### 3. 执行部署脚本
```bash
# 进入部署目录
cd /tmp/react-todo-deploy

# 执行部署脚本
sudo ./deploy/standalone-deploy.sh
```

## 📋 脚本执行流程

### 1. 项目结构检测
- 自动检测脚本位置
- 验证 deploy 目录结构
- 查找并验证 dist 目录
- 检查构建文件完整性

### 2. 系统环境检查
- 检测操作系统类型和版本
- 验证执行权限
- 检查现有服务状态

### 3. Nginx 安装和配置
- 自动安装 Nginx（如果未安装）
- 生成优化的 Nginx 配置
- 配置 SPA 路由支持
- 设置静态文件缓存
- 添加安全头

### 4. 防火墙配置
- 自动检测防火墙类型
- 配置 HTTP/HTTPS 端口开放
- 支持 firewalld、ufw、iptables

### 5. 应用部署
- 备份现有文件
- 复制新的构建文件
- 设置正确的文件权限
- 配置 Web 服务器用户

### 6. 安全配置
- 配置 SELinux 策略（如果启用）
- 设置文件上下文
- 启用网络连接权限

### 7. 连接测试
- 本地连接测试
- 外部连接测试
- 健康检查

### 8. 阿里云特殊配置
- 检测阿里云 ECS 环境
- 提供安全组配置指导
- 显示实例信息

## ⚙️ 配置说明

### 默认配置
```bash
DOMAIN_NAME="todo.ylingtech.com"
APP_NAME="todo-app"
WEB_DIR="/var/www/$APP_NAME"
```

### 自定义配置
如需修改配置，编辑脚本开头的变量：

```bash
# 修改域名
DOMAIN_NAME="your-domain.com"

# 修改应用名称
APP_NAME="your-app"

# 修改 Web 目录
WEB_DIR="/var/www/html"
```

## 🔧 Nginx 配置特性

### 性能优化
- Gzip 压缩
- 静态文件缓存
- 浏览器缓存控制

### 安全配置
- 安全头设置
- 隐藏服务器版本
- XSS 保护
- 内容类型保护

### SPA 支持
- 前端路由支持
- 404 重定向到 index.html
- 静态资源直接访问

### 监控和日志
- 访问日志记录
- 错误日志记录
- 健康检查端点

## 🛠️ 故障排除

### 常见问题

#### 1. 权限错误
```bash
# 确保以 root 权限执行
sudo ./deploy/standalone-deploy.sh
```

#### 2. 构建文件缺失
```bash
# 检查 dist 目录
ls -la dist/

# 重新构建
npm run build
```

#### 3. Nginx 配置错误
```bash
# 测试配置
nginx -t

# 查看错误日志
tail -f /var/log/nginx/error.log
```

#### 4. 防火墙问题
```bash
# 检查防火墙状态
systemctl status firewalld

# 手动开放端口
firewall-cmd --permanent --add-port=80/tcp
firewall-cmd --permanent --add-port=443/tcp
firewall-cmd --reload
```

### 阿里云 ECS 特殊问题

#### 安全组配置
1. 登录阿里云控制台
2. 进入 ECS 实例管理
3. 点击"安全组配置"
4. 添加入方向规则：
   - TCP 80/80 0.0.0.0/0
   - TCP 443/443 0.0.0.0/0

#### 域名解析
确保域名 A 记录指向正确的公网 IP

## 📊 部署验证

### 本地测试
```bash
curl -I http://localhost/
curl -I http://localhost/health
```

### 外部测试
```bash
curl -I http://your-domain.com/
curl -I https://your-domain.com/
```

### 日志检查
```bash
# 访问日志
tail -f /var/log/nginx/todo-app.access.log

# 错误日志
tail -f /var/log/nginx/todo-app.error.log

# Nginx 状态
systemctl status nginx
```

## 🔄 更新部署

### 快速更新
```bash
# 1. 本地重新构建
npm run build

# 2. 上传新的 dist 目录
rsync -av dist/ root@your-server-ip:/tmp/react-todo-deploy/

# 3. 重新执行部署脚本
sudo ./deploy/standalone-deploy.sh
```

### 回滚操作
脚本会自动备份现有文件到 `/var/backups/todo-app-YYYYMMDD-HHMMSS`

```bash
# 查看备份
ls -la /var/backups/

# 手动回滚
cp -r /var/backups/todo-app-20231225-143000/* /var/www/todo-app/
systemctl reload nginx
```

## 📞 技术支持

如果遇到问题，请提供以下信息：
1. 操作系统版本
2. 脚本执行日志
3. Nginx 错误日志
4. 网络连接测试结果

## 🎉 总结

独立部署脚本提供了一种简单、安全、高效的部署方式，特别适合：
- 生产环境部署
- CI/CD 自动化部署
- 多环境部署管理
- 云服务器部署

通过这种方式，您可以将开发环境和生产环境完全分离，提高部署的安全性和可靠性。
