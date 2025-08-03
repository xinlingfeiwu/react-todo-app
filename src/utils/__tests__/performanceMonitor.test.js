import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { performanceMonitor } from '../performanceMonitor'

describe('performanceMonitor', () => {
  let consoleSpy = {}
  let performanceSpy = {}

  beforeEach(() => {
    // 模拟 console 方法
    consoleSpy.log = vi.spyOn(console, 'log').mockImplementation(() => {})
    consoleSpy.warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    consoleSpy.error = vi.spyOn(console, 'error').mockImplementation(() => {})

    // 模拟 performance API
    performanceSpy.mark = vi.spyOn(performance, 'mark').mockImplementation(() => {})
    performanceSpy.measure = vi.spyOn(performance, 'measure').mockImplementation(() => {})
    performanceSpy.getEntriesByName = vi.spyOn(performance, 'getEntriesByName').mockReturnValue([
      { duration: 100, startTime: 50 }
    ])
    performanceSpy.getEntriesByType = vi.spyOn(performance, 'getEntriesByType').mockReturnValue([
      {
        domainLookupStart: 0,
        domainLookupEnd: 10,
        connectStart: 10,
        connectEnd: 20,
        requestStart: 20,
        responseStart: 30,
        responseEnd: 40,
        domContentLoadedEventStart: 40,
        domContentLoadedEventEnd: 50,
        loadEventStart: 50,
        loadEventEnd: 60
      }
    ])
    performanceSpy.now = vi.spyOn(performance, 'now').mockReturnValue(1000)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('性能标记和测量', () => {
    it('应该标记性能起点', () => {
      performanceMonitor.mark('test-operation')
      
      expect(performanceSpy.mark).toHaveBeenCalledWith('test-operation-start')
    })

    it('应该测量性能', () => {
      performanceMonitor.mark('test-operation')
      const duration = performanceMonitor.measure('test-operation')
      
      expect(performanceSpy.mark).toHaveBeenCalledWith('test-operation-end')
      expect(performanceSpy.measure).toHaveBeenCalledWith('test-operation', 'test-operation-start', 'test-operation-end')
      expect(duration).toBe(100)
      expect(consoleSpy.log).toHaveBeenCalled()
    })

    it('应该处理测量错误', () => {
      performanceSpy.measure.mockImplementation(() => {
        throw new Error('Measurement failed')
      })
      
      const duration = performanceMonitor.measure('test-operation')
      
      expect(duration).toBeUndefined()
      expect(consoleSpy.warn).toHaveBeenCalled()
    })
  })

  describe('页面加载指标', () => {
    it('应该获取页面加载指标', () => {
      const metrics = performanceMonitor.getPageLoadMetrics()
      
      expect(metrics).toEqual({
        dns: 10,
        tcp: 10,
        request: 10,
        response: 10,
        domContentLoaded: 10,
        loadComplete: 10,
        total: 60
      })
    })

    it('应该处理缺少导航信息的情况', () => {
      performanceSpy.getEntriesByType.mockReturnValue([])
      
      const metrics = performanceMonitor.getPageLoadMetrics()
      
      expect(metrics).toBeNull()
    })

    it('应该处理不支持 performance API 的情况', () => {
      const originalPerformance = global.performance
      global.performance = { navigation: undefined }
      
      const metrics = performanceMonitor.getPageLoadMetrics()
      
      expect(metrics).toBeNull()
      
      global.performance = originalPerformance
    })
  })

  describe('内存使用监控', () => {
    it('应该获取内存使用信息', () => {
      // 模拟内存信息
      Object.defineProperty(performance, 'memory', {
        value: {
          usedJSHeapSize: 1000000,
          totalJSHeapSize: 2000000,
          jsHeapSizeLimit: 4000000
        },
        configurable: true
      })
      
      const memoryInfo = performanceMonitor.getMemoryUsage()
      
      expect(memoryInfo).toEqual({
        used: '0.95 MB',
        total: '1.91 MB',
        limit: '3.81 MB',
        percentage: 50
      })
    })

    it('应该处理不支持内存 API 的情况', () => {
      const originalMemory = performance.memory
      delete performance.memory
      
      const memoryInfo = performanceMonitor.getMemoryUsage()
      
      expect(memoryInfo).toBeNull()
      
      if (originalMemory) {
        Object.defineProperty(performance, 'memory', {
          value: originalMemory,
          configurable: true
        })
      }
    })
  })

  describe('FPS 监控', () => {
    it('应该开始 FPS 监控', () => {
      const callback = vi.fn()
      
      performanceMonitor.startFPSMonitoring(callback)
      
      expect(performanceMonitor.fpsMonitoring).toBe(true)
    })

    it('应该停止 FPS 监控', () => {
      performanceMonitor.startFPSMonitoring(() => {})
      performanceMonitor.stopFPSMonitoring()
      
      expect(performanceMonitor.fpsMonitoring).toBe(false)
    })
  })

  describe('错误追踪', () => {
    it('应该记录错误', () => {
      const error = new Error('Test error')
      
      performanceMonitor.logError('test-component', error)
      
      expect(consoleSpy.error).toHaveBeenCalledWith(
        '❌ 错误 [test-component]:',
        expect.objectContaining({
          message: 'Test error',
          stack: expect.any(String),
          timestamp: expect.any(String)
        })
      )
    })

    it('应该记录警告', () => {
      performanceMonitor.logWarning('test-component', 'Test warning')
      
      expect(consoleSpy.warn).toHaveBeenCalledWith(
        '⚠️ 警告 [test-component]:',
        expect.objectContaining({
          message: 'Test warning',
          timestamp: expect.any(String)
        })
      )
    })
  })

  describe('性能报告', () => {
    it('应该生成性能报告', () => {
      // 设置一些测试数据
      performanceMonitor.mark('test1')
      performanceMonitor.measure('test1')
      
      const report = performanceMonitor.getPerformanceReport()
      
      expect(report).toHaveProperty('pageLoad')
      expect(report).toHaveProperty('memory')
      expect(report).toHaveProperty('timestamp')
      expect(consoleSpy.log).toHaveBeenCalledWith('📊 性能报告:', expect.any(Object))
    })
  })

  describe('资源监控', () => {
    it('应该监控资源加载', () => {
      // 模拟资源条目
      performanceSpy.getEntriesByType.mockReturnValue([
        {
          name: 'https://example.com/script.js',
          initiatorType: 'script',
          duration: 100,
          transferSize: 1024
        },
        {
          name: 'https://example.com/style.css',
          initiatorType: 'link',
          duration: 50,
          transferSize: 512
        }
      ])
      
      const resources = performanceMonitor.getResourceMetrics()
      
      expect(resources).toHaveLength(2)
      expect(resources[0]).toHaveProperty('name')
      expect(resources[0]).toHaveProperty('type')
      expect(resources[0]).toHaveProperty('duration')
      expect(resources[0]).toHaveProperty('size')
    })
  })

  describe('清理功能', () => {
    it('应该清理性能数据', () => {
      performanceMonitor.mark('test')
      performanceMonitor.clearMetrics()
      
      expect(performanceMonitor.metrics.size).toBe(0)
    })
  })
})
