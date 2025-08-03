import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  getDonationRecords,
  addDonationRecord,
  deleteDonationRecord,
  getDonationStats,
  exportDonationData,
  importDonationData,
  clearAllDonations
} from '../donationManager'
import { STORAGE_KEYS } from '../../constants/storageKeys'

describe('donationManager', () => {
  let mockLocalStorage = {}
  let consoleSpy = {}

  beforeEach(() => {
    // 模拟 localStorage
    mockLocalStorage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn()
    }

    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true
    })

    // 模拟 console 方法
    consoleSpy.error = vi.spyOn(console, 'error').mockImplementation(() => {})
    consoleSpy.log = vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('getDonationRecords', () => {
    it('应该返回空数组当没有记录时', () => {
      mockLocalStorage.getItem.mockReturnValue(null)

      const records = getDonationRecords()

      expect(records).toEqual([])
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith(STORAGE_KEYS.DONATION_RECORDS)
    })

    it('应该返回解析的捐赠记录', () => {
      const mockRecords = [
        { id: '1', name: '张三', amount: 100, date: '2023-01-01', isAnonymous: false },
        { id: '2', name: '匿名', amount: 50, date: '2023-01-02', isAnonymous: true }
      ]
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockRecords))

      const records = getDonationRecords()

      expect(records).toEqual(mockRecords)
    })

    it('应该处理 JSON 解析错误', () => {
      mockLocalStorage.getItem.mockReturnValue('invalid json')

      const records = getDonationRecords()

      expect(records).toEqual([])
      expect(consoleSpy.error).toHaveBeenCalled()
    })

    it('应该处理 localStorage 访问错误', () => {
      mockLocalStorage.getItem.mockImplementation(() => {
        throw new Error('Storage error')
      })

      const records = getDonationRecords()

      expect(records).toEqual([])
      expect(consoleSpy.error).toHaveBeenCalled()
    })
  })

  describe('addDonationRecord', () => {
    it('应该添加新的捐赠记录', () => {
      mockLocalStorage.getItem.mockReturnValue('[]')
      
      const newRecord = {
        name: '李四',
        amount: 200,
        date: '2023-01-03',
        message: '支持开发',
        isAnonymous: false
      }

      addDonationRecord(newRecord)

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.DONATION_RECORDS,
        expect.stringContaining('"name":"李四"')
      )
    })

    it('应该为新记录生成 ID', () => {
      mockLocalStorage.getItem.mockReturnValue('[]')
      
      const newRecord = {
        name: '王五',
        amount: 150,
        date: '2023-01-04',
        isAnonymous: false
      }

      addDonationRecord(newRecord)

      const savedData = mockLocalStorage.setItem.mock.calls[0][1]
      const savedRecords = JSON.parse(savedData)
      
      expect(savedRecords[0]).toHaveProperty('id')
      expect(savedRecords[0].id).toBeDefined()
    })

    it('应该处理添加错误', () => {
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('Storage error')
      })

      const newRecord = { name: '测试', amount: 100, date: '2023-01-01', isAnonymous: false }

      expect(() => addDonationRecord(newRecord)).not.toThrow()
      expect(consoleSpy.error).toHaveBeenCalled()
    })
  })

  describe('deleteDonationRecord', () => {
    it('应该删除指定的捐赠记录', () => {
      const mockRecords = [
        { id: '1', name: '张三', amount: 100, date: '2023-01-01', isAnonymous: false },
        { id: '2', name: '李四', amount: 200, date: '2023-01-02', isAnonymous: false }
      ]
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockRecords))

      const result = deleteDonationRecord('1')

      expect(result).toBe(true)
      const savedData = mockLocalStorage.setItem.mock.calls[0][1]
      const savedRecords = JSON.parse(savedData)
      expect(savedRecords).toHaveLength(1)
      expect(savedRecords[0].id).toBe('2')
    })

    it('应该返回 false 当记录不存在时', () => {
      mockLocalStorage.getItem.mockReturnValue('[]')

      const result = deleteDonationRecord('nonexistent')

      expect(result).toBe(false)
    })

    it('应该处理删除错误', () => {
      mockLocalStorage.getItem.mockImplementation(() => {
        throw new Error('Storage error')
      })

      const result = deleteDonationRecord('1')

      expect(result).toBe(false)
      expect(consoleSpy.error).toHaveBeenCalled()
    })
  })

  describe('getDonationStats', () => {
    it('应该计算捐赠统计信息', () => {
      const mockRecords = [
        { id: '1', name: '张三', amount: 100, date: '2023-01-01', isAnonymous: false },
        { id: '2', name: '李四', amount: 200, date: '2023-01-02', isAnonymous: false },
        { id: '3', name: '匿名', amount: 50, date: '2023-01-03', isAnonymous: true }
      ]
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockRecords))

      const stats = getDonationStats()

      expect(stats).toEqual({
        totalAmount: 350,
        totalCount: 3,
        averageAmount: 116.67,
        anonymousCount: 1,
        namedCount: 2
      })
    })

    it('应该处理空记录', () => {
      mockLocalStorage.getItem.mockReturnValue('[]')

      const stats = getDonationStats()

      expect(stats).toEqual({
        totalAmount: 0,
        totalCount: 0,
        averageAmount: 0,
        anonymousCount: 0,
        namedCount: 0
      })
    })
  })

  describe('exportDonationData', () => {
    it('应该导出捐赠数据', () => {
      const mockRecords = [
        { id: '1', name: '张三', amount: 100, date: '2023-01-01', isAnonymous: false }
      ]
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockRecords))

      const exportData = exportDonationData()

      expect(exportData).toHaveProperty('donations')
      expect(exportData).toHaveProperty('exportDate')
      expect(exportData).toHaveProperty('version')
      expect(exportData.donations).toEqual(mockRecords)
    })
  })

  describe('importDonationData', () => {
    it('应该导入有效的捐赠数据', () => {
      const importData = {
        donations: [
          { id: '1', name: '导入用户', amount: 300, date: '2023-01-01', isAnonymous: false }
        ],
        version: '1.0'
      }

      const result = importDonationData(importData)

      expect(result).toBe(true)
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.DONATION_RECORDS,
        JSON.stringify(importData.donations)
      )
    })

    it('应该拒绝无效的导入数据', () => {
      const invalidData = { invalid: 'data' }

      const result = importDonationData(invalidData)

      expect(result).toBe(false)
      expect(consoleSpy.error).toHaveBeenCalled()
    })

    it('应该处理导入错误', () => {
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('Storage error')
      })

      const importData = {
        donations: [{ id: '1', name: '测试', amount: 100, date: '2023-01-01', isAnonymous: false }],
        version: '1.0'
      }

      const result = importDonationData(importData)

      expect(result).toBe(false)
      expect(consoleSpy.error).toHaveBeenCalled()
    })
  })

  describe('clearAllDonations', () => {
    it('应该清除所有捐赠记录', () => {
      clearAllDonations()

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(STORAGE_KEYS.DONATION_RECORDS)
    })

    it('应该处理清除错误', () => {
      mockLocalStorage.removeItem.mockImplementation(() => {
        throw new Error('Storage error')
      })

      expect(() => clearAllDonations()).not.toThrow()
      expect(consoleSpy.error).toHaveBeenCalled()
    })
  })

  describe('边界情况', () => {
    it('应该处理负数金额', () => {
      mockLocalStorage.getItem.mockReturnValue('[]')
      
      const invalidRecord = {
        name: '测试',
        amount: -100,
        date: '2023-01-01',
        isAnonymous: false
      }

      addDonationRecord(invalidRecord)

      // 应该仍然添加记录，但可能会有警告
      expect(mockLocalStorage.setItem).toHaveBeenCalled()
    })

    it('应该处理空名称', () => {
      mockLocalStorage.getItem.mockReturnValue('[]')
      
      const recordWithEmptyName = {
        name: '',
        amount: 100,
        date: '2023-01-01',
        isAnonymous: false
      }

      addDonationRecord(recordWithEmptyName)

      expect(mockLocalStorage.setItem).toHaveBeenCalled()
    })

    it('应该处理无效日期', () => {
      mockLocalStorage.getItem.mockReturnValue('[]')
      
      const recordWithInvalidDate = {
        name: '测试',
        amount: 100,
        date: 'invalid-date',
        isAnonymous: false
      }

      addDonationRecord(recordWithInvalidDate)

      expect(mockLocalStorage.setItem).toHaveBeenCalled()
    })
  })
})
