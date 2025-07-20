// 应用版本信息常量 (自动生成，请勿手动修改)
// 生成时间: 2025-07-18T05:03:41.3NZ

export const APP_VERSION = '1.0.0';
export const BUILD_TIME = '2025-07-18T05:03:41.3NZ';
export const BUILD_HASH = '0c3f2a80e19a';
export const BUILD_TIMESTAMP = 1752815021;

export const GIT_INFO = {
  hash: '061a099',
  branch: 'main',
  tag: ''
};

export const VERSION_INFO = {
  name: 'react-todo-app',
  version: '1.0.0',
  buildTime: '2025-07-18T05:03:41.3NZ',
  buildHash: '0c3f2a80e19a',
  buildTimestamp: 1752815021,
  git: GIT_INFO
};

// 设置全局变量供应用使用
if (typeof window !== 'undefined') {
  window.__APP_VERSION__ = '1.0.0';
  window.__BUILD_HASH__ = '0c3f2a80e19a';
  window.__BUILD_TIME__ = '2025-07-18T05:03:41.3NZ';
}
