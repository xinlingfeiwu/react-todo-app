import { useState, useEffect } from 'react';
import { useAppUpdate } from '../hooks/useAppUpdate';
import '../styles/components/AppUpdateNotification.css';

/**
 * 应用更新模态对话框组件
 * 显示强制的更新选择对话框
 */
export default function AppUpdateNotification() {
  const {
    hasUpdate,
    currentVersion,
    latestVersion,
    isChecking,
    applyUpdate,
    dismissUpdate,
    checkForUpdate
  } = useAppUpdate();

  const [isVisible, setIsVisible] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateDismissed, setUpdateDismissed] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  // 控制模态对话框显示
  useEffect(() => {
    if (hasUpdate && !updateDismissed) {
      // 延迟显示，确保应用已完全加载
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1500);
      
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [hasUpdate, updateDismissed]);

  // 控制body滚动 - 只在模态对话框实际可见时阻止滚动
  useEffect(() => {
    if (isVisible) {
      // 使用更兼容的方式阻止页面滚动
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';
      
      return () => {
        // 恢复原始样式
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isVisible]);

  // 处理立即更新
  const handleUpdate = async () => {
    setIsUpdating(true);
    
    // 立即设置更新状态，防止重复弹出
    setUpdateDismissed(true);
    setIsVisible(false);
    
    // 显示更新进度
    setTimeout(() => {
      applyUpdate();
    }, 1000);
  };

  // 处理稍后更新
  const handleDismiss = () => {
    setIsUpdating(false);
    setIsVisible(false);
    setUpdateDismissed(true);
    
    // 调用hook的忽略函数
    setTimeout(() => {
      dismissUpdate();
    }, 300);
  };

  // 处理手动检查（开发环境）
  const handleManualCheck = async () => {
    const hasNewUpdate = await checkForUpdate();
    if (!hasNewUpdate) {
      console.log('当前已是最新版本');
    }
  };

  // 阻止对话框外部点击关闭
  const handleOverlayClick = (e) => {
    // 阻止点击遮罩层关闭对话框
    e.stopPropagation();
  };

  const handleDialogClick = (e) => {
    // 阻止点击对话框内容关闭对话框
    e.stopPropagation();
  };

  // 如果没有更新，不渲染
  if (!hasUpdate || updateDismissed) {
    return null;
  }

  return (
    <>
      {/* 模态遮罩层 */}
      <div 
        className={`app-update-modal-overlay ${isVisible ? 'visible' : ''}`}
        onClick={handleOverlayClick}
      >
        {/* 更新对话框 */}
        <div 
          className={`app-update-dialog ${isVisible ? 'visible' : ''}`}
          onClick={handleDialogClick}
        >
          {/* 对话框头部 */}
          <div className="update-dialog-header">
            <div className="update-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                <path d="M21 3v5h-5" />
                <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                <path d="M3 21v-5h5" />
              </svg>
            </div>
            <h2>发现新版本</h2>
          </div>

          {/* 对话框内容 */}
          <div className="update-dialog-content">
            <p className="update-message">
              应用已发布新版本，包含功能优化、性能提升和重要修复。建议立即更新以获得更好的使用体验。
            </p>

            {/* 版本信息 - 暂时隐藏 */}
            <div className="version-comparison" style={{ display: 'none' }}>
              <div className="version-item current">
                <span className="version-label">当前版本</span>
                <span className="version-number">{currentVersion}</span>
              </div>
              <div className="version-arrow">
                <svg className="arrow-right" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14" />
                  <path d="M12 5l7 7-7 7" />
                </svg>
                <svg className="arrow-down" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 5v14" />
                  <path d="M5 12l7 7 7-7" />
                </svg>
              </div>
              <div className="version-item latest">
                <span className="version-label">最新版本</span>
                <span className="version-number">{latestVersion}</span>
              </div>
            </div>

            {/* 详细信息按钮 - 暂时隐藏 */}
            <div className="details-toggle" style={{ display: 'none' }}>
              <button
                className="btn-toggle-details"
                onClick={() => setShowDetailsDialog(true)}
              >
                <span>查看详情</span>
                <svg 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="1" />
                  <circle cx="19" cy="12" r="1" />
                  <circle cx="5" cy="12" r="1" />
                </svg>
              </button>
            </div>

            {/* 预留空间用于未来功能 */}
            <div className="reserved-space">
              {/* 此区域为未来功能预留 */}
            </div>
          </div>

          {/* 更新进度（更新中时显示） */}
          {isUpdating && (
            <div className="update-progress">
              <div className="progress-bar">
                <div className="progress-fill"></div>
              </div>
              <div className="progress-text">
                <span className="loading-spinner"></span>
                正在更新应用，请稍候...
              </div>
            </div>
          )}

          {/* 对话框底部按钮 */}
          <div className="update-dialog-footer">
            <button
              className="btn-cancel"
              onClick={handleDismiss}
              disabled={isUpdating}
            >
              稍后更新
            </button>

            <button
              className="btn-update-now"
              onClick={handleUpdate}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <>
                  <span className="loading-spinner"></span>
                  更新中...
                </>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width: '16px', height: '16px'}}>
                    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                    <path d="M21 3v5h-5" />
                    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                    <path d="M3 21v-5h5" />
                  </svg>
                  立即更新
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 检查状态指示器（右下角小提示） */}
      {isChecking && (
        <div className="checking-indicator">
          <div className="checking-spinner"></div>
          <span>检查更新中...</span>
        </div>
      )}

      {/* 开发环境手动检查按钮 */}
      {import.meta.env.DEV && (
        <div className="dev-controls">
          <button
            className="btn-dev-check"
            onClick={handleManualCheck}
            disabled={isChecking}
            title="手动检查更新（开发环境）"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
              <path d="M21 3v5h-5" />
            </svg>
          </button>
        </div>
      )}

      {/* 更新详情对话框 */}
      {showDetailsDialog && (
        <div 
          className="app-update-modal-overlay visible"
          onClick={() => setShowDetailsDialog(false)}
        >
          <div 
            className="app-update-dialog visible update-details-dialog"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 详情对话框头部 */}
            <div className="update-dialog-header">
              <div className="update-icon details-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 8v4" />
                  <path d="M12 16h.01" />
                </svg>
              </div>
              <h2>更新详情</h2>
            </div>

            {/* 详情对话框内容 */}
            <div className="update-dialog-content">
              <div className="update-details-content">
                <h3>本次更新包含：</h3>
                <ul className="update-features-list">
                  <li>
                    <span className="feature-icon">✨</span>
                    <div className="feature-content">
                      <strong>新功能和界面优化</strong>
                      <p>改进用户界面设计，提升操作体验</p>
                    </div>
                  </li>
                  <li>
                    <span className="feature-icon">🐛</span>
                    <div className="feature-content">
                      <strong>重要问题修复</strong>
                      <p>修复已知bug，提高应用稳定性</p>
                    </div>
                  </li>
                  <li>
                    <span className="feature-icon">⚡</span>
                    <div className="feature-content">
                      <strong>性能和稳定性提升</strong>
                      <p>优化代码逻辑，提升运行效率</p>
                    </div>
                  </li>
                  <li>
                    <span className="feature-icon">🔒</span>
                    <div className="feature-content">
                      <strong>安全性增强</strong>
                      <p>强化数据保护和安全防护机制</p>
                    </div>
                  </li>
                </ul>

                <div className="update-info-card">
                  <h4>版本信息</h4>
                  <div className="version-details">
                    <div className="version-detail-item">
                      <span className="label">当前版本：</span>
                      <span className="value">{currentVersion}</span>
                    </div>
                    <div className="version-detail-item">
                      <span className="label">最新版本：</span>
                      <span className="value">{latestVersion}</span>
                    </div>
                    <div className="version-detail-item">
                      <span className="label">发布时间：</span>
                      <span className="value">2025年7月18日</span>
                    </div>
                  </div>
                </div>

                <div className="update-warning">
                  <div className="warning-icon">⚠️</div>
                  <div className="warning-content">
                    <strong>重要提示：</strong>
                    <p>更新过程需要刷新页面，请确保已保存重要数据。更新完成后，应用将自动重新加载。</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 详情对话框底部 */}
            <div className="update-dialog-footer">
              <button
                className="btn-close-details"
                onClick={() => setShowDetailsDialog(false)}
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
