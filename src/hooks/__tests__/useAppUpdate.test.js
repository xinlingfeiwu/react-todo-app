import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { useAppUpdate } from '../useAppUpdate'
import {
  APP_CURRENT_VERSION_KEY,
  APP_UPDATE_DISMISSED_KEY,
  APP_UPDATE_SNOOZED_KEY
} from '../../constants/storageKeys'

// 模拟 localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
}

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
})

// 模拟 fetch
global.fetch = vi.fn()

// 模拟环境变量
vi.mock('../../utils/storageCleanup', () => ({
  autoCleanup: vi.fn()
}))

describe('useAppUpdate Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockLocalStorage.getItem.mockReturnValue(null)
    
    // 模拟成功的 fetch 响应
    global.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        version: '1.0.1',
        buildHash: 'abc123',
        buildTime: '2023-01-01T00:00:00Z'
      })
    })

    // 清除定时器
    vi.clearAllTimers()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  describe('初始化', () => {
    it('应该正确初始化状态', () => {
      const { result } = renderHook(() => useAppUpdate())

      expect(result.current.hasUpdate).toBe(false)
      expect(result.current.currentVersion).toBeTruthy() // 应该有当前版本
      expect(result.current.latestVersion).toBe('')
      expect(result.current.isChecking).toBe(false)
    })

    it('应该在初始化时设置当前版本', async () => {
      // 模拟环境变量
      import.meta.env.VITE_APP_VERSION = '1.0.0'
      
      const { result } = renderHook(() => useAppUpdate())
      
      // 等待初始化完成
      await act(async () => {
        vi.advanceTimersByTime(1000)
      })
      
      expect(result.current.currentVersion).toBe('1.0.0')
    })
  })

  describe('版本检查', () => {
    it('应该检测到新版本', async () => {
      const { result } = renderHook(() => useAppUpdate())
      
      await act(async () => {
        await result.current.checkForUpdate()
      })
      
      expect(result.current.hasUpdate).toBe(true)
      expect(result.current.latestVersion).toBe('1.0.1')
    })

    it('应该处理网络错误', async () => {
      global.fetch.mockRejectedValue(new Error('Network error'))
      
      const { result } = renderHook(() => useAppUpdate())
      
      await act(async () => {
        const updateAvailable = await result.current.checkForUpdate()
        expect(updateAvailable).toBe(false)
      })
      
      expect(result.current.hasUpdate).toBe(false)
    })

    it('应该处理 HTTP 错误', async () => {
      global.fetch.mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      })
      
      const { result } = renderHook(() => useAppUpdate())
      
      await act(async () => {
        const updateAvailable = await result.current.checkForUpdate()
        expect(updateAvailable).toBe(false)
      })
      
      expect(result.current.hasUpdate).toBe(false)
    })
  })

  describe('更新操作', () => {
    it('应该应用更新', async () => {
      // 模拟window.location.reload
      const reloadSpy = vi.fn()

      // 使用delete和重新定义的方式
      delete window.location
      window.location = { reload: reloadSpy }

      const { result } = renderHook(() => useAppUpdate())

      await act(async () => {
        await result.current.checkForUpdate()
      })

      act(() => {
        result.current.applyUpdate()
      })

      // 等待延迟的刷新
      act(() => {
        vi.advanceTimersByTime(500)
      })

      expect(reloadSpy).toHaveBeenCalled()
      
      expect(result.current.hasUpdate).toBe(false)
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(APP_UPDATE_DISMISSED_KEY)
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(APP_UPDATE_SNOOZED_KEY)
    })

    it('应该暂缓更新', async () => {
      const { result } = renderHook(() => useAppUpdate())
      
      await act(async () => {
        await result.current.checkForUpdate()
      })
      
      act(() => {
        result.current.snoozeUpdate()
      })
      
      expect(result.current.hasUpdate).toBe(false)
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        APP_UPDATE_SNOOZED_KEY,
        expect.stringContaining('1.0.1')
      )
    })

    it('应该永久忽略更新', async () => {
      const { result } = renderHook(() => useAppUpdate())
      
      await act(async () => {
        await result.current.checkForUpdate()
      })
      
      act(() => {
        result.current.dismissUpdate()
      })
      
      expect(result.current.hasUpdate).toBe(false)
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(APP_UPDATE_DISMISSED_KEY, '1.0.1')
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(APP_UPDATE_SNOOZED_KEY)
    })
  })

  describe('自动检查', () => {
    it('应该启动和停止自动检查', () => {
      const { result } = renderHook(() => useAppUpdate())
      
      act(() => {
        result.current.startAutoCheck()
      })
      
      expect(vi.getTimerCount()).toBeGreaterThan(0)
      
      act(() => {
        result.current.stopAutoCheck()
      })
    })
  })

  describe('存储版本信息', () => {
    it('应该处理已忽略的版本', async () => {
      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === APP_UPDATE_DISMISSED_KEY) return '1.0.1'
        if (key === APP_CURRENT_VERSION_KEY) return JSON.stringify({
          version: '1.0.0',
          buildHash: 'old123',
          buildTime: '2022-01-01T00:00:00Z'
        })
        return null
      })
      
      const { result } = renderHook(() => useAppUpdate())
      
      await act(async () => {
        const updateAvailable = await result.current.checkForUpdate()
        expect(updateAvailable).toBe(false)
      })
      
      expect(result.current.hasUpdate).toBe(false)
    })

    it('应该处理暂缓的版本', async () => {
      const snoozedData = {
        version: '1.0.1',
        snoozedAt: Date.now() - 30 * 60 * 1000 // 30分钟前
      }
      
      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === APP_UPDATE_SNOOZED_KEY) return JSON.stringify(snoozedData)
        if (key === APP_CURRENT_VERSION_KEY) return JSON.stringify({
          version: '1.0.0',
          buildHash: 'old123',
          buildTime: '2022-01-01T00:00:00Z'
        })
        return null
      })
      
      const { result } = renderHook(() => useAppUpdate())
      
      await act(async () => {
        const updateAvailable = await result.current.checkForUpdate()
        expect(updateAvailable).toBe(false)
      })
      
      expect(result.current.hasUpdate).toBe(false)
    })
  })
})
