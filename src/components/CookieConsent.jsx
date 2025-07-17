import React, { useState, useEffect } from 'react';
import PrivacyPolicy from './PrivacyPolicy';
import { STORAGE_KEYS, COOKIE_CONSENT_VALUES } from '../constants/storageKeys';

/**
 * @description Cookie 隐私同意提示组件
 * @returns {JSX.Element}
 */
function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);

  useEffect(() => {
    // 检查用户是否已经同意过 Cookie 使用
    const hasConsented = localStorage.getItem(STORAGE_KEYS.COOKIE_CONSENT);
    if (!hasConsented) {
      // 延迟显示，提供更好的用户体验
      const timer = setTimeout(() => {
        setIsVisible(true);
        setTimeout(() => setIsAnimating(true), 100);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  // 同意使用 Cookie
  const handleAccept = () => {
    try {
      localStorage.setItem(STORAGE_KEYS.COOKIE_CONSENT, COOKIE_CONSENT_VALUES.ACCEPTED);
      localStorage.setItem(STORAGE_KEYS.COOKIE_CONSENT_DATE, new Date().toISOString());
      localStorage.setItem(STORAGE_KEYS.COOKIE_CONSENT_VERSION, '1.0');
      handleClose();
    } catch (error) {
      console.warn('无法保存 Cookie 同意状态:', error);
      // 即使无法保存到 localStorage，也允许用户继续使用
      handleClose();
    }
  };

  // 拒绝使用 Cookie
  const handleDecline = () => {
    try {
      localStorage.setItem(STORAGE_KEYS.COOKIE_CONSENT, COOKIE_CONSENT_VALUES.DECLINED);
      localStorage.setItem(STORAGE_KEYS.COOKIE_CONSENT_DATE, new Date().toISOString());
      // 清除可能已存在的应用数据
      clearAppData();
      handleClose();
    } catch (error) {
      console.warn('无法保存 Cookie 拒绝状态:', error);
      handleClose();
    }
  };

  // 清除应用数据
  const clearAppData = () => {
    const keysToKeep = [
      STORAGE_KEYS.COOKIE_CONSENT, 
      STORAGE_KEYS.COOKIE_CONSENT_DATE, 
      STORAGE_KEYS.COOKIE_CONSENT_VERSION
    ];
    const allKeys = Object.keys(localStorage);
    
    allKeys.forEach(key => {
      if (!keysToKeep.includes(key)) {
        try {
          localStorage.removeItem(key);
        } catch (error) {
          console.warn(`无法清除数据项 ${key}:`, error);
        }
      }
    });
  };

  // 关闭提示
  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => setIsVisible(false), 300);
  };

  // 查看隐私政策
  const handlePrivacyPolicy = () => {
    setShowPrivacyPolicy(true);
  };

  if (!isVisible) return null;

  return (
    <>
      {/* 遮罩层 */}
      <div className={`cookie-consent-overlay ${isAnimating ? 'show' : ''}`} />
      
      {/* Cookie 同意弹窗 */}
      <div className={`cookie-consent ${isAnimating ? 'show' : ''}`}>
        <div className="cookie-consent-content">
          {/* 图标和标题 */}
          <div className="cookie-consent-header">
            <div className="cookie-icon">🍪</div>
            <h3>Cookie 使用提示</h3>
          </div>
          
          {/* 说明文字 */}
          <div className="cookie-consent-message">
            <p>
              我们使用 Cookie 和本地存储来保存您的待办事项、主题偏好和应用设置，
              以提供更好的用户体验。
            </p>
            <p>
              <strong>我们收集的信息：</strong>
            </p>
            <ul>
              <li>✅ 您的待办事项数据（仅存储在您的设备上）</li>
              <li>✅ 主题和界面偏好设置</li>
              <li>✅ 应用使用统计（匿名）</li>
              <li>❌ 不收集个人身份信息</li>
              <li>❌ 不与第三方分享数据</li>
            </ul>
          </div>

          {/* 操作按钮 */}
          <div className="cookie-consent-actions">
            <button 
              className="btn-decline"
              onClick={handleDecline}
              aria-label="拒绝使用 Cookie"
            >
              仅必要功能
            </button>
            <button 
              className="btn-accept"
              onClick={handleAccept}
              aria-label="同意使用 Cookie"
            >
              同意并继续
            </button>
          </div>

          {/* 隐私政策链接 */}
          <div className="cookie-consent-footer">
            <button 
              className="privacy-link"
              onClick={handlePrivacyPolicy}
            >
              查看隐私政策
            </button>
          </div>
        </div>
      </div>

      {/* 隐私政策弹窗 */}
      <PrivacyPolicy 
        isOpen={showPrivacyPolicy} 
        onClose={() => setShowPrivacyPolicy(false)} 
      />
    </>
  );
}

export default CookieConsent;
