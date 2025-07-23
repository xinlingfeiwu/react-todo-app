// 应用版本信息常量 (自动生成，请勿手动修改)
// 生成时间: 2025-07-23T04:57:54.3NZ

export const APP_VERSION = '1.11.0';
export const BUILD_TIME = '2025-07-23T04:57:54.3NZ';
export const BUILD_HASH = '490e7d9ef91c';
export const BUILD_TIMESTAMP = 1753246674;

export const GIT_INFO = {
  hash: '85a86df',
  branch: 'main',
  tag: 'v1.9.0'
};

export const VERSION_INFO = {
  name: 'react-todo-app',
  version: '1.11.0',
  buildTime: '2025-07-23T04:57:54.3NZ',
  buildHash: '490e7d9ef91c',
  buildTimestamp: 1753246674,
  git: GIT_INFO
};

// 设置全局变量供应用使用
if (typeof window !== 'undefined') {
  window.__APP_VERSION__ = '1.11.0';
  window.__BUILD_HASH__ = '490e7d9ef91c';
  window.__BUILD_TIME__ = '2025-07-23T04:57:54.3NZ';
}
