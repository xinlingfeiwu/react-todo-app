import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import Todo from '../Todo'

describe('Todo Component - Basic Tests', () => {
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

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('基本渲染', () => {
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

  describe('完成状态', () => {
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

    it('已完成的待办事项应该有完成样式', () => {
      const completedTodo = { ...mockTodo, isCompleted: true }
      render(<Todo 
        todo={completedTodo} 
        deleteTodo={mockFunctions.deleteTodo}
        toggleCompletion={mockFunctions.toggleCompletion}
        toggleEditing={mockFunctions.toggleEditing}
        editTodo={mockFunctions.editTodo}
      />)
      
      const todoElement = screen.getByText('Test todo content').closest('.todo')
      expect(todoElement).toHaveClass('completed')
    })

    it('已完成的待办事项编辑按钮应该被禁用', () => {
      const completedTodo = { ...mockTodo, isCompleted: true }
      render(<Todo 
        todo={completedTodo} 
        deleteTodo={mockFunctions.deleteTodo}
        toggleCompletion={mockFunctions.toggleCompletion}
        toggleEditing={mockFunctions.toggleEditing}
        editTodo={mockFunctions.editTodo}
      />)
      
      const editBtn = screen.getByTitle('已完成的项目无法编辑')
      expect(editBtn).toBeDisabled()
    })
  })

  describe('交互功能', () => {
    it('点击完成按钮应该调用 toggleCompletion', () => {
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

    it('点击文本也应该切换完成状态', () => {
      render(<Todo 
        todo={mockTodo} 
        deleteTodo={mockFunctions.deleteTodo}
        toggleCompletion={mockFunctions.toggleCompletion}
        toggleEditing={mockFunctions.toggleEditing}
        editTodo={mockFunctions.editTodo}
      />)
      
      const todoText = screen.getByText('Test todo content')
      fireEvent.click(todoText)
      
      expect(mockFunctions.toggleCompletion).toHaveBeenCalledWith(mockTodo.id)
    })

    it('点击编辑按钮应该调用 toggleEditing', () => {
      render(<Todo 
        todo={mockTodo} 
        deleteTodo={mockFunctions.deleteTodo}
        toggleCompletion={mockFunctions.toggleCompletion}
        toggleEditing={mockFunctions.toggleEditing}
        editTodo={mockFunctions.editTodo}
      />)
      
      const editBtn = screen.getByTitle('编辑')
      fireEvent.click(editBtn)
      
      expect(mockFunctions.toggleEditing).toHaveBeenCalledWith(mockTodo.id)
    })

    it('点击删除按钮应该显示确认对话框', () => {
      render(<Todo 
        todo={mockTodo} 
        deleteTodo={mockFunctions.deleteTodo}
        toggleCompletion={mockFunctions.toggleCompletion}
        toggleEditing={mockFunctions.toggleEditing}
        editTodo={mockFunctions.editTodo}
      />)
      
      const deleteBtn = screen.getByTitle('删除')
      fireEvent.click(deleteBtn)
      
      // 应该显示确认对话框
      expect(screen.getByText('确认删除')).toBeInTheDocument()
      expect(screen.getByText(/确定要删除待办事项/)).toBeInTheDocument()
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
      
      // 应该显示编辑表单而不是普通的待办事项显示
      expect(screen.queryByText('Test todo content')).not.toBeInTheDocument()
      // 编辑表单应该存在（具体内容取决于 EditForm 组件的实现）
    })
  })

  describe('确认删除对话框', () => {
    it('确认删除应该调用 deleteTodo', () => {
      render(<Todo 
        todo={mockTodo} 
        deleteTodo={mockFunctions.deleteTodo}
        toggleCompletion={mockFunctions.toggleCompletion}
        toggleEditing={mockFunctions.toggleEditing}
        editTodo={mockFunctions.editTodo}
      />)
      
      // 点击删除按钮
      const deleteBtn = screen.getByTitle('删除')
      fireEvent.click(deleteBtn)
      
      // 点击确认删除
      const confirmBtn = screen.getByText('删除')
      fireEvent.click(confirmBtn)
      
      expect(mockFunctions.deleteTodo).toHaveBeenCalledWith(mockTodo.id)
    })

    it('取消删除应该关闭对话框', () => {
      render(<Todo 
        todo={mockTodo} 
        deleteTodo={mockFunctions.deleteTodo}
        toggleCompletion={mockFunctions.toggleCompletion}
        toggleEditing={mockFunctions.toggleEditing}
        editTodo={mockFunctions.editTodo}
      />)
      
      // 点击删除按钮
      const deleteBtn = screen.getByTitle('删除')
      fireEvent.click(deleteBtn)
      
      // 点击取消
      const cancelBtn = screen.getByText('取消')
      fireEvent.click(cancelBtn)
      
      // 对话框应该消失
      expect(screen.queryByText('确认删除')).not.toBeInTheDocument()
    })
  })
})
