/**
 * @description 开发环境错误监控和调试工具
 * 帮助快速识别和修复常见问题
 */

class DevErrorMonitor {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.isEnabled = import.meta.env.DEV;
    this.maxErrors = 50;
    
    if (this.isEnabled) {
      this.init();
    }
  }

  init() {
    // 监听全局错误
    window.addEventListener('error', (event) => {
      this.logError('JavaScript Error', {
        message: event.message,
        filename: event.filename,
        line: event.lineno,
        column: event.colno,
        stack: event.error?.stack
      });
    });

    // 监听Promise错误
    window.addEventListener('unhandledrejection', (event) => {
      this.logError('Unhandled Promise Rejection', {
        reason: event.reason,
        stack: event.reason?.stack
      });
    });

    // 拦截控制台错误和警告
    this.interceptConsole();

    // 监听网络错误
    this.monitorNetworkErrors();

    console.log('🔍 开发环境错误监控已启动');
  }

  interceptConsole() {
    const originalError = console.error;
    const originalWarn = console.warn;

    console.error = (...args) => {
      this.logError('Console Error', args);
      originalError.apply(console, args);
    };

    console.warn = (...args) => {
      this.logWarning('Console Warning', args);
      originalWarn.apply(console, args);
    };
  }

  monitorNetworkErrors() {
    // 监听fetch错误
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args);
        if (!response.ok) {
          this.logWarning('Network Error', {
            url: args[0],
            status: response.status,
            statusText: response.statusText
          });
        }
        return response;
      } catch (error) {
        this.logError('Fetch Error', {
          url: args[0],
          error: error.message
        });
        throw error;
      }
    };
  }

  logError(type, details) {
    const error = {
      type,
      details,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent
    };

    this.errors.push(error);
    
    // 保持数组大小
    if (this.errors.length > this.maxErrors) {
      this.errors.shift();
    }

    // 特殊处理一些常见错误
    this.handleSpecialErrors(error);
  }

  logWarning(type, details) {
    const warning = {
      type,
      details,
      timestamp: new Date().toISOString()
    };

    this.warnings.push(warning);
    
    if (this.warnings.length > this.maxErrors) {
      this.warnings.shift();
    }
  }

  handleSpecialErrors(error) {
    const message = error.details?.message || JSON.stringify(error.details);

    // WebSocket连接失败
    if (message.includes('WebSocket connection') && message.includes('failed')) {
      console.group('🔧 WebSocket连接问题修复建议:');
      console.log('1. 检查Vite开发服务器是否正常运行');
      console.log('2. 确认端口配置是否正确');
      console.log('3. 尝试重启开发服务器: npm run dev');
      console.log('4. 检查防火墙是否阻止了WebSocket连接');
      console.groupEnd();
    }

    // Service Worker缓存错误
    if (message.includes('chrome-extension') || message.includes('Cache')) {
      console.group('🔧 Service Worker缓存问题修复建议:');
      console.log('1. 开发环境已自动禁用Service Worker');
      console.log('2. 如需测试PWA功能，请使用生产构建: npm run build && npm run preview');
      console.log('3. 清除浏览器缓存和Service Worker');
      console.groupEnd();
    }

    // React相关错误
    if (message.includes('React') || message.includes('hook')) {
      console.group('🔧 React错误修复建议:');
      console.log('1. 检查组件生命周期和Hook使用');
      console.log('2. 确认依赖数组是否正确');
      console.log('3. 检查组件卸载时的清理逻辑');
      console.groupEnd();
    }
  }

  getErrorSummary() {
    const summary = {
      totalErrors: this.errors.length,
      totalWarnings: this.warnings.length,
      recentErrors: this.errors.slice(-5),
      recentWarnings: this.warnings.slice(-5),
      errorTypes: this.getErrorTypes(),
      suggestions: this.getSuggestions()
    };

    return summary;
  }

  getErrorTypes() {
    const types = {};
    this.errors.forEach(error => {
      types[error.type] = (types[error.type] || 0) + 1;
    });
    return types;
  }

  getSuggestions() {
    const suggestions = [];
    const errorTypes = this.getErrorTypes();

    if (errorTypes['Network Error']) {
      suggestions.push('检查网络连接和API端点配置');
    }

    if (errorTypes['JavaScript Error']) {
      suggestions.push('检查语法错误和类型错误');
    }

    if (errorTypes['Unhandled Promise Rejection']) {
      suggestions.push('添加适当的错误处理和try-catch语句');
    }

    return suggestions;
  }

  // 导出错误报告
  exportReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: this.getErrorSummary(),
      errors: this.errors,
      warnings: this.warnings,
      environment: {
        userAgent: navigator.userAgent,
        url: window.location.href,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        }
      }
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { 
      type: 'application/json' 
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `error-report-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    console.log('📄 错误报告已导出');
  }

  // 清除所有记录
  clear() {
    this.errors = [];
    this.warnings = [];
    console.log('🧹 错误记录已清除');
  }

  // 显示当前状态
  status() {
    console.group('📊 错误监控状态:');
    console.log(`错误数量: ${this.errors.length}`);
    console.log(`警告数量: ${this.warnings.length}`);
    console.log('错误类型分布:', this.getErrorTypes());
    console.log('修复建议:', this.getSuggestions());
    console.groupEnd();
  }
}

// 创建全局实例
let devErrorMonitor;

if (import.meta.env.DEV) {
  devErrorMonitor = new DevErrorMonitor();
  
  // 暴露到全局作用域，方便在控制台中使用
  window.devErrorMonitor = devErrorMonitor;
  
  // React错误记录
  devErrorMonitor.logReactError = function(error, errorInfo) {
    if (!this.isEnabled) return;

    this.logError('React Component Error', {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack
    });
  };

  // 性能检查
  devErrorMonitor.checkRenderPerformance = function(componentName, renderTime) {
    if (!this.isEnabled) return;

    if (renderTime > 50) { // 50ms阈值
      this.logWarning('Slow Render', {
        component: componentName,
        renderTime: `${renderTime}ms`
      });
    }
  };

  // 内存使用检查
  devErrorMonitor.checkMemoryUsage = function(memoryInfo) {
    if (!this.isEnabled) return;

    if (memoryInfo.usedJSHeapSize > memoryInfo.jsHeapSizeLimit * 0.9) {
      this.logWarning('High Memory Usage', {
        used: memoryInfo.usedJSHeapSize,
        limit: memoryInfo.jsHeapSizeLimit,
        percentage: Math.round((memoryInfo.usedJSHeapSize / memoryInfo.jsHeapSizeLimit) * 100)
      });
    }
  };

  // 生成错误报告
  devErrorMonitor.generateReport = function() {
    return {
      errors: this.errors,
      warnings: this.warnings,
      timestamp: new Date().toISOString(),
      summary: {
        totalErrors: this.errors.length,
        totalWarnings: this.warnings.length,
        recentErrors: this.errors.filter(e =>
          new Date(e.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000)
        ).length
      }
    };
  };

  // 导出错误数据
  devErrorMonitor.exportErrors = function() {
    return {
      errors: this.errors,
      warnings: this.warnings,
      exportTime: new Date().toISOString(),
      version: '1.0'
    };
  };

  // 清理错误
  devErrorMonitor.clearErrors = function() {
    this.errors = [];
    this.warnings = [];
  };

  // 清理旧错误
  devErrorMonitor.cleanupOldErrors = function() {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    this.errors = this.errors.filter(error =>
      new Date(error.timestamp) > oneDayAgo
    );
    this.warnings = this.warnings.filter(warning =>
      new Date(warning.timestamp) > oneDayAgo
    );
  };

  // 错误分析
  devErrorMonitor.analyzeErrors = function() {
    const errorTypes = {};
    this.errors.forEach(error => {
      errorTypes[error.type] = (errorTypes[error.type] || 0) + 1;
    });

    return {
      mostCommonErrors: Object.entries(errorTypes)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5),
      totalErrors: this.errors.length,
      errorTypes: Object.keys(errorTypes)
    };
  };

  // 错误趋势
  devErrorMonitor.getErrorTrends = function() {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    const recentErrors = this.errors.filter(error =>
      new Date(error.timestamp) > oneHourAgo
    );

    return {
      recentErrors: recentErrors.length,
      hourlyRate: recentErrors.length,
      trend: recentErrors.length > 5 ? 'increasing' : 'stable'
    };
  };

  // 添加快捷命令
  window.errorStatus = () => devErrorMonitor.status();
  window.errorExport = () => devErrorMonitor.exportReport();
  window.errorClear = () => devErrorMonitor.clear();

  console.log('🛠️ 开发工具已加载，可用命令:');
  console.log('- errorStatus(): 查看错误状态');
  console.log('- errorExport(): 导出错误报告');
  console.log('- errorClear(): 清除错误记录');
}

export { devErrorMonitor };
export default devErrorMonitor;
