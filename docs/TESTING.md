# 测试文档

本文档描述了 React Todo App 项目的测试体系和最佳实践。

## 📋 目录

- [测试框架](#-测试框架)
- [测试结构](#-测试结构)
- [运行测试](#-运行测试)
- [测试覆盖率](#-测试覆盖率)
- [编写测试](#️-编写测试)
- [CI/CD 集成](#-cicd-集成)

## 🧪 测试框架

我们使用现代化的测试技术栈：

- **测试运行器**: [Vitest](https://vitest.dev/) - 快速的 Vite 原生测试框架
- **测试工具**: [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) -

  专注于用户行为的测试

- **断言库**: [Vitest 内置断言](https://vitest.dev/api/expect.html) - 兼容 Jest 的断言 API
- **模拟工具**: [Vitest Mock](https://vitest.dev/api/vi.html) - 强大的模拟和间谍功能
- **覆盖率**: [V8 Coverage](https://vitest.dev/guide/coverage.html) - 原生 V8 覆盖率报告

## 📁 测试结构

```text

src/
├── components/
│   ├── __tests__/
│   │   ├── Todo.basic.test.jsx
│   │   ├── CreateForm.test.jsx
│   │   └── TodoList.test.jsx
│   └── ...
├── hooks/
│   ├── __tests__/
│   │   ├── useTodos.basic.test.js
│   │   └── useTodos.test.js
│   └── ...
├── utils/
│   ├── __tests__/
│   │   ├── themeManager.test.js
│   │   ├── privacyManager.test.js
│   │   └── logger.basic.test.js
│   └── ...
└── test/
    └── setup.js          # 测试环境配置

```

## 🚀 运行测试

### 基本命令

```bash

# 运行所有测试

npm test

# 监听模式运行测试

npm run test:watch

# 运行测试并生成覆盖率报告

npm run test:coverage

# 运行基础测试（快速验证）

npm run test:basic

# 打开测试 UI 界面

npm run test:ui

# 生成详细的测试报告

npm run test:report

```

### 运行特定测试

```bash

# 运行特定文件的测试

npx vitest run src/hooks/__tests__/useTodos.test.js

# 运行匹配模式的测试

npx vitest run --grep "Todo Component"

# 运行特定目录的测试

npx vitest run src/components/__tests__/

```

## 📊 测试覆盖率

### 当前覆盖率状态

- **语句覆盖率**: 6.58% (378/5747)
- **分支覆盖率**: 52.27% (46/88)
- **函数覆盖率**: 21.05% (12/57)
- **行覆盖率**: 6.58% (378/5747)

### 覆盖率目标

我们的目标是达到以下覆盖率：

- **语句覆盖率**: 80%
- **分支覆盖率**: 80%
- **函数覆盖率**: 80%
- **行覆盖率**: 80%

### 查看覆盖率报告

```bash

# 生成并查看覆盖率报告

npm run test:coverage

# 打开 HTML 覆盖率报告

open coverage/index.html

# 生成详细的测试质量报告

npm run test:report

```

## ✍️ 编写测试

### 测试文件命名规范

- 单元测试: `ComponentName.test.jsx` 或 `functionName.test.js`
- 基础测试: `ComponentName.basic.test.jsx`
- 集成测试: `feature.integration.test.js`

### 测试结构模板

```javascript

import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import ComponentName from '../ComponentName'

describe('ComponentName', () => {
  const mockProps = {
    // 模拟属性
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('渲染测试', () => {
    it('应该渲染基本内容', () => {
      render(<ComponentName {...mockProps} />)

      expect(screen.getByText('预期文本')).toBeInTheDocument()
    })
  })

  describe('交互测试', () => {
    it('应该处理用户交互', () => {
      render(<ComponentName {...mockProps} />)

      const button = screen.getByRole('button')
      fireEvent.click(button)

      expect(mockProps.onClick).toHaveBeenCalled()
    })
  })

  describe('边界情况', () => {
    it('应该处理空数据', () => {
      render(<ComponentName {...mockProps} data={null} />)

      expect(screen.getByText('暂无数据')).toBeInTheDocument()
    })
  })
})

```

### Hook 测试模板

```javascript

import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useCustomHook } from '../useCustomHook'

describe('useCustomHook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('应该返回初始状态', () => {
    const { result } = renderHook(() => useCustomHook())

    expect(result.current.value).toBe(initialValue)
  })

  it('应该更新状态', () => {
    const { result } = renderHook(() => useCustomHook())

    act(() => {
      result.current.setValue(newValue)
    })

    expect(result.current.value).toBe(newValue)
  })
})

```

### 测试最佳实践

1. **测试用户行为，而不是实现细节**

   ```javascript

   // ✅ 好的做法
   expect(screen.getByText('添加待办事项')).toBeInTheDocument()

   // ❌ 避免的做法
   expect(component.state.todos).toHaveLength(1)

   ```

2. **使用有意义的测试描述**

   ```javascript

   // ✅ 好的做法
   it('点击删除按钮应该显示确认对话框', () => {})

   // ❌ 避免的做法
   it('should work', () => {})

   ```

3. **测试边界条件**

   ```javascript

   it('应该处理空列表', () => {})
   it('应该处理网络错误', () => {})
   it('应该处理无效输入', () => {})

   ```

4. **保持测试独立**

   ```javascript

   beforeEach(() => {
     vi.clearAllMocks()
     localStorage.clear()
   })

   ```

## 🔄 CI/CD 集成

### GitHub Actions

我们的 CI/CD 流程包括：

1. **代码检查**: ESLint 静态分析
2. **测试运行**: 所有测试用例
3. **覆盖率检查**: 覆盖率阈值验证
4. **报告生成**: 覆盖率和测试报告

### 覆盖率阈值

在 `vitest.config.js` 中配置的覆盖率阈值：

```javascript

coverage: {
  thresholds: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
}

```

### 自动化报告

- **Codecov**: 覆盖率趋势分析
- **Coveralls**: 覆盖率徽章和报告
- **PR 评论**: 自动覆盖率变化报告

## 🛠️ 故障排除

### 常见问题

1. **测试运行缓慢**

   ```bash

   # 使用并行运行

   npx vitest run --threads

   ```

2. **模拟不工作**

   ```javascript

   // 确保在测试前清理模拟
   beforeEach(() => {
     vi.clearAllMocks()
   })

   ```

3. **DOM 清理问题**

   ```javascript

   // 使用 cleanup 自动清理
   import { cleanup } from '@testing-library/react'
   afterEach(cleanup)

   ```

### 调试测试

```bash

# 运行单个测试文件进行调试

npx vitest run --reporter=verbose src/path/to/test.js

# 使用 UI 模式进行交互式调试

npm run test:ui

```

## 📚 参考资源

- [Vitest 官方文档](https://vitest.dev/)
- [React Testing Library 文档](https://testing-library.com/docs/react-testing-library/intro/)
- [测试最佳实践](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [覆盖率报告解读](https://istanbul.js.org/docs/tutorials/coverage/)

---

**注意**: 这是一个持续改进的文档。随着项目的发展，我们会不断更新测试策略和最佳实践。
