// 应用版本信息常量 (自动生成，请勿手动修改)
// 生成时间: 2025-07-25T02:52:08.3NZ

export const APP_VERSION = '1.3.0';
export const BUILD_TIME = '2025-07-25T02:52:08.3NZ';
export const BUILD_HASH = '63b9719f0c73';
export const BUILD_TIMESTAMP = 1753411928;

export const GIT_INFO = {
  hash: '5c8fcd1',
  branch: 'main',
  tag: ''
};

export const VERSION_INFO = {
  name: 'react-todo-app',
  version: '1.3.0',
  buildTime: '2025-07-25T02:52:08.3NZ',
  buildHash: '63b9719f0c73',
  buildTimestamp: 1753411928,
  git: GIT_INFO
};

// 设置全局变量供应用使用
if (typeof window !== 'undefined') {
  window.__APP_VERSION__ = '1.3.0';
  window.__BUILD_HASH__ = '63b9719f0c73';
  window.__BUILD_TIME__ = '2025-07-25T02:52:08.3NZ';
}
