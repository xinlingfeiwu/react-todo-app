// 应用版本信息常量 (自动生成，请勿手动修改)
// 生成时间: 2025-07-26T02:44:23.3NZ

export const APP_VERSION = '1.3.7';
export const BUILD_TIME = '2025-07-26T02:44:23.3NZ';
export const BUILD_HASH = 'e88225fc08ed';
export const BUILD_TIMESTAMP = 1753497863;

export const GIT_INFO = {
  hash: '238b259',
  branch: 'main',
  tag: ''
};

export const VERSION_INFO = {
  name: 'react-todo-app',
  version: '1.3.7',
  buildTime: '2025-07-26T02:44:23.3NZ',
  buildHash: 'e88225fc08ed',
  buildTimestamp: 1753497863,
  git: GIT_INFO
};

// 设置全局变量供应用使用
if (typeof window !== 'undefined') {
  window.__APP_VERSION__ = '1.3.7';
  window.__BUILD_HASH__ = 'e88225fc08ed';
  window.__BUILD_TIME__ = '2025-07-26T02:44:23.3NZ';
}
