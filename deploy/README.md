# React Todo 应用部署指南

## 📋 目录结构

```
deploy/
├── nginx/
│   ├── todo.conf          # 生产环境 Nginx 配置
│   └── nginx.conf         # Docker 环境 Nginx 配置
├── deploy.sh              # 自动化部署脚本
└── update.sh              # 应用更新脚本
```

## 🚀 部署方式

### 方式一：传统部署（推荐用于生产环境）

#### 前置要求
- Ubuntu 20.04+ / CentOS 8+ 服务器
- 域名并已解析到服务器 IP
- 服务器开放 80、443 端口

#### 部署步骤

1. **在本地构建应用**
   ```bash
   npm run build
   ```

2. **上传代码到服务器**
   ```bash
   # 方式一：使用 Git
   git clone https://github.com/yourusername/react-todo.git
   cd react-todo
   
   # 方式二：使用 SCP
   scp -r ./dist ./deploy user@yourserver:/home/user/react-todo/
   ```

3. **在服务器上运行部署脚本**
   ```bash
   chmod +x deploy/deploy.sh
   ./deploy/deploy.sh todo.yourdomain.com
   ```

4. **配置域名解析**
   - A 记录：`todo.yourdomain.com` → `服务器IP`

#### 自动化配置说明

部署脚本会自动完成：
- ✅ 安装 Nginx
- ✅ 配置 SSL 证书（Let's Encrypt）
- ✅ 设置证书自动续期
- ✅ 配置 HTTP 到 HTTPS 重定向
- ✅ 启用 Gzip 压缩
- ✅ 配置安全头
- ✅ 设置缓存策略

### 方式二：Docker 部署

#### 前置要求
- Docker 和 Docker Compose
- 域名解析

#### 部署步骤

1. **构建镜像**
   ```bash
   docker build -t react-todo .
   ```

2. **使用 Docker Compose 部署**
   ```bash
   # 修改 docker-compose.yml 中的域名
   sed -i 's/todo.yourdomain.com/todo.yourrealdomain.com/g' docker-compose.yml
   
   # 启动服务
   docker-compose up -d
   ```

3. **使用 Traefik + Let's Encrypt（推荐）**
   ```bash
   # 创建外部网络
   docker network create web
   
   # 启动服务
   docker-compose up -d
   ```

## 🔧 配置说明

### Nginx 配置特性

- **SSL/TLS**: 自动配置 Let's Encrypt 证书
- **安全头**: 完整的安全头配置
- **压缩**: Gzip 压缩优化传输
- **缓存**: 静态资源长期缓存
- **SPA 支持**: 单页应用路由支持

### 域名配置

支持的二级域名格式：
- `todo.yourdomain.com`
- `app.yourdomain.com`
- `mytodo.yourdomain.com`

### 环境变量（Docker）

```bash
# .env 文件
DOMAIN=todo.yourdomain.com
EMAIL=admin@yourdomain.com
```

## 🔄 应用更新

### 传统部署更新

```bash
# 本地构建新版本
npm run build

# 上传到服务器并运行更新脚本
./deploy/update.sh
```

### Docker 部署更新

```bash
# 重新构建镜像
docker build -t react-todo .

# 重启容器
docker-compose up -d --build
```

## 🛡️ 安全配置

### SSL/TLS 配置
- TLS 1.2+ 支持
- 强加密套件
- HSTS 启用
- OCSP Stapling

### 安全头
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Content-Security-Policy`: 严格的 CSP 策略

### 防火墙
```bash
# Ubuntu UFW
sudo ufw allow 'Nginx Full'
sudo ufw allow ssh
sudo ufw enable

# CentOS Firewalld
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

## 📊 监控和日志

### 日志位置
- Nginx 访问日志: `/var/log/nginx/todo-app-access.log`
- Nginx 错误日志: `/var/log/nginx/todo-app-error.log`

### 日志查看
```bash
# 实时查看访问日志
sudo tail -f /var/log/nginx/todo-app-access.log

# 查看错误日志
sudo tail -f /var/log/nginx/todo-app-error.log
```

### 性能监控
```bash
# 检查服务状态
sudo systemctl status nginx

# 测试配置
sudo nginx -t

# 重新加载配置
sudo systemctl reload nginx
```

## 🔧 故障排除

### 常见问题

1. **证书获取失败**
   - 确认域名解析正确
   - 检查防火墙 80 端口开放
   - 查看 Let's Encrypt 速率限制

2. **404 错误**
   - 检查文件路径权限
   - 确认 SPA 路由配置

3. **502 错误**
   - 检查 Nginx 配置语法
   - 确认应用文件存在

### 手动证书续期
```bash
sudo certbot renew --dry-run
sudo certbot renew
```

### 备份恢复
```bash
# 查看备份
ls /var/backups/todo-app/

# 恢复备份
sudo cp -r /var/backups/todo-app/backup-YYYYMMDD-HHMMSS/* /var/www/todo-app/
sudo systemctl reload nginx
```

## 📈 性能优化

### 启用 Brotli 压缩（可选）
```bash
# 安装 Brotli 模块
sudo apt install nginx-module-brotli

# 在 nginx.conf 中添加
load_module modules/ngx_http_brotli_filter_module.so;
load_module modules/ngx_http_brotli_static_module.so;
```

### CDN 配置
建议使用 CloudFlare 等 CDN 服务进一步优化:
- 全球加速
- DDoS 防护
- 额外缓存层

## 🆘 支持

如有问题，请检查：
1. 域名解析是否正确
2. 防火墙端口是否开放
3. SSL 证书是否有效
4. Nginx 配置是否正确

联系方式：admin@yourdomain.com
