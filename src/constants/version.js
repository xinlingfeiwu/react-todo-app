// 应用版本信息常量 (自动生成，请勿手动修改)
// 生成时间: 2025-07-23T05:17:57.3NZ

export const APP_VERSION = '1.14.0';
export const BUILD_TIME = '2025-07-23T05:17:57.3NZ';
export const BUILD_HASH = 'eb2e041a388d';
export const BUILD_TIMESTAMP = 1753247877;

export const GIT_INFO = {
  hash: '3ec3bdf',
  branch: 'main',
  tag: 'v1.13.0'
};

export const VERSION_INFO = {
  name: 'react-todo-app',
  version: '1.14.0',
  buildTime: '2025-07-23T05:17:57.3NZ',
  buildHash: 'eb2e041a388d',
  buildTimestamp: 1753247877,
  git: GIT_INFO
};

// 设置全局变量供应用使用
if (typeof window !== 'undefined') {
  window.__APP_VERSION__ = '1.14.0';
  window.__BUILD_HASH__ = 'eb2e041a388d';
  window.__BUILD_TIME__ = '2025-07-23T05:17:57.3NZ';
}
