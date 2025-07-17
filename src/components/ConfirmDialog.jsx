import React from 'react';

/**
 * @description 确认对话框组件
 * @param {Object} props - 组件属性
 * @param {boolean} props.isOpen - 是否显示对话框
 * @param {string} props.title - 对话框标题
 * @param {string} props.message - 确认消息
 * @param {string} props.confirmText - 确认按钮文字
 * @param {string} props.cancelText - 取消按钮文字
 * @param {Function} props.onConfirm - 确认回调
 * @param {Function} props.onCancel - 取消回调
 * @param {string} props.type - 对话框类型 ('warning', 'danger', 'info', 'success', 'error')
 * @param {boolean} props.showCancel - 是否显示取消按钮
 * @returns {JSX.Element}
 */
function ConfirmDialog({ 
  isOpen, 
  title = '确认操作', 
  message, 
  confirmText = '确认', 
  cancelText = '取消',
  onConfirm, 
  onCancel,
  type = 'warning',
  showCancel = true
}) {
  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      if (onCancel) {
        onCancel();
      }
    }
  };

  return (
    <div className="confirm-dialog-overlay" onClick={handleOverlayClick}>
      <div className={`confirm-dialog ${type}`}>
        <div className="dialog-header">
          <h3>{title}</h3>
        </div>
        
        <div className="dialog-content">
          <p>{message}</p>
        </div>
        
        <div className="dialog-actions">
          {showCancel && cancelText && onCancel && (
            <button 
              className="btn-cancel" 
              onClick={onCancel}
            >
              {cancelText}
            </button>
          )}
          <button 
            className={`btn-confirm btn-${type}`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;
