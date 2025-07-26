/**
 * 集中管理应用中所有的localStorage键名
 * 统一维护，避免硬编码字符串散布在各个文件中
 */

// 应用数据相关
export const STORAGE_KEYS = {
  // 待办事项数据
  TODOS: 'ylingtech-todo-app',
  
  // 旧版本key，用于数据迁移
  TODOS_OLD: 'react-todo-app',
  
  // 主题设置
  THEME: 'todo-app-theme',
  
  // Cookie同意相关
  COOKIE_CONSENT: 'cookie_consent',
  COOKIE_CONSENT_DATE: 'cookie_consent_date',
  COOKIE_CONSENT_VERSION: 'cookie_consent_version',
  
  // 捐赠记录
  DONATION_RECORDS: 'donation_records',
  
  // 应用更新相关（简化版本）
  APP_CURRENT_VERSION: 'app_current_version',
  APP_UPDATE_DISMISSED: 'app_update_dismissed',
  APP_UPDATE_SNOOZED: 'app_update_snoozed'
};

// 导出单独的常量以保持向后兼容
export const STORAGE_KEY = STORAGE_KEYS.TODOS;
export const OLD_STORAGE_KEY = STORAGE_KEYS.TODOS_OLD;
export const THEME_STORAGE_KEY = STORAGE_KEYS.THEME;
export const DONATION_RECORDS_KEY = STORAGE_KEYS.DONATION_RECORDS;

// 应用更新相关常量
export const APP_CURRENT_VERSION_KEY = STORAGE_KEYS.APP_CURRENT_VERSION;
export const APP_UPDATE_DISMISSED_KEY = STORAGE_KEYS.APP_UPDATE_DISMISSED;
export const APP_UPDATE_SNOOZED_KEY = STORAGE_KEYS.APP_UPDATE_SNOOZED;

// 主题相关常量
export const THEME_VALUES = {
  LIGHT: 'light',
  DARK: 'dark'
};

// Cookie同意状态常量
export const COOKIE_CONSENT_VALUES = {
  ACCEPTED: 'accepted',
  DECLINED: 'declined'
};

export default STORAGE_KEYS;
