# 反馈功能配置指南

## 概述

待办清单应用包含了用户反馈收集功能，支持多种反馈服务配置。用户可以提交功能建议和Bug反馈，管理员可以通过配置的服务接收这些反馈。

## 🚀 快速配置

### 1. 推荐方案：Formspree（免费）

Formspree 是一个免费的表单后端服务，每月提供50次免费提交。

#### 配置步骤：

1. **注册账户**：访问 [formspree.io](https://formspree.io/) 注册免费账户
2. **创建表单**：在仪表板中创建新表单，获取表单ID（如：`xeojabcd`）
3. **修改配置**：编辑 `src/config/feedback.js` 文件：

```javascript
formspree: {
  enabled: true,  // 改为 true
  endpoint: 'https://formspree.io/f/YOUR_FORM_ID'  // 替换 YOUR_FORM_ID
}
```

4. **测试功能**：重新启动应用，测试反馈提交功能

### 2. Netlify Forms（免费）

如果您的应用部署在 Netlify 上，可以使用免费的 Netlify Forms。

#### 配置步骤：

1. **确保部署在 Netlify**：应用必须部署在 Netlify 平台
2. **修改配置**：编辑 `src/config/feedback.js`：

```javascript
netlify: {
  enabled: true,
  action: '/feedback'
}
```

3. **查看反馈**：在 Netlify 仪表板的 Forms 部分查看提交的反馈

### 3. 自定义 API

如果您有自己的后端服务：

```javascript
customAPI: {
  enabled: true,
  endpoint: 'https://your-api.com/feedback'
}
```

### 4. 邮件降级方案（默认）

当其他服务不可用时，系统会自动使用 mailto 链接：

```javascript
email: {
  address: 'lovexinlingfeiwu@foxmail.com',  // 替换为您的邮箱
  subject: '[待办清单反馈]'
}
```

## 📋 管理界面

管理员可以通过以下方式访问反馈配置界面：

```
https://your-domain.com/?admin=feedback
```

在管理界面中，您可以：
- 查看当前配置状态
- 获取各种服务的配置指南
- 复制配置代码
- 检查服务启用状态

## 🔧 配置文件说明

配置文件位于 `src/config/feedback.js`，包含所有反馈服务的配置选项：

```javascript
export const FEEDBACK_CONFIG = {
  // Formspree 配置
  formspree: {
    enabled: false,
    endpoint: 'https://formspree.io/f/YOUR_FORM_ID'
  },
  
  // Netlify Forms 配置
  netlify: {
    enabled: false,
    action: '/feedback'
  },
  
  // 自定义 API 配置
  customAPI: {
    enabled: false,
    endpoint: 'https://your-api.com/feedback'
  },
  
  // 邮件降级配置
  email: {
    address: 'your-email@example.com',
    subject: '[待办清单反馈]'
  }
};
```

## 📝 数据格式

提交的反馈数据包含以下字段：

```json
{
  "type": "suggestion|bug",
  "title": "反馈标题",
  "description": "详细描述",
  "email": "用户邮箱（可选）",
  "priority": "low|medium|high",
  "timestamp": "2023-07-15T10:30:00.000Z",
  "userAgent": "浏览器信息",
  "url": "页面地址"
}
```

## 🛠️ 故障排除

### 常见问题：

1. **Formspree 提交失败**
   - 检查表单ID是否正确
   - 确认 Formspree 账户状态
   - 查看浏览器控制台错误信息

2. **邮件客户端无法打开**
   - 确保系统已安装邮件客户端
   - 检查邮箱地址配置是否正确

3. **管理界面无法访问**
   - 确认 URL 参数格式：`?admin=feedback`
   - 检查应用是否正常运行

### 调试模式：

在浏览器控制台中可以查看反馈提交的详细日志，包括：
- 服务选择逻辑
- 提交尝试结果
- 降级方案执行

## 📞 技术支持

如果您在配置过程中遇到问题，可以：
1. 查看浏览器控制台的错误信息
2. 检查网络连接状态
3. 验证配置文件语法
4. 测试各个服务的独立功能

## 🔒 安全说明

- 所有反馈数据都通过 HTTPS 传输
- 不会在客户端存储敏感信息
- 邮箱地址仅用于可选的联系方式
- 建议定期检查反馈服务的访问日志
