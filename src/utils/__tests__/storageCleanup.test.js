import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  cleanupOldUpdateKeys,
  getAppStorageItems,
  cleanupExpiredData,
  autoCleanup,
  getStorageUsage
} from '../storageCleanup'

describe('storageCleanup', () => {
  let mockLocalStorage = {}
  let consoleSpy = {}

  beforeEach(() => {
    // 模拟 localStorage
    mockLocalStorage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
      key: vi.fn(),
      length: 0
    }

    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true
    })

    // 模拟 console 方法
    consoleSpy.log = vi.spyOn(console, 'log').mockImplementation(() => {})
    consoleSpy.warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('cleanupOldUpdateKeys', () => {
    it('应该清理存在的旧键', () => {
      mockLocalStorage.getItem.mockImplementation((key) => {
        const oldKeys = ['app_update_available', 'app_etag']
        return oldKeys.includes(key) ? 'some_value' : null
      })

      const cleanedCount = cleanupOldUpdateKeys()

      expect(cleanedCount).toBe(2)
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('app_update_available')
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('app_etag')
      expect(consoleSpy.log).toHaveBeenCalledWith('🧹 已清理旧的存储key: app_update_available')
      expect(consoleSpy.log).toHaveBeenCalledWith('✅ 清理完成，共清理了 2 个旧的存储项')
    })

    it('应该处理没有旧键的情况', () => {
      mockLocalStorage.getItem.mockReturnValue(null)

      const cleanedCount = cleanupOldUpdateKeys()

      expect(cleanedCount).toBe(0)
      expect(mockLocalStorage.removeItem).not.toHaveBeenCalled()
      expect(consoleSpy.log).toHaveBeenCalledWith('✅ 没有发现需要清理的旧存储项')
    })

    it('应该处理 localStorage 错误', () => {
      mockLocalStorage.getItem.mockImplementation(() => {
        throw new Error('Storage error')
      })

      expect(() => cleanupOldUpdateKeys()).not.toThrow()
    })
  })

  describe('getAppStorageItems', () => {
    it('应该返回应用相关的存储项', () => {
      const mockData = {
        'ylingtech-todo-app': '{"todos":[]}',
        'todo-app-theme': 'dark',
        'cookie_consent': 'accepted',
        'unrelated_key': 'value'
      }

      mockLocalStorage.getItem.mockImplementation((key) => mockData[key] || null)
      mockLocalStorage.length = Object.keys(mockData).length
      mockLocalStorage.key.mockImplementation((index) => Object.keys(mockData)[index])

      const appItems = getAppStorageItems()

      expect(appItems).toHaveProperty('ylingtech-todo-app')
      expect(appItems).toHaveProperty('todo-app-theme')
      expect(appItems).toHaveProperty('cookie_consent')
      expect(appItems).not.toHaveProperty('unrelated_key')
    })

    it('应该处理空的 localStorage', () => {
      mockLocalStorage.length = 0

      const appItems = getAppStorageItems()

      expect(appItems).toEqual({})
    })

    it('应该处理 localStorage 访问错误', () => {
      mockLocalStorage.key.mockImplementation(() => {
        throw new Error('Storage error')
      })

      const appItems = getAppStorageItems()

      expect(appItems).toEqual({})
      expect(consoleSpy.warn).toHaveBeenCalled()
    })
  })

  describe('cleanupExpiredData', () => {
    it('应该清理过期的数据', () => {
      const now = Date.now()
      const expiredData = {
        'app_update_snoozed': JSON.stringify({
          snoozedAt: now - 2 * 60 * 60 * 1000, // 2小时前
          version: '1.0.0'
        }),
        'valid_data': JSON.stringify({
          snoozedAt: now - 30 * 60 * 1000, // 30分钟前
          version: '1.0.1'
        })
      }

      mockLocalStorage.getItem.mockImplementation((key) => expiredData[key] || null)
      mockLocalStorage.length = Object.keys(expiredData).length
      mockLocalStorage.key.mockImplementation((index) => Object.keys(expiredData)[index])

      const cleanedCount = cleanupExpiredData()

      expect(cleanedCount).toBeGreaterThan(0)
      expect(consoleSpy.log).toHaveBeenCalled()
    })

    it('应该处理无效的 JSON 数据', () => {
      mockLocalStorage.getItem.mockReturnValue('invalid json')
      mockLocalStorage.length = 1
      mockLocalStorage.key.mockReturnValue('test_key')

      expect(() => cleanupExpiredData()).not.toThrow()
    })
  })

  describe('autoCleanup', () => {
    it('应该执行自动清理', () => {
      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'app_update_available') return 'true'
        return null
      })

      autoCleanup()

      expect(consoleSpy.log).toHaveBeenCalledWith('🧹 开始自动清理存储数据...')
    })

    it('应该处理清理过程中的错误', () => {
      mockLocalStorage.getItem.mockImplementation(() => {
        throw new Error('Storage error')
      })

      expect(() => autoCleanup()).not.toThrow()
      expect(consoleSpy.warn).toHaveBeenCalled()
    })
  })

  describe('getStorageUsage', () => {
    it('应该计算存储使用情况', () => {
      const mockData = {
        'key1': 'value1',
        'key2': 'value2',
        'key3': 'value3'
      }

      mockLocalStorage.length = Object.keys(mockData).length
      mockLocalStorage.key.mockImplementation((index) => Object.keys(mockData)[index])
      mockLocalStorage.getItem.mockImplementation((key) => mockData[key])

      const usage = getStorageUsage()

      expect(usage).toHaveProperty('totalItems')
      expect(usage).toHaveProperty('totalSize')
      expect(usage).toHaveProperty('appItems')
      expect(usage).toHaveProperty('appSize')
      expect(usage.totalItems).toBe(3)
    })

    it('应该处理存储访问错误', () => {
      mockLocalStorage.length = 1
      mockLocalStorage.key.mockImplementation(() => {
        throw new Error('Storage error')
      })

      const usage = getStorageUsage()

      expect(usage).toEqual({
        totalItems: 0,
        totalSize: 0,
        appItems: 0,
        appSize: 0,
        error: true
      })
    })

    it('应该正确计算大小', () => {
      const largeValue = 'x'.repeat(1000)
      mockLocalStorage.length = 1
      mockLocalStorage.key.mockReturnValue('large_key')
      mockLocalStorage.getItem.mockReturnValue(largeValue)

      const usage = getStorageUsage()

      expect(usage.totalSize).toBeGreaterThan(1000)
    })
  })

  describe('边界情况', () => {
    it('应该处理 localStorage 不可用的情况', () => {
      Object.defineProperty(window, 'localStorage', {
        value: undefined,
        writable: true
      })

      expect(() => {
        cleanupOldUpdateKeys()
        getAppStorageItems()
        autoCleanup()
      }).not.toThrow()
    })

    it('应该处理空字符串值', () => {
      mockLocalStorage.getItem.mockReturnValue('')
      mockLocalStorage.length = 1
      mockLocalStorage.key.mockReturnValue('empty_key')

      const usage = getStorageUsage()
      const appItems = getAppStorageItems()

      expect(usage).toBeDefined()
      expect(appItems).toBeDefined()
    })

    it('应该处理 null 值', () => {
      mockLocalStorage.getItem.mockReturnValue(null)
      mockLocalStorage.length = 1
      mockLocalStorage.key.mockReturnValue('null_key')

      const usage = getStorageUsage()

      expect(usage.totalItems).toBe(1)
      expect(usage.totalSize).toBe(0)
    })
  })
})
