// 应用版本信息常量 (自动生成，请勿手动修改)
// 生成时间: 2025-07-25T07:36:38.3NZ

export const APP_VERSION = '1.3.4';
export const BUILD_TIME = '2025-07-25T07:36:38.3NZ';
export const BUILD_HASH = '528e144acd69';
export const BUILD_TIMESTAMP = 1753428998;

export const GIT_INFO = {
  hash: 'c042b17',
  branch: 'main',
  tag: 'v1.3.4'
};

export const VERSION_INFO = {
  name: 'react-todo-app',
  version: '1.3.4',
  buildTime: '2025-07-25T07:36:38.3NZ',
  buildHash: '528e144acd69',
  buildTimestamp: 1753428998,
  git: GIT_INFO
};

// 设置全局变量供应用使用
if (typeof window !== 'undefined') {
  window.__APP_VERSION__ = '1.3.4';
  window.__BUILD_HASH__ = '528e144acd69';
  window.__BUILD_TIME__ = '2025-07-25T07:36:38.3NZ';
}
