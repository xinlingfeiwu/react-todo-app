/**
 * 生产环境日志清理工具
 * 在生产环境中移除或替换 console.log
 */

// 环境检测函数
const getEnvironment = () => {
  // 检测生产环境
  const isProd = import.meta.env.PROD || 
    import.meta.env.NODE_ENV === 'production' ||
    (typeof process !== 'undefined' && process.env.NODE_ENV === 'production');
  
  // 检测测试环境
  const isTestEnv = import.meta.env.MODE === 'test' || 
    import.meta.env.NODE_ENV === 'test' ||
    (typeof process !== 'undefined' && process.env.NODE_ENV === 'test') ||
    (typeof global !== 'undefined' && global.__vitest);
  
  return { isProd, isTestEnv };
};

const { isProd: isProduction } = getEnvironment();

// 创建安全的日志函数
export const logger = {
  log: (...args) => {
    try {
      if (!isProduction && console && console.log) {
        console.log(...args);
      }
    } catch {
      // 静默处理console错误
    }
  },

  warn: (...args) => {
    try {
      if (!isProduction && console && console.warn) {
        console.warn(...args);
      }
    } catch {
      // 静默处理console错误
    }
  },

  error: (...args) => {
    try {
      // 错误信息在生产环境中也应该保留，但可以发送到错误收集服务
      if (console && console.error) {
        console.error(...args);
      }

      // 在生产环境中可以添加错误上报逻辑
      if (isProduction) {
        // 可以在这里添加错误上报到 Sentry 等服务
        // reportError(...args);
      }
    } catch {
      // 静默处理console错误
    }
  },

  info: (...args) => {
    try {
      if (!isProduction && console && console.info) {
        console.info(...args);
      }
    } catch {
      // 静默处理console错误
    }
  },

  debug: (...args) => {
    try {
      if (!isProduction && console && console.debug) {
        console.debug(...args);
      }
    } catch {
      // 静默处理console错误
    }
  }
};

// 数据迁移专用日志（保留重要信息）
export const migrationLogger = {
  log: (...args) => {
    try {
      // 数据迁移信息即使在生产环境也应该记录
      if (console && console.log) {
        console.log('[MIGRATION]', ...args);
      }
    } catch {
      // 静默处理console错误
    }
  }
};

export default logger;
