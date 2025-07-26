// 应用版本信息常量 (自动生成，请勿手动修改)
// 生成时间: 2025-07-26T04:08:57.3NZ

export const APP_VERSION = '1.3.11';
export const BUILD_TIME = '2025-07-26T04:08:57.3NZ';
export const BUILD_HASH = '37f85f66efb2';
export const BUILD_TIMESTAMP = 1753502937;

export const GIT_INFO = {
  hash: 'b2ff845',
  branch: 'main',
  tag: ''
};

export const VERSION_INFO = {
  name: 'react-todo-app',
  version: '1.3.11',
  buildTime: '2025-07-26T04:08:57.3NZ',
  buildHash: '37f85f66efb2',
  buildTimestamp: 1753502937,
  git: GIT_INFO
};

// 设置全局变量供应用使用
if (typeof window !== 'undefined') {
  window.__APP_VERSION__ = '1.3.11';
  window.__BUILD_HASH__ = '37f85f66efb2';
  window.__BUILD_TIME__ = '2025-07-26T04:08:57.3NZ';
}
