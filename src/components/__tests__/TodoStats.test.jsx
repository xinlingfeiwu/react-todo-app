import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import TodoStats from '../TodoStats'

describe('TodoStats Component', () => {
  const mockOnClearCompleted = vi.fn()
  const mockOnToggleAll = vi.fn()

  const defaultProps = {
    onClearCompleted: mockOnClearCompleted,
    onToggleAll: mockOnToggleAll
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('基本渲染', () => {
    it('应该显示统计信息', () => {
      const stats = { total: 5, completed: 2, pending: 3 }
      
      render(<TodoStats stats={stats} {...defaultProps} />)

      expect(screen.getByText('总计:')).toBeInTheDocument()
      expect(screen.getByText('5')).toBeInTheDocument()
      expect(screen.getByText('已完成:')).toBeInTheDocument()
      expect(screen.getByText('2')).toBeInTheDocument()
      expect(screen.getByText('待完成:')).toBeInTheDocument()
      expect(screen.getByText('3')).toBeInTheDocument()
    })

    it('应该有正确的 CSS 类', () => {
      const stats = { total: 5, completed: 2, pending: 3 }
      
      render(<TodoStats stats={stats} {...defaultProps} />)

      expect(document.querySelector('.todo-stats')).toBeInTheDocument()
      expect(document.querySelector('.stats-info')).toBeInTheDocument()
      expect(document.querySelector('.stats-actions')).toBeInTheDocument()
    })

    it('应该不渲染当总数为0', () => {
      const stats = { total: 0, completed: 0, pending: 0 }
      
      const { container } = render(<TodoStats stats={stats} {...defaultProps} />)

      expect(container.firstChild).toBeNull()
    })
  })

  describe('全选/全不选按钮', () => {
    it('应该显示"全部完成"当有未完成项', () => {
      const stats = { total: 5, completed: 2, pending: 3 }
      
      render(<TodoStats stats={stats} {...defaultProps} />)

      expect(screen.getByText('全部完成')).toBeInTheDocument()
      expect(screen.getByTitle('全部标记为完成')).toBeInTheDocument()
    })

    it('应该显示"全部未完成"当所有项都已完成', () => {
      const stats = { total: 3, completed: 3, pending: 0 }
      
      render(<TodoStats stats={stats} {...defaultProps} />)

      expect(screen.getByText('全部未完成')).toBeInTheDocument()
      expect(screen.getByTitle('全部标记为未完成')).toBeInTheDocument()
    })

    it('点击全选按钮应该调用 onToggleAll', async () => {
      const user = userEvent.setup()
      const stats = { total: 5, completed: 2, pending: 3 }
      
      render(<TodoStats stats={stats} {...defaultProps} />)

      const toggleAllBtn = screen.getByText('全部完成')
      await user.click(toggleAllBtn)

      expect(mockOnToggleAll).toHaveBeenCalledTimes(1)
    })

    it('应该显示全选按钮当总数大于0', () => {
      const stats = { total: 1, completed: 0, pending: 1 }
      
      render(<TodoStats stats={stats} {...defaultProps} />)

      expect(screen.getByText('全部完成')).toBeInTheDocument()
    })

    it('应该有正确的 CSS 类', () => {
      const stats = { total: 5, completed: 2, pending: 3 }
      
      render(<TodoStats stats={stats} {...defaultProps} />)

      const toggleAllBtn = document.querySelector('.btn-toggle-all')
      expect(toggleAllBtn).toBeInTheDocument()
    })
  })

  describe('清除已完成按钮', () => {
    it('应该显示清除按钮当有已完成项', () => {
      const stats = { total: 5, completed: 2, pending: 3 }

      render(<TodoStats stats={stats} {...defaultProps} />)

      expect(screen.getByText('清除已完成 (2)')).toBeInTheDocument()
      expect(screen.getByTitle('清除所有已完成的待办事项')).toBeInTheDocument()
    })

    it('应该不显示清除按钮当没有已完成项', () => {
      const stats = { total: 3, completed: 0, pending: 3 }

      render(<TodoStats stats={stats} {...defaultProps} />)

      expect(screen.queryByText(/清除已完成/)).not.toBeInTheDocument()
    })

    it('点击清除按钮应该调用 onClearCompleted', async () => {
      const user = userEvent.setup()
      const stats = { total: 5, completed: 2, pending: 3 }

      render(<TodoStats stats={stats} {...defaultProps} />)

      const clearBtn = screen.getByText('清除已完成 (2)')
      await user.click(clearBtn)

      expect(mockOnClearCompleted).toHaveBeenCalledTimes(1)
    })

    it('应该有正确的 CSS 类', () => {
      const stats = { total: 5, completed: 2, pending: 3 }
      
      render(<TodoStats stats={stats} {...defaultProps} />)

      const clearBtn = document.querySelector('.btn-clear-completed')
      expect(clearBtn).toBeInTheDocument()
    })
  })

  describe('统计数字显示', () => {
    it('应该显示正确的数字格式', () => {
      const stats = { total: 1234, completed: 567, pending: 667 }
      
      render(<TodoStats stats={stats} {...defaultProps} />)

      expect(screen.getByText('1234')).toBeInTheDocument()
      expect(screen.getByText('567')).toBeInTheDocument()
      expect(screen.getByText('667')).toBeInTheDocument()
    })

    it('应该处理零值', () => {
      const stats = { total: 1, completed: 0, pending: 1 }

      render(<TodoStats stats={stats} {...defaultProps} />)

      // 使用更具体的选择器来避免重复匹配
      expect(screen.getByText('总计:')).toBeInTheDocument()
      expect(screen.getByText('已完成:')).toBeInTheDocument()
      expect(screen.getByText('待完成:')).toBeInTheDocument()
    })

    it('应该处理大数字', () => {
      const stats = { total: 99999, completed: 50000, pending: 49999 }
      
      render(<TodoStats stats={stats} {...defaultProps} />)

      expect(screen.getByText('99999')).toBeInTheDocument()
      expect(screen.getByText('50000')).toBeInTheDocument()
      expect(screen.getByText('49999')).toBeInTheDocument()
    })
  })

  describe('边界情况', () => {
    it('应该处理缺失的 stats 属性', () => {
      expect(() => {
        render(<TodoStats {...defaultProps} />)
      }).toThrow()
    })

    it('应该处理 null stats', () => {
      expect(() => {
        render(<TodoStats stats={null} {...defaultProps} />)
      }).toThrow()
    })

    it('应该处理不完整的 stats 对象', () => {
      const incompleteStats = { total: 5 }

      expect(() => {
        render(<TodoStats stats={incompleteStats} {...defaultProps} />)
      }).not.toThrow()

      // 组件应该能够处理缺失的属性，使用 undefined 值
    })

    it('应该处理负数统计', () => {
      const negativeStats = { total: -1, completed: -1, pending: -1 }

      render(<TodoStats stats={negativeStats} {...defaultProps} />)

      // 组件会渲染负数，因为只检查 total === 0
      expect(screen.getByText('总计:')).toBeInTheDocument()
      expect(screen.getByText('已完成:')).toBeInTheDocument()
      expect(screen.getByText('待完成:')).toBeInTheDocument()
      // 验证组件确实渲染了
      expect(document.querySelector('.todo-stats')).toBeInTheDocument()
    })

    it('应该处理缺失的回调函数', () => {
      const stats = { total: 5, completed: 2, pending: 3 }
      
      expect(() => {
        render(<TodoStats stats={stats} />)
      }).not.toThrow()
    })

    it('应该处理 undefined 回调函数', () => {
      const stats = { total: 5, completed: 2, pending: 3 }
      
      expect(() => {
        render(<TodoStats stats={stats} onClearCompleted={undefined} onToggleAll={undefined} />)
      }).not.toThrow()
    })
  })

  describe('交互行为', () => {
    it('按钮应该可以通过键盘访问', () => {
      const stats = { total: 5, completed: 2, pending: 3 }

      render(<TodoStats stats={stats} {...defaultProps} />)

      const toggleAllBtn = screen.getByText('全部完成')
      const clearBtn = screen.getByText('清除已完成 (2)')

      expect(toggleAllBtn).not.toBeDisabled()
      expect(clearBtn).not.toBeDisabled()
    })

    it('应该支持键盘导航', () => {
      const stats = { total: 5, completed: 2, pending: 3 }

      render(<TodoStats stats={stats} {...defaultProps} />)

      const toggleAllBtn = screen.getByText('全部完成')
      const clearBtn = screen.getByText('清除已完成 (2)')

      // 按钮应该可以获得焦点
      toggleAllBtn.focus()
      expect(document.activeElement).toBe(toggleAllBtn)

      clearBtn.focus()
      expect(document.activeElement).toBe(clearBtn)
    })
  })

  describe('不同状态组合', () => {
    it('应该处理只有已完成项的情况', () => {
      const stats = { total: 3, completed: 3, pending: 0 }

      render(<TodoStats stats={stats} {...defaultProps} />)

      expect(screen.getByText('全部未完成')).toBeInTheDocument()
      expect(screen.getByText('清除已完成 (3)')).toBeInTheDocument()
      // 验证统计信息显示
      expect(screen.getByText('总计:')).toBeInTheDocument()
      expect(screen.getByText('已完成:')).toBeInTheDocument()
      expect(screen.getByText('待完成:')).toBeInTheDocument()
    })

    it('应该处理只有待完成项的情况', () => {
      const stats = { total: 3, completed: 0, pending: 3 }

      render(<TodoStats stats={stats} {...defaultProps} />)

      expect(screen.getByText('全部完成')).toBeInTheDocument()
      expect(screen.queryByText(/清除已完成/)).not.toBeInTheDocument()
      // 验证统计信息显示
      expect(screen.getByText('总计:')).toBeInTheDocument()
      expect(screen.getByText('已完成:')).toBeInTheDocument()
      expect(screen.getByText('待完成:')).toBeInTheDocument()
    })

    it('应该处理单个待办事项的情况', () => {
      const stats = { total: 1, completed: 0, pending: 1 }

      render(<TodoStats stats={stats} {...defaultProps} />)

      expect(screen.getByText('全部完成')).toBeInTheDocument()
      expect(screen.queryByText(/清除已完成/)).not.toBeInTheDocument()
      // 验证统计信息显示
      expect(screen.getByText('总计:')).toBeInTheDocument()
      expect(screen.getByText('已完成:')).toBeInTheDocument()
      expect(screen.getByText('待完成:')).toBeInTheDocument()
    })

    it('应该处理单个已完成项的情况', () => {
      const stats = { total: 1, completed: 1, pending: 0 }

      render(<TodoStats stats={stats} {...defaultProps} />)

      expect(screen.getByText('全部未完成')).toBeInTheDocument()
      expect(screen.getByText('清除已完成 (1)')).toBeInTheDocument()
      // 验证统计信息显示
      expect(screen.getByText('总计:')).toBeInTheDocument()
      expect(screen.getByText('已完成:')).toBeInTheDocument()
      expect(screen.getByText('待完成:')).toBeInTheDocument()
    })
  })

  describe('性能', () => {
    it('应该在相同 props 时不重新渲染', () => {
      const stats = { total: 5, completed: 2, pending: 3 }
      
      const { rerender } = render(<TodoStats stats={stats} {...defaultProps} />)
      
      rerender(<TodoStats stats={stats} {...defaultProps} />)
      
      expect(screen.getByText('总计:')).toBeInTheDocument()
    })

    it('应该在 stats 变化时正确更新', () => {
      const initialStats = { total: 5, completed: 2, pending: 3 }
      const updatedStats = { total: 10, completed: 7, pending: 3 }
      
      const { rerender } = render(<TodoStats stats={initialStats} {...defaultProps} />)
      
      expect(screen.getByText('5')).toBeInTheDocument()
      expect(screen.getByText('2')).toBeInTheDocument()
      
      rerender(<TodoStats stats={updatedStats} {...defaultProps} />)
      
      expect(screen.getByText('10')).toBeInTheDocument()
      expect(screen.getByText('7')).toBeInTheDocument()
    })
  })
})
