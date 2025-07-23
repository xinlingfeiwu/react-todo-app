// 应用版本信息常量 (自动生成，请勿手动修改)
// 生成时间: 2025-07-23T05:39:54.3NZ

export const APP_VERSION = '1.19.0';
export const BUILD_TIME = '2025-07-23T05:39:54.3NZ';
export const BUILD_HASH = '2a56f4f4ec9e';
export const BUILD_TIMESTAMP = 1753249194;

export const GIT_INFO = {
  hash: '419270c',
  branch: 'main',
  tag: 'v1.17.0'
};

export const VERSION_INFO = {
  name: 'react-todo-app',
  version: '1.19.0',
  buildTime: '2025-07-23T05:39:54.3NZ',
  buildHash: '2a56f4f4ec9e',
  buildTimestamp: 1753249194,
  git: GIT_INFO
};

// 设置全局变量供应用使用
if (typeof window !== 'undefined') {
  window.__APP_VERSION__ = '1.19.0';
  window.__BUILD_HASH__ = '2a56f4f4ec9e';
  window.__BUILD_TIME__ = '2025-07-23T05:39:54.3NZ';
}
