# React Todo App

🎯 一个简洁高效的待办事项管理工具，基于 React + Vite 构建，支持数据导入导出、隐私设置、主题切换等功能。

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-19.1.0-blue.svg)
![Vite](https://img.shields.io/badge/Vite-5.4.19-green.svg)

## ✨ 功能特色

- 📝 **任务管理**：创建、编辑、删除、完成待办事项
- 🔍 **智能过滤**：按状态（全部/进行中/已完成）过滤任务
- 📊 **统计面板**：实时显示任务统计信息
- 💾 **数据管理**：支持数据导入导出（JSON格式）
- 🎨 **主题切换**：明亮/暗黑主题自由切换
- 🔒 **隐私保护**：完整的隐私设置和数据控制
- 💰 **支持功能**：支付宝/微信打赏功能
- 📱 **响应式设计**：完美适配桌面和移动设备
- 🌐 **PWA支持**：可安装为原生应用

## 🚀 快速开始

### 环境要求

- Node.js 16.0+
- npm 或 yarn

### 本地开发

```bash
# 克隆项目
git clone https://github.com/xinlingfeiwu/react-todo-app.git
cd react-todo-app

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 打开浏览器访问 http://localhost:5173
```

### 构建生产版本

```bash
# 构建项目
npm run build

# 预览构建结果
npm run preview
```

## 📁 项目结构

```
react-todo-app/
├── public/                 # 静态资源
│   ├── favicon.svg        # 网站图标
│   ├── manifest.json      # PWA配置
│   └── robots.txt         # SEO配置
├── src/                   # 源代码
│   ├── components/        # React组件
│   │   ├── TodoWrapper.jsx    # 主容器组件
│   │   ├── CreateForm.jsx     # 创建任务表单
│   │   ├── EditForm.jsx       # 编辑任务表单
│   │   ├── TodoList.jsx       # 任务列表
│   │   ├── Todo.jsx           # 单个任务组件
│   │   ├── TodoFilter.jsx     # 过滤器组件
│   │   ├── TodoStats.jsx      # 统计组件
│   │   ├── DataManager.jsx    # 数据管理组件
│   │   ├── ThemeToggle.jsx    # 主题切换组件
│   │   ├── AppSettings.jsx    # 应用设置
│   │   ├── PrivacySettings.jsx # 隐私设置
│   │   └── Donate.jsx         # 捐赠组件
│   ├── hooks/             # 自定义Hooks
│   │   └── useTodos.js    # 待办事项状态管理
│   ├── utils/             # 工具函数
│   │   ├── privacyManager.js  # 隐私管理
│   │   ├── themeManager.js    # 主题管理
│   │   └── contentFilter.js   # 内容过滤
│   ├── styles/            # 样式文件
│   │   └── Todo.css       # 主要样式
│   ├── constants/         # 常量定义
│   │   └── todoConstants.js
│   ├── App.jsx           # 应用主组件
│   └── main.jsx          # 应用入口
├── deploy/               # 部署配置
│   ├── deploy.sh         # 自动部署脚本
│   └── check-env.sh      # 环境检查脚本
├── package.json          # 项目配置
├── vite.config.js        # Vite配置
└── README.md            # 项目说明
```

## 🛠️ 技术栈

- **前端框架**：React 19.1.0
- **构建工具**：Vite 5.4.19
- **UI组件**：自定义组件 + CSS
- **图标库**：React Icons
- **状态管理**：React Hooks (useState, useEffect, useCallback)
- **数据存储**：localStorage
- **样式方案**：CSS3 + CSS变量

## 📋 可用脚本

```bash
npm run dev         # 启动开发服务器
npm run build       # 构建生产版本
npm run build:prod  # 生产环境构建
npm run preview     # 预览构建结果
npm run lint        # 代码检查
npm run lint:fix    # 自动修复代码问题
npm run analyze     # 构建分析
```

## 🎨 主要功能

### 任务管理
- ✅ 创建新任务
- ✏️ 编辑现有任务
- 🗑️ 删除任务
- ✔️ 标记完成/未完成
- 🔍 任务过滤和搜索

### 数据管理
- 📤 导出数据为JSON格式
- 📥 从JSON文件导入数据
- 🔄 数据备份和恢复
- 🧹 清空所有数据

### 用户体验
- 🌙 明亮/暗黑主题切换
- 📱 完全响应式设计
- ⚡ 快速响应的交互
- 🎯 直观的用户界面

## 🔧 配置说明

### 环境变量
项目不需要特殊的环境变量配置，开箱即用。

### 自定义配置
- 主题配色可在 `src/styles/Todo.css` 中的CSS变量部分修改
- 应用配置可在 `src/constants/todoConstants.js` 中调整

## 🚀 部署

### 静态托管
构建后的 `dist` 目录可以部署到任何静态托管服务：

- **Vercel**: 连接GitHub自动部署
- **Netlify**: 拖拽dist文件夹部署
- **GitHub Pages**: 使用GitHub Actions自动部署

### 服务器部署
项目包含完整的服务器部署脚本：

```bash
# 使用自动部署脚本
./deploy/deploy.sh your-domain.com
```

支持的服务器环境：
- CentOS 7/8
- Ubuntu 18.04+
- 自动配置Nginx + SSL证书

## 📄 许可证

本项目采用 [MIT](LICENSE) 许可证。

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建你的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交你的更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开一个 Pull Request

## 💬 反馈与支持

- 🐛 [报告Bug](https://github.com/xinlingfeiwu/react-todo-app/issues)
- 💡 [功能建议](https://github.com/xinlingfeiwu/react-todo-app/issues)
- 📧 邮箱：lovexinlingfeiwu@foxmail.com

## 🙏 致谢

感谢所有为这个项目做出贡献的人！

---

⭐ 如果这个项目对你有帮助，请给它一个星标！
