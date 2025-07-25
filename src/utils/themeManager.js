/**
 * @description 主题管理工具
 * @author AI Assistant
 * @date 2025-07-16
 */

import { useState, useEffect, useCallback } from 'react';
import { THEME_STORAGE_KEY, THEME_VALUES } from '../constants/storageKeys';

// 主题模式常量
export const THEME_MODES = {
  LIGHT: THEME_VALUES.LIGHT,
  DARK: THEME_VALUES.DARK,
  SYSTEM: 'system'
};

/**
 * 获取系统主题偏好
 * @returns {string} 'light' | 'dark'
 */
export function getSystemTheme() {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
}

/**
 * 获取当前主题设置
 * @returns {Object} { mode: string, actualTheme: string }
 */
export function getCurrentTheme() {
  const savedMode = localStorage.getItem(THEME_STORAGE_KEY) || THEME_MODES.SYSTEM;
  const actualTheme = savedMode === THEME_MODES.SYSTEM ? getSystemTheme() : savedMode;
  
  return {
    mode: savedMode,
    actualTheme
  };
}

/**
 * 设置主题模式
 * @param {string} mode - 主题模式 ('light' | 'dark' | 'system')
 */
export function setThemeMode(mode) {
  if (!Object.values(THEME_MODES).includes(mode)) {
    console.warn('无效的主题模式:', mode);
    return;
  }
  
  localStorage.setItem(THEME_STORAGE_KEY, mode);
  applyTheme(mode);
}

/**
 * 应用主题到页面
 * @param {string} mode - 主题模式
 */
export function applyTheme(mode) {
  const actualTheme = mode === THEME_MODES.SYSTEM ? getSystemTheme() : mode;

  // 设置 data-theme 属性
  document.documentElement.setAttribute('data-theme', actualTheme);

  // 同时保持类名兼容性
  document.documentElement.classList.remove('theme-light', 'theme-dark');
  document.documentElement.classList.add(`theme-${actualTheme}`);

  // 设置 CSS 变量
  updateThemeVariables(actualTheme);
}

/**
 * 更新主题相关的 CSS 变量
 * @param {string} theme - 'light' | 'dark'
 */
function updateThemeVariables(theme) {
  const root = document.documentElement;
  
  if (theme === 'dark') {
    // 深色主题变量 - 主流黑色背景
    root.style.setProperty('--bg-primary', '#000000');
    root.style.setProperty('--bg-secondary', '#111111');
    root.style.setProperty('--bg-tertiary', '#1a1a1a');
    root.style.setProperty('--text-primary', '#ffffff');
    root.style.setProperty('--text-secondary', '#e5e5e5');
    root.style.setProperty('--text-muted', '#a1a1a1');
    root.style.setProperty('--border-color', '#333333');
    root.style.setProperty('--shadow-color', 'rgba(0, 0, 0, 0.5)');
    root.style.setProperty('--glass-bg', 'rgba(17, 17, 17, 0.9)');
    root.style.setProperty('--glass-border', 'rgba(255, 255, 255, 0.1)');
  } else {
    // 浅色主题变量
    root.style.setProperty('--bg-primary', '#ffffff');
    root.style.setProperty('--bg-secondary', '#f8f9fa');
    root.style.setProperty('--bg-tertiary', '#e9ecef');
    root.style.setProperty('--text-primary', '#2d3748');
    root.style.setProperty('--text-secondary', '#4a5568');
    root.style.setProperty('--text-muted', '#718096');
    root.style.setProperty('--border-color', '#e2e8f0');
    root.style.setProperty('--shadow-color', 'rgba(0, 0, 0, 0.1)');
    root.style.setProperty('--glass-bg', 'rgba(255, 255, 255, 0.8)');
    root.style.setProperty('--glass-border', 'rgba(255, 255, 255, 0.3)');
  }
}

/**
 * 初始化主题系统
 */
export function initTheme() {
  const { mode } = getCurrentTheme();
  applyTheme(mode);
  
  // 监听系统主题变化
  if (typeof window !== 'undefined' && window.matchMedia) {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      const currentMode = localStorage.getItem(THEME_STORAGE_KEY) || THEME_MODES.SYSTEM;
      if (currentMode === THEME_MODES.SYSTEM) {
        applyTheme(THEME_MODES.SYSTEM);
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    
    // 返回清理函数
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }
}

/**
 * 切换主题（仅在 light 和 dark 之间切换，不包括 system）
 * @returns {string} 切换后的主题
 */
export function toggleTheme() {
  const { actualTheme } = getCurrentTheme();
  const newTheme = actualTheme === 'light' ? 'dark' : 'light';
  setThemeMode(newTheme);
  return newTheme;
}

/**
 * 获取主题显示名称
 * @param {string} mode - 主题模式
 * @returns {string} 显示名称
 */
export function getThemeDisplayName(mode) {
  const names = {
    [THEME_MODES.LIGHT]: '浅色',
    [THEME_MODES.DARK]: '深色',
    [THEME_MODES.SYSTEM]: '跟随系统'
  };
  return names[mode] || mode;
}

/**
 * React Hook：使用主题
 * @returns {Object} { mode, actualTheme, setThemeMode, toggleTheme }
 */
export function useTheme() {
  const [themeState, setThemeState] = useState(getCurrentTheme);
  
  useEffect(() => {
    const cleanup = initTheme();
    
    // 定期检查主题状态变化
    const interval = setInterval(() => {
      const newState = getCurrentTheme();
      setThemeState(prevState => {
        if (prevState.mode !== newState.mode || prevState.actualTheme !== newState.actualTheme) {
          return newState;
        }
        return prevState;
      });
    }, 1000);
    
    return () => {
      if (cleanup) cleanup();
      clearInterval(interval);
    };
  }, []);
  
  const handleSetThemeMode = useCallback((mode) => {
    setThemeMode(mode);
    setThemeState(getCurrentTheme());
  }, []);
  
  const handleToggleTheme = useCallback(() => {
    const newTheme = toggleTheme();
    setThemeState(getCurrentTheme());
    return newTheme;
  }, []);
  
  return {
    mode: themeState.mode,
    actualTheme: themeState.actualTheme,
    setThemeMode: handleSetThemeMode,
    toggleTheme: handleToggleTheme
  };
}
