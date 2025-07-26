// 应用版本信息常量 (自动生成，请勿手动修改)
// 生成时间: 2025-07-26T12:00:18.3NZ

export const APP_VERSION = '1.3.13';
export const BUILD_TIME = '2025-07-26T12:00:18.3NZ';
export const BUILD_HASH = '5401406596b0';
export const BUILD_TIMESTAMP = 1753531218;

export const GIT_INFO = {
  hash: '017b221',
  branch: 'main',
  tag: ''
};

export const VERSION_INFO = {
  name: 'react-todo-app',
  version: '1.3.13',
  buildTime: '2025-07-26T12:00:18.3NZ',
  buildHash: '5401406596b0',
  buildTimestamp: 1753531218,
  git: GIT_INFO
};

// 设置全局变量供应用使用
if (typeof window !== 'undefined') {
  window.__APP_VERSION__ = '1.3.13';
  window.__BUILD_HASH__ = '5401406596b0';
  window.__BUILD_TIME__ = '2025-07-26T12:00:18.3NZ';
}
