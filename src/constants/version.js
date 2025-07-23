// 应用版本信息常量 (自动生成，请勿手动修改)
// 生成时间: 2025-07-23T04:42:23.3NZ

export const APP_VERSION = '1.7.0';
export const BUILD_TIME = '2025-07-23T04:42:23.3NZ';
export const BUILD_HASH = '2446b33250a2';
export const BUILD_TIMESTAMP = 1753245743;

export const GIT_INFO = {
  hash: '7f7529b',
  branch: 'main',
  tag: ''
};

export const VERSION_INFO = {
  name: 'react-todo-app',
  version: '1.7.0',
  buildTime: '2025-07-23T04:42:23.3NZ',
  buildHash: '2446b33250a2',
  buildTimestamp: 1753245743,
  git: GIT_INFO
};

// 设置全局变量供应用使用
if (typeof window !== 'undefined') {
  window.__APP_VERSION__ = '1.7.0';
  window.__BUILD_HASH__ = '2446b33250a2';
  window.__BUILD_TIME__ = '2025-07-23T04:42:23.3NZ';
}
