import React, { useState } from 'react';
import CustomSelect from './CustomSelect';

/**
 * @description CustomSelect 组件演示页面
 * 专门展示美化后的下拉选择器效果
 */
function CustomSelectDemo() {
  const [selectedType, setSelectedType] = useState('suggestion');
  const [selectedPriority, setPriority] = useState('medium');
  const [selectedCategory, setCategory] = useState('ui');

  const typeOptions = [
    { value: 'suggestion', label: '功能建议', icon: '💡' },
    { value: 'bug', label: 'Bug反馈', icon: '🐛' },
    { value: 'improvement', label: '改进建议', icon: '⚡' },
    { value: 'question', label: '问题咨询', icon: '❓' }
  ];

  const priorityOptions = [
    { value: 'low', label: '低优先级', icon: '🔵' },
    { value: 'medium', label: '中优先级', icon: '🟡' },
    { value: 'high', label: '高优先级', icon: '🟠' },
    { value: 'urgent', label: '紧急', icon: '🔴' }
  ];

  const categoryOptions = [
    { value: 'ui', label: '界面设计', icon: '🎨' },
    { value: 'performance', label: '性能优化', icon: '⚡' },
    { value: 'feature', label: '新功能', icon: '✨' },
    { value: 'accessibility', label: '无障碍', icon: '♿' },
    { value: 'mobile', label: '移动端', icon: '📱' },
    { value: 'desktop', label: '桌面端', icon: '💻' }
  ];

  return (
    <div style={{ 
      padding: '40px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif'
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(20px)',
        borderRadius: '24px',
        padding: '40px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
      }}>
        <h1 style={{
          textAlign: 'center',
          color: 'white',
          marginBottom: '30px',
          fontSize: '2.5rem',
          fontWeight: '600'
        }}>
          CustomSelect 组件演示
        </h1>
        
        <p style={{
          textAlign: 'center',
          color: 'rgba(255, 255, 255, 0.8)',
          marginBottom: '40px',
          fontSize: '1.1rem'
        }}>
          展示美化后的自定义下拉选择器组件效果
        </p>

        <div style={{
          display: 'grid',
          gap: '30px',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))'
        }}>
          <div>
            <label style={{
              display: 'block',
              marginBottom: '12px',
              color: 'white',
              fontSize: '1.1rem',
              fontWeight: '500'
            }}>
              反馈类型
            </label>
            <CustomSelect
              id="type-demo"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              options={typeOptions}
            />
          </div>

          <div>
            <label style={{
              display: 'block',
              marginBottom: '12px',
              color: 'white',
              fontSize: '1.1rem',
              fontWeight: '500'
            }}>
              优先级
            </label>
            <CustomSelect
              id="priority-demo"
              value={selectedPriority}
              onChange={(e) => setPriority(e.target.value)}
              options={priorityOptions}
            />
          </div>

          <div>
            <label style={{
              display: 'block',
              marginBottom: '12px',
              color: 'white',
              fontSize: '1.1rem',
              fontWeight: '500'
            }}>
              分类
            </label>
            <CustomSelect
              id="category-demo"
              value={selectedCategory}
              onChange={(e) => setCategory(e.target.value)}
              options={categoryOptions}
            />
          </div>
        </div>

        <div style={{
          marginTop: '40px',
          padding: '24px',
          background: 'rgba(255, 255, 255, 0.15)',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
        }}>
          <h3 style={{
            color: 'white',
            marginBottom: '20px',
            fontSize: '1.4rem',
            textAlign: 'center'
          }}>
            📊 当前选择状态
          </h3>
          <div style={{
            display: 'grid',
            gap: '15px',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            color: 'rgba(255, 255, 255, 0.95)',
            lineHeight: '1.6',
            fontSize: '1rem'
          }}>
            <div style={{
              padding: '15px',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '1.8rem', marginBottom: '8px' }}>
                {typeOptions.find(opt => opt.value === selectedType)?.icon}
              </div>
              <div style={{ fontWeight: '600', marginBottom: '4px' }}>反馈类型</div>
              <div style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                {typeOptions.find(opt => opt.value === selectedType)?.label}
              </div>
            </div>
            
            <div style={{
              padding: '15px',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '1.8rem', marginBottom: '8px' }}>
                {priorityOptions.find(opt => opt.value === selectedPriority)?.icon}
              </div>
              <div style={{ fontWeight: '600', marginBottom: '4px' }}>优先级</div>
              <div style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                {priorityOptions.find(opt => opt.value === selectedPriority)?.label}
              </div>
            </div>
            
            <div style={{
              padding: '15px',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '1.8rem', marginBottom: '8px' }}>
                {categoryOptions.find(opt => opt.value === selectedCategory)?.icon}
              </div>
              <div style={{ fontWeight: '600', marginBottom: '4px' }}>分类</div>
              <div style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                {categoryOptions.find(opt => opt.value === selectedCategory)?.label}
              </div>
            </div>
          </div>
          
          <div style={{
            marginTop: '20px',
            padding: '15px',
            background: 'rgba(255, 255, 255, 0.08)',
            borderRadius: '12px',
            textAlign: 'center',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <div style={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.7)' }}>
              💡 试试点击上面的下拉框选择不同的选项，观察这里的实时变化！
            </div>
          </div>
        </div>

        <div style={{
          marginTop: '30px',
          textAlign: 'center'
        }}>
          <button 
            onClick={() => window.location.href = '/'} 
            style={{
              padding: '12px 24px',
              background: 'rgba(255, 255, 255, 0.2)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '12px',
              color: 'white',
              fontSize: '1rem',
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
            返回主应用
          </button>
        </div>
      </div>
    </div>
  );
}

export default CustomSelectDemo;
