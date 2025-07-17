# 🚀 快速部署指南

## 📋 部署准备

### 1. 服务器要求
- Ubuntu 20.04+ 服务器
- 域名已解析到服务器 IP
- 开放 80, 443 端口

### 2. 本地构建

```bash
npm run build
```

> 💡 **提示**: 构建过程会自动压缩和优化代码，无需担心构建时的警告。

## 🔧 一键部署

### 上传代码到服务器
```bash
# 使用 Git
git clone https://github.com/yourusername/react-todo.git
cd react-todo

# 或使用 SCP
scp -r . user@yourserver:/home/user/react-todo/
```

### 运行部署脚本
```bash
# 在服务器上执行
chmod +x deploy/deploy.sh
./deploy/deploy.sh todo.yourdomain.com
```

## ✅ 部署完成

访问 `https://todo.yourdomain.com` 查看应用！

## 🔄 更新应用

```bash
# 本地重新构建
npm run build

# 服务器上更新
./deploy/update.sh
```

## 📞 问题排查

1. **域名解析**：确保 A 记录指向服务器 IP
2. **防火墙**：确保 80、443 端口开放
3. **日志查看**：`sudo tail -f /var/log/nginx/todo-app-error.log`

---

🎉 **恭喜！您的 React Todo 应用已成功部署！**
