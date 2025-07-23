// 应用版本信息常量 (自动生成，请勿手动修改)
// 生成时间: 2025-07-23T06:50:39.3NZ

export const APP_VERSION = '1.1.1';
export const BUILD_TIME = '2025-07-23T06:50:39.3NZ';
export const BUILD_HASH = 'd2a2fb7dcc34';
export const BUILD_TIMESTAMP = 1753253439;

export const GIT_INFO = {
  hash: '01857fe',
  branch: 'main',
  tag: ''
};

export const VERSION_INFO = {
  name: 'react-todo-app',
  version: '1.1.1',
  buildTime: '2025-07-23T06:50:39.3NZ',
  buildHash: 'd2a2fb7dcc34',
  buildTimestamp: 1753253439,
  git: GIT_INFO
};

// 设置全局变量供应用使用
if (typeof window !== 'undefined') {
  window.__APP_VERSION__ = '1.1.1';
  window.__BUILD_HASH__ = 'd2a2fb7dcc34';
  window.__BUILD_TIME__ = '2025-07-23T06:50:39.3NZ';
}
