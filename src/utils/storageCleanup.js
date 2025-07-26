/**
 * localStorage清理工具
 * 用于清理旧版本的存储数据和不再使用的key
 */

/**
 * 清理旧版本的应用更新相关数据
 */
export function cleanupOldUpdateKeys() {
  const oldKeys = [
    'app_update_available',
    'app_update_applied', 
    'app_etag',
    'app_last_modified'
  ];

  let cleanedCount = 0;
  
  oldKeys.forEach(key => {
    if (localStorage.getItem(key) !== null) {
      localStorage.removeItem(key);
      cleanedCount++;
      console.log(`🧹 已清理旧的存储key: ${key}`);
    }
  });

  if (cleanedCount > 0) {
    console.log(`✅ 清理完成，共清理了 ${cleanedCount} 个旧的存储项`);
  } else {
    console.log('✅ 没有发现需要清理的旧存储项');
  }

  return cleanedCount;
}

/**
 * 获取所有应用相关的localStorage项
 */
export function getAppStorageItems() {
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
    const value = localStorage.getItem(key);
    if (value !== null) {
      items[key] = value;
    }
  });

  return items;
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
  const cleanedCount = cleanupOldUpdateKeys();
  
  // 显示当前存储使用情况
  if (import.meta.env.DEV) {
    showStorageUsage();
  }
  
  return cleanedCount;
}
