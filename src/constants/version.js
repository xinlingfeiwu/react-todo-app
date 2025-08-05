// 应用版本信息常量 (自动生成，请勿手动修改)
// 生成时间: 2025-08-05T08:01:35.3NZ

export const APP_VERSION = '1.4.3';
export const BUILD_TIME = '2025-08-05T08:01:35.3NZ';
export const BUILD_HASH = 'e091900b00e1';
export const BUILD_TIMESTAMP = 1754380895;

export const GIT_INFO = {
  hash: 'a1c30cf',
  branch: 'main',
  tag: 'v1.4.3'
};

export const VERSION_INFO = {
  name: 'react-todo-app',
  version: '1.4.3',
  buildTime: '2025-08-05T08:01:35.3NZ',
  buildHash: 'e091900b00e1',
  buildTimestamp: 1754380895,
  git: GIT_INFO
};

// 设置全局变量供应用使用
if (typeof window !== 'undefined') {
  window.__APP_VERSION__ = '1.4.3';
  window.__BUILD_HASH__ = 'e091900b00e1';
  window.__BUILD_TIME__ = '2025-08-05T08:01:35.3NZ';
}
