// 应用版本信息常量 (自动生成，请勿手动修改)
// 生成时间: 2025-07-25T06:14:48.3NZ

export const APP_VERSION = '1.3.3';
export const BUILD_TIME = '2025-07-25T06:14:48.3NZ';
export const BUILD_HASH = '40855f3dd87f';
export const BUILD_TIMESTAMP = 1753424088;

export const GIT_INFO = {
  hash: '6d24bd6',
  branch: 'main',
  tag: 'v1.3.3'
};

export const VERSION_INFO = {
  name: 'react-todo-app',
  version: '1.3.3',
  buildTime: '2025-07-25T06:14:48.3NZ',
  buildHash: '40855f3dd87f',
  buildTimestamp: 1753424088,
  git: GIT_INFO
};

// 设置全局变量供应用使用
if (typeof window !== 'undefined') {
  window.__APP_VERSION__ = '1.3.3';
  window.__BUILD_HASH__ = '40855f3dd87f';
  window.__BUILD_TIME__ = '2025-07-25T06:14:48.3NZ';
}
