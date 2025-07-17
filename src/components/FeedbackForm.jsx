import React, { useState } from 'react';
import ConfirmDialog from './ConfirmDialog';
import CustomSelect from './CustomSelect';
import { getActiveFeedbackService } from '../config/feedback';
import { validateFormContent } from '../utils/contentFilter';

/**
 * @description 反馈表单组件 - 用于收集用户的功能建议和Bug反馈
 * @param {Object} props - 组件属性
 * @param {boolean} props.isOpen - 是否显示反馈表单
 * @param {Function} props.onClose - 关闭表单的回调函数
 * @returns {JSX.Element}
 */
function FeedbackForm({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    type: 'suggestion', // 'suggestion' 或 'bug'
    title: '',
    description: '',
    email: '',
    priority: 'medium'
  });
  
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [showContentWarningDialog, setShowContentWarningDialog] = useState(false);
  const [contentWarningMessage, setContentWarningMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedType, setSubmittedType] = useState(''); // 保存提交时的类型
  
  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 基本验证
    if (!formData.title.trim() || !formData.description.trim()) {
      setShowErrorDialog(true);
      return;
    }

    // 内容安全检查
    const contentValidation = validateFormContent(formData);
    if (!contentValidation.isValid) {
      const issuesList = contentValidation.issues.map(issue => `• ${issue}`).join('\n');
      setContentWarningMessage(`检测到以下问题：\n\n${issuesList}\n\n请修改后重新提交。`);
      setShowContentWarningDialog(true);
      return;
    }

    setIsSubmitting(true);

    try {
      const feedbackService = getActiveFeedbackService();
      const feedbackData = {
        type: formData.type,
        title: formData.title,
        description: formData.description,
        email: formData.email,
        priority: formData.priority,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      };

      let submitted = false;

      // 根据配置的服务类型进行提交
      switch (feedbackService.type) {
        case 'formspree':
          try {
            console.log('正在提交到 Formspree...', feedbackService.config.endpoint);
            const response = await fetch(feedbackService.config.endpoint, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              },
              body: JSON.stringify(feedbackData),
            });
            
            console.log('Formspree 响应状态:', response.status);
            const responseData = await response.text();
            console.log('Formspree 响应内容:', responseData);
            
            if (response.ok) {
              submitted = true;
              console.log('Formspree 提交成功');
            } else {
              console.warn('Formspree 提交失败:', response.status, responseData);
            }
          } catch (error) {
            console.warn('Formspree 提交异常:', error);
          }
          break;

        case 'netlify':
          try {
            const formData = new FormData();
            Object.keys(feedbackData).forEach(key => {
              formData.append(key, feedbackData[key]);
            });
            
            const response = await fetch(feedbackService.config.action, {
              method: 'POST',
              body: formData,
            });
            
            if (response.ok) {
              submitted = true;
            }
          } catch (error) {
            console.warn('Netlify Forms 提交失败，尝试其他方式:', error);
          }
          break;

        case 'customAPI':
          try {
            const response = await fetch(feedbackService.config.endpoint, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(feedbackData),
            });
            
            if (response.ok) {
              submitted = true;
            }
          } catch (error) {
            console.warn('自定义API提交失败，尝试其他方式:', error);
          }
          break;
      }

      // 如果在线服务都失败了，使用邮件降级方案
      if (!submitted) {
        console.log('在线服务提交失败，使用邮件降级方案');
        const subject = encodeURIComponent(`[${formData.type === 'suggestion' ? '功能建议' : 'Bug反馈'}] ${formData.title}`);
        const body = encodeURIComponent(`
类型: ${formData.type === 'suggestion' ? '💡 功能建议' : '🐛 Bug反馈'}
标题: ${formData.title}
${formData.type === 'bug' ? `优先级: ${formData.priority}` : ''}

详细描述:
${formData.description}

联系邮箱: ${formData.email || '未提供'}

---
时间: ${new Date().toLocaleString('zh-CN')}
页面: ${window.location.href}
浏览器: ${navigator.userAgent}
        `);
        
        const mailtoLink = `mailto:${feedbackService.config.address}?subject=${subject}&body=${body}`;
        
        // 尝试打开邮件客户端
        window.open(mailtoLink, '_blank');
        
        // 标记为已提交（使用邮件降级）
        submitted = true;
      }

      if (submitted) {
        console.log('反馈提交成功，显示成功对话框');
        
        // 保存提交时的类型
        setSubmittedType(formData.type);
        
        // 重置表单
        setFormData({
          type: 'suggestion',
          title: '',
          description: '',
          email: '',
          priority: 'medium'
        });
        
        // 显示成功对话框
        setShowSuccessDialog(true);
      } else {
        console.log('反馈提交失败，显示错误对话框');
        setShowErrorDialog(true);
      }
      
    } catch (error) {
      console.error('提交反馈异常:', error);
      setShowErrorDialog(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuccessDialogClose = () => {
    console.log('成功对话框关闭，同时关闭反馈表单');
    setShowSuccessDialog(false);
    onClose(); // 关闭反馈表单
  };

  const handleErrorDialogClose = () => {
    console.log('错误对话框关闭');
    setShowErrorDialog(false);
  };

  const handleContentWarningDialogClose = () => {
    console.log('内容警告对话框关闭');
    setShowContentWarningDialog(false);
  };

  return (
    <>
      {/* 遮罩层 */}
      <div className="feedback-overlay" onClick={handleOverlayClick}>
        {/* 反馈表单 */}
        <div className={`feedback-modal ${isOpen ? 'open' : ''}`} onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3>💬 反馈与建议</h3>
            <button className="close-btn" onClick={onClose}>
              <span className="close-btn-icon">✕</span>
            </button>
          </div>
        
        <div className="modal-content">
          <form onSubmit={handleSubmit} className="feedback-form">
            {/* 反馈类型 */}
            <div className="form-group">
              <label htmlFor="type" id="type-label">反馈类型</label>
              <CustomSelect
                id="type"
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                options={[
                  { value: 'suggestion', label: '功能建议', icon: '💡' },
                  { value: 'bug', label: 'Bug 反馈', icon: '🐛' }
                ]}
                className="feedback-custom-select"
              />
            </div>

            {/* 标题 */}
            <div className="form-group">
              <label htmlFor="title">
                {formData.type === 'suggestion' ? '建议标题' : 'Bug 标题'} *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder={formData.type === 'suggestion' 
                  ? '请简要描述您的功能建议...' 
                  : '请简要描述遇到的问题...'}
                className="form-input"
                maxLength={100}
              />
              <div className="char-count">{formData.title.length}/100</div>
            </div>

            {/* 详细描述 */}
            <div className="form-group">
              <label htmlFor="description">详细描述 *</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder={formData.type === 'suggestion' 
                  ? '请详细描述您希望添加的功能，以及它如何帮助提升用户体验...' 
                  : '请详细描述问题的具体表现、重现步骤、您的设备和浏览器信息等...'}
                className="form-textarea"
                rows={6}
                maxLength={1000}
              />
              <div className="char-count">{formData.description.length}/1000</div>
            </div>

            {/* 优先级（仅Bug反馈显示） */}
            {formData.type === 'bug' && (
              <div className="form-group">
                <label htmlFor="priority" id="priority-label">优先级</label>
                <CustomSelect
                  id="priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  options={[
                    { value: 'low', label: '低 - 小问题，不影响使用', icon: '🟢' },
                    { value: 'medium', label: '中 - 影响部分功能', icon: '🟡' },
                    { value: 'high', label: '高 - 严重影响使用', icon: '🔴' }
                  ]}
                  className="feedback-custom-select"
                />
              </div>
            )}

            {/* 联系邮箱（可选） */}
            <div className="form-group">
              <label htmlFor="email">联系邮箱（可选）</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="如需跟进讨论，请留下您的邮箱"
                className="form-input"
              />
            </div>

            {/* 提交按钮 */}
            <div className="form-actions">
              <button
                type="button"
                onClick={onClose}
                className="btn btn-secondary"
                disabled={isSubmitting}
              >
                取消
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting || !formData.title.trim() || !formData.description.trim()}
              >
                {isSubmitting ? (
                  <>
                    <span className="loading-spinner"></span>
                    提交中...
                  </>
                ) : (
                  <>
                    <span className="submit-icon">📤</span>
                    提交{formData.type === 'suggestion' ? '建议' : '反馈'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
      </div>

      {/* 成功提示对话框 */}
      <ConfirmDialog
        isOpen={showSuccessDialog}
        title="提交成功 🎉"
        message={`感谢您的${submittedType === 'suggestion' ? '建议' : '反馈'}！我们会认真考虑并尽快回复。`}
        confirmText="好的"
        cancelText={null}
        onConfirm={() => {
          console.log('成功对话框确认按钮被点击');
          handleSuccessDialogClose();
        }}
        onCancel={null}
        type="success"
      />

      {/* 错误提示对话框 */}
      <ConfirmDialog
        isOpen={showErrorDialog}
        title="提交失败 ❌"
        message="请确保标题和描述都已填写完整后再提交。"
        confirmText="好的"
        cancelText={null}
        onConfirm={handleErrorDialogClose}
        onCancel={handleErrorDialogClose}
        type="error"
      />

      {/* 内容警告对话框 */}
      <ConfirmDialog
        isOpen={showContentWarningDialog}
        title="内容检查警告 ⚠️"
        message={contentWarningMessage}
        confirmText="我知道了"
        cancelText={null}
        onConfirm={handleContentWarningDialogClose}
        onCancel={handleContentWarningDialogClose}
        type="warning"
      />
    </>
  );
}

export default FeedbackForm;
