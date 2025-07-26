// 应用版本信息常量 (自动生成，请勿手动修改)
// 生成时间: 2025-07-26T03:50:05.3NZ

export const APP_VERSION = '1.3.9';
export const BUILD_TIME = '2025-07-26T03:50:05.3NZ';
export const BUILD_HASH = 'fc67c2303b1b';
export const BUILD_TIMESTAMP = 1753501805;

export const GIT_INFO = {
  hash: '8324623',
  branch: 'main',
  tag: ''
};

export const VERSION_INFO = {
  name: 'react-todo-app',
  version: '1.3.9',
  buildTime: '2025-07-26T03:50:05.3NZ',
  buildHash: 'fc67c2303b1b',
  buildTimestamp: 1753501805,
  git: GIT_INFO
};

// 设置全局变量供应用使用
if (typeof window !== 'undefined') {
  window.__APP_VERSION__ = '1.3.9';
  window.__BUILD_HASH__ = 'fc67c2303b1b';
  window.__BUILD_TIME__ = '2025-07-26T03:50:05.3NZ';
}
