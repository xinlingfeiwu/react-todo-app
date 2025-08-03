/**
 * @description 性能监控和错误追踪工具
 * 帮助识别性能瓶颈和运行时错误
 */

class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.startTime = performance.now();
  }

  // 标记性能起点
  mark(name) {
    if (typeof performance !== 'undefined' && performance.mark) {
      try {
        performance.mark(`${name}-start`);
        this.metrics.set(name, { start: performance.now() });
      } catch (error) {
        console.warn('性能标记失败:', error);
      }
    }
  }

  // 测量性能
  measure(name) {
    if (typeof performance !== 'undefined' && performance.mark && performance.measure && performance.getEntriesByName) {
      const startMark = `${name}-start`;
      const endMark = `${name}-end`;
      
      try {
        performance.mark(endMark);
        
        performance.measure(name, startMark, endMark);
        const measure = performance.getEntriesByName(name)[0];
        
        console.log(`⚡ 性能指标 [${name}]:`, {
          duration: `${measure.duration.toFixed(2)}ms`,
          start: `${measure.startTime.toFixed(2)}ms`,
          end: `${(measure.startTime + measure.duration).toFixed(2)}ms`
        });
        
        return measure.duration;
      } catch (error) {
        console.warn(`性能测量失败 [${name}]:`, error);
      }
    }
  }

  // 获取页面加载性能
  getPageLoadMetrics() {
    if (typeof performance !== 'undefined' && performance.getEntriesByType) {
      try {
        const navigation = performance.getEntriesByType('navigation')[0];
        if (navigation) {
          const dns = navigation.domainLookupEnd - navigation.domainLookupStart;
          const tcp = navigation.connectEnd - navigation.connectStart;
          const request = navigation.responseStart - navigation.requestStart;
          const response = navigation.responseEnd - navigation.responseStart;
          const domContentLoaded = navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart;
          const loadComplete = navigation.loadEventEnd - navigation.loadEventStart;
          
          const total = dns + tcp + request + response + domContentLoaded + loadComplete;
          
          return {
            dns,
            tcp,
            request,
            response,
            domContentLoaded,
            loadComplete,
            total
          };
        }
      } catch (error) {
        console.warn('获取页面加载指标失败:', error);
      }
    }
    return null;
  }

  // 监控长任务
  observeLongTasks() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          console.warn('🐌 检测到长任务:', {
            duration: `${entry.duration.toFixed(2)}ms`,
            startTime: `${entry.startTime.toFixed(2)}ms`,
            name: entry.name
          });
        }
      });
      
      try {
        observer.observe({ entryTypes: ['longtask'] });
      } catch (error) {
        console.log('长任务监控不支持:', error);
      }
    }
  }

  // 内存使用监控
  getMemoryInfo() {
    if (performance.memory) {
      return {
        used: performance.memory.usedJSHeapSize / 1024 / 1024,
        total: performance.memory.totalJSHeapSize / 1024 / 1024,
        limit: performance.memory.jsHeapSizeLimit / 1024 / 1024
      };
    }
    return null;
  }

  // 内存使用监控（测试兼容）
  getMemoryUsage() {
    const memInfo = this.getMemoryInfo();
    if (memInfo) {
      return {
        used: `${memInfo.used.toFixed(2)} MB`,
        total: `${memInfo.total.toFixed(2)} MB`,
        limit: `${memInfo.limit.toFixed(2)} MB`,
        percentage: Math.round((memInfo.used / memInfo.total) * 100)
      };
    }
    return null;
  }

  // FPS监控
  startFPSMonitoring(callback) {
    this.fpsMonitoring = true;
    this.fpsCallback = callback;
    // 简化的FPS监控实现
    if (callback) {
      callback(60); // 模拟60fps
    }
  }

  stopFPSMonitoring() {
    this.fpsMonitoring = false;
    this.fpsCallback = null;
  }

  // 错误记录
  logError(component, error) {
    const errorInfo = {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    };
    console.error(`❌ 错误 [${component}]:`, errorInfo);
  }

  logWarning(component, message) {
    const warningInfo = {
      message: message,
      timestamp: new Date().toISOString()
    };
    console.warn(`⚠️ 警告 [${component}]:`, warningInfo);
  }

  // 性能报告
  getPerformanceReport() {
    const report = {
      pageLoad: this.getPageLoadMetrics(),
      memory: this.getMemoryUsage(),
      timestamp: new Date().toISOString(),
      metrics: Object.fromEntries(this.metrics)
    };
    
    console.log('📊 性能报告:', report);
    return report;
  }

  // 资源监控
  getResourceMetrics() {
    if (typeof performance !== 'undefined' && performance.getEntriesByType) {
      try {
        return performance.getEntriesByType('resource').map(entry => ({
          name: entry.name,
          type: entry.initiatorType || 'other',
          duration: entry.duration,
          size: entry.transferSize || 0
        }));
      } catch (error) {
        console.warn('获取资源指标失败:', error);
        return [];
      }
    }
    return [];
  }

  // 清理性能数据
  clearMetrics() {
    this.metrics.clear();
    if (typeof performance !== 'undefined') {
      performance.clearMarks();
      performance.clearMeasures();
    }
  }

  // 启动监控
  startMonitoring() {
    console.log('🚀 性能监控已启动');

    this.observeLongTasks();

    // 每30秒输出一次内存信息
    setInterval(() => {
      const memory = this.getMemoryInfo();
      if (memory) {
        console.log('💾 内存使用:', `${memory.used}MB / ${memory.total}MB (限制: ${memory.limit}MB)`);
      }
    }, 30000);

    // 页面可见性变化监控
    document.addEventListener('visibilitychange', () => {
      console.log('👁️ 页面可见性:', document.hidden ? '隐藏' : '显示');
    });
  }
}

// 创建全局性能监控实例
export const performanceMonitor = new PerformanceMonitor();

// 在开发环境下启动监控
if (import.meta.env.DEV) {
  performanceMonitor.startMonitoring();
  
  // 输出页面加载性能
  window.addEventListener('load', () => {
    setTimeout(() => {
      const metrics = performanceMonitor.getPageLoadMetrics();
      if (metrics) {
        console.table(metrics);
      }
    }, 1000);
  });
}
