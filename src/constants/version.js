// 应用版本信息常量 (自动生成，请勿手动修改)
// 生成时间: 2025-07-23T05:04:20.3NZ

export const APP_VERSION = '1.13.0';
export const BUILD_TIME = '2025-07-23T05:04:20.3NZ';
export const BUILD_HASH = '8e22429ebc01';
export const BUILD_TIMESTAMP = 1753247060;

export const GIT_INFO = {
  hash: '233d118',
  branch: 'main',
  tag: ''
};

export const VERSION_INFO = {
  name: 'react-todo-app',
  version: '1.13.0',
  buildTime: '2025-07-23T05:04:20.3NZ',
  buildHash: '8e22429ebc01',
  buildTimestamp: 1753247060,
  git: GIT_INFO
};

// 设置全局变量供应用使用
if (typeof window !== 'undefined') {
  window.__APP_VERSION__ = '1.13.0';
  window.__BUILD_HASH__ = '8e22429ebc01';
  window.__BUILD_TIME__ = '2025-07-23T05:04:20.3NZ';
}
