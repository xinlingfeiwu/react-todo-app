import React, { useState } from 'react';
import FeedbackForm from './FeedbackForm';

/**
 * @description 反馈表单测试页面
 */
function FeedbackTest() {
  const [showForm, setShowForm] = useState(false);

  return (
    <div style={{ 
      padding: '40px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif'
    }}>
      <div style={{
        maxWidth: '600px',
        margin: '0 auto',
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(20px)',
        borderRadius: '24px',
        padding: '40px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        textAlign: 'center'
      }}>
        <h1 style={{
          color: 'white',
          marginBottom: '20px',
          fontSize: '2.2rem',
          fontWeight: '600'
        }}>
          🧪 反馈表单测试
        </h1>
        
        <p style={{
          color: 'rgba(255, 255, 255, 0.8)',
          marginBottom: '30px',
          fontSize: '1.1rem',
          lineHeight: '1.6'
        }}>
          测试反馈表单的提交功能，包括：
          <br />
          • Formspree 在线提交
          <br />
          • 邮件降级方案
          <br />
          • 成功/失败提示对话框
          <br />
          • 表单自动关闭功能
          <br />
          • 敏感词和恶意内容过滤
        </p>

        <button 
          onClick={() => setShowForm(true)}
          style={{
            padding: '15px 30px',
            background: 'rgba(255, 255, 255, 0.2)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '12px',
            color: 'white',
            fontSize: '1.1rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            backdropFilter: 'blur(10px)'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(255, 255, 255, 0.3)';
            e.target.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'rgba(255, 255, 255, 0.2)';
            e.target.style.transform = 'translateY(0)';
          }}
        >
          📝 打开反馈表单
        </button>

        <div style={{
          marginTop: '30px',
          padding: '20px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          textAlign: 'left'
        }}>
          <h3 style={{
            color: 'white',
            marginBottom: '15px',
            fontSize: '1.3rem'
          }}>
            🔍 测试要点：
          </h3>
          <ul style={{
            color: 'rgba(255, 255, 255, 0.9)',
            lineHeight: '1.8',
            paddingLeft: '20px'
          }}>
            <li>填写表单并提交，观察控制台日志</li>
            <li>检查是否显示"提交成功"对话框</li>
            <li>确认对话框关闭后表单是否自动关闭</li>
            <li>验证表单字段是否重置为默认值</li>
            <li>测试空字段提交是否正确显示错误提示</li>
            <li>测试敏感词检测：尝试输入"政治"、"暴力"等敏感词</li>
            <li>测试恶意内容检测：尝试输入网址、重复字符等</li>
          </ul>
        </div>

        <div style={{
          marginTop: '20px',
          textAlign: 'center'
        }}>
          <button 
            onClick={() => window.location.href = '/'} 
            style={{
              padding: '10px 20px',
              background: 'transparent',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '8px',
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: '0.9rem',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.color = 'white';
              e.target.style.borderColor = 'rgba(255, 255, 255, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.target.style.color = 'rgba(255, 255, 255, 0.8)';
              e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)';
            }}
          >
            返回主应用
          </button>
        </div>
      </div>

      {/* 反馈表单 */}
      <FeedbackForm 
        isOpen={showForm}
        onClose={() => {
          console.log('FeedbackTest: 反馈表单关闭');
          setShowForm(false);
        }}
      />
    </div>
  );
}

export default FeedbackTest;
