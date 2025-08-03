// 应用版本信息常量 (自动生成，请勿手动修改)
// 生成时间: 2025-08-03T13:31:28.3NZ

export const APP_VERSION = '1.3.19';
export const BUILD_TIME = '2025-08-03T13:31:28.3NZ';
export const BUILD_HASH = 'a99d45ec33f7';
export const BUILD_TIMESTAMP = 1754227888;

export const GIT_INFO = {
  hash: '682d442',
  branch: 'main',
  tag: ''
};

export const VERSION_INFO = {
  name: 'react-todo-app',
  version: '1.3.19',
  buildTime: '2025-08-03T13:31:28.3NZ',
  buildHash: 'a99d45ec33f7',
  buildTimestamp: 1754227888,
  git: GIT_INFO
};

// 设置全局变量供应用使用
if (typeof window !== 'undefined') {
  window.__APP_VERSION__ = '1.3.19';
  window.__BUILD_HASH__ = 'a99d45ec33f7';
  window.__BUILD_TIME__ = '2025-08-03T13:31:28.3NZ';
}
