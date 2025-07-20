import React, { useState, useEffect } from 'react';
import { DONATION_RECORDS_KEY } from '../constants/storageKeys';
import { getDonationRecords, addDonationRecord } from '../utils/donationManager';

/**
 * @description 感谢榜组件 - 显示捐赠记录
 * @param {Object} props - 组件属性
 * @param {boolean} props.showAddDemo - 是否显示添加演示数据按钮
 * @returns {JSX.Element}
 */
function ThankYouList({ showAddDemo = false }) {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  // 加载捐赠记录
  useEffect(() => {
    loadDonations();
  }, []);

  const loadDonations = () => {
    try {
      const records = getDonationRecords();
      setDonations(records);
    } catch (error) {
      console.error('加载捐赠记录失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 添加演示数据（仅用于测试）
  const addDemoData = () => {
    const demoRecords = [
      { name: '匿名用户', amount: 5, method: 'alipay' },
      { name: 'React爱好者', amount: 10, method: 'wechat' },
      { name: '前端开发', amount: 8, method: 'alipay' },
      { name: '热心网友', amount: 20, method: 'wechat' },
      { name: '学生党', amount: 3, method: 'alipay' }
    ];

    demoRecords.forEach(record => {
      addDonationRecord(record.name, record.amount, record.method);
    });

    loadDonations();
  };

  // 清空记录（仅用于测试）
  const clearRecords = () => {
    localStorage.removeItem(DONATION_RECORDS_KEY);
    setDonations([]);
  };

  if (loading) {
    return (
      <div className="thank-you-section">
        <h4>🎉 感谢榜</h4>
        <div className="supporters-list">
          <div className="loading">
            <span>加载中...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="thank-you-section">
      <h4>🎉 感谢榜</h4>
      <p className="thank-note">感谢每一位支持者的慷慨捐赠！</p>
      
      <div className="supporters-list">
        {donations.length === 0 ? (
          <div className="no-supporters">
            <span className="empty-icon">💝</span>
            <span className="empty-message">暂无捐赠记录</span>
            <span className="empty-note">成为第一个支持者吧！</span>
          </div>
        ) : (
          <div className="supporters-grid">
            {donations.slice(0, 10).map((donation, index) => (
              <div key={donation.id} className="supporter-item">
                <span className="supporter-rank">#{index + 1}</span>
                <span className="supporter-name">{donation.name}</span>
                <span className="supporter-amount">¥{donation.amount}</span>
                <span className="supporter-method">
                  {donation.method === 'alipay' ? '💙' : '💚'}
                </span>
              </div>
            ))}
            {donations.length > 10 && (
              <div className="supporter-item more-supporters">
                <span className="more-text">还有 {donations.length - 10} 位支持者...</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 统计信息 */}
      {donations.length > 0 && (
        <div className="donation-stats">
          <div className="stat-item">
            <span className="stat-label">总支持者</span>
            <span className="stat-value">{donations.length}人</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">总金额</span>
            <span className="stat-value">
              ¥{donations.reduce((sum, d) => sum + d.amount, 0)}
            </span>
          </div>
        </div>
      )}

      {/* 开发测试按钮 - 正式环境应该移除 */}
      {showAddDemo && (
        <div className="demo-controls" style={{ marginTop: '10px', fontSize: '12px' }}>
          <button 
            onClick={addDemoData}
            style={{ 
              margin: '2px', 
              padding: '4px 8px', 
              fontSize: '11px',
              background: '#e3f2fd',
              border: '1px solid #2196f3',
              borderRadius: '3px',
              cursor: 'pointer'
            }}
          >
            添加演示数据
          </button>
          <button 
            onClick={clearRecords}
            style={{ 
              margin: '2px', 
              padding: '4px 8px', 
              fontSize: '11px',
              background: '#ffebee',
              border: '1px solid #f44336',
              borderRadius: '3px',
              cursor: 'pointer'
            }}
          >
            清空记录
          </button>
        </div>
      )}
    </div>
  );
}

export default ThankYouList;
