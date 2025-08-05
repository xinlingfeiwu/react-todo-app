// 应用版本信息常量 (自动生成，请勿手动修改)
// 生成时间: 2025-08-05T03:07:36.3NZ

export const APP_VERSION = '1.4.1';
export const BUILD_TIME = '2025-08-05T03:07:36.3NZ';
export const BUILD_HASH = 'd3409785a962';
export const BUILD_TIMESTAMP = 1754363256;

export const GIT_INFO = {
  hash: '9ba14e2',
  branch: 'main',
  tag: 'v1.4.1'
};

export const VERSION_INFO = {
  name: 'react-todo-app',
  version: '1.4.1',
  buildTime: '2025-08-05T03:07:36.3NZ',
  buildHash: 'd3409785a962',
  buildTimestamp: 1754363256,
  git: GIT_INFO
};

// 设置全局变量供应用使用
if (typeof window !== 'undefined') {
  window.__APP_VERSION__ = '1.4.1';
  window.__BUILD_HASH__ = 'd3409785a962';
  window.__BUILD_TIME__ = '2025-08-05T03:07:36.3NZ';
}
