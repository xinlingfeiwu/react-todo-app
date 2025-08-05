// 应用版本信息常量 (自动生成，请勿手动修改)
// 生成时间: 2025-08-05T03:11:21.3NZ

export const APP_VERSION = '1.4.2';
export const BUILD_TIME = '2025-08-05T03:11:21.3NZ';
export const BUILD_HASH = '72a93347b179';
export const BUILD_TIMESTAMP = 1754363481;

export const GIT_INFO = {
  hash: '832873d',
  branch: 'main',
  tag: ''
};

export const VERSION_INFO = {
  name: 'react-todo-app',
  version: '1.4.2',
  buildTime: '2025-08-05T03:11:21.3NZ',
  buildHash: '72a93347b179',
  buildTimestamp: 1754363481,
  git: GIT_INFO
};

// 设置全局变量供应用使用
if (typeof window !== 'undefined') {
  window.__APP_VERSION__ = '1.4.2';
  window.__BUILD_HASH__ = '72a93347b179';
  window.__BUILD_TIME__ = '2025-08-05T03:11:21.3NZ';
}
