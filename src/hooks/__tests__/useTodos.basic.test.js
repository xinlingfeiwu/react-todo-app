import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useTodos } from '../useTodos'
import { STORAGE_KEY } from '../../constants/storageKeys'

// 模拟 localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
}

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true
})

describe('useTodos Hook - Basic Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockLocalStorage.getItem.mockReturnValue(null)
  })

  describe('初始化测试', () => {
    it('应该从空状态开始初始化', () => {
      const { result } = renderHook(() => useTodos())
      
      expect(result.current.todos).toEqual([])
      expect(result.current.stats).toEqual({
        total: 0,
        completed: 0,
        pending: 0
      })
    })

    it('应该提供所有必需的 actions', () => {
      const { result } = renderHook(() => useTodos())
      
      expect(typeof result.current.actions.addTodo).toBe('function')
      expect(typeof result.current.actions.deleteTodo).toBe('function')
      expect(typeof result.current.actions.editTodo).toBe('function')
      expect(typeof result.current.actions.toggleCompletion).toBe('function')
      expect(typeof result.current.actions.toggleEditing).toBe('function')
      expect(typeof result.current.actions.clearCompleted).toBe('function')
      expect(typeof result.current.actions.toggleAllCompletion).toBe('function')
      expect(typeof result.current.actions.exportTodos).toBe('function')
      expect(typeof result.current.actions.clearAllData).toBe('function')
    })
  })

  describe('添加待办事项', () => {
    it('应该添加新的待办事项', () => {
      const { result } = renderHook(() => useTodos())
      
      act(() => {
        result.current.actions.addTodo('New todo')
      })
      
      expect(result.current.todos).toHaveLength(1)
      expect(result.current.todos[0].content).toBe('New todo')
      expect(result.current.todos[0].isCompleted).toBe(false)
      expect(result.current.todos[0].isEditing).toBe(false)
      expect(result.current.todos[0].id).toBeDefined()
      expect(result.current.todos[0].createdAt).toBeDefined()
    })

    it('应该忽略空内容', () => {
      const { result } = renderHook(() => useTodos())
      
      act(() => {
        result.current.actions.addTodo('')
      })
      
      expect(result.current.todos).toHaveLength(0)
    })

    it('应该修剪内容的空格', () => {
      const { result } = renderHook(() => useTodos())
      
      act(() => {
        result.current.actions.addTodo('  Trimmed todo  ')
      })
      
      expect(result.current.todos[0].content).toBe('Trimmed todo')
    })
  })

  describe('删除待办事项', () => {
    it('应该删除指定的待办事项', () => {
      const { result } = renderHook(() => useTodos())
      
      // 先添加一个待办事项
      act(() => {
        result.current.actions.addTodo('Todo to delete')
      })
      
      const todoId = result.current.todos[0].id
      
      // 删除它
      act(() => {
        result.current.actions.deleteTodo(todoId)
      })
      
      expect(result.current.todos).toHaveLength(0)
    })

    it('应该忽略不存在的ID', () => {
      const { result } = renderHook(() => useTodos())
      
      act(() => {
        result.current.actions.addTodo('Existing todo')
      })
      
      act(() => {
        result.current.actions.deleteTodo(999999)
      })
      
      expect(result.current.todos).toHaveLength(1)
    })
  })

  describe('切换完成状态', () => {
    it('应该切换待办事项的完成状态', () => {
      const { result } = renderHook(() => useTodos())
      
      act(() => {
        result.current.actions.addTodo('Toggle todo')
      })
      
      const todoId = result.current.todos[0].id
      
      // 切换为完成
      act(() => {
        result.current.actions.toggleCompletion(todoId)
      })
      
      expect(result.current.todos[0].isCompleted).toBe(true)
      
      // 切换回未完成
      act(() => {
        result.current.actions.toggleCompletion(todoId)
      })
      
      expect(result.current.todos[0].isCompleted).toBe(false)
    })
  })

  describe('统计信息', () => {
    it('应该正确计算统计信息', () => {
      const { result } = renderHook(() => useTodos())
      
      act(() => {
        result.current.actions.addTodo('Todo 1')
        result.current.actions.addTodo('Todo 2')
        result.current.actions.addTodo('Todo 3')
      })
      
      // 标记一些为完成
      act(() => {
        result.current.actions.toggleCompletion(result.current.todos[0].id)
        result.current.actions.toggleCompletion(result.current.todos[2].id)
      })
      
      expect(result.current.stats).toEqual({
        total: 3,
        completed: 2,
        pending: 1
      })
    })
  })

  describe('数据持久化', () => {
    it('应该在数据变化时保存到 localStorage', () => {
      const { result } = renderHook(() => useTodos())
      
      act(() => {
        result.current.actions.addTodo('Persistent todo')
      })
      
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEY,
        expect.stringContaining('Persistent todo')
      )
    })
  })
})
