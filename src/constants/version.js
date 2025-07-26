// 应用版本信息常量 (自动生成，请勿手动修改)
// 生成时间: 2025-07-26T04:03:55.3NZ

export const APP_VERSION = '1.3.10';
export const BUILD_TIME = '2025-07-26T04:03:55.3NZ';
export const BUILD_HASH = '8c634fdd62a3';
export const BUILD_TIMESTAMP = 1753502635;

export const GIT_INFO = {
  hash: 'ce531cd',
  branch: 'main',
  tag: ''
};

export const VERSION_INFO = {
  name: 'react-todo-app',
  version: '1.3.10',
  buildTime: '2025-07-26T04:03:55.3NZ',
  buildHash: '8c634fdd62a3',
  buildTimestamp: 1753502635,
  git: GIT_INFO
};

// 设置全局变量供应用使用
if (typeof window !== 'undefined') {
  window.__APP_VERSION__ = '1.3.10';
  window.__BUILD_HASH__ = '8c634fdd62a3';
  window.__BUILD_TIME__ = '2025-07-26T04:03:55.3NZ';
}
