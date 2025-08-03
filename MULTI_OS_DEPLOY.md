# 多操作系统兼容部署脚本

## 支持的操作系统

### ✅ 完全支持

- **AlmaLinux 9.x** (主要目标)
- **RHEL 9.x** (Red Hat Enterprise Linux)
- **Rocky Linux 9.x**
- **CentOS Stream 9.x**
- **Fedora 35+**

### ✅ 兼容支持

- **Ubuntu 20.04+**
- **Debian 11+**
- **RHEL 8.x**
- **AlmaLinux 8.x**

### ⚠️ 有限支持

- **CentOS 7** (需要手动安装 Node.js 18+)
- 其他 Linux 发行版 (需要手动安装依赖)

## 系统要求

### 硬件要求

- **CPU**: 1+ 核心
- **内存**: 1GB+ RAM
- **存储**: 10GB+ 可用空间
- **网络**: 互联网连接

### 软件要求

- **操作系统**: 支持的 Linux 发行版
- **权限**: sudo 访问权限
- **网络**: 80/443 端口可访问

## 自动安装的软件包

### RHEL 系 (AlmaLinux/RHEL/Rocky/CentOS/Fedora)

```bash

# 基础工具

curl wget git bind-utils

# Web 服务器

nginx

# 运行时环境

nodejs npm

# SSL 证书

certbot python3-certbot-nginx

```

### Debian 系 (Ubuntu/Debian)

```bash

# 基础工具

curl wget git dnsutils

# Web 服务器

nginx

# 运行时环境

nodejs npm (通过 NodeSource 仓库)

# SSL 证书

certbot python3-certbot-nginx

```

## 使用方法

### 快速开始

1. **克隆项目**

   ```bash

   git clone https://github.com/xinlingfeiwu/react-todo-app.git
   cd react-todo-app

   ```

2. **基本部署**

   ```bash

   # 交互式配置

   sudo ./deploy/almalinux-deploy.sh

   # 命令行参数

   sudo ./deploy/almalinux-deploy.sh -d todo.example.com -a todo-app

   ```

3. **多应用部署**

   ```bash

   sudo ./deploy/multi-app-deploy.sh

   ```

### 命令行选项

```bash

./deploy/almalinux-deploy.sh [选项]

选项:
  -d, --domain DOMAIN    域名 (例如: todo.ylingtech.com)
  -a, --app APP_NAME     应用名称 (例如: todo-app)
  -h, --help             显示帮助信息

示例:
  ./deploy/almalinux-deploy.sh -d todo.ylingtech.com -a todo-app
  ./deploy/almalinux-deploy.sh --domain blog.example.com --app blog

```

## 功能特性

### 🔧 自动化安装

- ✅ 检测操作系统类型并选择合适的包管理器
- ✅ 自动安装 Nginx、Node.js 18+、certbot
- ✅ 配置系统服务自启动
- ✅ 创建必要的目录和权限

### 🌐 Web 服务器配置

- ✅ 自动生成 Nginx 虚拟主机配置
- ✅ 支持 RHEL 系 (`/etc/nginx/conf.d/`) 和 Debian 系 (`sites-available/sites-enabled`) 结构
- ✅ HTTP 强制重定向到 HTTPS
- ✅ 现代 SSL/TLS 配置 (TLS 1.2/1.3)
- ✅ 静态资源缓存优化

### 🔒 SSL/TLS 管理

- ✅ 自动检测现有证书
- ✅ 证书有效期检查 (30天内自动续期)
- ✅ Let's Encrypt 证书自动获取
- ✅ 证书自动续期 cron 任务配置
- ✅ OCSP Stapling 和安全头配置

### 🛡️ 安全配置

- ✅ 防火墙自动配置 (firewalld/ufw)
- ✅ SELinux 上下文设置 (RHEL 系)
- ✅ 强化安全头 (HSTS, CSP, X-Frame-Options)
- ✅ 禁止访问敏感文件

### 📊 系统监控

- ✅ 服务状态检查
- ✅ 配置文件语法验证
- ✅ 部署文件完整性检查
- ✅ 详细的日志和错误报告

