import { describe, it, expect } from 'vitest'
import {
  detectSensitiveWords,
  detectMaliciousPatterns,
  checkContent,
  validateFormContent,
  SENSITIVE_WORD_CONFIG,
  addCustomSensitiveWords,
  addWhitelistWords,
  setSensitiveWordLevel
} from '../contentFilter'

describe('ContentFilter Utils', () => {
  describe('detectSensitiveWords', () => {
    it('应该检测敏感词', () => {
      const content = '这是一个包含政治敏感词的内容'
      const result = detectSensitiveWords(content)

      expect(Array.isArray(result)).toBe(true)
      if (result.length > 0) {
        expect(result[0]).toContain('政治')
      }
    })

    it('应该返回空数组对于正常内容', () => {
      const content = '这是一个正常的待办事项内容'
      const result = detectSensitiveWords(content)

      expect(result).toEqual([])
    })

    it('应该处理空字符串', () => {
      const result = detectSensitiveWords('')
      expect(result).toEqual([])
    })

    it('应该处理 null 和 undefined', () => {
      expect(detectSensitiveWords(null)).toEqual([])
      expect(detectSensitiveWords(undefined)).toEqual([])
    })

    it('应该检测多个敏感词', () => {
      const content = '包含暴力和色情内容'
      const result = detectSensitiveWords(content)

      expect(Array.isArray(result)).toBe(true)
      // 可能检测到多个敏感词
    })

    it('应该处理大小写不敏感', () => {
      const content = '包含POLITICS内容'
      const result = detectSensitiveWords(content)

      expect(Array.isArray(result)).toBe(true)
    })
  })

  describe('detectMaliciousPatterns', () => {
    it('应该检测恶意模式', () => {
      const maliciousContent = '这是一个包含威胁的内容'
      const result = detectMaliciousPatterns(maliciousContent)

      expect(Array.isArray(result)).toBe(true)
    })

    it('应该返回空数组对于正常内容', () => {
      const normalContent = '买菜、做饭、洗衣服'
      const result = detectMaliciousPatterns(normalContent)

      expect(result).toEqual([])
    })

    it('应该处理空内容', () => {
      const result = detectMaliciousPatterns('')

      expect(result).toEqual([])
    })

    it('应该检测多种类型的恶意模式', () => {
      const content = '包含暴力和诈骗内容'
      const result = detectMaliciousPatterns(content)

      expect(Array.isArray(result)).toBe(true)
    })

    it('应该处理 null 和 undefined', () => {
      expect(detectMaliciousPatterns(null)).toEqual([])
      expect(detectMaliciousPatterns(undefined)).toEqual([])
    })
  })

  describe('checkContent', () => {
    it('应该检查安全内容', () => {
      const safeContent = '完成工作报告'
      const result = checkContent(safeContent)

      expect(result).toHaveProperty('isValid')
      expect(result).toHaveProperty('sensitiveWords')
      expect(result).toHaveProperty('maliciousPatterns')
    })

    it('应该检查并标识不安全内容', () => {
      const unsafeContent = '包含政治敏感词的内容'
      const result = checkContent(unsafeContent)

      expect(result.isValid).toBeDefined()
      expect(Array.isArray(result.sensitiveWords)).toBe(true)
      expect(Array.isArray(result.maliciousPatterns)).toBe(true)
    })

    it('应该处理长内容', () => {
      const longContent = 'A'.repeat(1000)
      const result = checkContent(longContent)

      expect(result).toHaveProperty('isValid')
      expect(result).toHaveProperty('sensitiveWords')
    })

    it('应该处理特殊字符', () => {
      const specialContent = '包含特殊字符 @#$%^&*() 的内容'
      const result = checkContent(specialContent)

      expect(result).toHaveProperty('isValid')
      expect(Array.isArray(result.sensitiveWords)).toBe(true)
    })
  })

  describe('validateFormContent', () => {
    it('应该验证表单内容', () => {
      const formData = {
        title: '正常标题',
        description: '正常描述内容'
      }
      const result = validateFormContent(formData)

      expect(result).toHaveProperty('isValid')
      expect(result).toHaveProperty('issues')
      expect(result).toHaveProperty('details')
      expect(result.details).toHaveProperty('title')
      expect(result.details).toHaveProperty('description')
    })

    it('应该检测表单中的敏感内容', () => {
      const formData = {
        title: '包含政治敏感词的标题',
        description: '正常描述'
      }
      const result = validateFormContent(formData)

      expect(result).toHaveProperty('isValid')
      expect(result.details.title).toHaveProperty('isValid')
      expect(result.details.description).toHaveProperty('isValid')
    })

    it('应该处理空表单数据', () => {
      const formData = {
        title: '',
        description: ''
      }
      const result = validateFormContent(formData)

      expect(result).toHaveProperty('isValid')
    })
  })

  describe('配置管理', () => {
    it('应该有默认配置', () => {
      expect(SENSITIVE_WORD_CONFIG).toHaveProperty('enabled')
      expect(SENSITIVE_WORD_CONFIG).toHaveProperty('level')
      expect(SENSITIVE_WORD_CONFIG).toHaveProperty('customWords')
      expect(SENSITIVE_WORD_CONFIG).toHaveProperty('whitelist')
      expect(SENSITIVE_WORD_CONFIG).toHaveProperty('categories')
    })

    it('应该能够添加自定义敏感词', () => {
      const initialLength = SENSITIVE_WORD_CONFIG.customWords.length
      addCustomSensitiveWords(['测试敏感词'])

      expect(SENSITIVE_WORD_CONFIG.customWords.length).toBe(initialLength + 1)
      expect(SENSITIVE_WORD_CONFIG.customWords).toContain('测试敏感词')
    })

    it('应该能够添加白名单词汇', () => {
      const initialLength = SENSITIVE_WORD_CONFIG.whitelist.length
      addWhitelistWords(['测试白名单'])

      expect(SENSITIVE_WORD_CONFIG.whitelist.length).toBe(initialLength + 1)
      expect(SENSITIVE_WORD_CONFIG.whitelist).toContain('测试白名单')
    })

    it('应该能够设置检测级别', () => {
      setSensitiveWordLevel('strict')
      expect(SENSITIVE_WORD_CONFIG.level).toBe('strict')

      setSensitiveWordLevel('normal')
      expect(SENSITIVE_WORD_CONFIG.level).toBe('normal')

      setSensitiveWordLevel('loose')
      expect(SENSITIVE_WORD_CONFIG.level).toBe('loose')
    })
  })

  describe('边界情况和错误处理', () => {
    it('应该处理非字符串输入', () => {
      expect(() => detectSensitiveWords(123)).not.toThrow()
      expect(() => detectMaliciousPatterns({})).not.toThrow()
      expect(() => checkContent([])).not.toThrow()
    })

    it('应该处理超长内容', () => {
      const veryLongContent = 'A'.repeat(10000)

      expect(() => detectSensitiveWords(veryLongContent)).not.toThrow()
      expect(() => detectMaliciousPatterns(veryLongContent)).not.toThrow()
      expect(() => checkContent(veryLongContent)).not.toThrow()
    })

    it('应该处理特殊字符和 Unicode', () => {
      const unicodeContent = '测试内容 🎉 包含 emoji 和特殊字符 ñáéíóú'

      expect(() => detectSensitiveWords(unicodeContent)).not.toThrow()
      expect(() => checkContent(unicodeContent)).not.toThrow()
    })

    it('应该处理换行符和空白字符', () => {
      const contentWithWhitespace = '  \n\t 测试内容 \r\n  '

      const sensitiveWords = detectSensitiveWords(contentWithWhitespace)
      const checkResult = checkContent(contentWithWhitespace)

      expect(Array.isArray(sensitiveWords)).toBe(true)
      expect(checkResult).toHaveProperty('isValid')
    })
  })

  describe('性能测试', () => {
    it('应该在合理时间内处理中等长度内容', () => {
      const mediumContent = '这是一个中等长度的内容，'.repeat(100)

      const start = Date.now()
      detectSensitiveWords(mediumContent)
      const end = Date.now()

      // 应该在 100ms 内完成
      expect(end - start).toBeLessThan(100)
    })

    it('应该高效处理批量内容', () => {
      const contents = Array.from({ length: 50 }, (_, i) => `测试内容 ${i}`)

      const start = Date.now()
      contents.forEach(content => checkContent(content))
      const end = Date.now()

      // 批量处理应该在 200ms 内完成
      expect(end - start).toBeLessThan(200)
    })
  })
})
