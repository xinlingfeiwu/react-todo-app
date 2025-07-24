// 应用版本信息常量 (自动生成，请勿手动修改)
// 生成时间: 2025-07-24T04:54:26.3NZ

export const APP_VERSION = '1.2.0';
export const BUILD_TIME = '2025-07-24T04:54:26.3NZ';
export const BUILD_HASH = 'f018cb3e65d3';
export const BUILD_TIMESTAMP = 1753332866;

export const GIT_INFO = {
  hash: 'db5cd7b',
  branch: 'main',
  tag: ''
};

export const VERSION_INFO = {
  name: 'react-todo-app',
  version: '1.2.0',
  buildTime: '2025-07-24T04:54:26.3NZ',
  buildHash: 'f018cb3e65d3',
  buildTimestamp: 1753332866,
  git: GIT_INFO
};

// 设置全局变量供应用使用
if (typeof window !== 'undefined') {
  window.__APP_VERSION__ = '1.2.0';
  window.__BUILD_HASH__ = 'f018cb3e65d3';
  window.__BUILD_TIME__ = '2025-07-24T04:54:26.3NZ';
}
