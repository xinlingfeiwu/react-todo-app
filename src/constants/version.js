// 应用版本信息常量 (自动生成，请勿手动修改)
// 生成时间: 2025-07-26T12:11:01.3NZ

export const APP_VERSION = '1.3.14';
export const BUILD_TIME = '2025-07-26T12:11:01.3NZ';
export const BUILD_HASH = 'a4fed673622b';
export const BUILD_TIMESTAMP = 1753531861;

export const GIT_INFO = {
  hash: '1b61284',
  branch: 'main',
  tag: ''
};

export const VERSION_INFO = {
  name: 'react-todo-app',
  version: '1.3.14',
  buildTime: '2025-07-26T12:11:01.3NZ',
  buildHash: 'a4fed673622b',
  buildTimestamp: 1753531861,
  git: GIT_INFO
};

// 设置全局变量供应用使用
if (typeof window !== 'undefined') {
  window.__APP_VERSION__ = '1.3.14';
  window.__BUILD_HASH__ = 'a4fed673622b';
  window.__BUILD_TIME__ = '2025-07-26T12:11:01.3NZ';
}
