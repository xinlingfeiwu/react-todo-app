# CentOS 7 手动安装指南

## 1. 检查系统版本
```bash
cat /etc/redhat-release
```

## 2. 安装基础工具（如果需要）
```bash
# 只安装缺失的包
which wget || yum install -y wget
which curl || yum install -y curl
which tar || yum install -y tar
```

## 3. 手动下载 Node.js 16 (兼容 glibc 2.17)
```bash
cd /tmp
wget https://nodejs.org/dist/v16.20.2/node-v16.20.2-linux-x64.tar.xz
```

## 4. 验证下载
```bash
ls -la node-v16.20.2-linux-x64.tar.xz
```

## 5. 解压 Node.js
```bash
tar -xf node-v16.20.2-linux-x64.tar.xz
```

## 6. 移动到系统目录
```bash
sudo mv node-v16.20.2-linux-x64 /opt/nodejs
```

## 7. 创建符号链接
```bash
sudo ln -sf /opt/nodejs/bin/node /usr/local/bin/node
sudo ln -sf /opt/nodejs/bin/npm /usr/local/bin/npm
sudo ln -sf /opt/nodejs/bin/npx /usr/local/bin/npx
```

## 8. 验证安装
```bash
node --version
npm --version
```

## 9. 安装 PM2
```bash
npm install -g pm2
sudo ln -sf /opt/nodejs/bin/pm2 /usr/local/bin/pm2
```

## 10. 安装 Nginx（如果需要）
```bash
sudo yum install -y epel-release
sudo yum install -y nginx
```

## 11. 启动并启用 Nginx
```bash
sudo systemctl start nginx
sudo systemctl enable nginx
```

## 12. 安装 DNS 工具（用于 check-env.sh）
```bash
sudo yum install -y bind-utils
```

## 13. 配置防火墙
```bash
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

## 14. 测试环境检查
```bash
cd /path/to/your/project/deploy
bash check-env.sh
```

## 故障排除

### 如果 Node.js 版本显示错误
检查路径：
```bash
which node
echo $PATH
```

确保 `/usr/local/bin` 在 PATH 中：
```bash
export PATH="/usr/local/bin:$PATH"
echo 'export PATH="/usr/local/bin:$PATH"' >> ~/.bashrc
```

### 如果权限有问题
```bash
sudo chown -R root:root /opt/nodejs
sudo chmod -R 755 /opt/nodejs
```

### 如果 PM2 安装失败
直接从 /opt/nodejs/bin 运行：
```bash
/opt/nodejs/bin/npm install -g pm2
```
