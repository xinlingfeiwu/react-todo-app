import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import TodoList from '../TodoList'

describe('TodoList Component', () => {
  const mockFunctions = {
    deleteTodo: vi.fn(),
    editTodo: vi.fn(),
    toggleCompletion: vi.fn(),
    toggleEditing: vi.fn()
  }

  const mockTodos = [
    {
      id: 1,
      content: '第一个待办事项',
      isCompleted: false,
      isEditing: false,
      createdAt: '2024-01-01T00:00:00.000Z'
    },
    {
      id: 2,
      content: '第二个待办事项',
      isCompleted: true,
      isEditing: false,
      createdAt: '2024-01-02T00:00:00.000Z'
    },
    {
      id: 3,
      content: '第三个待办事项',
      isCompleted: false,
      isEditing: false,
      createdAt: '2024-01-03T00:00:00.000Z'
    }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('基本渲染', () => {
    it('应该渲染所有待办事项', () => {
      render(
        <TodoList
          todos={mockTodos}
          {...mockFunctions}
          filter="all"
        />
      )

      expect(screen.getByText('第一个待办事项')).toBeInTheDocument()
      expect(screen.getByText('第二个待办事项')).toBeInTheDocument()
      expect(screen.getByText('第三个待办事项')).toBeInTheDocument()
    })

    it('应该有正确的 CSS 类', () => {
      render(
        <TodoList
          todos={mockTodos}
          {...mockFunctions}
          filter="all"
        />
      )

      const todoList = document.querySelector('.todo-list')
      expect(todoList).toBeInTheDocument()
    })

    it('应该为每个待办事项渲染 Todo 组件', () => {
      render(
        <TodoList
          todos={mockTodos}
          {...mockFunctions}
          filter="all"
        />
      )

      const todoElements = document.querySelectorAll('.todo')
      expect(todoElements).toHaveLength(3)
    })
  })

  describe('过滤功能', () => {
    it('应该只显示待完成的待办事项', () => {
      render(
        <TodoList
          todos={mockTodos}
          {...mockFunctions}
          filter="pending"
        />
      )

      expect(screen.getByText('第一个待办事项')).toBeInTheDocument()
      expect(screen.queryByText('第二个待办事项')).not.toBeInTheDocument()
      expect(screen.getByText('第三个待办事项')).toBeInTheDocument()
    })

    it('应该只显示已完成的待办事项', () => {
      render(
        <TodoList
          todos={mockTodos}
          {...mockFunctions}
          filter="completed"
        />
      )

      expect(screen.queryByText('第一个待办事项')).not.toBeInTheDocument()
      expect(screen.getByText('第二个待办事项')).toBeInTheDocument()
      expect(screen.queryByText('第三个待办事项')).not.toBeInTheDocument()
    })

    it('应该显示所有待办事项当过滤器为 all', () => {
      render(
        <TodoList
          todos={mockTodos}
          {...mockFunctions}
          filter="all"
        />
      )

      expect(screen.getByText('第一个待办事项')).toBeInTheDocument()
      expect(screen.getByText('第二个待办事项')).toBeInTheDocument()
      expect(screen.getByText('第三个待办事项')).toBeInTheDocument()
    })

    it('应该使用默认过滤器 all 当没有提供过滤器', () => {
      render(
        <TodoList
          todos={mockTodos}
          {...mockFunctions}
        />
      )

      expect(screen.getByText('第一个待办事项')).toBeInTheDocument()
      expect(screen.getByText('第二个待办事项')).toBeInTheDocument()
      expect(screen.getByText('第三个待办事项')).toBeInTheDocument()
    })
  })

  describe('空状态', () => {
    it('应该显示空状态消息当没有待办事项', () => {
      render(
        <TodoList
          todos={[]}
          {...mockFunctions}
          filter="all"
        />
      )

      expect(screen.getByText('暂无待办事项，添加一个开始吧！')).toBeInTheDocument()
    })

    it('应该显示待完成空状态消息', () => {
      const completedTodos = mockTodos.map(todo => ({ ...todo, isCompleted: true }))
      
      render(
        <TodoList
          todos={completedTodos}
          {...mockFunctions}
          filter="pending"
        />
      )

      expect(screen.getByText('太棒了！没有待完成的事项')).toBeInTheDocument()
    })

    it('应该显示已完成空状态消息', () => {
      const pendingTodos = mockTodos.map(todo => ({ ...todo, isCompleted: false }))
      
      render(
        <TodoList
          todos={pendingTodos}
          {...mockFunctions}
          filter="completed"
        />
      )

      expect(screen.getByText('还没有完成任何待办事项')).toBeInTheDocument()
    })

    it('空状态应该有正确的 CSS 类', () => {
      render(
        <TodoList
          todos={[]}
          {...mockFunctions}
          filter="all"
        />
      )

      const emptyState = document.querySelector('.empty-state')
      expect(emptyState).toBeInTheDocument()
    })
  })

  describe('函数传递', () => {
    it('应该将所有必需的函数传递给 Todo 组件', () => {
      render(
        <TodoList
          todos={[mockTodos[0]]}
          {...mockFunctions}
          filter="all"
        />
      )

      // 验证 Todo 组件接收到了正确的 props
      // 这里我们通过检查按钮是否存在来间接验证
      expect(screen.getByTitle('标记为完成')).toBeInTheDocument()
      expect(screen.getByTitle('编辑')).toBeInTheDocument()
      expect(screen.getByTitle('删除')).toBeInTheDocument()
    })

    it('应该为每个 Todo 传递正确的 key', () => {
      render(
        <TodoList
          todos={mockTodos}
          {...mockFunctions}
          filter="all"
        />
      )

      // React 会为每个元素分配正确的 key，我们通过检查渲染的元素数量来验证
      const todoElements = document.querySelectorAll('.todo')
      expect(todoElements).toHaveLength(3)
    })
  })

  describe('边界情况', () => {
    it('应该处理 undefined todos', () => {
      expect(() => {
        render(
          <TodoList
            todos={undefined}
            {...mockFunctions}
            filter="all"
          />
        )
      }).toThrow()
    })

    it('应该处理 null todos', () => {
      expect(() => {
        render(
          <TodoList
            todos={null}
            {...mockFunctions}
            filter="all"
          />
        )
      }).toThrow()
    })

    it('应该处理无效的过滤器值', () => {
      render(
        <TodoList
          todos={mockTodos}
          {...mockFunctions}
          filter="invalid"
        />
      )

      // 无效过滤器应该回退到显示所有待办事项
      expect(screen.getByText('第一个待办事项')).toBeInTheDocument()
      expect(screen.getByText('第二个待办事项')).toBeInTheDocument()
      expect(screen.getByText('第三个待办事项')).toBeInTheDocument()
    })

    it('应该处理缺失的函数 props', () => {
      expect(() => {
        render(
          <TodoList
            todos={mockTodos}
            filter="all"
          />
        )
      }).not.toThrow()
    })

    it('应该处理空字符串过滤器', () => {
      render(
        <TodoList
          todos={mockTodos}
          {...mockFunctions}
          filter=""
        />
      )

      // 空字符串应该回退到显示所有待办事项
      expect(screen.getByText('第一个待办事项')).toBeInTheDocument()
      expect(screen.getByText('第二个待办事项')).toBeInTheDocument()
      expect(screen.getByText('第三个待办事项')).toBeInTheDocument()
    })
  })

  describe('特殊内容处理', () => {
    it('应该处理包含特殊字符的待办事项', () => {
      const specialTodos = [
        {
          id: 1,
          content: '特殊字符 & < > " \' 测试',
          isCompleted: false,
          isEditing: false,
          createdAt: '2024-01-01T00:00:00.000Z'
        },
        {
          id: 2,
          content: '🎉 Emoji 测试 🚀',
          isCompleted: false,
          isEditing: false,
          createdAt: '2024-01-02T00:00:00.000Z'
        }
      ]

      render(
        <TodoList
          todos={specialTodos}
          {...mockFunctions}
          filter="all"
        />
      )

      expect(screen.getByText('特殊字符 & < > " \' 测试')).toBeInTheDocument()
      expect(screen.getByText('🎉 Emoji 测试 🚀')).toBeInTheDocument()
    })

    it('应该处理很长的待办事项内容', () => {
      const longContentTodo = {
        id: 1,
        content: 'A'.repeat(200),
        isCompleted: false,
        isEditing: false,
        createdAt: '2024-01-01T00:00:00.000Z'
      }

      render(
        <TodoList
          todos={[longContentTodo]}
          {...mockFunctions}
          filter="all"
        />
      )

      expect(screen.getByText('A'.repeat(200))).toBeInTheDocument()
    })

    it('应该处理空内容的待办事项', () => {
      const emptyContentTodo = {
        id: 1,
        content: '',
        isCompleted: false,
        isEditing: false,
        createdAt: '2024-01-01T00:00:00.000Z'
      }

      render(
        <TodoList
          todos={[emptyContentTodo]}
          {...mockFunctions}
          filter="all"
        />
      )

      // 应该仍然渲染 Todo 组件，即使内容为空
      const todoElements = document.querySelectorAll('.todo')
      expect(todoElements).toHaveLength(1)
    })
  })

  describe('性能', () => {
    it('应该能够处理大量待办事项', () => {
      const largeTodoList = Array.from({ length: 1000 }, (_, index) => ({
        id: index + 1,
        content: `待办事项 ${index + 1}`,
        isCompleted: index % 2 === 0,
        isEditing: false,
        createdAt: new Date().toISOString()
      }))

      expect(() => {
        render(
          <TodoList
            todos={largeTodoList}
            {...mockFunctions}
            filter="all"
          />
        )
      }).not.toThrow()

      const todoElements = document.querySelectorAll('.todo')
      expect(todoElements).toHaveLength(1000)
    })

    it('应该正确过滤大量待办事项', () => {
      const largeTodoList = Array.from({ length: 100 }, (_, index) => ({
        id: index + 1,
        content: `待办事项 ${index + 1}`,
        isCompleted: index < 50, // 前50个已完成
        isEditing: false,
        createdAt: new Date().toISOString()
      }))

      render(
        <TodoList
          todos={largeTodoList}
          {...mockFunctions}
          filter="completed"
        />
      )

      const todoElements = document.querySelectorAll('.todo')
      expect(todoElements).toHaveLength(50)
    })
  })
})
