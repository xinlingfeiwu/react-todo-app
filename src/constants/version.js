// 应用版本信息常量 (自动生成，请勿手动修改)
// 生成时间: 2025-08-05T08:02:58.3NZ

export const APP_VERSION = '1.4.4';
export const BUILD_TIME = '2025-08-05T08:02:58.3NZ';
export const BUILD_HASH = '7d0fc14e609d';
export const BUILD_TIMESTAMP = 1754380978;

export const GIT_INFO = {
  hash: 'c835209',
  branch: 'main',
  tag: ''
};

export const VERSION_INFO = {
  name: 'react-todo-app',
  version: '1.4.4',
  buildTime: '2025-08-05T08:02:58.3NZ',
  buildHash: '7d0fc14e609d',
  buildTimestamp: 1754380978,
  git: GIT_INFO
};

// 设置全局变量供应用使用
if (typeof window !== 'undefined') {
  window.__APP_VERSION__ = '1.4.4';
  window.__BUILD_HASH__ = '7d0fc14e609d';
  window.__BUILD_TIME__ = '2025-08-05T08:02:58.3NZ';
}
