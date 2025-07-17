import React, { useState, useEffect } from 'react';
import ConfirmDialog from './ConfirmDialog';
import { 
  getPrivacySummary, 
  resetPrivacySettings, 
  clearAppData, 
  exportUserData 
} from '../utils/privacyManager';

/**
 * @description 隐私设置管理组件
 * @param {Object} props - 组件属性
 * @param {boolean} props.isOpen - 是否显示
 * @param {Function} props.onClose - 关闭回调
 * @param {Function} props.onDataCleared - 数据清除后的回调函数
 * @returns {JSX.Element}
 */
function PrivacySettings({ isOpen, onClose, onDataCleared }) {
  const [privacyInfo, setPrivacyInfo] = useState(null);
  const [showConfirm, setShowConfirm] = useState(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setPrivacyInfo(getPrivacySummary());
    }
  }, [isOpen]);

  const handleExportData = () => {
    try {
      const userData = exportUserData();
      const blob = new Blob([JSON.stringify(userData, null, 2)], {
        type: 'application/json'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `my-todos-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      // 显示成功提示
      setShowSuccessDialog({
        type: 'success',
        title: '导出成功 📥',
        message: '数据已成功导出到您的下载文件夹！'
      });
    } catch (error) {
      console.error('导出数据失败:', error);
      setShowSuccessDialog({
        type: 'error',
        title: '导出失败 ❌',
        message: '导出过程中发生错误，请重试。'
      });
    }
  };

  const handleClearData = () => {
    if (showConfirm === 'clear') {
      const success = clearAppData();
      setPrivacyInfo(getPrivacySummary());
      setShowConfirm(null);
      
      if (success) {
        // 通知父组件数据已清除，更新应用状态
        if (onDataCleared) {
          onDataCleared();
        }
        
        setShowSuccessDialog({
          type: 'success',
          title: '清除成功 🗑️',
          message: '应用数据已成功清除！您的隐私设置已保留。'
        });
      } else {
        setShowSuccessDialog({
          type: 'error',
          title: '清除失败 ❌',
          message: '清除数据时发生错误，请重试。'
        });
      }
    } else {
      setShowConfirm('clear');
    }
  };

  const handleResetPrivacy = () => {
    if (showConfirm === 'reset') {
      resetPrivacySettings();
      setShowConfirm(null);
      setShowSuccessDialog({
        type: 'success',
        title: '重置成功 🔄',
        message: '隐私设置已重置，页面将在3秒后刷新...'
      });
      // 延迟刷新页面，给用户时间看到成功提示
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    } else {
      setShowConfirm('reset');
    }
  };

  // 关闭成功对话框
  const handleCloseSuccessDialog = () => {
    setShowSuccessDialog(null);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="privacy-settings-overlay" onClick={onClose}>
        <div className="privacy-settings-modal" onClick={e => e.stopPropagation()}>
          <div className="privacy-settings-header">
            <h2>隐私设置</h2>
            <button className="close-btn" onClick={onClose}>
              <span className="close-btn-icon">✕</span>
            </button>
          </div>
          
          <div className="privacy-settings-content">
            {privacyInfo && (
              <>
                {/* 当前状态 */}
                <section className="privacy-section">
                  <h3>当前状态</h3>
                  <div className="privacy-status">
                    <div className="status-item">
                      <span className="status-label">Cookie 同意状态:</span>
                      <span className={`status-value ${privacyInfo.consentStatus}`}>
                        {privacyInfo.consentStatus === 'accepted' ? '✅ 已同意' : 
                         privacyInfo.consentStatus === 'declined' ? '❌ 已拒绝' : '⏳ 未设置'}
                      </span>
                    </div>
                    {privacyInfo.consentDate && (
                      <div className="status-item">
                        <span className="status-label">设置时间:</span>
                        <span className="status-value">
                          {privacyInfo.consentDate.toLocaleString()}
                        </span>
                      </div>
                    )}
                    <div className="status-item">
                      <span className="status-label">存储数据项:</span>
                      <span className="status-value">{privacyInfo.dataKeysCount} 个</span>
                    </div>
                  </div>
                </section>

                {/* 数据管理 */}
                <section className="privacy-section">
                  <h3>数据管理</h3>
                  <div className="privacy-actions">
                    <button 
                      className="privacy-btn export"
                      onClick={handleExportData}
                    >
                      📥 导出我的数据
                    </button>
                    <button 
                      className="privacy-btn clear"
                      onClick={handleClearData}
                    >
                      {showConfirm === 'clear' ? '确认清除数据？' : '🗑️ 清除应用数据'}
                    </button>
                  </div>
                </section>

                {/* 隐私控制 */}
                <section className="privacy-section">
                  <h3>隐私控制</h3>
                  <div className="privacy-actions">
                    <button 
                      className="privacy-btn reset"
                      onClick={handleResetPrivacy}
                    >
                      {showConfirm === 'reset' ? '确认重置设置？' : '🔄 重置隐私设置'}
                    </button>
                  </div>
                  <p className="privacy-note">
                    重置后将重新显示 Cookie 同意提示
                  </p>
                </section>

                {/* 说明信息 */}
                <section className="privacy-section">
                  <h3>说明</h3>
                  <div className="privacy-info">
                    <p>
                      • 所有数据仅存储在您的设备上<br/>
                      • 我们不收集个人身份信息<br/>
                      • 您可以随时导出或删除数据<br/>
                      • 拒绝 Cookie 将限制某些功能
                    </p>
                  </div>
                </section>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 成功提示对话框 */}
      {showSuccessDialog && (
        <div className="privacy-success-dialog-wrapper">
          <ConfirmDialog
            isOpen={true}
            title={showSuccessDialog.title}
            message={showSuccessDialog.message}
            type={showSuccessDialog.type}
            showCancel={false}
            confirmText="确定"
            onConfirm={handleCloseSuccessDialog}
            onCancel={handleCloseSuccessDialog}
          />
        </div>
      )}
    </>
  );
}

export default PrivacySettings;
