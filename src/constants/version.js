// 应用版本信息常量 (自动生成，请勿手动修改)
// 生成时间: 2025-07-23T05:29:37.3NZ

export const APP_VERSION = '1.17.0';
export const BUILD_TIME = '2025-07-23T05:29:37.3NZ';
export const BUILD_HASH = 'c878e7bd9574';
export const BUILD_TIMESTAMP = 1753248577;

export const GIT_INFO = {
  hash: 'b8bccd5',
  branch: 'main',
  tag: 'v1.16.0'
};

export const VERSION_INFO = {
  name: 'react-todo-app',
  version: '1.17.0',
  buildTime: '2025-07-23T05:29:37.3NZ',
  buildHash: 'c878e7bd9574',
  buildTimestamp: 1753248577,
  git: GIT_INFO
};

// 设置全局变量供应用使用
if (typeof window !== 'undefined') {
  window.__APP_VERSION__ = '1.17.0';
  window.__BUILD_HASH__ = 'c878e7bd9574';
  window.__BUILD_TIME__ = '2025-07-23T05:29:37.3NZ';
}
