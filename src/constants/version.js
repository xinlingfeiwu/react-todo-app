// 应用版本信息常量 (自动生成，请勿手动修改)
// 生成时间: 2025-08-05T09:38:48.3NZ

export const APP_VERSION = '1.4.5';
export const BUILD_TIME = '2025-08-05T09:38:48.3NZ';
export const BUILD_HASH = '0a9c5ec1afc9';
export const BUILD_TIMESTAMP = 1754386728;

export const GIT_INFO = {
  hash: '27b767d',
  branch: 'main',
  tag: ''
};

export const VERSION_INFO = {
  name: 'react-todo-app',
  version: '1.4.5',
  buildTime: '2025-08-05T09:38:48.3NZ',
  buildHash: '0a9c5ec1afc9',
  buildTimestamp: 1754386728,
  git: GIT_INFO
};

// 设置全局变量供应用使用
if (typeof window !== 'undefined') {
  window.__APP_VERSION__ = '1.4.5';
  window.__BUILD_HASH__ = '0a9c5ec1afc9';
  window.__BUILD_TIME__ = '2025-08-05T09:38:48.3NZ';
}
