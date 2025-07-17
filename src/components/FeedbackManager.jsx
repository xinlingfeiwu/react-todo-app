import React, { useState } from 'react';
import { FEEDBACK_CONFIG, getActiveFeedbackService } from '../config/feedback';

/**
 * @description 反馈管理组件 - 配置和管理反馈服务
 * @param {Object} props - 组件属性
 * @param {boolean} props.isOpen - 是否显示管理界面
 * @param {Function} props.onClose - 关闭界面的回调函数
 * @returns {JSX.Element}
 */
function FeedbackManager({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('config');
  const activeFeedbackService = getActiveFeedbackService();

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('已复制到剪贴板！');
    });
  };

  return (
    <>
      {/* 遮罩层 */}
      <div className="feedback-overlay" onClick={handleOverlayClick}></div>
      
      {/* 管理界面 */}
      <div className={`feedback-manager ${isOpen ? 'open' : ''}`}>
        <div className="manager-header">
          <h3>⚙️ 反馈服务配置</h3>
          <button className="close-btn" onClick={onClose}>
            <span className="close-btn-icon">✕</span>
          </button>
        </div>
        
        <div className="manager-content">
          {/* 标签页 */}
          <div className="tabs">
            <button 
              className={`tab ${activeTab === 'config' ? 'active' : ''}`}
              onClick={() => setActiveTab('config')}
            >
              📋 配置指南
            </button>
            <button 
              className={`tab ${activeTab === 'status' ? 'active' : ''}`}
              onClick={() => setActiveTab('status')}
            >
              🔍 当前状态
            </button>
          </div>

          <div className="tab-content">
            {activeTab === 'config' && (
              <div className="config-guide">
                <div className="service-card">
                  <h4>🌟 推荐：Formspree（免费）</h4>
                  <p>免费的表单后端服务，每月50次提交额度</p>
                  <div className="steps">
                    <div className="step">
                      <span className="step-number">1</span>
                      <div>
                        <strong>注册账户：</strong>
                        <a href="https://formspree.io/" target="_blank" rel="noopener noreferrer">
                          访问 formspree.io
                        </a>
                      </div>
                    </div>
                    <div className="step">
                      <span className="step-number">2</span>
                      <div>
                        <strong>创建表单：</strong>获取表单ID（类似：xeojabcd）
                      </div>
                    </div>
                    <div className="step">
                      <span className="step-number">3</span>
                      <div>
                        <strong>修改配置：</strong>编辑 <code>src/config/feedback.js</code>
                        <div className="code-block">
                          <pre>{`formspree: {
  enabled: true,
  endpoint: 'https://formspree.io/f/YOUR_FORM_ID'
}`}</pre>
                          <button 
                            onClick={() => copyToClipboard(`formspree: {
  enabled: true,
  endpoint: 'https://formspree.io/f/YOUR_FORM_ID'
}`)}
                            className="copy-btn"
                          >
                            📋 复制
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="service-card">
                  <h4>🚀 Netlify Forms</h4>
                  <p>如果您的应用部署在 Netlify 上，可以使用免费的 Netlify Forms</p>
                  <div className="steps">
                    <div className="step">
                      <span className="step-number">1</span>
                      <div>
                        <strong>部署到 Netlify：</strong>确保您的应用部署在 Netlify 上
                      </div>
                    </div>
                    <div className="step">
                      <span className="step-number">2</span>
                      <div>
                        <strong>修改配置：</strong>
                        <div className="code-block">
                          <pre>{`netlify: {
  enabled: true,
  action: '/feedback'
}`}</pre>
                          <button 
                            onClick={() => copyToClipboard(`netlify: {
  enabled: true,
  action: '/feedback'
}`)}
                            className="copy-btn"
                          >
                            📋 复制
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="service-card">
                  <h4>📧 邮件降级方案（默认）</h4>
                  <p>当其他服务不可用时，自动使用 mailto 链接</p>
                  <div className="steps">
                    <div className="step">
                      <span className="step-number">1</span>
                      <div>
                        <strong>修改邮箱：</strong>编辑配置文件中的邮箱地址
                        <div className="code-block">
                          <pre>{`email: {
  address: 'your-email@example.com',
  subject: '[待办清单反馈]'
}`}</pre>
                          <button 
                            onClick={() => copyToClipboard(`email: {
  address: 'your-email@example.com',
  subject: '[待办清单反馈]'
}`)}
                            className="copy-btn"
                          >
                            � 复制
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="service-card">
                  <h4>🔧 自定义 API</h4>
                  <p>如果您有自己的后端服务</p>
                  <div className="steps">
                    <div className="step">
                      <span className="step-number">1</span>
                      <div>
                        <strong>配置端点：</strong>
                        <div className="code-block">
                          <pre>{`customAPI: {
  enabled: true,
  endpoint: 'https://your-api.com/feedback'
}`}</pre>
                          <button 
                            onClick={() => copyToClipboard(`customAPI: {
  enabled: true,
  endpoint: 'https://your-api.com/feedback'
}`)}
                            className="copy-btn"
                          >
                            📋 复制
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'status' && (
              <div className="status-info">
                <div className="status-card">
                  <h4>🔍 当前配置状态</h4>
                  <div className="status-item">
                    <span className="status-label">激活的服务：</span>
                    <span className={`status-value ${activeFeedbackService.type}`}>
                      {activeFeedbackService.type === 'formspree' && '🌟 Formspree'}
                      {activeFeedbackService.type === 'netlify' && '🚀 Netlify Forms'}
                      {activeFeedbackService.type === 'customAPI' && '� 自定义 API'}
                      {activeFeedbackService.type === 'email' && '� 邮件降级'}
                    </span>
                  </div>
                  
                  {activeFeedbackService.type === 'formspree' && (
                    <div className="status-item">
                      <span className="status-label">端点：</span>
                      <span className="status-value">{activeFeedbackService.config.endpoint}</span>
                    </div>
                  )}
                  
                  {activeFeedbackService.type === 'email' && (
                    <div className="status-item">
                      <span className="status-label">邮箱：</span>
                      <span className="status-value">{activeFeedbackService.config.address}</span>
                    </div>
                  )}
                </div>

                <div className="status-card">
                  <h4>📊 服务状态检查</h4>
                  <div className="service-status">
                    <div className="service-item">
                      <span className="service-name">Formspree</span>
                      <span className={`service-indicator ${FEEDBACK_CONFIG.formspree.enabled ? 'enabled' : 'disabled'}`}>
                        {FEEDBACK_CONFIG.formspree.enabled ? '✅ 已启用' : '⭕ 未启用'}
                      </span>
                    </div>
                    <div className="service-item">
                      <span className="service-name">Netlify Forms</span>
                      <span className={`service-indicator ${FEEDBACK_CONFIG.netlify.enabled ? 'enabled' : 'disabled'}`}>
                        {FEEDBACK_CONFIG.netlify.enabled ? '✅ 已启用' : '⭕ 未启用'}
                      </span>
                    </div>
                    <div className="service-item">
                      <span className="service-name">自定义 API</span>
                      <span className={`service-indicator ${FEEDBACK_CONFIG.customAPI.enabled ? 'enabled' : 'disabled'}`}>
                        {FEEDBACK_CONFIG.customAPI.enabled ? '✅ 已启用' : '⭕ 未启用'}
                      </span>
                    </div>
                    <div className="service-item">
                      <span className="service-name">邮件降级</span>
                      <span className="service-indicator enabled">✅ 始终可用</span>
                    </div>
                  </div>
                </div>

                <div className="status-card">
                  <h4>🔗 管理链接</h4>
                  <p>管理员可以通过以下链接访问此配置页面：</p>
                  <div className="management-links">
                    <div className="link-item">
                      <code>{window.location.origin}?admin=feedback</code>
                      <button 
                        onClick={() => copyToClipboard(`${window.location.origin}?admin=feedback`)}
                        className="copy-btn small"
                      >
                        📋
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default FeedbackManager;
