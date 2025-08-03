import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { afterEach, beforeEach, vi } from 'vitest'

// 设置 React 18 的测试环境
import { configure } from '@testing-library/react'

configure({
  testIdAttribute: 'data-testid',
})

// 每个测试后清理
afterEach(() => {
  cleanup()
})

// 每个测试前的设置
beforeEach(() => {
  // 清理所有模拟
  vi.clearAllMocks()

  // 重置 localStorage（安全方式）
  try {
    if (localStorage && typeof localStorage.clear === 'function') {
      localStorage.clear()
    } else if (localStorage && typeof localStorage === 'object') {
      Object.keys(localStorage).forEach(key => {
        localStorage.removeItem(key)
      })
    }
  } catch {
    // 忽略 localStorage 访问错误
  }

  // 重置 sessionStorage（安全方式）
  try {
    sessionStorage.clear()
  } catch {
    // 如果 sessionStorage.clear 不存在，手动清理
    Object.keys(sessionStorage).forEach(key => {
      sessionStorage.removeItem(key)
    })
  }

  // 重置 DOM 并确保有一个容器
  document.body.innerHTML = '<div id="root"></div>'
  document.head.innerHTML = ''
})

// 全局模拟
window.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

window.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// 模拟 matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// 模拟 URL.createObjectURL 和 URL.revokeObjectURL
window.URL.createObjectURL = vi.fn(() => 'mocked-url')
window.URL.revokeObjectURL = vi.fn()

// 模拟 FileReader
window.FileReader = class MockFileReader {
  constructor() {
    this.readAsText = vi.fn()
    this.onload = null
    this.onerror = null
    this.result = null
  }
  
  // 模拟成功读取
  mockSuccess(content) {
    this.result = content
    if (this.onload) {
      this.onload({ target: { result: content } })
    }
  }
  
  // 模拟读取错误
  mockError(error) {
    if (this.onerror) {
      this.onerror(error)
    }
  }
}

// 模拟 Blob
window.Blob = class MockBlob {
  constructor(content, options) {
    this.content = content
    this.options = options
    this.size = content ? content.join('').length : 0
    this.type = options?.type || ''
  }
}

// 模拟 console 方法以避免测试输出污染
// 保存原始 console 方法以供测试使用
const originalConsole = { ...console }

// 为了避免测试中的控制台污染，我们可以选择性地模拟
// 但保留原始方法以供需要验证 console 调用的测试使用
globalThis.originalConsole = originalConsole

// 不默认模拟 console，让测试自行决定是否需要模拟
// 这样可以避免 logger 测试失败的问题

// 恢复原始 console 的工具函数
window.restoreConsole = () => {
  window.console = originalConsole
}

// 模拟 console 的工具函数（供需要的测试使用）
window.mockConsole = () => {
  window.console = {
    ...console,
    log: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  }
  return window.console
}

// 模拟 crypto.getRandomValues (用于 ID 生成)
Object.defineProperty(window, 'crypto', {
  value: {
    getRandomValues: vi.fn().mockImplementation((arr) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256)
      }
      return arr
    })
  }
})

// 测试工具函数
export const createMockTodo = (overrides = {}) => ({
  id: Date.now() + Math.random(),
  content: 'Test todo',
  isCompleted: false,
  isEditing: false,
  createdAt: new Date().toISOString(),
  ...overrides
})

export const createMockTodos = (count = 3) => {
  return Array.from({ length: count }, (_, index) => 
    createMockTodo({
      id: index + 1,
      content: `Test todo ${index + 1}`,
      isCompleted: index % 2 === 0
    })
  )
}

// 等待异步操作完成的工具函数
export const waitFor = (callback, timeout = 1000) => {
  return new Promise((resolve, reject) => {
    const startTime = Date.now()
    
    const check = () => {
      try {
        const result = callback()
        if (result) {
          resolve(result)
        } else if (Date.now() - startTime >= timeout) {
          reject(new Error('Timeout waiting for condition'))
        } else {
          setTimeout(check, 10)
        }
      } catch (error) {
        if (Date.now() - startTime >= timeout) {
          reject(error)
        } else {
          setTimeout(check, 10)
        }
      }
    }
    
    check()
  })
}
