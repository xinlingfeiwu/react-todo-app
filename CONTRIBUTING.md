# Contributing to React Todo App

感谢你对这个项目的关注！我们欢迎任何形式的贡献。

## 贡献方式

### 报告 Bug
1. 确保 Bug 没有被重复报告
2. 创建一个详细的 Issue，包括：
   - 详细的描述
   - 复现步骤
   - 期望的行为
   - 实际的行为
   - 环境信息（浏览器、操作系统等）

### 功能建议
1. 在 Issues 中提出新功能建议
2. 详细描述功能的用途和价值
3. 如果可能，提供设计稿或使用案例

### 代码贡献
1. Fork 项目
2. 创建你的功能分支 (`git checkout -b feature/AmazingFeature`)
3. 确保代码符合项目标准：
   ```bash
   npm run lint
   npm run build
   ```
4. 提交你的更改 (`git commit -m 'Add some AmazingFeature'`)
5. 推送到分支 (`git push origin feature/AmazingFeature`)
6. 创建 Pull Request

## 开发指南

### 环境设置
```bash
# 克隆项目
git clone https://github.com/yourusername/react-todo-app.git
cd react-todo-app

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

### 代码规范
- 使用 ESLint 进行代码检查
- 组件使用函数式组件和 Hooks
- 遵循 React 最佳实践
- 保持代码简洁和可读性

### 提交规范
```
feat: 新功能
fix: 修复问题
docs: 文档更新
style: 样式更新
refactor: 代码重构
test: 测试相关
chore: 构建过程或辅助工具的变动
```

### 测试
在提交代码前，请确保：
- 代码通过 ESLint 检查
- 应用能正常构建
- 功能按预期工作

## 项目结构

```
src/
├── components/        # React 组件
├── hooks/            # 自定义 Hooks
├── utils/            # 工具函数
├── styles/           # 样式文件
└── constants/        # 常量定义
```

## 问题和建议

如果你有任何问题或建议，请：
1. 查看现有的 Issues
2. 创建新的 Issue
3. 发送邮件到：lovexinlingfeiwu@foxmail.com

再次感谢你的贡献！
