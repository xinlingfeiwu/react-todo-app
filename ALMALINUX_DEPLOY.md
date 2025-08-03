# AlmaLinux 9.5 部署指南

## 系统要求

### 操作系统

- **AlmaLinux 9.5** (64位)
- 最小内存: 1GB RAM
- 最小存储: 10GB 可用空间
- 网络连接: 用于下载依赖和包

### 软件要求

- **Node.js 18+** (推荐 LTS 版本)
- **npm 8+** (通常随 Node.js 一起安装)
- **Nginx** (Web 服务器)
- **Git** (用于代码管理)

## 快速部署

### 1. 系统准备

```bash

# 更新系统

sudo dnf update -y

# 安装基本工具

sudo dnf install -y curl wget git

# 安装 Node.js 18 LTS

sudo dnf install -y nodejs npm

# 验证安装

node --version  # 应该显示 v18.x.x 或更高
npm --version   # 应该显示 8.x.x 或更高

```

### 2. 安装 Nginx

```bash

# 安装 Nginx

sudo dnf install -y nginx

# 启动并启用 Nginx

sudo systemctl start nginx
sudo systemctl enable nginx

# 检查状态

sudo systemctl status nginx

```

### 3. 配置防火墙

```bash

# 启动防火墙服务

sudo systemctl start firewalld
sudo systemctl enable firewalld

# 允许 HTTP 和 HTTPS

sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload

# 验证规则

sudo firewall-cmd --list-all

```

### 4. 部署应用

#### 单应用部署

```bash

# 克隆项目后运行 - 基本部署 (localhost)

chmod +x deploy/almalinux-deploy.sh
sudo ./deploy/almalinux-deploy.sh

# 二级域名部署 (推荐)

sudo ./deploy/almalinux-deploy.sh -d todo.ylingtech.com -a todo-app

# 交互式配置

sudo ./deploy/almalinux-deploy.sh

```

#### 多应用部署 (二级域名)

```bash

# 使用多应用部署工具

chmod +x deploy/multi-app-deploy.sh
sudo ./deploy/multi-app-deploy.sh

# 直接部署多个应用到不同域名

sudo ./deploy/almalinux-deploy.sh -d todo.ylingtech.com -a todo-app
sudo ./deploy/almalinux-deploy.sh -d blog.ylingtech.com -a blog-app
sudo ./deploy/almalinux-deploy.sh -d docs.ylingtech.com -a docs-app

```

#### 支持的配置选项

- `-d, --domain`: 域名 (例如: todo.ylingtech.com)
- `-a, --app`: 应用名称 (例如: todo-app)
- `-h, --help`: 显示帮助信息

## 手动部署步骤

如果你想手动控制部署过程：

### 1. 安装依赖

```bash

cd react-todo-app
npm install

```

### 2. 构建应用

```bash

# 生产构建

npm run build

# 验证构建输出

ls -la dist/

```

### 3. 配置 Nginx

```bash

# 复制 Nginx 配置

sudo cp deploy/nginx/almalinux-nginx.conf /etc/nginx/conf.d/react-todo.conf

# 创建 Web 目录

sudo mkdir -p /var/www/react-todo-app

# 复制构建文件

sudo cp -r dist/* /var/www/react-todo-app/

# 设置权限

sudo chown -R nginx:nginx /var/www/react-todo-app
sudo chmod -R 755 /var/www/react-todo-app

# 测试 Nginx 配置

sudo nginx -t

# 重启 Nginx

sudo systemctl restart nginx

```

### 4. SELinux 配置（如果启用）

```bash

# 检查 SELinux 状态

getenforce

# 如果是 Enforcing，配置 SELinux

sudo setsebool -P httpd_can_network_connect on
sudo semanage fcontext -a -t httpd_exec_t "/var/www/react-todo-app(/.*)?"
sudo restorecon -Rv /var/www/react-todo-app

```

## 优化建议

### 性能优化

1. **启用 HTTP/2**:

   ```nginx

   listen 443 ssl http2;

   ```

2. **配置 Gzip 压缩** (已包含在配置中):
   - 减少传输大小
   - 提高加载速度

3. **静态资源缓存** (已包含在配置中):
   - 1年缓存 JS/CSS 文件
   - 1月缓存图标文件

### 安全优化

1. **SSL/TLS 配置**:

   ```bash

   # 安装 Let's Encrypt

   sudo dnf install -y certbot python3-certbot-nginx

   # 获取免费 SSL 证书

   sudo certbot --nginx -d your-domain.com

   ```

2. **安全头配置** (已包含在 Nginx 配置中):
   - X-Frame-Options
   - X-Content-Type-Options
   - X-XSS-Protection
   - Referrer-Policy

3. **禁用不必要的服务**:

   ```bash

   # 检查运行的服务

   sudo systemctl list-units --type=service --state=running

   ```

### 监控和日志

1. **Nginx 日志位置**:
   - 访问日志: `/var/log/nginx/react-todo-app.access.log`
   - 错误日志: `/var/log/nginx/react-todo-app.error.log`

2. **系统监控**:

   ```bash

   # 检查系统资源

   htop

   # 检查磁盘使用

   df -h

   # 检查内存使用

   free -h

   ```

## 故障排除

### 常见问题

1. **Nginx 无法启动**:

   ```bash

   # 检查配置语法

   sudo nginx -t

   # 查看错误日志

   sudo journalctl -u nginx -f

   ```

2. **页面无法访问**:

   ```bash

   # 检查防火墙

   sudo firewall-cmd --list-all

   # 检查 SELinux

   sudo sealert -a /var/log/audit/audit.log

   ```

3. **静态文件 404**:

   ```bash

   # 检查文件权限

   ls -la /var/www/react-todo-app/

   # 检查 Nginx 配置

   sudo nginx -t

   ```

### 日志分析

```bash

# 实时查看访问日志

sudo tail -f /var/log/nginx/react-todo-app.access.log

# 查看错误日志

sudo tail -f /var/log/nginx/react-todo-app.error.log

# 分析最多访问的页面

sudo awk '{print $7}' /var/log/nginx/react-todo-app.access.log | sort | uniq -c | sort -nr | head -10

```

## 维护和更新

### 应用更新

```bash

# 拉取最新代码

git pull origin main

# 重新构建

npm run build

# 备份当前版本

sudo cp -r /var/www/react-todo-app /var/www/react-todo-app.backup.$(date +%Y%m%d_%H%M%S)

# 部署新版本

sudo cp -r dist/* /var/www/react-todo-app/

# 重启 Nginx (可选)

sudo systemctl reload nginx

```

### 系统维护

```bash

# 定期更新系统

sudo dnf update -y

# 清理日志 (保留最近30天)

sudo journalctl --vacuum-time=30d

# 清理包缓存

sudo dnf clean all

```

## 性能基准

在标准的 AlmaLinux 9.5 虚拟机上 (2 vCPU, 4GB RAM):

- **构建时间**: ~30-60秒
- **首次加载**: <2秒
- **后续加载**: <500ms (缓存)
- **包大小**: ~250KB (gzipped)

---

*此指南专门为 AlmaLinux 9.5 + Node.js 18+ 环境优化*
