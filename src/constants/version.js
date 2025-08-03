// 应用版本信息常量 (自动生成，请勿手动修改)
// 生成时间: 2025-08-03T17:04:05.3NZ

export const APP_VERSION = '1.4.0';
export const BUILD_TIME = '2025-08-03T17:04:05.3NZ';
export const BUILD_HASH = 'b428d00b0202';
export const BUILD_TIMESTAMP = 1754240645;

export const GIT_INFO = {
  hash: 'adec7be',
  branch: 'main',
  tag: ''
};

export const VERSION_INFO = {
  name: 'react-todo-app',
  version: '1.4.0',
  buildTime: '2025-08-03T17:04:05.3NZ',
  buildHash: 'b428d00b0202',
  buildTimestamp: 1754240645,
  git: GIT_INFO
};

// 设置全局变量供应用使用
if (typeof window !== 'undefined') {
  window.__APP_VERSION__ = '1.4.0';
  window.__BUILD_HASH__ = 'b428d00b0202';
  window.__BUILD_TIME__ = '2025-08-03T17:04:05.3NZ';
}
