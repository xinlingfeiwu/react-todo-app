// 应用版本信息常量 (自动生成，请勿手动修改)
// 生成时间: 2025-07-23T04:52:56.3NZ

export const APP_VERSION = '1.9.0';
export const BUILD_TIME = '2025-07-23T04:52:56.3NZ';
export const BUILD_HASH = '11ee11f8869f';
export const BUILD_TIMESTAMP = 1753246376;

export const GIT_INFO = {
  hash: '30c3369',
  branch: 'main',
  tag: 'v1.7.0'
};

export const VERSION_INFO = {
  name: 'react-todo-app',
  version: '1.9.0',
  buildTime: '2025-07-23T04:52:56.3NZ',
  buildHash: '11ee11f8869f',
  buildTimestamp: 1753246376,
  git: GIT_INFO
};

// 设置全局变量供应用使用
if (typeof window !== 'undefined') {
  window.__APP_VERSION__ = '1.9.0';
  window.__BUILD_HASH__ = '11ee11f8869f';
  window.__BUILD_TIME__ = '2025-07-23T04:52:56.3NZ';
}
