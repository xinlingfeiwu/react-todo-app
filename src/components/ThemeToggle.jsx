import React from 'react';
import { useTheme } from '../utils/themeManager';

/**
 * @description 主题切换按钮组件
 * @returns {JSX.Element}
 */
function ThemeToggle() {
  const { actualTheme, toggleTheme } = useTheme();

  return (
    <button
      className="theme-toggle"
      onClick={toggleTheme}
      title={`切换到${actualTheme === 'light' ? '深色' : '浅色'}主题`}
    >
      <span className="theme-toggle-icon">
        {actualTheme === 'light' ? '🌙' : '☀️'}
      </span>
    </button>
  );
}

export default ThemeToggle;
