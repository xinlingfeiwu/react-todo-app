// 应用版本信息常量 (自动生成，请勿手动修改)
// 生成时间: 2025-07-26T12:29:55.3NZ

export const APP_VERSION = '1.3.16';
export const BUILD_TIME = '2025-07-26T12:29:55.3NZ';
export const BUILD_HASH = '6473bd5af5e3';
export const BUILD_TIMESTAMP = 1753532995;

export const GIT_INFO = {
  hash: '6f95eac',
  branch: 'main',
  tag: ''
};

export const VERSION_INFO = {
  name: 'react-todo-app',
  version: '1.3.16',
  buildTime: '2025-07-26T12:29:55.3NZ',
  buildHash: '6473bd5af5e3',
  buildTimestamp: 1753532995,
  git: GIT_INFO
};

// 设置全局变量供应用使用
if (typeof window !== 'undefined') {
  window.__APP_VERSION__ = '1.3.16';
  window.__BUILD_HASH__ = '6473bd5af5e3';
  window.__BUILD_TIME__ = '2025-07-26T12:29:55.3NZ';
}
