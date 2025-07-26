// 应用版本信息常量 (自动生成，请勿手动修改)
// 生成时间: 2025-07-26T02:24:29.3NZ

export const APP_VERSION = '1.3.5';
export const BUILD_TIME = '2025-07-26T02:24:29.3NZ';
export const BUILD_HASH = '8e4fe5552983';
export const BUILD_TIMESTAMP = 1753496669;

export const GIT_INFO = {
  hash: 'fb8ebed',
  branch: 'main',
  tag: ''
};

export const VERSION_INFO = {
  name: 'react-todo-app',
  version: '1.3.5',
  buildTime: '2025-07-26T02:24:29.3NZ',
  buildHash: '8e4fe5552983',
  buildTimestamp: 1753496669,
  git: GIT_INFO
};

// 设置全局变量供应用使用
if (typeof window !== 'undefined') {
  window.__APP_VERSION__ = '1.3.5';
  window.__BUILD_HASH__ = '8e4fe5552983';
  window.__BUILD_TIME__ = '2025-07-26T02:24:29.3NZ';
}
