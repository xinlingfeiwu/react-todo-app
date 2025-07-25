// 应用版本信息常量 (自动生成，请勿手动修改)
// 生成时间: 2025-07-25T05:14:25.3NZ

export const APP_VERSION = '1.3.1';
export const BUILD_TIME = '2025-07-25T05:14:25.3NZ';
export const BUILD_HASH = 'b3aa541abf58';
export const BUILD_TIMESTAMP = 1753420465;

export const GIT_INFO = {
  hash: '3729678',
  branch: 'main',
  tag: ''
};

export const VERSION_INFO = {
  name: 'react-todo-app',
  version: '1.3.1',
  buildTime: '2025-07-25T05:14:25.3NZ',
  buildHash: 'b3aa541abf58',
  buildTimestamp: 1753420465,
  git: GIT_INFO
};

// 设置全局变量供应用使用
if (typeof window !== 'undefined') {
  window.__APP_VERSION__ = '1.3.1';
  window.__BUILD_HASH__ = 'b3aa541abf58';
  window.__BUILD_TIME__ = '2025-07-25T05:14:25.3NZ';
}
