// 应用版本信息常量 (自动生成，请勿手动修改)
// 生成时间: 2025-07-26T03:25:10.3NZ

export const APP_VERSION = '1.3.8';
export const BUILD_TIME = '2025-07-26T03:25:10.3NZ';
export const BUILD_HASH = '3ad68bf3339a';
export const BUILD_TIMESTAMP = 1753500310;

export const GIT_INFO = {
  hash: 'ee9c77e',
  branch: 'main',
  tag: ''
};

export const VERSION_INFO = {
  name: 'react-todo-app',
  version: '1.3.8',
  buildTime: '2025-07-26T03:25:10.3NZ',
  buildHash: '3ad68bf3339a',
  buildTimestamp: 1753500310,
  git: GIT_INFO
};

// 设置全局变量供应用使用
if (typeof window !== 'undefined') {
  window.__APP_VERSION__ = '1.3.8';
  window.__BUILD_HASH__ = '3ad68bf3339a';
  window.__BUILD_TIME__ = '2025-07-26T03:25:10.3NZ';
}
