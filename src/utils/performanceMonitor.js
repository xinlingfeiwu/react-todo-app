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
    performance.mark(`${name}-start`);
    this.metrics.set(name, { start: performance.now() });
  }

  // 测量性能
  measure(name) {
    const startMark = `${name}-start`;
    const endMark = `${name}-end`;
    
    performance.mark(endMark);
    
    try {
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

  // 获取页面加载性能
  getPageLoadMetrics() {
    if (typeof performance !== 'undefined' && performance.navigation) {
      const navigation = performance.getEntriesByType('navigation')[0];
      if (navigation) {
        return {
          dns: navigation.domainLookupEnd - navigation.domainLookupStart,
          tcp: navigation.connectEnd - navigation.connectStart,
          request: navigation.responseStart - navigation.requestStart,
          response: navigation.responseEnd - navigation.responseStart,
          domParsing: navigation.domInteractive - navigation.responseEnd,
          domReady: navigation.domContentLoadedEventEnd - navigation.navigationStart,
          loadComplete: navigation.loadEventEnd - navigation.navigationStart
        };
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
        used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
        total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
        limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
      };
    }
    return null;
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
