// 应用版本信息常量 (自动生成，请勿手动修改)
// 生成时间: 2025-08-05T07:52:22.3NZ

export const APP_VERSION = '1.4.3';
export const BUILD_TIME = '2025-08-05T07:52:22.3NZ';
export const BUILD_HASH = 'f4785ec061c4';
export const BUILD_TIMESTAMP = 1754380342;

export const GIT_INFO = {
  hash: '0a78097',
  branch: 'main',
  tag: ''
};

export const VERSION_INFO = {
  name: 'react-todo-app',
  version: '1.4.3',
  buildTime: '2025-08-05T07:52:22.3NZ',
  buildHash: 'f4785ec061c4',
  buildTimestamp: 1754380342,
  git: GIT_INFO
};

// 设置全局变量供应用使用
if (typeof window !== 'undefined') {
  window.__APP_VERSION__ = '1.4.3';
  window.__BUILD_HASH__ = 'f4785ec061c4';
  window.__BUILD_TIME__ = '2025-08-05T07:52:22.3NZ';
}
