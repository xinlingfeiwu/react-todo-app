import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  getCookieConsent,
  setCookieConsent,
  canUseLocalStorage,
  safeSetLocalStorage,
  safeGetLocalStorage,
  clearAppData,
  exportUserData,
  getPrivacySummary
} from '../privacyManager'
import { STORAGE_KEYS, COOKIE_CONSENT_VALUES } from '../../constants/storageKeys'

describe('privacyManager', () => {
  // 模拟 localStorage
  const mockLocalStorage = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn()
  }

  beforeEach(() => {
    vi.clearAllMocks()
    
    // 设置 localStorage 模拟
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true
    })
    
    // 默认返回 null
    mockLocalStorage.getItem.mockReturnValue(null)
  })

  describe('getCookieConsent', () => {
    it('应该返回保存的同意状态', () => {
      mockLocalStorage.getItem.mockReturnValue('accepted')
      
      const consent = getCookieConsent()
      expect(consent).toBe('accepted')
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith(STORAGE_KEYS.COOKIE_CONSENT)
    })

    it('应该返回拒绝状态', () => {
      mockLocalStorage.getItem.mockReturnValue('declined')
      
      const consent = getCookieConsent()
      expect(consent).toBe('declined')
    })

    it('应该返回 null 当没有设置时', () => {
      mockLocalStorage.getItem.mockReturnValue(null)
      
      const consent = getCookieConsent()
      expect(consent).toBeNull()
    })

    it('应该处理 localStorage 访问错误', () => {
      mockLocalStorage.getItem.mockImplementation(() => {
        throw new Error('localStorage access denied')
      })
      
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      
      const consent = getCookieConsent()
      expect(consent).toBeNull()
      expect(consoleSpy).toHaveBeenCalledWith('无法读取 Cookie 同意状态:', expect.any(Error))
      
      consoleSpy.mockRestore()
    })
  })

  describe('setCookieConsent', () => {
    it('应该保存接受状态和相关信息', () => {
      const mockDate = new Date('2024-01-01T00:00:00.000Z')
      vi.setSystemTime(mockDate)
      
      setCookieConsent('accepted')
      
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(STORAGE_KEYS.COOKIE_CONSENT, 'accepted')
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(STORAGE_KEYS.COOKIE_CONSENT_DATE, '2024-01-01T00:00:00.000Z')
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(STORAGE_KEYS.COOKIE_CONSENT_VERSION, '1.0')
      
      vi.useRealTimers()
    })

    it('应该保存拒绝状态', () => {
      setCookieConsent('declined')
      
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(STORAGE_KEYS.COOKIE_CONSENT, 'declined')
    })

    it('应该处理 localStorage 写入错误', () => {
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('localStorage write denied')
      })
      
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      
      setCookieConsent('accepted')
      
      expect(consoleSpy).toHaveBeenCalledWith('无法保存 Cookie 同意状态:', expect.any(Error))
      consoleSpy.mockRestore()
    })
  })

  describe('canUseLocalStorage', () => {
    it('应该允许使用当用户接受时', () => {
      mockLocalStorage.getItem.mockReturnValue(COOKIE_CONSENT_VALUES.ACCEPTED)
      
      const canUse = canUseLocalStorage()
      expect(canUse).toBe(true)
    })

    it('应该不允许使用当用户拒绝时', () => {
      mockLocalStorage.getItem.mockReturnValue(COOKIE_CONSENT_VALUES.DECLINED)
      
      const canUse = canUseLocalStorage()
      expect(canUse).toBe(false)
    })

    it('应该默认允许使用当没有设置时', () => {
      mockLocalStorage.getItem.mockReturnValue(null)
      
      const canUse = canUseLocalStorage()
      expect(canUse).toBe(true)
    })
  })

  describe('safeSetLocalStorage', () => {
    it('应该保存数据当允许使用 localStorage 时', () => {
      mockLocalStorage.getItem.mockReturnValue(COOKIE_CONSENT_VALUES.ACCEPTED)
      
      const result = safeSetLocalStorage('test-key', 'test-value')
      
      expect(result).toBe(true)
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('test-key', 'test-value')
    })

    it('应该不保存数据当用户拒绝时', () => {
      mockLocalStorage.getItem.mockReturnValue(COOKIE_CONSENT_VALUES.DECLINED)
      
      const result = safeSetLocalStorage('test-key', 'test-value')
      
      expect(result).toBe(false)
      expect(mockLocalStorage.setItem).not.toHaveBeenCalled()
    })

    it('应该处理对象数据', () => {
      mockLocalStorage.getItem.mockReturnValue(COOKIE_CONSENT_VALUES.ACCEPTED)
      const testObject = { name: 'test', value: 123 }
      
      const result = safeSetLocalStorage('test-key', testObject)
      
      expect(result).toBe(true)
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('test-key', JSON.stringify(testObject))
    })

    it('应该处理存储错误', () => {
      mockLocalStorage.getItem.mockReturnValue(COOKIE_CONSENT_VALUES.ACCEPTED)
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('Storage quota exceeded')
      })
      
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      
      const result = safeSetLocalStorage('test-key', 'test-value')
      
      expect(result).toBe(false)
      expect(consoleSpy).toHaveBeenCalled()
      consoleSpy.mockRestore()
    })
  })

  describe('safeGetLocalStorage', () => {
    it('应该获取数据当允许使用 localStorage 时', () => {
      mockLocalStorage.getItem
        .mockReturnValueOnce(COOKIE_CONSENT_VALUES.ACCEPTED) // canUseLocalStorage 调用
        .mockReturnValueOnce('test-value') // 实际数据获取
      
      const result = safeGetLocalStorage('test-key')
      
      expect(result).toBe('test-value')
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('test-key')
    })

    it('应该返回 null 当用户拒绝时', () => {
      mockLocalStorage.getItem.mockReturnValue(COOKIE_CONSENT_VALUES.DECLINED)
      
      const result = safeGetLocalStorage('test-key')
      
      expect(result).toBeNull()
    })

    it('应该解析 JSON 数据', () => {
      const testObject = { name: 'test', value: 123 }
      mockLocalStorage.getItem
        .mockReturnValueOnce(COOKIE_CONSENT_VALUES.ACCEPTED)
        .mockReturnValueOnce(JSON.stringify(testObject))
      
      const result = safeGetLocalStorage('test-key', true)
      
      expect(result).toEqual(testObject)
    })

    it('应该处理无效的 JSON 数据', () => {
      mockLocalStorage.getItem
        .mockReturnValueOnce(COOKIE_CONSENT_VALUES.ACCEPTED)
        .mockReturnValueOnce('invalid json')
      
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      
      const result = safeGetLocalStorage('test-key', true)
      
      expect(result).toBe(true)
      expect(consoleSpy).toHaveBeenCalled()
      consoleSpy.mockRestore()
    })
  })

  describe('clearAppData', () => {
    it('应该清除应用数据但保留隐私设置', () => {
      const result = clearAppData()

      expect(result).toBe(true)
      expect(mockLocalStorage.removeItem).toHaveBeenCalled()
    })

    it('应该处理清除错误', () => {
      mockLocalStorage.removeItem.mockImplementation(() => {
        throw new Error('Remove failed')
      })

      const result = clearAppData()

      expect(result).toBe(false)
    })
  })

  describe('exportUserData', () => {
    it('应该导出用户数据', () => {
      // 模拟 localStorage 中的数据
      const mockData = {
        'todo-app-data': '{"todos": []}',
        'theme-preference': 'dark',
        'cookie-consent': 'accepted'
      }
      
      mockLocalStorage.getItem.mockImplementation((key) => mockData[key] || null)
      
      // 模拟 localStorage.length 和 key 方法
      Object.defineProperty(mockLocalStorage, 'length', { value: 3 })
      mockLocalStorage.key = vi.fn()
        .mockReturnValueOnce('todo-app-data')
        .mockReturnValueOnce('theme-preference')
        .mockReturnValueOnce('cookie-consent')
      
      const exportedData = exportUserData()
      
      expect(exportedData).toEqual({
        exportDate: expect.any(String),
        privacyInfo: expect.any(Object),
        userData: expect.any(Object)
      })
    })

    it('应该处理导出错误', () => {
      // 模拟 Object.keys 抛出错误
      const originalKeys = Object.keys
      Object.keys = vi.fn().mockImplementation(() => {
        throw new Error('Export failed')
      })

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      const result = exportUserData()

      expect(result).toHaveProperty('exportDate')
      expect(result).toHaveProperty('privacyInfo')
      expect(result).toHaveProperty('userData')
      expect(result.userData).toEqual({})
      expect(consoleSpy).toHaveBeenCalled()

      consoleSpy.mockRestore()
      Object.keys = originalKeys
    })
  })

  describe('getPrivacySummary', () => {
    it('应该返回隐私设置摘要', () => {
      mockLocalStorage.getItem.mockReturnValue(COOKIE_CONSENT_VALUES.ACCEPTED)

      const summary = getPrivacySummary()
      expect(summary).toHaveProperty('consentStatus')
      expect(summary.consentStatus).toBe(COOKIE_CONSENT_VALUES.ACCEPTED)
    })

    it('应该处理未设置的隐私选择', () => {
      mockLocalStorage.getItem.mockReturnValue(null)

      const summary = getPrivacySummary()
      expect(summary).toHaveProperty('consentStatus')
      expect(summary.consentStatus).toBe(null)
    })
  })
})
