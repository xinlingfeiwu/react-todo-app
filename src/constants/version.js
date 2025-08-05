// 应用版本信息常量 (自动生成，请勿手动修改)
// 生成时间: 2025-08-05T07:50:49.3NZ

export const APP_VERSION = '1.4.2';
export const BUILD_TIME = '2025-08-05T07:50:49.3NZ';
export const BUILD_HASH = '4014f7d89bc7';
export const BUILD_TIMESTAMP = 1754380249;

export const GIT_INFO = {
  hash: 'c66e02c',
  branch: 'main',
  tag: 'v1.4.2'
};

export const VERSION_INFO = {
  name: 'react-todo-app',
  version: '1.4.2',
  buildTime: '2025-08-05T07:50:49.3NZ',
  buildHash: '4014f7d89bc7',
  buildTimestamp: 1754380249,
  git: GIT_INFO
};

// 设置全局变量供应用使用
if (typeof window !== 'undefined') {
  window.__APP_VERSION__ = '1.4.2';
  window.__BUILD_HASH__ = '4014f7d89bc7';
  window.__BUILD_TIME__ = '2025-08-05T07:50:49.3NZ';
}
