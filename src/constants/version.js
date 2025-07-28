// 应用版本信息常量 (自动生成，请勿手动修改)
// 生成时间: 2025-07-28T02:27:08.3NZ

export const APP_VERSION = '1.3.18';
export const BUILD_TIME = '2025-07-28T02:27:08.3NZ';
export const BUILD_HASH = 'c63feb6bf7d8';
export const BUILD_TIMESTAMP = 1753669628;

export const GIT_INFO = {
  hash: '8e73ee1',
  branch: 'main',
  tag: ''
};

export const VERSION_INFO = {
  name: 'react-todo-app',
  version: '1.3.18',
  buildTime: '2025-07-28T02:27:08.3NZ',
  buildHash: 'c63feb6bf7d8',
  buildTimestamp: 1753669628,
  git: GIT_INFO
};

// 设置全局变量供应用使用
if (typeof window !== 'undefined') {
  window.__APP_VERSION__ = '1.3.18';
  window.__BUILD_HASH__ = 'c63feb6bf7d8';
  window.__BUILD_TIME__ = '2025-07-28T02:27:08.3NZ';
}
