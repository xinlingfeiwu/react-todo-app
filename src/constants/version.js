// 应用版本信息常量 (自动生成，请勿手动修改)
// 生成时间: 2025-07-25T09:04:55.3NZ

export const APP_VERSION = '1.3.5';
export const BUILD_TIME = '2025-07-25T09:04:55.3NZ';
export const BUILD_HASH = '07496b5d56d6';
export const BUILD_TIMESTAMP = 1753434295;

export const GIT_INFO = {
  hash: 'd60a986',
  branch: 'main',
  tag: 'v1.3.5'
};

export const VERSION_INFO = {
  name: 'react-todo-app',
  version: '1.3.5',
  buildTime: '2025-07-25T09:04:55.3NZ',
  buildHash: '07496b5d56d6',
  buildTimestamp: 1753434295,
  git: GIT_INFO
};

// 设置全局变量供应用使用
if (typeof window !== 'undefined') {
  window.__APP_VERSION__ = '1.3.5';
  window.__BUILD_HASH__ = '07496b5d56d6';
  window.__BUILD_TIME__ = '2025-07-25T09:04:55.3NZ';
}
