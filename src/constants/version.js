// 应用版本信息常量 (自动生成，请勿手动修改)
// 生成时间: 2025-07-23T06:47:18.3NZ

export const APP_VERSION = '1.1.0';
export const BUILD_TIME = '2025-07-23T06:47:18.3NZ';
export const BUILD_HASH = 'ea4a04b902da';
export const BUILD_TIMESTAMP = 1753253238;

export const GIT_INFO = {
  hash: '01306cc',
  branch: 'main',
  tag: ''
};

export const VERSION_INFO = {
  name: 'react-todo-app',
  version: '1.1.0',
  buildTime: '2025-07-23T06:47:18.3NZ',
  buildHash: 'ea4a04b902da',
  buildTimestamp: 1753253238,
  git: GIT_INFO
};

// 设置全局变量供应用使用
if (typeof window !== 'undefined') {
  window.__APP_VERSION__ = '1.1.0';
  window.__BUILD_HASH__ = 'ea4a04b902da';
  window.__BUILD_TIME__ = '2025-07-23T06:47:18.3NZ';
}
