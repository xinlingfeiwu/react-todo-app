import React from 'react';

// 简单的测试组件来验证React正常工作
export default function SimpleTest() {
  return (
    <div style={{
      padding: '20px',
      backgroundColor: '#f0f0f0',
      margin: '10px',
      borderRadius: '8px',
      border: '2px solid #007bff'
    }}>
      <h2>✅ React 测试组件</h2>
      <p>如果你能看到这个组件，说明React正在正常工作！</p>
      <p>时间: {new Date().toLocaleString()}</p>
    </div>
  );
}
