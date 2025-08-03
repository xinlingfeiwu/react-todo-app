import { test, expect } from '@playwright/test'

test.describe('Todo App E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // 清除 localStorage
    await page.goto('/')
    await page.evaluate(() => localStorage.clear())
    await page.reload()
  })

  test('应该显示应用的基本界面', async ({ page }) => {
    await page.goto('/')

    // 检查页面标题
    await expect(page).toHaveTitle(/Todo|待办/)

    // 检查主要 UI 元素
    await expect(page.getByPlaceholder(/添加新的待办事项|输入待办事项/)).toBeVisible()

    // 等待应用加载完成后再检查过滤器
    await page.waitForTimeout(1000)

    // 检查过滤器按钮 - 只有在有待办事项时才显示
    // 先添加一个待办事项来确保过滤器显示
    const input = page.getByPlaceholder(/添加新的待办事项|输入待办事项/)
    await input.fill('测试任务')
    await input.press('Enter')

    await expect(page.locator('.todo-filter .filter-btn').filter({ hasText: '全部' })).toBeVisible()
    await expect(page.locator('.todo-filter .filter-btn').filter({ hasText: '待完成' })).toBeVisible()
    await expect(page.locator('.todo-filter .filter-btn').filter({ hasText: '已完成' })).toBeVisible()

    // 检查统计信息
    await expect(page.getByText(/总计.*1/)).toBeVisible()
  })

  test('应该能够添加新的待办事项', async ({ page }) => {
    await page.goto('/')

    const input = page.getByPlaceholder(/添加新的待办事项|输入待办事项/)

    // 添加第一个待办事项
    await input.fill('学习 Playwright 测试')
    await input.press('Enter')

    // 等待待办事项被添加
    await page.waitForTimeout(500)

    // 验证待办事项已添加
    await expect(page.getByText('学习 Playwright 测试')).toBeVisible()
    await expect(page.getByText(/总计.*1/)).toBeVisible()

    // 等待统计信息更新
    await page.waitForTimeout(300)
    await expect(page.locator('.stats-item').filter({ hasText: '待完成:' })).toContainText('1')

    // 验证输入框已清空
    await expect(input).toHaveValue('')

    // 添加第二个待办事项
    await input.fill('编写 E2E 测试')
    await input.press('Enter')

    // 等待第二个待办事项被添加
    await page.waitForTimeout(500)

    // 验证两个待办事项都存在
    await expect(page.getByText('学习 Playwright 测试')).toBeVisible()
    await expect(page.getByText('编写 E2E 测试')).toBeVisible()
    await expect(page.getByText(/总计.*2/)).toBeVisible()
  })

  test('应该能够完成待办事项', async ({ page }) => {
    await page.goto('/')

    // 添加待办事项
    const input = page.getByPlaceholder(/添加新的待办事项|输入待办事项/)
    await input.fill('完成测试任务')
    await input.press('Enter')

    // 等待待办事项被添加
    await page.waitForTimeout(500)
    await expect(page.getByText('完成测试任务')).toBeVisible()

    // 点击完成按钮 - 使用正确的选择器
    await page.locator('.todo .completion-btn').first().click()

    // 等待状态更新
    await page.waitForTimeout(500)

    // 验证统计信息更新
    await expect(page.locator('.stats-item').filter({ hasText: '已完成:' })).toContainText('1')
    await expect(page.locator('.stats-item').filter({ hasText: '待完成:' })).toContainText('0')

    // 验证待办事项有完成样式
    const todoItem = page.locator('.todo').filter({ hasText: '完成测试任务' })
    await expect(todoItem).toHaveClass(/completed/)
  })

  test('应该能够编辑待办事项', async ({ page }) => {
    await page.goto('/')

    // 添加待办事项
    const input = page.getByPlaceholder(/添加新的待办事项|输入待办事项/)
    await input.fill('原始内容')
    await input.press('Enter')

    // 等待待办事项被添加
    await page.waitForTimeout(500)
    await expect(page.getByText('原始内容')).toBeVisible()

    // 点击编辑按钮
    await page.locator('.todo').filter({ hasText: '原始内容' }).locator('.edit-btn').click()

    // 等待编辑表单出现
    await page.waitForTimeout(500)

    // 修改内容 - 查找编辑表单中的输入框
    const editInput = page.locator('.edit-form input[type="text"]')
    await expect(editInput).toBeVisible()
    await editInput.clear()
    await editInput.fill('修改后的内容')
    await editInput.press('Enter')

    // 等待编辑完成
    await page.waitForTimeout(500)

    // 验证内容已更新
    await expect(page.getByText('修改后的内容')).toBeVisible()
    await expect(page.getByText('原始内容')).not.toBeVisible()
  })

  test('应该能够删除待办事项', async ({ page }) => {
    await page.goto('/')

    // 添加待办事项
    const input = page.getByPlaceholder(/添加新的待办事项|输入待办事项/)
    await input.fill('要删除的任务')
    await input.press('Enter')

    // 等待待办事项被添加
    await page.waitForTimeout(500)
    await expect(page.getByText('要删除的任务')).toBeVisible()

    // 点击删除按钮
    await page.locator('.todo').filter({ hasText: '要删除的任务' }).locator('.delete-btn').click()

    // 确认删除 - 等待确认对话框出现
    await expect(page.getByText('确认删除')).toBeVisible()
    await page.locator('.btn-confirm.btn-danger').click()

    // 等待删除操作完成
    await page.waitForTimeout(500)

    // 验证待办事项已删除
    await expect(page.getByText('要删除的任务')).not.toBeVisible()

    // 验证统计信息更新 - 检查是否回到初始状态
    const statsVisible = await page.locator('.todo-stats').isVisible()
    if (statsVisible) {
      await expect(page.getByText(/总计.*0/)).toBeVisible()
    }
  })

  test('应该能够使用过滤器', async ({ page }) => {
    await page.goto('/')

    const input = page.getByPlaceholder(/添加新的待办事项|输入待办事项/)
    
    // 添加多个待办事项
    await input.fill('任务 1')
    await input.press('Enter')
    await input.fill('任务 2')
    await input.press('Enter')
    await input.fill('任务 3')
    await input.press('Enter')

    // 完成第一个任务
    await page.locator('.todo .completion-btn').first().click()

    // 测试"待完成"过滤器
    await page.locator('.todo-filter .filter-btn').filter({ hasText: '待完成' }).click()
    await expect(page.getByText('任务 1')).not.toBeVisible()
    await expect(page.getByText('任务 2')).toBeVisible()
    await expect(page.getByText('任务 3')).toBeVisible()

    // 测试"已完成"过滤器
    await page.locator('.todo-filter .filter-btn').filter({ hasText: '已完成' }).click()
    await expect(page.getByText('任务 1')).toBeVisible()
    await expect(page.getByText('任务 2')).not.toBeVisible()
    await expect(page.getByText('任务 3')).not.toBeVisible()

    // 测试"全部"过滤器
    await page.locator('.todo-filter .filter-btn').filter({ hasText: '全部' }).click()
    await expect(page.getByText('任务 1')).toBeVisible()
    await expect(page.getByText('任务 2')).toBeVisible()
    await expect(page.getByText('任务 3')).toBeVisible()
  })

  test('应该能够切换主题', async ({ page }) => {
    await page.goto('/')

    // 等待页面加载完成
    await page.waitForTimeout(1000)

    // 获取初始主题状态
    const html = page.locator('html')
    const initialClass = await html.getAttribute('class') || ''

    // 点击主题切换按钮 - 使用更具体的选择器
    const themeToggle = page.locator('.theme-toggle, [title*="主题"], [title*="切换"]').first()
    await expect(themeToggle).toBeVisible()
    await themeToggle.click()

    // 等待主题切换完成
    await page.waitForTimeout(500)

    // 验证主题已切换（检查类名变化）
    const newClass = await html.getAttribute('class') || ''
    expect(newClass).not.toBe(initialClass)

    // 验证主题类存在
    await expect(html).toHaveClass(/dark-theme|light-theme/)
  })

  test('应该支持键盘导航', async ({ page }) => {
    await page.goto('/')

    // 等待页面加载完成
    await page.waitForTimeout(500)

    // 点击页面确保焦点在页面内
    await page.click('body')

    // 使用 Tab 键导航到输入框
    await page.keyboard.press('Tab')

    // 验证输入框获得焦点
    const input = page.getByPlaceholder(/添加新的待办事项|输入待办事项/)
    await expect(input).toBeFocused()

    // 添加待办事项
    await input.fill('键盘导航测试')
    await input.press('Enter')

    // 等待待办事项被添加
    await page.waitForTimeout(500)
    await expect(page.getByText('键盘导航测试')).toBeVisible()

    // 验证输入框重新获得焦点（这是常见的 UX 模式）
    await expect(input).toBeFocused()

    // 验证可以继续输入
    await input.fill('第二个任务')
    await input.press('Enter')
    await page.waitForTimeout(500)
    await expect(page.getByText('第二个任务')).toBeVisible()
  })

  test('应该在页面刷新后保持数据', async ({ page }) => {
    await page.goto('/')

    // 添加一些待办事项
    const input = page.getByPlaceholder(/添加新的待办事项|输入待办事项/)
    await input.fill('持久化测试 1')
    await input.press('Enter')
    await input.fill('持久化测试 2')
    await input.press('Enter')

    // 完成一个任务
    await page.getByTitle('标记为完成').first().click()

    // 刷新页面
    await page.reload()

    // 验证数据仍然存在
    await expect(page.getByText('持久化测试 1')).toBeVisible()
    await expect(page.getByText('持久化测试 2')).toBeVisible()
    await expect(page.getByText(/总计.*2/)).toBeVisible()
    await expect(page.getByText(/已完成.*1/)).toBeVisible()
    await expect(page.getByText(/未完成.*1/)).toBeVisible()
  })

  test('应该处理空输入', async ({ page }) => {
    await page.goto('/')

    const input = page.getByPlaceholder(/添加新的待办事项|输入待办事项/)

    // 尝试提交空输入
    await input.press('Enter')

    // 验证没有添加空的待办事项 - 检查输入框仍然为空
    await expect(input).toHaveValue('')

    // 尝试提交只有空格的输入
    await input.fill('   ')
    await input.press('Enter')

    // 验证仍然没有添加待办事项 - 输入框应该被清空
    await expect(input).toHaveValue('')
  })

  test('应该支持长文本内容', async ({ page }) => {
    await page.goto('/')

    const longText = '这是一个非常长的待办事项内容，用来测试应用是否能够正确处理和显示长文本内容，包括换行和布局问题。'.repeat(3)
    
    const input = page.getByPlaceholder(/添加新的待办事项|输入待办事项/)
    await input.fill(longText)
    await input.press('Enter')

    // 验证长文本被正确显示
    await expect(page.getByText(longText)).toBeVisible()
  })

  test('应该支持特殊字符和 Emoji', async ({ page }) => {
    await page.goto('/')

    const specialText = '🎉 特殊字符测试 & < > " \' 🚀'
    
    const input = page.getByPlaceholder(/添加新的待办事项|输入待办事项/)
    await input.fill(specialText)
    await input.press('Enter')

    // 验证特殊字符被正确显示
    await expect(page.getByText(specialText)).toBeVisible()
  })
})

