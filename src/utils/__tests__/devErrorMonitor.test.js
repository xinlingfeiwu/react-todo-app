import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { DevErrorMonitor, devErrorMonitor } from '../devErrorMonitor'

describe('devErrorMonitor', () => {
  let consoleSpy = {}
  let originalAddEventListener
  let originalFetch

  beforeEach(() => {
    // 清理之前的错误记录
    if (devErrorMonitor) {
      devErrorMonitor.errors = []
      devErrorMonitor.warnings = []
    }

    // 模拟 console 方法
    consoleSpy.log = vi.spyOn(console, 'log').mockImplementation(() => {})
    consoleSpy.error = vi.spyOn(console, 'error').mockImplementation(() => {})
    consoleSpy.warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    // 模拟 window.addEventListener
    originalAddEventListener = window.addEventListener
    window.addEventListener = vi.fn()

    // 模拟 fetch
    originalFetch = global.fetch
    global.fetch = vi.fn()

    // 模拟开发环境
    vi.stubEnv('DEV', true)
  })

  afterEach(() => {
    vi.restoreAllMocks()
    window.addEventListener = originalAddEventListener
    global.fetch = originalFetch
  })

  describe('初始化', () => {
    it('应该在开发环境中初始化', () => {
      // 创建新实例以测试初始化过程
      const testInstance = new DevErrorMonitor()
      
      expect(testInstance.isEnabled).toBe(true)
      expect(window.addEventListener).toHaveBeenCalledWith('error', expect.any(Function))
      expect(window.addEventListener).toHaveBeenCalledWith('unhandledrejection', expect.any(Function))
      expect(consoleSpy.log).toHaveBeenCalledWith('🔍 开发环境错误监控已启动')
    })

    it('应该在生产环境中禁用', () => {
      vi.stubEnv('DEV', false)
      
      // 重新创建实例
      const prodMonitor = new DevErrorMonitor()
      
      expect(prodMonitor.isEnabled).toBe(false)
    })
  })

  describe('错误记录', () => {
    it('应该记录 JavaScript 错误', () => {
      const errorEvent = new ErrorEvent('error', {
        message: 'Test error',
        filename: 'test.js',
        lineno: 10,
        colno: 5,
        error: new Error('Test error')
      })

      devErrorMonitor.logError('JavaScript Error', {
        message: errorEvent.message,
        filename: errorEvent.filename,
        line: errorEvent.lineno,
        column: errorEvent.colno,
        stack: errorEvent.error?.stack
      })

      expect(devErrorMonitor.errors).toHaveLength(1)
      expect(devErrorMonitor.errors[0]).toMatchObject({
        type: 'JavaScript Error',
        details: expect.objectContaining({
          message: 'Test error',
          filename: 'test.js'
        })
      })
    })

    it('应该记录 Promise 拒绝', () => {
      const rejectionEvent = {
        reason: new Error('Promise rejection'),
        preventDefault: vi.fn()
      }

      devErrorMonitor.logError('Unhandled Promise Rejection', {
        reason: rejectionEvent.reason,
        stack: rejectionEvent.reason?.stack
      })

      expect(devErrorMonitor.errors).toHaveLength(1)
      expect(devErrorMonitor.errors[0].type).toBe('Unhandled Promise Rejection')
    })

    it('应该限制错误数量', () => {
      // 添加超过最大限制的错误
      for (let i = 0; i < 60; i++) {
        devErrorMonitor.logError('Test Error', { message: `Error ${i}` })
      }

      expect(devErrorMonitor.errors.length).toBeLessThanOrEqual(devErrorMonitor.maxErrors)
    })
  })

  describe('警告记录', () => {
    it('应该记录警告', () => {
      devErrorMonitor.logWarning('Test Warning', { message: 'This is a warning' })

      expect(devErrorMonitor.warnings).toHaveLength(1)
      expect(devErrorMonitor.warnings[0]).toMatchObject({
        type: 'Test Warning',
        details: { message: 'This is a warning' }
      })
    })

    it('应该限制警告数量', () => {
      // 添加超过最大限制的警告
      for (let i = 0; i < 60; i++) {
        devErrorMonitor.logWarning('Test Warning', { message: `Warning ${i}` })
      }

      expect(devErrorMonitor.warnings.length).toBeLessThanOrEqual(devErrorMonitor.maxErrors)
    })
  })

  describe('网络错误监控', () => {
    it('应该监控网络请求失败', async () => {
      global.fetch.mockRejectedValue(new Error('Network error'))

      try {
        await fetch('/api/test')
      } catch (error) {
        devErrorMonitor.logError('Network Error', {
          url: '/api/test',
          error: error.message
        })
      }

      expect(devErrorMonitor.errors).toHaveLength(1)
      expect(devErrorMonitor.errors[0].type).toBe('Network Error')
    })

    it('应该监控 HTTP 错误状态', async () => {
      global.fetch.mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        url: '/api/test'
      })

      const response = await fetch('/api/test')
      if (!response.ok) {
        devErrorMonitor.logError('HTTP Error', {
          status: response.status,
          statusText: response.statusText,
          url: response.url
        })
      }

      expect(devErrorMonitor.errors).toHaveLength(1)
      expect(devErrorMonitor.errors[0].details.status).toBe(404)
    })
  })

  describe('React 错误边界', () => {
    it('应该记录 React 组件错误', () => {
      const componentError = new Error('Component render error')
      const errorInfo = {
        componentStack: 'in Component\n  in App'
      }

      devErrorMonitor.logReactError(componentError, errorInfo)

      expect(devErrorMonitor.errors).toHaveLength(1)
      expect(devErrorMonitor.errors[0]).toMatchObject({
        type: 'React Error',
        details: expect.objectContaining({
          message: 'Component render error',
          componentStack: 'in Component\n  in App'
        })
      })
    })
  })

  describe('性能警告', () => {
    it('应该检测慢速渲染', () => {
      const slowRenderTime = 100 // ms

      devErrorMonitor.checkRenderPerformance('SlowComponent', slowRenderTime)

      expect(devErrorMonitor.warnings).toHaveLength(1)
      expect(devErrorMonitor.warnings[0]).toMatchObject({
        type: 'Performance Warning',
        details: expect.objectContaining({
          component: 'SlowComponent',
          renderTime: slowRenderTime
        })
      })
    })

    it('应该检测内存泄漏', () => {
      // 模拟内存使用增长（设置为超过90%阈值）
      const memoryUsage = {
        usedJSHeapSize: 1900000000, // 1.9GB，超过 90% of 2GB
        totalJSHeapSize: 2000000000,
        jsHeapSizeLimit: 2000000000 // 2GB limit
      }

      devErrorMonitor.checkMemoryUsage(memoryUsage)

      expect(devErrorMonitor.warnings).toHaveLength(1)
      expect(devErrorMonitor.warnings[0].type).toBe('Memory Warning')
    })
  })

  describe('错误报告', () => {
    it('应该生成错误报告', () => {
      devErrorMonitor.logError('Test Error', { message: 'Error 1' })
      devErrorMonitor.logWarning('Test Warning', { message: 'Warning 1' })

      const report = devErrorMonitor.generateReport()

      expect(report).toHaveProperty('errors')
      expect(report).toHaveProperty('warnings')
      expect(report).toHaveProperty('summary')
      expect(report.errors).toHaveLength(1)
      expect(report.warnings).toHaveLength(1)
      expect(report.summary.totalErrors).toBe(1)
      expect(report.summary.totalWarnings).toBe(1)
    })

    it('应该导出错误数据', () => {
      devErrorMonitor.logError('Export Test', { message: 'Test error' })

      const exportData = devErrorMonitor.exportErrors()

      expect(exportData).toHaveProperty('errors')
      expect(exportData).toHaveProperty('warnings')
      expect(exportData).toHaveProperty('exportDate')
      expect(exportData).toHaveProperty('version')
    })
  })

  describe('错误清理', () => {
    it('应该清理所有错误', () => {
      devErrorMonitor.logError('Test Error', { message: 'Error' })
      devErrorMonitor.logWarning('Test Warning', { message: 'Warning' })

      devErrorMonitor.clearErrors()

      expect(devErrorMonitor.errors).toHaveLength(0)
      expect(devErrorMonitor.warnings).toHaveLength(0)
    })

    it('应该清理旧错误', () => {
      // 添加一些旧错误
      const oldTimestamp = Date.now() - 25 * 60 * 60 * 1000 // 25小时前
      devErrorMonitor.errors.push({
        type: 'Old Error',
        timestamp: oldTimestamp,
        details: {}
      })

      devErrorMonitor.cleanupOldErrors()

      expect(devErrorMonitor.errors).toHaveLength(0)
    })
  })

  describe('错误分析', () => {
    it('应该分析错误模式', () => {
      // 添加重复错误
      for (let i = 0; i < 5; i++) {
        devErrorMonitor.logError('Repeated Error', { message: 'Same error' })
      }

      const analysis = devErrorMonitor.analyzeErrors()

      expect(analysis).toHaveProperty('mostCommonErrors')
      expect(analysis).toHaveProperty('errorFrequency')
      expect(analysis.mostCommonErrors[0]).toMatchObject({
        type: 'Repeated Error',
        count: 5
      })
    })

    it('应该检测错误趋势', () => {
      const now = Date.now()
      
      // 添加不同时间的错误
      devErrorMonitor.errors.push(
        { type: 'Error 1', timestamp: now - 1000, details: {} },
        { type: 'Error 2', timestamp: now - 2000, details: {} },
        { type: 'Error 3', timestamp: now - 3000, details: {} }
      )

      const trends = devErrorMonitor.getErrorTrends()

      expect(trends).toHaveProperty('recentErrors')
      expect(trends).toHaveProperty('errorRate')
      expect(trends.recentErrors).toBeGreaterThan(0)
    })
  })

  describe('边界情况', () => {
    it('应该处理空错误对象', () => {
      expect(() => {
        devErrorMonitor.logError(null, null)
      }).not.toThrow()
    })

    it('应该处理循环引用对象', () => {
      const circularObj = { name: 'test' }
      circularObj.self = circularObj

      expect(() => {
        devErrorMonitor.logError('Circular Error', circularObj)
      }).not.toThrow()
    })

    it('应该处理非常大的错误对象', () => {
      const largeObj = {
        data: 'x'.repeat(10000),
        array: new Array(1000).fill('large data')
      }

      expect(() => {
        devErrorMonitor.logError('Large Error', largeObj)
      }).not.toThrow()
    })
  })
})
