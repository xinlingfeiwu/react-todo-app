// 应用版本信息常量 (自动生成，请勿手动修改)
// 生成时间: 2025-07-26T12:20:51.3NZ

export const APP_VERSION = '1.3.15';
export const BUILD_TIME = '2025-07-26T12:20:51.3NZ';
export const BUILD_HASH = '9ac2129e47d2';
export const BUILD_TIMESTAMP = 1753532451;

export const GIT_INFO = {
  hash: '488ca1e',
  branch: 'main',
  tag: ''
};

export const VERSION_INFO = {
  name: 'react-todo-app',
  version: '1.3.15',
  buildTime: '2025-07-26T12:20:51.3NZ',
  buildHash: '9ac2129e47d2',
  buildTimestamp: 1753532451,
  git: GIT_INFO
};

// 设置全局变量供应用使用
if (typeof window !== 'undefined') {
  window.__APP_VERSION__ = '1.3.15';
  window.__BUILD_HASH__ = '9ac2129e47d2';
  window.__BUILD_TIME__ = '2025-07-26T12:20:51.3NZ';
}
