// 应用版本信息常量 (自动生成，请勿手动修改)
// 生成时间: 2025-08-05T02:46:52.3NZ

export const APP_VERSION = '1.4.0';
export const BUILD_TIME = '2025-08-05T02:46:52.3NZ';
export const BUILD_HASH = '0b2a5df46b14';
export const BUILD_TIMESTAMP = 1754362012;

export const GIT_INFO = {
  hash: '2fa69ec',
  branch: 'main',
  tag: ''
};

export const VERSION_INFO = {
  name: 'react-todo-app',
  version: '1.4.0',
  buildTime: '2025-08-05T02:46:52.3NZ',
  buildHash: '0b2a5df46b14',
  buildTimestamp: 1754362012,
  git: GIT_INFO
};

// 设置全局变量供应用使用
if (typeof window !== 'undefined') {
  window.__APP_VERSION__ = '1.4.0';
  window.__BUILD_HASH__ = '0b2a5df46b14';
  window.__BUILD_TIME__ = '2025-08-05T02:46:52.3NZ';
}
