// 应用版本信息常量 (自动生成，请勿手动修改)
// 生成时间: 2025-07-26T02:33:18.3NZ

export const APP_VERSION = '1.3.6';
export const BUILD_TIME = '2025-07-26T02:33:18.3NZ';
export const BUILD_HASH = '62d41817a033';
export const BUILD_TIMESTAMP = 1753497198;

export const GIT_INFO = {
  hash: 'eeebb69',
  branch: 'main',
  tag: ''
};

export const VERSION_INFO = {
  name: 'react-todo-app',
  version: '1.3.6',
  buildTime: '2025-07-26T02:33:18.3NZ',
  buildHash: '62d41817a033',
  buildTimestamp: 1753497198,
  git: GIT_INFO
};

// 设置全局变量供应用使用
if (typeof window !== 'undefined') {
  window.__APP_VERSION__ = '1.3.6';
  window.__BUILD_HASH__ = '62d41817a033';
  window.__BUILD_TIME__ = '2025-07-26T02:33:18.3NZ';
}
