import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import {
  APP_VERSION,
  BUILD_TIME,
  BUILD_HASH,
  BUILD_TIMESTAMP,
  GIT_INFO,
  VERSION_INFO
} from '../version'

describe('version constants', () => {
  let originalWindow

  beforeEach(() => {
    // 保存原始 window 对象
    originalWindow = global.window
  })

  afterEach(() => {
    // 恢复原始 window 对象
    global.window = originalWindow
  })

  describe('基本常量', () => {
    it('应该导出 APP_VERSION', () => {
      expect(APP_VERSION).toBeDefined()
      expect(typeof APP_VERSION).toBe('string')
      expect(APP_VERSION).toMatch(/^\d+\.\d+\.\d+$/)
    })

    it('应该导出 BUILD_TIME', () => {
      expect(BUILD_TIME).toBeDefined()
      expect(typeof BUILD_TIME).toBe('string')
      expect(BUILD_TIME).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
    })

    it('应该导出 BUILD_HASH', () => {
      expect(BUILD_HASH).toBeDefined()
      expect(typeof BUILD_HASH).toBe('string')
      expect(BUILD_HASH.length).toBeGreaterThan(0)
    })

    it('应该导出 BUILD_TIMESTAMP', () => {
      expect(BUILD_TIMESTAMP).toBeDefined()
      expect(typeof BUILD_TIMESTAMP).toBe('number')
      expect(BUILD_TIMESTAMP).toBeGreaterThan(0)
    })
  })

  describe('GIT_INFO', () => {
    it('应该包含 git 信息', () => {
      expect(GIT_INFO).toBeDefined()
      expect(typeof GIT_INFO).toBe('object')
      expect(GIT_INFO).toHaveProperty('hash')
      expect(GIT_INFO).toHaveProperty('branch')
      expect(GIT_INFO).toHaveProperty('tag')
    })

    it('应该有有效的 git hash', () => {
      expect(typeof GIT_INFO.hash).toBe('string')
      expect(GIT_INFO.hash.length).toBeGreaterThan(0)
    })

    it('应该有有效的 branch', () => {
      expect(typeof GIT_INFO.branch).toBe('string')
      expect(GIT_INFO.branch.length).toBeGreaterThan(0)
    })

    it('应该有 tag 属性', () => {
      expect(GIT_INFO).toHaveProperty('tag')
      expect(typeof GIT_INFO.tag).toBe('string')
    })
  })

  describe('VERSION_INFO', () => {
    it('应该包含完整的版本信息', () => {
      expect(VERSION_INFO).toBeDefined()
      expect(typeof VERSION_INFO).toBe('object')
      
      expect(VERSION_INFO).toHaveProperty('name')
      expect(VERSION_INFO).toHaveProperty('version')
      expect(VERSION_INFO).toHaveProperty('buildTime')
      expect(VERSION_INFO).toHaveProperty('buildHash')
      expect(VERSION_INFO).toHaveProperty('buildTimestamp')
      expect(VERSION_INFO).toHaveProperty('git')
    })

    it('应该有正确的应用名称', () => {
      expect(VERSION_INFO.name).toBe('react-todo-app')
    })

    it('应该版本信息一致', () => {
      expect(VERSION_INFO.version).toBe(APP_VERSION)
      expect(VERSION_INFO.buildTime).toBe(BUILD_TIME)
      expect(VERSION_INFO.buildHash).toBe(BUILD_HASH)
      expect(VERSION_INFO.buildTimestamp).toBe(BUILD_TIMESTAMP)
      expect(VERSION_INFO.git).toBe(GIT_INFO)
    })
  })

  describe('全局变量设置', () => {
    it('应该在浏览器环境中设置全局变量', () => {
      // 检查全局变量是否已经设置（在实际运行时会被设置）
      // 在测试环境中，我们检查version.js模块是否正确导出了这些值
      expect(APP_VERSION).toBeDefined()
      expect(BUILD_HASH).toBeDefined()
      expect(BUILD_TIME).toBeDefined()

      // 如果window对象存在，检查全局变量
      if (typeof window !== 'undefined') {
        expect(window.__APP_VERSION__).toBeDefined()
        expect(window.__BUILD_HASH__).toBeDefined()
        expect(window.__BUILD_TIME__).toBeDefined()
      }
    })

    it('应该在非浏览器环境中不报错', () => {
      // 模拟非浏览器环境
      global.window = undefined

      expect(() => {
        // 在 Vitest 中使用动态导入
        import('../version')
      }).not.toThrow()
    })
  })

  describe('版本格式验证', () => {
    it('应该使用语义化版本格式', () => {
      const semverRegex = /^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?$/
      expect(APP_VERSION).toMatch(semverRegex)
    })

    it('应该有有效的构建时间格式', () => {
      const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/
      expect(BUILD_TIME).toMatch(isoDateRegex)
    })

    it('应该有有效的构建哈希格式', () => {
      expect(BUILD_HASH).toMatch(/^[a-f0-9]+$/)
      expect(BUILD_HASH.length).toBeGreaterThanOrEqual(6)
    })

    it('应该有有效的时间戳', () => {
      expect(BUILD_TIMESTAMP).toBeGreaterThan(1600000000) // 2020年后
      expect(BUILD_TIMESTAMP).toBeLessThan(2000000000) // 2033年前
    })
  })

  describe('数据一致性', () => {
    it('所有版本引用应该一致', () => {
      expect(VERSION_INFO.version).toBe(APP_VERSION)
    })

    it('所有构建时间引用应该一致', () => {
      expect(VERSION_INFO.buildTime).toBe(BUILD_TIME)
    })

    it('所有构建哈希引用应该一致', () => {
      expect(VERSION_INFO.buildHash).toBe(BUILD_HASH)
    })

    it('所有时间戳引用应该一致', () => {
      expect(VERSION_INFO.buildTimestamp).toBe(BUILD_TIMESTAMP)
    })
  })
})
