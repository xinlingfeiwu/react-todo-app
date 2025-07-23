// 应用版本信息常量 (自动生成，请勿手动修改)
// 生成时间: 2025-07-23T05:27:13.3NZ

export const APP_VERSION = '1.16.0';
export const BUILD_TIME = '2025-07-23T05:27:13.3NZ';
export const BUILD_HASH = '5ab8b54c8a07';
export const BUILD_TIMESTAMP = 1753248433;

export const GIT_INFO = {
  hash: '41a43ba',
  branch: 'main',
  tag: 'v1.15.0'
};

export const VERSION_INFO = {
  name: 'react-todo-app',
  version: '1.16.0',
  buildTime: '2025-07-23T05:27:13.3NZ',
  buildHash: '5ab8b54c8a07',
  buildTimestamp: 1753248433,
  git: GIT_INFO
};

// 设置全局变量供应用使用
if (typeof window !== 'undefined') {
  window.__APP_VERSION__ = '1.16.0';
  window.__BUILD_HASH__ = '5ab8b54c8a07';
  window.__BUILD_TIME__ = '2025-07-23T05:27:13.3NZ';
}
