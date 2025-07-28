// 应用版本信息常量 (自动生成，请勿手动修改)
// 生成时间: 2025-07-28T10:06:31.3NZ

export const APP_VERSION = '1.3.19';
export const BUILD_TIME = '2025-07-28T10:06:31.3NZ';
export const BUILD_HASH = 'cf5e789b9a6d';
export const BUILD_TIMESTAMP = 1753697191;

export const GIT_INFO = {
  hash: '8be432e',
  branch: 'main',
  tag: ''
};

export const VERSION_INFO = {
  name: 'react-todo-app',
  version: '1.3.19',
  buildTime: '2025-07-28T10:06:31.3NZ',
  buildHash: 'cf5e789b9a6d',
  buildTimestamp: 1753697191,
  git: GIT_INFO
};

// 设置全局变量供应用使用
if (typeof window !== 'undefined') {
  window.__APP_VERSION__ = '1.3.19';
  window.__BUILD_HASH__ = 'cf5e789b9a6d';
  window.__BUILD_TIME__ = '2025-07-28T10:06:31.3NZ';
}
