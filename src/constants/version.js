// 应用版本信息常量 (自动生成，请勿手动修改)
// 生成时间: 2025-07-25T07:56:16.3NZ

export const APP_VERSION = '1.3.4';
export const BUILD_TIME = '2025-07-25T07:56:16.3NZ';
export const BUILD_HASH = 'e197e42a19d0';
export const BUILD_TIMESTAMP = 1753430176;

export const GIT_INFO = {
  hash: 'acba9ad',
  branch: 'main',
  tag: ''
};

export const VERSION_INFO = {
  name: 'react-todo-app',
  version: '1.3.4',
  buildTime: '2025-07-25T07:56:16.3NZ',
  buildHash: 'e197e42a19d0',
  buildTimestamp: 1753430176,
  git: GIT_INFO
};

// 设置全局变量供应用使用
if (typeof window !== 'undefined') {
  window.__APP_VERSION__ = '1.3.4';
  window.__BUILD_HASH__ = 'e197e42a19d0';
  window.__BUILD_TIME__ = '2025-07-25T07:56:16.3NZ';
}
