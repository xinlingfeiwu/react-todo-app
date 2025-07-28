// 应用版本信息常量 (自动生成，请勿手动修改)
// 生成时间: 2025-07-28T09:47:40.3NZ

export const APP_VERSION = '1.3.18';
export const BUILD_TIME = '2025-07-28T09:47:40.3NZ';
export const BUILD_HASH = 'dc182c7e8fc8';
export const BUILD_TIMESTAMP = 1753696060;

export const GIT_INFO = {
  hash: '02ad233',
  branch: 'main',
  tag: ''
};

export const VERSION_INFO = {
  name: 'react-todo-app',
  version: '1.3.18',
  buildTime: '2025-07-28T09:47:40.3NZ',
  buildHash: 'dc182c7e8fc8',
  buildTimestamp: 1753696060,
  git: GIT_INFO
};

// 设置全局变量供应用使用
if (typeof window !== 'undefined') {
  window.__APP_VERSION__ = '1.3.18';
  window.__BUILD_HASH__ = 'dc182c7e8fc8';
  window.__BUILD_TIME__ = '2025-07-28T09:47:40.3NZ';
}
