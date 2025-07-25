import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import TodoFilter from '../TodoFilter'

describe('TodoFilter Component', () => {
  const mockOnFilterChange = vi.fn()

  const defaultProps = {
    currentFilter: 'all',
    onFilterChange: mockOnFilterChange,
    stats: {
      total: 5,
      completed: 2,
      pending: 3
    }
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('基本渲染', () => {
    it('应该渲染所有过滤器按钮', () => {
      render(<TodoFilter {...defaultProps} />)

      expect(screen.getByText('全部')).toBeInTheDocument()
      expect(screen.getByText('待完成')).toBeInTheDocument()
      expect(screen.getByText('已完成')).toBeInTheDocument()
    })

    it('应该显示正确的统计数字', () => {
      render(<TodoFilter {...defaultProps} />)

      expect(screen.getByText('5')).toBeInTheDocument()
      expect(screen.getByText('3')).toBeInTheDocument()
      expect(screen.getByText('2')).toBeInTheDocument()
    })

    it('应该高亮当前选中的过滤器', () => {
      render(<TodoFilter {...defaultProps} currentFilter="pending" />)

      const pendingButton = screen.getByText('待完成').closest('button')
      const allButton = screen.getByText('全部').closest('button')

      expect(pendingButton).toHaveClass('active')
      expect(allButton).not.toHaveClass('active')
    })
  })

  describe('过滤器交互', () => {
    it('点击"全部"应该调用 onFilterChange', async () => {
      const user = userEvent.setup()
      render(<TodoFilter {...defaultProps} currentFilter="pending" />)

      const allButton = screen.getByText('全部')
      await user.click(allButton)

      expect(mockOnFilterChange).toHaveBeenCalledWith('all')
    })

    it('点击"待完成"应该调用 onFilterChange', async () => {
      const user = userEvent.setup()
      render(<TodoFilter {...defaultProps} />)

      const pendingButton = screen.getByText('待完成')
      await user.click(pendingButton)

      expect(mockOnFilterChange).toHaveBeenCalledWith('pending')
    })

    it('点击"已完成"应该调用 onFilterChange', async () => {
      const user = userEvent.setup()
      render(<TodoFilter {...defaultProps} />)

      const completedButton = screen.getByText('已完成')
      await user.click(completedButton)

      expect(mockOnFilterChange).toHaveBeenCalledWith('completed')
    })
  })

  describe('统计数字显示', () => {
    it('应该隐藏为0的统计数字', () => {
      const emptyStats = {
        total: 0,
        completed: 0,
        pending: 0
      }

      render(<TodoFilter {...defaultProps} stats={emptyStats} />)

      expect(screen.queryByText('0')).not.toBeInTheDocument()
    })
  })

  describe('边界情况', () => {
    it('应该处理无效的 currentFilter 值', () => {
      render(<TodoFilter {...defaultProps} currentFilter="invalid" />)

      expect(screen.getByText('全部')).toBeInTheDocument()
      expect(screen.getByText('待完成')).toBeInTheDocument()
      expect(screen.getByText('已完成')).toBeInTheDocument()
    })
  })
})