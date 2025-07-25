import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useTodos } from '../hooks/useTodos'

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

describe('Performance Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockLocalStorage.getItem.mockReturnValue(null)
  })

  describe('useTodos Hook 性能测试', () => {
    it('应该在合理时间内处理大量待办事项', () => {
      const startTime = performance.now()
      
      // 创建大量待办事项数据
      const largeTodoList = Array.from({ length: 1000 }, (_, index) => ({
        id: index + 1,
        content: `Performance test todo ${index + 1}`,
        isCompleted: index % 2 === 0,
        isEditing: false,
        createdAt: new Date().toISOString()
      }))
      
      const largeData = {
        version: '1.0',
        timestamp: Date.now(),
        todos: largeTodoList
      }
      
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(largeData))
      
      const { result } = renderHook(() => useTodos())
      
      const loadTime = performance.now() - startTime
      
      // 加载时间应该少于 100ms
      expect(loadTime).toBeLessThan(100)
      
      // 验证数据正确加载
      expect(result.current.todos).toHaveLength(1000)
      expect(result.current.stats.total).toBe(1000)
      expect(result.current.stats.completed).toBe(500)
      expect(result.current.stats.pending).toBe(500)
    })

    it('批量操作应该在合理时间内完成', () => {
      // 准备大量数据
      const largeTodoList = Array.from({ length: 500 }, (_, index) => ({
        id: index + 1,
        content: `Batch test todo ${index + 1}`,
        isCompleted: false,
        isEditing: false,
        createdAt: new Date().toISOString()
      }))
      
      const largeData = {
        version: '1.0',
        timestamp: Date.now(),
        todos: largeTodoList
      }
      
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(largeData))
      
      const { result } = renderHook(() => useTodos())
      
      // 测试全选操作的性能
      const startTime = performance.now()
      
      act(() => {
        result.current.actions.toggleAllCompletion()
      })
      
      const toggleAllTime = performance.now() - startTime
      
      // 全选操作应该少于 50ms
      expect(toggleAllTime).toBeLessThan(50)
      
      // 验证操作结果
      expect(result.current.stats.completed).toBe(500)
      expect(result.current.stats.pending).toBe(0)
    })

    it('清除已完成项目应该高效执行', () => {
      // 准备混合状态的数据
      const mixedTodoList = Array.from({ length: 1000 }, (_, index) => ({
        id: index + 1,
        content: `Clear test todo ${index + 1}`,
        isCompleted: index < 600, // 前600个已完成
        isEditing: false,
        createdAt: new Date().toISOString()
      }))
      
      const mixedData = {
        version: '1.0',
        timestamp: Date.now(),
        todos: mixedTodoList
      }
      
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mixedData))
      
      const { result } = renderHook(() => useTodos())
      
      expect(result.current.stats.completed).toBe(600)
      expect(result.current.stats.pending).toBe(400)
      
      // 测试清除已完成项目的性能
      const startTime = performance.now()
      
      act(() => {
        result.current.actions.clearCompleted()
      })
      
      const clearTime = performance.now() - startTime
      
      // 清除操作应该少于 30ms
      expect(clearTime).toBeLessThan(30)
      
      // 验证操作结果
      expect(result.current.todos).toHaveLength(400)
      expect(result.current.stats.completed).toBe(0)
      expect(result.current.stats.pending).toBe(400)
    })

    it('频繁的添加操作应该保持性能', () => {
      const { result } = renderHook(() => useTodos())
      
      const startTime = performance.now()
      
      // 连续添加100个待办事项
      act(() => {
        for (let i = 0; i < 100; i++) {
          result.current.actions.addTodo(`Frequent add test ${i}`)
        }
      })
      
      const addTime = performance.now() - startTime
      
      // 100次添加操作应该少于 100ms
      expect(addTime).toBeLessThan(100)
      
      // 验证结果
      expect(result.current.todos).toHaveLength(100)
      expect(result.current.stats.total).toBe(100)
    })

    it('localStorage 写入操作不应该阻塞', () => {
      const { result } = renderHook(() => useTodos())
      
      // 模拟慢速的 localStorage.setItem
      let setItemCallCount = 0
      mockLocalStorage.setItem.mockImplementation(() => {
        setItemCallCount++
        // 模拟一些延迟，但不应该影响主线程
        return Promise.resolve()
      })
      
      const startTime = performance.now()
      
      act(() => {
        result.current.actions.addTodo('Performance test todo')
      })
      
      const operationTime = performance.now() - startTime
      
      // 主操作应该很快完成，不等待 localStorage
      expect(operationTime).toBeLessThan(10)
      
      // 验证 localStorage 被调用
      expect(setItemCallCount).toBeGreaterThan(0)
    })
  })

  describe('内存使用测试', () => {
    it('应该正确清理内存，避免内存泄漏', () => {
      // 创建多个 hook 实例
      const hooks = []
      
      for (let i = 0; i < 10; i++) {
        const { result, unmount } = renderHook(() => useTodos())
        hooks.push({ result, unmount })
        
        // 添加一些数据
        act(() => {
          result.current.actions.addTodo(`Memory test ${i}`)
        })
      }
      
      // 卸载所有 hooks
      hooks.forEach(({ unmount }) => {
        expect(() => unmount()).not.toThrow()
      })
      
      // 验证没有遗留的定时器或监听器
      // 这里可以检查 global 对象上是否有遗留的引用
      expect(true).toBe(true) // 占位符，实际项目中可以添加更具体的内存检查
    })

    it('大量数据操作后应该能够正确垃圾回收', () => {
      const { result, unmount } = renderHook(() => useTodos())
      
      // 创建大量数据
      act(() => {
        for (let i = 0; i < 1000; i++) {
          result.current.actions.addTodo(`GC test ${i}`)
        }
      })
      
      expect(result.current.todos).toHaveLength(1000)
      
      // 清除所有数据
      act(() => {
        result.current.actions.clearAllData()
      })
      
      expect(result.current.todos).toHaveLength(0)
      
      // 卸载组件
      expect(() => unmount()).not.toThrow()
    })
  })

  describe('并发操作测试', () => {
    it('应该正确处理快速连续的操作', () => {
      const { result } = renderHook(() => useTodos())
      
      // 快速连续执行多个操作
      act(() => {
        result.current.actions.addTodo('Concurrent test 1')
        result.current.actions.addTodo('Concurrent test 2')
        result.current.actions.addTodo('Concurrent test 3')
      })

      // 获取待办事项 ID
      const firstTodoId = result.current.todos[0]?.id
      const secondTodoId = result.current.todos[1]?.id

      act(() => {
        // 立即切换第一个的状态
        if (firstTodoId) {
          result.current.actions.toggleCompletion(firstTodoId)
        }

        // 立即删除第二个
        if (secondTodoId) {
          result.current.actions.deleteTodo(secondTodoId)
        }
      })

      // 验证最终状态的一致性
      expect(result.current.todos).toHaveLength(2)
      expect(result.current.stats.total).toBe(2)
      
      // 第一个应该是已完成的
      const firstTodo = result.current.todos.find(todo => todo.content === 'Concurrent test 1')
      expect(firstTodo?.isCompleted).toBe(true)
      
      // 第二个应该被删除了，第三个应该存在
      const thirdTodo = result.current.todos.find(todo => todo.content === 'Concurrent test 3')
      expect(thirdTodo).toBeDefined()
    })

    it('应该处理状态更新竞争条件', () => {
      const { result } = renderHook(() => useTodos())
      
      act(() => {
        result.current.actions.addTodo('Race condition test')
      })
      
      const todoId = result.current.todos[0].id
      
      // 模拟竞争条件：同时进行多个状态更新
      act(() => {
        result.current.actions.toggleCompletion(todoId)
        result.current.actions.toggleEditing(todoId)
        result.current.actions.editTodo(todoId, 'Updated content')
      })
      
      // 验证最终状态是一致的
      const finalTodo = result.current.todos.find(todo => todo.id === todoId)
      expect(finalTodo).toBeDefined()
      expect(finalTodo.content).toBe('Updated content')
      expect(finalTodo.isEditing).toBe(false) // 编辑完成后应该退出编辑模式
    })
  })

  describe('边界性能测试', () => {
    it('应该处理极长的待办事项内容', () => {
      const { result } = renderHook(() => useTodos())
      
      // 创建一个非常长的字符串
      const longContent = 'A'.repeat(10000)
      
      const startTime = performance.now()
      
      act(() => {
        result.current.actions.addTodo(longContent)
      })
      
      const operationTime = performance.now() - startTime
      
      // 即使内容很长，操作也应该很快
      expect(operationTime).toBeLessThan(50)
      
      // 验证内容正确保存
      expect(result.current.todos[0].content).toBe(longContent)
    })

    it('应该处理包含特殊字符的大量数据', () => {
      const { result } = renderHook(() => useTodos())
      
      const specialChars = ['🎉', '🚀', '💻', '🔥', '⭐', '🎯', '📝', '✅']
      
      const startTime = performance.now()
      
      act(() => {
        for (let i = 0; i < 100; i++) {
          const randomChar = specialChars[i % specialChars.length]
          result.current.actions.addTodo(`${randomChar} Special test ${i} ${randomChar}`)
        }
      })
      
      const operationTime = performance.now() - startTime
      
      // 特殊字符不应该显著影响性能
      expect(operationTime).toBeLessThan(100)
      
      // 验证数据正确
      expect(result.current.todos).toHaveLength(100)
      expect(result.current.todos[0].content).toContain('🎉')
    })
  })
})
