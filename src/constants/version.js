// 应用版本信息常量 (自动生成，请勿手动修改)
// 生成时间: 2025-07-25T06:04:47.3NZ

export const APP_VERSION = '1.3.3';
export const BUILD_TIME = '2025-07-25T06:04:47.3NZ';
export const BUILD_HASH = '7d6b11967510';
export const BUILD_TIMESTAMP = 1753423487;

export const GIT_INFO = {
  hash: 'd0b3d0e',
  branch: 'main',
  tag: ''
};

export const VERSION_INFO = {
  name: 'react-todo-app',
  version: '1.3.3',
  buildTime: '2025-07-25T06:04:47.3NZ',
  buildHash: '7d6b11967510',
  buildTimestamp: 1753423487,
  git: GIT_INFO
};

// 设置全局变量供应用使用
if (typeof window !== 'undefined') {
  window.__APP_VERSION__ = '1.3.3';
  window.__BUILD_HASH__ = '7d6b11967510';
  window.__BUILD_TIME__ = '2025-07-25T06:04:47.3NZ';
}
