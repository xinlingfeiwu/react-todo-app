/**
 * @description 懒加载组件配置
 * 通过代码分割优化应用加载性能
 */

import { lazy, Suspense } from 'react';

// 懒加载大型组件
const LazyDataManager = lazy(() => import('./DataManager'));
const LazyAppSettings = lazy(() => import('./AppSettings'));
const LazyFeedbackManager = lazy(() => import('./FeedbackManager'));
const LazyPrivacyPolicy = lazy(() => import('./PrivacyPolicy'));
const LazyDonate = lazy(() => import('./Donate'));

// 加载中组件
const LoadingSpinner = ({ message = "加载中..." }) => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
    color: 'var(--text-secondary)',
    fontSize: '14px'
  }}>
    <div style={{
      width: '20px',
      height: '20px',
      border: '2px solid currentColor',
      borderTop: '2px solid transparent',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
      marginRight: '0.5rem'
    }}></div>
    {message}
  </div>
);

// 包装组件，提供错误边界
const LazyWrapper = ({ children, fallback = <LoadingSpinner /> }) => (
  <Suspense fallback={fallback}>
    {children}
  </Suspense>
);

// 导出懒加载组件
export const DataManager = (props) => (
  <LazyWrapper fallback={<LoadingSpinner message="加载数据管理..." />}>
    <LazyDataManager {...props} />
  </LazyWrapper>
);

export const AppSettings = (props) => (
  <LazyWrapper fallback={<LoadingSpinner message="加载应用设置..." />}>
    <LazyAppSettings {...props} />
  </LazyWrapper>
);

export const FeedbackManager = (props) => (
  <LazyWrapper fallback={<LoadingSpinner message="加载反馈管理..." />}>
    <LazyFeedbackManager {...props} />
  </LazyWrapper>
);

export const PrivacyPolicy = (props) => (
  <LazyWrapper fallback={<LoadingSpinner message="加载隐私政策..." />}>
    <LazyPrivacyPolicy {...props} />
  </LazyWrapper>
);

export const Donate = (props) => (
  <LazyWrapper fallback={<LoadingSpinner message="加载打赏功能..." />}>
    <LazyDonate {...props} />
  </LazyWrapper>
);

// 添加旋转动画CSS
const style = document.createElement('style');
style.textContent = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;
document.head.appendChild(style);
