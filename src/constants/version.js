// 应用版本信息常量 (自动生成，请勿手动修改)
// 生成时间: 2025-07-28T02:05:31.3NZ

export const APP_VERSION = '1.3.17';
export const BUILD_TIME = '2025-07-28T02:05:31.3NZ';
export const BUILD_HASH = '29e21828d6dc';
export const BUILD_TIMESTAMP = 1753668331;

export const GIT_INFO = {
  hash: '771a5f5',
  branch: 'main',
  tag: ''
};

export const VERSION_INFO = {
  name: 'react-todo-app',
  version: '1.3.17',
  buildTime: '2025-07-28T02:05:31.3NZ',
  buildHash: '29e21828d6dc',
  buildTimestamp: 1753668331,
  git: GIT_INFO
};

// 设置全局变量供应用使用
if (typeof window !== 'undefined') {
  window.__APP_VERSION__ = '1.3.17';
  window.__BUILD_HASH__ = '29e21828d6dc';
  window.__BUILD_TIME__ = '2025-07-28T02:05:31.3NZ';
}
