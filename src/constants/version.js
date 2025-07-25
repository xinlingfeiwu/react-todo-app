// 应用版本信息常量 (自动生成，请勿手动修改)
// 生成时间: 2025-07-25T05:38:18.3NZ

export const APP_VERSION = '1.3.2';
export const BUILD_TIME = '2025-07-25T05:38:18.3NZ';
export const BUILD_HASH = '8153cfe98db8';
export const BUILD_TIMESTAMP = 1753421898;

export const GIT_INFO = {
  hash: 'afa8b6b',
  branch: 'main',
  tag: ''
};

export const VERSION_INFO = {
  name: 'react-todo-app',
  version: '1.3.2',
  buildTime: '2025-07-25T05:38:18.3NZ',
  buildHash: '8153cfe98db8',
  buildTimestamp: 1753421898,
  git: GIT_INFO
};

// 设置全局变量供应用使用
if (typeof window !== 'undefined') {
  window.__APP_VERSION__ = '1.3.2';
  window.__BUILD_HASH__ = '8153cfe98db8';
  window.__BUILD_TIME__ = '2025-07-25T05:38:18.3NZ';
}