## 目录结构

### 生成的文件和目录

```

/var/www/$APP_NAME/          # 应用部署目录
├── index.html               # 主页面
├── assets/                  # 静态资源
└── health                   # 健康检查文件

/etc/nginx/conf.d/           # Nginx 配置 (RHEL 系)
└── $APP_NAME.conf

/etc/nginx/sites-available/  # Nginx 配置 (Debian 系)
└── $APP_NAME.conf

/etc/nginx/sites-enabled/    # 启用的站点 (Debian 系)
└── $APP_NAME.conf -> ../sites-available/$APP_NAME.conf

/var/log/nginx/              # 日志目录
├── $APP_NAME-access.log     # 访问日志
└── $APP_NAME-error.log      # 错误日志

/etc/letsencrypt/live/$DOMAIN_NAME/  # SSL 证书
├── fullchain.pem            # 证书链
├── privkey.pem              # 私钥
└── chain.pem                # 中间证书

```

## 故障排除

### 常见问题

1. **权限错误**

   ```bash

   # 检查文件权限

   ls -la /var/www/$APP_NAME/

   # 重新设置权限

   sudo chown -R nginx:nginx /var/www/$APP_NAME/  # RHEL 系
   sudo chown -R www-data:www-data /var/www/$APP_NAME/  # Debian 系

   ```

2. **Nginx 配置错误**

   ```bash

   # 测试配置

   sudo nginx -t

   # 查看错误日志

   sudo tail -f /var/log/nginx/error.log

   ```

3. **SSL 证书问题**

   ```bash

   # 检查证书状态

   sudo certbot certificates

   # 测试续期

   sudo certbot renew --dry-run

   ```

4. **防火墙问题**

   ```bash

   # RHEL 系

   sudo firewall-cmd --list-all

   # Debian 系

   sudo ufw status verbose

   ```

### 日志查看

```bash

# 应用访问日志

sudo tail -f /var/log/nginx/$APP_NAME-access.log

# 应用错误日志

sudo tail -f /var/log/nginx/$APP_NAME-error.log

# Nginx 系统日志

sudo journalctl -u nginx -f

# 系统日志

sudo journalctl -f

```

### 服务管理

```bash

# Nginx 服务

sudo systemctl status nginx
sudo systemctl start nginx
sudo systemctl stop nginx
sudo systemctl restart nginx
sudo systemctl reload nginx

# 防火墙服务

sudo systemctl status firewalld  # RHEL 系
sudo systemctl status ufw        # Debian 系

```

## 性能优化建议

### 系统级优化

1. **内核参数调优**

   ```bash

   # 编辑 /etc/sysctl.conf

   net.core.somaxconn = 65535
   net.ipv4.tcp_max_syn_backlog = 65535

   ```

2. **Nginx 工作进程数**

   ```bash

   # 编辑 /etc/nginx/nginx.conf

   worker_processes auto;
   worker_connections 1024;

   ```

3. **文件描述符限制**

   ```bash

   # 编辑 /etc/security/limits.conf

   nginx soft nofile 65535
   nginx hard nofile 65535

   ```

### 应用级优化

1. **静态资源压缩** (已配置)
2. **HTTP/2 支持** (已配置)
3. **缓存策略** (已配置)
4. **安全头** (已配置)

## 更新和维护

### 应用更新

```bash

# 拉取最新代码

git pull origin main

# 重新构建

npm run build

# 重新部署

sudo ./deploy/almalinux-deploy.sh -d $DOMAIN -a $APP_NAME

```

### 系统维护

```bash

# 更新系统包

sudo dnf update -y      # RHEL 系
sudo apt update && sudo apt upgrade -y  # Debian 系

# 检查证书状态

sudo certbot certificates

# 检查日志大小

sudo du -sh /var/log/nginx/

# 清理旧日志

sudo logrotate -f /etc/logrotate.d/nginx

```

---

**支持和反馈**: 如遇问题，请查看日志文件或提交 Issue 到项目仓库。
