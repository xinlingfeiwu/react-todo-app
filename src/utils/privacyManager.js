/**
 * Cookie 和隐私管理工具
 * 提供用户隐私偏好管理功能
 */

import { STORAGE_KEYS, COOKIE_CONSENT_VALUES } from '../constants/storageKeys';

/**
 * 获取 Cookie 同意状态
 * @returns {string|null} 'accepted', 'declined', 或 null
 */
export function getCookieConsent() {
  try {
    return localStorage.getItem(STORAGE_KEYS.COOKIE_CONSENT);
  } catch (error) {
    console.warn('无法读取 Cookie 同意状态:', error);
    return null;
  }
}

/**
 * 设置 Cookie 同意状态
 * @param {string} status - 'accepted' 或 'declined'
 */
export function setCookieConsent(status) {
  try {
    localStorage.setItem(STORAGE_KEYS.COOKIE_CONSENT, status);
    localStorage.setItem(STORAGE_KEYS.COOKIE_CONSENT_DATE, new Date().toISOString());
    localStorage.setItem(STORAGE_KEYS.COOKIE_CONSENT_VERSION, '1.0');
  } catch (error) {
    console.warn('无法保存 Cookie 同意状态:', error);
  }
}

/**
 * 检查是否可以使用本地存储
 * @returns {boolean}
 */
export function canUseLocalStorage() {
  const consent = getCookieConsent();
  return consent === COOKIE_CONSENT_VALUES.ACCEPTED || consent === null; // 默认允许，用户可以拒绝
}

/**
 * 安全地保存数据到本地存储
 * @param {string} key - 存储键
 * @param {any} value - 存储值
 * @returns {boolean} 是否保存成功
 */
export function safeSetLocalStorage(key, value) {
  if (!canUseLocalStorage()) {
    console.log('用户已拒绝使用本地存储');
    return false;
  }
  
  try {
    const serializedValue = typeof value === 'string' ? value : JSON.stringify(value);
    localStorage.setItem(key, serializedValue);
    return true;
  } catch (error) {
    console.warn('保存到本地存储失败:', error);
    return false;
  }
}

/**
 * 安全地从本地存储读取数据
 * @param {string} key - 存储键
 * @param {any} defaultValue - 默认值
 * @returns {any} 读取的值或默认值
 */
export function safeGetLocalStorage(key, defaultValue = null) {
  if (!canUseLocalStorage()) {
    return defaultValue;
  }
  
  try {
    const value = localStorage.getItem(key);
    if (value === null) return defaultValue;
    
    // 尝试解析 JSON
    try {
      return JSON.parse(value);
    } catch (parseError) {
      // 如果提供了非 null 的默认值，说明期望的是 JSON 数据
      // 解析失败时返回默认值
      if (defaultValue !== null) {
        console.warn('JSON 解析失败，返回默认值:', parseError);
        return defaultValue;
      }
      // 如果没有提供默认值，可能存储的就是字符串，直接返回
      return value;
    }
  } catch (error) {
    console.warn('从本地存储读取失败:', error);
    return defaultValue;
  }
}

/**
 * 清除所有应用数据（保留隐私设置）
 * @returns {boolean} 是否清除成功
 */
export function clearAppData() {
  const keysToKeep = [
    STORAGE_KEYS.COOKIE_CONSENT,
    STORAGE_KEYS.COOKIE_CONSENT_DATE,
    STORAGE_KEYS.COOKIE_CONSENT_VERSION
  ];
  
  try {
    const allKeys = Object.keys(localStorage);
    const keysToRemove = allKeys.filter(key => !keysToKeep.includes(key));
    
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
    });
    
    console.log(`应用数据已清除，共删除 ${keysToRemove.length} 项数据:`, keysToRemove);
    return true;
  } catch (error) {
    console.error('清除应用数据失败:', error);
    return false;
  }
}

/**
 * 获取隐私设置摘要
 * @returns {Object} 隐私设置信息
 */
export function getPrivacySummary() {
  const consent = getCookieConsent();
  const consentDate = localStorage.getItem(STORAGE_KEYS.COOKIE_CONSENT_DATE);
  
  return {
    hasConsented: consent !== null,
    consentStatus: consent,
    consentDate: consentDate ? new Date(consentDate) : null,
    canUseLocalStorage: canUseLocalStorage(),
    dataKeysCount: getStoredDataKeysCount()
  };
}

/**
 * 获取存储的数据项数量
 * @returns {number}
 */
function getStoredDataKeysCount() {
  try {
    const allKeys = Object.keys(localStorage);
    const privacyKeys = [
      STORAGE_KEYS.COOKIE_CONSENT, 
      STORAGE_KEYS.COOKIE_CONSENT_DATE, 
      STORAGE_KEYS.COOKIE_CONSENT_VERSION
    ];
    return allKeys.filter(key => !privacyKeys.includes(key)).length;
  } catch {
    return 0;
  }
}

/**
 * 导出所有用户数据（隐私合规）
 * @returns {Object} 用户数据导出
 */
export function exportUserData() {
  const summary = getPrivacySummary();
  const userData = {};
  
  try {
    const allKeys = Object.keys(localStorage);
    const privacyKeys = [
      STORAGE_KEYS.COOKIE_CONSENT,
      STORAGE_KEYS.COOKIE_CONSENT_DATE,
      STORAGE_KEYS.COOKIE_CONSENT_VERSION
    ];
    
    allKeys.forEach(key => {
      if (!privacyKeys.includes(key)) {
        userData[key] = safeGetLocalStorage(key);
      }
    });
  } catch (error) {
    console.warn('导出用户数据失败:', error);
  }
  
  return {
    exportDate: new Date().toISOString(),
    privacyInfo: summary,
    userData: userData
  };
}

/**
 * 重置隐私设置（用于测试或用户请求）
 */
export function resetPrivacySettings() {
  try {
    localStorage.removeItem(STORAGE_KEYS.COOKIE_CONSENT);
    localStorage.removeItem(STORAGE_KEYS.COOKIE_CONSENT_DATE);
    localStorage.removeItem(STORAGE_KEYS.COOKIE_CONSENT_VERSION);
    console.log('隐私设置已重置');
  } catch (error) {
    console.warn('重置隐私设置失败:', error);
  }
}
