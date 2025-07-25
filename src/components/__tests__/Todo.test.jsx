import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import Todo from '../Todo'

describe('Todo Component', () => {
  const mockTodo = {
    id: 1,
    content: 'Test todo content',
    isCompleted: false,
    isEditing: false,
    createdAt: '2024-01-01T00:00:00.000Z'
  }

  const mockFunctions = {
    deleteTodo: vi.fn(),
    toggleCompletion: vi.fn(),
    toggleEditing: vi.fn(),
    editTodo: vi.fn()
  }

  const renderTodo = (todo = mockTodo) => {
    return render(<Todo
      todo={todo}
      deleteTodo={mockFunctions.deleteTodo}
      toggleCompletion={mockFunctions.toggleCompletion}
      toggleEditing={mockFunctions.toggleEditing}
      editTodo={mockFunctions.editTodo}
    />)
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('渲染测试', () => {
    it('应该渲染待办事项内容', () => {
      render(<Todo
        todo={mockTodo}
        deleteTodo={mockFunctions.deleteTodo}
        toggleCompletion={mockFunctions.toggleCompletion}
        toggleEditing={mockFunctions.toggleEditing}
        editTodo={mockFunctions.editTodo}
      />)

      expect(screen.getByText('Test todo content')).toBeInTheDocument()
    })

    it('应该显示完成状态按钮', () => {
      render(<Todo
        todo={mockTodo}
        deleteTodo={mockFunctions.deleteTodo}
        toggleCompletion={mockFunctions.toggleCompletion}
        toggleEditing={mockFunctions.toggleEditing}
        editTodo={mockFunctions.editTodo}
      />)

      const completionBtn = screen.getByTitle('标记为完成')
      expect(completionBtn).toBeInTheDocument()
    })

    it('已完成的待办事项应该显示撤销按钮', () => {
      const completedTodo = { ...mockTodo, isCompleted: true }
      render(<Todo
        todo={completedTodo}
        deleteTodo={mockFunctions.deleteTodo}
        toggleCompletion={mockFunctions.toggleCompletion}
        toggleEditing={mockFunctions.toggleEditing}
        editTodo={mockFunctions.editTodo}
      />)

      const undoBtn = screen.getByTitle('标记为未完成')
      expect(undoBtn).toBeInTheDocument()
    })

    it('应该显示编辑和删除按钮', () => {
      render(<Todo
        todo={mockTodo}
        deleteTodo={mockFunctions.deleteTodo}
        toggleCompletion={mockFunctions.toggleCompletion}
        toggleEditing={mockFunctions.toggleEditing}
        editTodo={mockFunctions.editTodo}
      />)

      expect(screen.getByTitle('编辑')).toBeInTheDocument()
      expect(screen.getByTitle('删除')).toBeInTheDocument()
    })
  })

  describe('交互测试', () => {
    it('点击完成按钮应该切换完成状态', () => {
      render(<Todo
        todo={mockTodo}
        deleteTodo={mockFunctions.deleteTodo}
        toggleCompletion={mockFunctions.toggleCompletion}
        toggleEditing={mockFunctions.toggleEditing}
        editTodo={mockFunctions.editTodo}
      />)

      const completionBtn = screen.getByTitle('标记为完成')
      fireEvent.click(completionBtn)

      expect(mockFunctions.toggleCompletion).toHaveBeenCalledWith(mockTodo.id)
    })

    it('点击编辑按钮应该切换编辑状态', () => {
      render(<Todo
        todo={mockTodo}
        deleteTodo={mockFunctions.deleteTodo}
        toggleCompletion={mockFunctions.toggleCompletion}
        toggleEditing={mockFunctions.toggleEditing}
        editTodo={mockFunctions.editTodo}
      />)

      const editButton = screen.getByTitle('编辑')
      fireEvent.click(editButton)

      expect(mockFunctions.toggleEditing).toHaveBeenCalledWith(mockTodo.id)
    })

    it('点击删除按钮应该显示确认对话框', async () => {
      const user = userEvent.setup()
      render(<Todo
        todo={mockTodo}
        deleteTodo={mockFunctions.deleteTodo}
        toggleCompletion={mockFunctions.toggleCompletion}
        toggleEditing={mockFunctions.toggleEditing}
        editTodo={mockFunctions.editTodo}
      />)

      const deleteButton = screen.getByTitle('删除')
      await user.click(deleteButton)

      // 应该显示确认对话框
      expect(screen.getByText('确认删除')).toBeInTheDocument()
      expect(screen.getByText(/确定要删除待办事项/)).toBeInTheDocument()

      // 点击确认删除
      const confirmBtn = screen.getByText('删除')
      await user.click(confirmBtn)

      expect(mockFunctions.deleteTodo).toHaveBeenCalledWith(mockTodo.id)
    })
  })

  describe('编辑模式', () => {
    it('编辑模式下应该显示编辑表单', () => {
      const editingTodo = { ...mockTodo, isEditing: true }
      render(<Todo
        todo={editingTodo}
        deleteTodo={mockFunctions.deleteTodo}
        toggleCompletion={mockFunctions.toggleCompletion}
        toggleEditing={mockFunctions.toggleEditing}
        editTodo={mockFunctions.editTodo}
      />)

      // 应该显示输入框而不是文本
      expect(screen.getByDisplayValue('Test todo content')).toBeInTheDocument()
      expect(screen.queryByText('Test todo content')).not.toBeInTheDocument()
    })

    it('编辑模式下应该显示编辑表单', () => {
      const editingTodo = { ...mockTodo, isEditing: true }
      render(<Todo
        todo={editingTodo}
        deleteTodo={mockFunctions.deleteTodo}
        toggleCompletion={mockFunctions.toggleCompletion}
        toggleEditing={mockFunctions.toggleEditing}
        editTodo={mockFunctions.editTodo}
      />)

      // 应该显示编辑表单的按钮
      expect(screen.getByRole('button', { name: /完成/ })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /取消/ })).toBeInTheDocument()

      // 应该显示输入框
      expect(screen.getByDisplayValue('Test todo content')).toBeInTheDocument()
    })
  })

  describe('样式测试', () => {
    it('已完成的待办事项应该有完成样式', () => {
      const completedTodo = { ...mockTodo, isCompleted: true }
      renderTodo(completedTodo)

      const todoElement = screen.getByText('Test todo content').closest('.todo')
      expect(todoElement).toHaveClass('completed')
    })

    it('编辑模式下应该显示编辑表单', () => {
      const editingTodo = { ...mockTodo, isEditing: true }
      renderTodo(editingTodo)

      // 编辑模式下应该显示编辑表单而不是普通的 todo 元素
      expect(screen.getByDisplayValue('Test todo content')).toBeInTheDocument()
      expect(document.querySelector('.edit-form')).toBeInTheDocument()
      expect(document.querySelector('.todo')).not.toBeInTheDocument()
    })
  })

  describe('键盘交互', () => {
    it('按 Enter 键应该保存编辑', async () => {
      const user = userEvent.setup()
      const editingTodo = { ...mockTodo, isEditing: true }
      renderTodo(editingTodo)

      const input = screen.getByDisplayValue('Test todo content')
      await user.clear(input)
      await user.type(input, 'Updated content')
      await user.keyboard('{Enter}')

      expect(mockFunctions.editTodo).toHaveBeenCalledWith(mockTodo.id, 'Updated content')
    })

    it('按 Escape 键应该取消编辑', () => {
      const editingTodo = { ...mockTodo, isEditing: true }
      renderTodo(editingTodo)

      const input = screen.getByDisplayValue('Test todo content')
      fireEvent.keyDown(input, { key: 'Escape', code: 'Escape' })

      expect(mockFunctions.toggleEditing).toHaveBeenCalledWith(mockTodo.id)
    })
  })

  describe('边界情况', () => {
    it('应该处理空内容', () => {
      const emptyTodo = { ...mockTodo, content: '' }
      renderTodo(emptyTodo)

      // 应该渲染空内容的 todo 元素
      const todoElement = document.querySelector('.todo')
      expect(todoElement).toBeInTheDocument()

      // 文本内容应该为空
      const textElement = document.querySelector('.todo-text')
      expect(textElement).toHaveTextContent('')
    })

    it('应该处理很长的内容', () => {
      const longContent = 'A'.repeat(200)
      const longTodo = { ...mockTodo, content: longContent }
      renderTodo(longTodo)
      
      expect(screen.getByText(longContent)).toBeInTheDocument()
    })

    it('应该处理特殊字符', () => {
      const specialContent = '特殊字符 & < > " \' 测试'
      const specialTodo = { ...mockTodo, content: specialContent }
      renderTodo(specialTodo)
      
      expect(screen.getByText(specialContent)).toBeInTheDocument()
    })
  })

  describe('无障碍性', () => {
    it('应该有正确的标题属性', () => {
      renderTodo()

      const completionBtn = screen.getByTitle('标记为完成')
      expect(completionBtn).toBeInTheDocument()

      const editButton = screen.getByTitle('编辑')
      expect(editButton).toBeInTheDocument()

      const deleteButton = screen.getByTitle('删除')
      expect(deleteButton).toBeInTheDocument()
    })

    it('应该支持键盘导航', () => {
      renderTodo()

      const editButton = screen.getByTitle('编辑')
      const deleteButton = screen.getByTitle('删除')
      const completionBtn = screen.getByTitle('标记为完成')

      expect(editButton).not.toBeDisabled()
      expect(deleteButton).not.toBeDisabled()
      expect(completionBtn).not.toBeDisabled()
    })
  })
})
