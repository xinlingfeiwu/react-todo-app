/**
 * 生产环境日志清理工具
 * 在生产环境中移除或替换 console.log
 */

// 生产环境检测
const isProduction = import.meta.env.PROD;

// 创建安全的日志函数
export const logger = {
  log: (...args) => {
    if (!isProduction) {
      console.log(...args);
    }
  },
  
  warn: (...args) => {
    if (!isProduction) {
      console.warn(...args);
    }
  },
  
  error: (...args) => {
    // 错误信息在生产环境中也应该保留，但可以发送到错误收集服务
    console.error(...args);
    
    // 在生产环境中可以添加错误上报逻辑
    if (isProduction) {
      // 可以在这里添加错误上报到 Sentry 等服务
      // reportError(...args);
    }
  },
  
  info: (...args) => {
    if (!isProduction) {
      console.info(...args);
    }
  },
  
  debug: (...args) => {
    if (!isProduction) {
      console.debug(...args);
    }
  }
};

// 数据迁移专用日志（保留重要信息）
export const migrationLogger = {
  log: (...args) => {
    // 数据迁移信息即使在生产环境也应该记录
    console.log('[Migration]', ...args);
  }
};

export default logger;
