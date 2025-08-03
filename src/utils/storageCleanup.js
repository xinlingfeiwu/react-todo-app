/**
 * localStorage清理工具
 * 用于清理旧版本的存储数据和不再使用的key
 */

/**
 * 清理旧版本的应用更新相关数据
 */
export function cleanupOldUpdateKeys() {
  try {
    // 检查 localStorage 是否可用
    if (typeof localStorage === 'undefined' || !localStorage) {
      console.warn('localStorage 不可用，跳过清理操作');
      return 0;
    }

    const oldKeys = [
      'app_update_available',
      'app_update_applied', 
      'app_etag',
      'app_last_modified'
    ];

    let cleanedCount = 0;
    
    oldKeys.forEach(key => {
      try {
        if (localStorage.getItem(key) !== null) {
          localStorage.removeItem(key);
          cleanedCount++;
          console.log(`🧹 已清理旧的存储key: ${key}`);
        }
      } catch (error) {
        console.warn(`清理key "${key}" 时出错:`, error);
      }
    });

    if (cleanedCount > 0) {
      console.log(`✅ 清理完成，共清理了 ${cleanedCount} 个旧的存储项`);
    } else {
      console.log('✅ 没有发现需要清理的旧存储项');
    }

    return cleanedCount;
  } catch (error) {
    console.warn('清理旧版本数据失败:', error);
    return 0;
  }
}

/**
 * 获取所有应用相关的localStorage项
 */
export function getAppStorageItems() {
  try {
    // 检查 localStorage 是否可用
    if (typeof localStorage === 'undefined' || !localStorage) {
      console.warn('localStorage 不可用，返回空对象');
      return {};
    }

    const appKeys = [
      'ylingtech-todo-app',
      'react-todo-app',
      'todo-app-theme',
      'app_current_version',
      'app_update_dismissed',
      'app_update_snoozed',
      'cookie_consent',
      'cookie_consent_date',
      'cookie_consent_version',
      'donation_records'
    ];

    const items = {};
    
    appKeys.forEach(key => {
      try {
        const value = localStorage.getItem(key);
        if (value !== null) {
          items[key] = value;
        }
      } catch (error) {
        console.warn(`获取存储项 "${key}" 时出错:`, error);
      }
    });

    return items;
  } catch (error) {
    console.warn('获取应用存储项失败:', error);
    return {};
  }
}

/**
 * 显示存储使用情况
 */
export function showStorageUsage() {
  const items = getAppStorageItems();
  const totalKeys = Object.keys(items).length;
  
  console.group('📊 应用存储使用情况');
  console.log(`总存储项数: ${totalKeys}`);
  
  Object.entries(items).forEach(([key, value]) => {
    const size = new Blob([value]).size;
    console.log(`${key}: ${size} bytes`);
  });
  
  console.groupEnd();
  
  return {
    totalKeys,
    items
  };
}

/**
 * 自动清理函数 - 在应用启动时调用
 */
export function autoCleanup() {
  console.log('🔄 开始自动清理旧的存储数据...');
  
  // 清理旧的更新相关key
  try {
    const cleanedCount = cleanupOldUpdateKeys();

    // 显示当前存储使用情况
    if (import.meta.env.DEV) {
      showStorageUsage();
    }

    return cleanedCount;
  } catch (error) {
    console.warn('自动清理过程中出现错误:', error);
    return 0;
  }
}

/**
 * 清理过期数据
 */
export function cleanupExpiredData() {
  try {
    // 检查 localStorage 是否可用
    if (typeof localStorage === 'undefined' || !localStorage) {
      console.warn('localStorage 不可用，跳过清理过期数据操作');
      return 0;
    }

    let cleanedCount = 0;
    const now = Date.now();
    const expiredKeys = [];

    for (let i = 0; i < localStorage.length; i++) {
      try {
        const key = localStorage.key(i);
        if (key && key.startsWith('react-todo-app')) {
          try {
            const value = localStorage.getItem(key);
            if (value) {
              const data = JSON.parse(value);

              // 检查是否有过期时间字段
              if (data && data.expireAt && data.expireAt < now) {
                expiredKeys.push(key);
              }
            }
          } catch (jsonError) {
            // 忽略JSON解析错误
            console.warn(`解析存储项 "${key}" 的JSON数据时出错:`, jsonError);
          }
        }
      } catch (error) {
        console.warn(`检查存储项 ${i} 时出错:`, error);
      }
    }

    // 删除过期的键
    expiredKeys.forEach(key => {
      try {
        localStorage.removeItem(key);
        cleanedCount++;
        console.log(`🧹 已清理过期数据: ${key}`);
      } catch (error) {
        console.warn(`删除过期存储项 "${key}" 时出错:`, error);
      }
    });

    return cleanedCount;
  } catch (error) {
    console.warn('清理过期数据失败:', error);
    return 0;
  }
}

/**
 * 获取存储使用情况
 */
export function getStorageUsage() {
  try {
    // 检查 localStorage 是否可用
    if (typeof localStorage === 'undefined' || !localStorage) {
      console.warn('localStorage 不可用，返回空统计');
      return {
        totalItems: 0,
        totalSize: 0,
        items: {}
      };
    }

    const items = getAppStorageItems();
    const totalItems = Object.keys(items).length;
    let totalSize = 0;

    Object.values(items).forEach(value => {
      try {
        totalSize += new Blob([value]).size;
      } catch (error) {
        console.warn('计算存储项大小时出错:', error);
      }
    });

    return {
      totalItems,
      totalSize,
      items
    };
  } catch (error) {
    console.warn('获取存储使用情况失败:', error);
    return {
      totalItems: 0,
      totalSize: 0,
      items: {}
    };
  }
}
