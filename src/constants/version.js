// 应用版本信息常量 (自动生成，请勿手动修改)
// 生成时间: 2025-07-25T01:58:15.3NZ

export const APP_VERSION = '1.4.0';
export const BUILD_TIME = '2025-07-25T01:58:15.3NZ';
export const BUILD_HASH = 'cefbc55807d5';
export const BUILD_TIMESTAMP = 1753408695;

export const GIT_INFO = {
  hash: '031bcae',
  branch: 'main',
  tag: 'v1.3.0'
};

export const VERSION_INFO = {
  name: 'react-todo-app',
  version: '1.4.0',
  buildTime: '2025-07-25T01:58:15.3NZ',
  buildHash: 'cefbc55807d5',
  buildTimestamp: 1753408695,
  git: GIT_INFO
};

// 设置全局变量供应用使用
if (typeof window !== 'undefined') {
  window.__APP_VERSION__ = '1.4.0';
  window.__BUILD_HASH__ = 'cefbc55807d5';
  window.__BUILD_TIME__ = '2025-07-25T01:58:15.3NZ';
}
