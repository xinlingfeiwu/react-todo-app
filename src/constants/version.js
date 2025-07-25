// 应用版本信息常量 (自动生成，请勿手动修改)
// 生成时间: 2025-07-25T02:53:41.3NZ

export const APP_VERSION = '1.3.0';
export const BUILD_TIME = '2025-07-25T02:53:41.3NZ';
export const BUILD_HASH = 'b56afa7cdb8b';
export const BUILD_TIMESTAMP = 1753412021;

export const GIT_INFO = {
  hash: '5431e5b',
  branch: 'main',
  tag: ''
};

export const VERSION_INFO = {
  name: 'react-todo-app',
  version: '1.3.0',
  buildTime: '2025-07-25T02:53:41.3NZ',
  buildHash: 'b56afa7cdb8b',
  buildTimestamp: 1753412021,
  git: GIT_INFO
};

// 设置全局变量供应用使用
if (typeof window !== 'undefined') {
  window.__APP_VERSION__ = '1.3.0';
  window.__BUILD_HASH__ = 'b56afa7cdb8b';
  window.__BUILD_TIME__ = '2025-07-25T02:53:41.3NZ';
}
