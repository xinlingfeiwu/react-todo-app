// 应用版本信息常量 (自动生成，请勿手动修改)
// 生成时间: 2025-07-25T06:23:32.3NZ

export const APP_VERSION = '1.3.4';
export const BUILD_TIME = '2025-07-25T06:23:32.3NZ';
export const BUILD_HASH = 'd931bbdff2ae';
export const BUILD_TIMESTAMP = 1753424612;

export const GIT_INFO = {
  hash: '6e3ac08',
  branch: 'main',
  tag: ''
};

export const VERSION_INFO = {
  name: 'react-todo-app',
  version: '1.3.4',
  buildTime: '2025-07-25T06:23:32.3NZ',
  buildHash: 'd931bbdff2ae',
  buildTimestamp: 1753424612,
  git: GIT_INFO
};

// 设置全局变量供应用使用
if (typeof window !== 'undefined') {
  window.__APP_VERSION__ = '1.3.4';
  window.__BUILD_HASH__ = 'd931bbdff2ae';
  window.__BUILD_TIME__ = '2025-07-25T06:23:32.3NZ';
}
