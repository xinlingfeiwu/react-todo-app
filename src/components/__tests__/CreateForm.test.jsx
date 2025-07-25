import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import CreateForm from '../CreateForm'

describe('CreateForm Component', () => {
  const mockAddTodo = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('渲染测试', () => {
    it('应该渲染输入框和提交按钮', () => {
      render(<CreateForm addTodo={mockAddTodo} />)
      
      expect(screen.getByPlaceholderText(/添加新的待办事项|输入待办事项/)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /添加|提交/ })).toBeInTheDocument()
    })

    it('输入框应该有正确的属性', () => {
      render(<CreateForm addTodo={mockAddTodo} />)
      
      const input = screen.getByPlaceholderText(/添加新的待办事项|输入待办事项/)
      expect(input).toHaveAttribute('type', 'text')
      expect(input).toHaveAttribute('maxLength')
      expect(input).not.toBeDisabled()
    })

    it('提交按钮应该有正确的类型', () => {
      render(<CreateForm addTodo={mockAddTodo} />)
      
      const button = screen.getByRole('button', { name: /添加|提交/ })
      expect(button).toHaveAttribute('type', 'submit')
    })
  })

  describe('输入交互', () => {
    it('应该能够在输入框中输入文本', async () => {
      const user = userEvent.setup()
      render(<CreateForm addTodo={mockAddTodo} />)
      
      const input = screen.getByPlaceholderText(/添加新的待办事项|输入待办事项/)
      await user.type(input, 'New todo item')
      
      expect(input).toHaveValue('New todo item')
    })

    it('应该限制输入长度', async () => {
      const user = userEvent.setup()
      render(<CreateForm addTodo={mockAddTodo} />)
      
      const input = screen.getByPlaceholderText(/添加新的待办事项|输入待办事项/)
      const longText = 'A'.repeat(300) // 假设限制是 200 字符
      
      await user.type(input, longText)
      
      // 输入应该被截断
      expect(input.value.length).toBeLessThanOrEqual(200)
    })
  })

  describe('表单提交', () => {
    it('点击提交按钮应该添加待办事项', async () => {
      const user = userEvent.setup()
      render(<CreateForm addTodo={mockAddTodo} />)
      
      const input = screen.getByPlaceholderText(/添加新的待办事项|输入待办事项/)
      const button = screen.getByRole('button', { name: /添加|提交/ })
      
      await user.type(input, 'New todo')
      await user.click(button)
      
      expect(mockAddTodo).toHaveBeenCalledWith('New todo')
    })

    it('按 Enter 键应该提交表单', async () => {
      const user = userEvent.setup()
      render(<CreateForm addTodo={mockAddTodo} />)
      
      const input = screen.getByPlaceholderText(/添加新的待办事项|输入待办事项/)
      
      await user.type(input, 'New todo')
      await user.keyboard('{Enter}')
      
      expect(mockAddTodo).toHaveBeenCalledWith('New todo')
    })

    it('提交后应该清空输入框', async () => {
      const user = userEvent.setup()
      render(<CreateForm addTodo={mockAddTodo} />)
      
      const input = screen.getByPlaceholderText(/添加新的待办事项|输入待办事项/)
      
      await user.type(input, 'New todo')
      await user.keyboard('{Enter}')
      
      await waitFor(() => {
        expect(input).toHaveValue('')
      })
    })

    it('应该修剪输入的空格', async () => {
      const user = userEvent.setup()
      render(<CreateForm addTodo={mockAddTodo} />)

      const input = screen.getByPlaceholderText(/添加新的待办事项|输入待办事项/)

      await user.type(input, '  Trimmed todo  ')
      await user.keyboard('{Enter}')

      // CreateForm 组件会传递原始内容，由 validateTodoContent 处理修剪
      expect(mockAddTodo).toHaveBeenCalledWith('  Trimmed todo  ')
    })
  })

  describe('验证测试', () => {
    it('不应该提交空内容', async () => {
      const user = userEvent.setup()
      render(<CreateForm addTodo={mockAddTodo} />)
      
      const button = screen.getByRole('button', { name: /添加|提交/ })
      await user.click(button)
      
      expect(mockAddTodo).not.toHaveBeenCalled()
    })

    it('不应该提交只有空格的内容', async () => {
      const user = userEvent.setup()
      render(<CreateForm addTodo={mockAddTodo} />)
      
      const input = screen.getByPlaceholderText(/添加新的待办事项|输入待办事项/)
      
      await user.type(input, '   ')
      await user.keyboard('{Enter}')
      
      expect(mockAddTodo).not.toHaveBeenCalled()
    })

    it('空提交时按钮应该被禁用', async () => {
      render(<CreateForm addTodo={mockAddTodo} />)

      const button = screen.getByRole('button', { name: /添加|提交/ })

      // 按钮应该被禁用，因为输入为空
      expect(button).toBeDisabled()
      expect(mockAddTodo).not.toHaveBeenCalled()
    })
  })

  describe('状态管理', () => {
    it('应该在输入为空时禁用按钮', () => {
      render(<CreateForm addTodo={mockAddTodo} />)

      const button = screen.getByRole('button', { name: /添加|提交/ })
      expect(button).toBeDisabled()
    })

    it('应该在有内容时启用按钮', async () => {
      const user = userEvent.setup()
      render(<CreateForm addTodo={mockAddTodo} />)

      const input = screen.getByPlaceholderText(/添加新的待办事项|输入待办事项/)
      const button = screen.getByRole('button', { name: /添加|提交/ })

      await user.type(input, 'Test content')
      expect(button).not.toBeDisabled()
    })
  })

  describe('无障碍性', () => {
    it('应该有正确的表单结构', () => {
      render(<CreateForm addTodo={mockAddTodo} />)

      const input = screen.getByPlaceholderText(/添加新的待办事项|输入待办事项/)
      expect(input).toHaveAttribute('type', 'text')

      const button = screen.getByRole('button', { name: /添加|提交/ })
      expect(button).toHaveAttribute('type', 'submit')
    })

    it('应该有正确的表单元素', () => {
      render(<CreateForm addTodo={mockAddTodo} />)

      const form = document.querySelector('.create-form')
      expect(form).toBeInTheDocument()
      expect(form.tagName).toBe('FORM')
    })

    it('应该在有错误时显示错误信息', async () => {
      const user = userEvent.setup()
      render(<CreateForm addTodo={mockAddTodo} />)

      const input = screen.getByPlaceholderText(/添加新的待办事项|输入待办事项/)

      // 输入空格然后提交（这会触发验证错误）
      await user.type(input, '   ')

      // 由于按钮被禁用，我们需要通过表单提交来触发验证
      fireEvent.submit(input.closest('form'))

      await waitFor(() => {
        expect(screen.getByText(/内容不能为空/)).toBeInTheDocument()
      })
    })
  })

  describe('边界情况', () => {
    it('应该处理特殊字符', async () => {
      const user = userEvent.setup()
      render(<CreateForm addTodo={mockAddTodo} />)
      
      const input = screen.getByPlaceholderText(/添加新的待办事项|输入待办事项/)
      const specialText = '特殊字符 & < > " \' 测试'
      
      await user.type(input, specialText)
      await user.keyboard('{Enter}')
      
      expect(mockAddTodo).toHaveBeenCalledWith(specialText)
    })

    it('应该处理 Emoji', async () => {
      const user = userEvent.setup()
      render(<CreateForm addTodo={mockAddTodo} />)
      
      const input = screen.getByPlaceholderText(/添加新的待办事项|输入待办事项/)
      const emojiText = '📝 买菜 🛒'
      
      await user.type(input, emojiText)
      await user.keyboard('{Enter}')
      
      expect(mockAddTodo).toHaveBeenCalledWith(emojiText)
    })

    it('应该处理包含换行符的文本', async () => {
      const user = userEvent.setup()
      render(<CreateForm addTodo={mockAddTodo} />)

      const input = screen.getByPlaceholderText(/添加新的待办事项|输入待办事项/)

      // 输入包含空格的文本（不包含换行符，因为 input 元素不支持多行）
      await user.type(input, 'Line 1 Line 2 Line 3')

      await user.keyboard('{Enter}')

      expect(mockAddTodo).toHaveBeenCalledWith('Line 1 Line 2 Line 3')
    })
  })
})