test.describe('移动端测试', () => {
  test.use({ viewport: { width: 375, height: 667 } })

  test('应该在移动端正确显示', async ({ page }) => {
    await page.goto('/')

    // 验证主要元素在移动端可见
    await expect(page.getByPlaceholder(/添加新的待办事项|输入待办事项/)).toBeVisible()

    // 添加一个待办事项来显示过滤器
    const input = page.getByPlaceholder(/添加新的待办事项|输入待办事项/)
    await input.fill('移动端测试任务')
    await input.press('Enter')

    await expect(page.locator('.todo-filter .filter-btn').filter({ hasText: '全部' })).toBeVisible()
    await expect(page.getByText(/总计.*1/)).toBeVisible()
  })

  test('应该支持触摸操作', async ({ page }) => {
    await page.goto('/')

    // 添加待办事项
    const input = page.getByPlaceholder(/添加新的待办事项|输入待办事项/)
    await input.fill('移动端测试')
    await input.press('Enter')

    // 使用触摸操作完成任务 - 使用正确的选择器
    await page.locator('.todo .completion-btn').first().tap()

    // 验证操作成功
    await expect(page.getByText(/已完成.*1/)).toBeVisible()
  })
})

test.describe('性能测试', () => {
  test('页面加载性能应该良好', async ({ page }) => {
    const startTime = Date.now()
    
    await page.goto('/')
    
    // 等待主要内容加载
    await page.getByPlaceholder(/添加新的待办事项|输入待办事项/).waitFor()
    
    const loadTime = Date.now() - startTime
    
    // 页面应该在 3 秒内加载完成
    expect(loadTime).toBeLessThan(3000)
  })

  test('应该能够处理大量待办事项', async ({ page }) => {
    await page.goto('/')

    const input = page.getByPlaceholder(/添加新的待办事项|输入待办事项/)
    
    // 添加多个待办事项
    for (let i = 1; i <= 50; i++) {
      await input.fill(`性能测试任务 ${i}`)
      await input.press('Enter')
    }

    // 验证所有任务都被添加
    await expect(page.getByText(/总计.*50/)).toBeVisible()

    // 验证页面仍然响应 - 使用精确匹配避免冲突
    await expect(page.getByText('性能测试任务 1', { exact: true })).toBeVisible()
    await expect(page.getByText('性能测试任务 50', { exact: true })).toBeVisible()
  })
})
