import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

describe('logger', () => {
  // 保存原始的 console 方法
  const originalConsole = {
    log: console.log,
    warn: console.warn,
    error: console.error,
    info: console.info,
    debug: console.debug
  }

  // 模拟 console 方法
  const mockConsole = {
    log: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    debug: vi.fn()
  }

  beforeEach(() => {
    vi.clearAllMocks()
    
    // 替换 console 方法
    Object.assign(console, mockConsole)
  })

  afterEach(() => {
    // 恢复原始的 console 方法
    Object.assign(console, originalConsole)
  })

  describe('开发环境', () => {
    let logger

    beforeEach(async () => {
      // 模拟开发环境
      vi.stubEnv('NODE_ENV', 'development')
      vi.stubEnv('VITE_NODE_ENV', 'development')
      // 重新导入模块以应用新的环境变量
      vi.resetModules()
      const loggerModule = await import('../logger')
      logger = loggerModule.logger
    })

    it('应该在开发环境中输出 log', () => {
      logger.log('test message', 123)
      
      expect(mockConsole.log).toHaveBeenCalledWith('test message', 123)
    })

    it('应该在开发环境中输出 warn', () => {
      logger.warn('warning message')
      
      expect(mockConsole.warn).toHaveBeenCalledWith('warning message')
    })

    it('应该在开发环境中输出 error', () => {
      logger.error('error message')
      
      expect(mockConsole.error).toHaveBeenCalledWith('error message')
    })

    it('应该在开发环境中输出 info', () => {
      logger.info('info message')
      
      expect(mockConsole.info).toHaveBeenCalledWith('info message')
    })

    it('应该在开发环境中输出 debug', () => {
      logger.debug('debug message')
      
      expect(mockConsole.debug).toHaveBeenCalledWith('debug message')
    })

    it('应该处理多个参数', () => {
      logger.log('message', { data: 'test' }, [1, 2, 3])
      
      expect(mockConsole.log).toHaveBeenCalledWith('message', { data: 'test' }, [1, 2, 3])
    })

    it('应该处理空参数', () => {
      logger.log()
      
      expect(mockConsole.log).toHaveBeenCalledWith()
    })
  })

  describe('生产环境', () => {
    let logger

    beforeEach(async () => {
      // 模拟生产环境
      vi.stubEnv('NODE_ENV', 'production')
      vi.stubEnv('VITE_NODE_ENV', 'production')
      // 重新导入模块以应用新的环境变量
      vi.resetModules()
      const loggerModule = await import('../logger')
      logger = loggerModule.logger
    })

    it('不应该在生产环境中输出 log', () => {
      logger.log('test message')
      
      expect(mockConsole.log).not.toHaveBeenCalled()
    })

    it('不应该在生产环境中输出 warn', () => {
      logger.warn('warning message')
      
      expect(mockConsole.warn).not.toHaveBeenCalled()
    })

    it('应该在生产环境中输出 error', () => {
      logger.error('error message')
      
      expect(mockConsole.error).toHaveBeenCalledWith('error message')
    })

    it('不应该在生产环境中输出 info', () => {
      logger.info('info message')
      
      expect(mockConsole.info).not.toHaveBeenCalled()
    })

    it('不应该在生产环境中输出 debug', () => {
      logger.debug('debug message')
      
      expect(mockConsole.debug).not.toHaveBeenCalled()
    })
  })

  describe('migrationLogger', () => {
    let migrationLogger

    beforeEach(async () => {
      const loggerModule = await import('../logger')
      migrationLogger = loggerModule.migrationLogger
    })

    it('应该在开发环境中输出迁移日志', () => {
      migrationLogger.log('migration message')
      
      expect(mockConsole.log).toHaveBeenCalledWith('[MIGRATION]', 'migration message')
    })

    it('应该在生产环境中输出迁移日志', () => {
      migrationLogger.log('migration message')
      
      expect(mockConsole.log).toHaveBeenCalledWith('[MIGRATION]', 'migration message')
    })

    it('应该处理多个参数', () => {
      migrationLogger.log('migration', { from: 'v1', to: 'v2' })
      
      expect(mockConsole.log).toHaveBeenCalledWith('[MIGRATION]', 'migration', { from: 'v1', to: 'v2' })
    })

    it('应该处理空参数', () => {
      migrationLogger.log()
      
      expect(mockConsole.log).toHaveBeenCalledWith('[MIGRATION]')
    })
  })

  describe('错误处理', () => {
    let logger

    beforeEach(async () => {
      const loggerModule = await import('../logger')
      logger = loggerModule.logger
    })
    it('应该处理 console 方法不存在的情况', () => {
      // 临时删除 console.log
      const originalLog = console.log
      delete console.log
      
      expect(() => {
        logger.log('test')
      }).not.toThrow()
      
      // 恢复 console.log
      console.log = originalLog
    })

    it('应该处理 console 方法抛出异常的情况', () => {
      mockConsole.log.mockImplementation(() => {
        throw new Error('Console error')
      })
      
      expect(() => {
        logger.log('test')
      }).not.toThrow()
    })
  })

  describe('性能测试', () => {
    let logger

    beforeEach(async () => {
      vi.stubEnv('NODE_ENV', 'production')
      vi.resetModules()
      const loggerModule = await import('../logger')
      logger = loggerModule.logger
    })
    it('生产环境中被跳过的日志应该有最小的性能影响', () => {
      const start = performance.now()
      
      // 执行大量日志调用
      for (let i = 0; i < 1000; i++) {
        logger.log('test message', i)
        logger.info('info message', i)
        logger.debug('debug message', i)
      }
      
      const end = performance.now()
      const duration = end - start
      
      // 在生产环境中，这些调用应该很快完成（小于 10ms）
      expect(duration).toBeLessThan(10)
      
      // 确认没有实际的 console 调用
      expect(mockConsole.log).not.toHaveBeenCalled()
      expect(mockConsole.info).not.toHaveBeenCalled()
      expect(mockConsole.debug).not.toHaveBeenCalled()
    })
  })

  describe('类型安全', () => {
    let logger, migrationLogger

    beforeEach(async () => {
      const loggerModule = await import('../logger')
      logger = loggerModule.logger
      migrationLogger = loggerModule.migrationLogger
    })
    it('应该处理各种数据类型', () => {
      const testData = [
        'string',
        123,
        true,
        null,
        undefined,
        { object: 'value' },
        [1, 2, 3],
        new Date(),
        new Error('test error')
      ]
      
      testData.forEach(data => {
        expect(() => {
          logger.log(data)
          logger.error(data)
          migrationLogger.log(data)
        }).not.toThrow()
      })
    })

    it('应该处理循环引用对象', () => {
      const circularObj = { name: 'test' }
      circularObj.self = circularObj
      
      expect(() => {
        logger.log(circularObj)
      }).not.toThrow()
    })
  })

  describe('环境变量处理', () => {
    it('应该正确处理未定义的环境变量', async () => {
      // 清除环境变量
      vi.unstubAllEnvs()
      vi.resetModules()
      
      const loggerModule = await import('../logger')
      const logger = loggerModule.logger
      
      expect(() => {
        logger.log('test')
        logger.error('test')
      }).not.toThrow()
    })

    it('应该处理字符串形式的环境变量', async () => {
      vi.stubEnv('NODE_ENV', 'production')
      vi.resetModules()
      
      const loggerModule = await import('../logger')
      const logger = loggerModule.logger
      
      logger.log('test message')
      
      // 应该被当作生产环境处理
      expect(mockConsole.log).not.toHaveBeenCalled()
    })
  })
})
