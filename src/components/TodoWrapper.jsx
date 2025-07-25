import React, { useState, useEffect } from "react";
import { useTodos } from "../hooks/useTodos";
import CreateForm from "./CreateForm";
import TodoList from "./TodoList";
import TodoStats from "./TodoStats";
import TodoFilter from "./TodoFilter";
import AppSettings from "./AppSettings";
import ThemeToggle from "./ThemeToggle";
import Donate from "./Donate";
import FeedbackManager from "./FeedbackManager";

/**
 * @description Todo应用的主容器组件
 * @param {Object} props - 组件属性
 * @param {string} props.title - 应用标题
 * @param {boolean} props.showStats - 是否显示统计信息
 * @param {boolean} props.showFilter - 是否显示过滤器
 * @param {boolean} props.showDataManager - 是否显示数据管理功能
 * @returns {JSX.Element}
 */
function TodoWrapper({ 
  title = "待办事项", 
  showStats = true,
  showFilter = true,
  showDataManager = true,
  showDonate = true
}) {
  const { todos, stats, actions } = useTodos();
  const [currentFilter, setCurrentFilter] = useState('all');
  const [showAppSettingsPanel, setShowAppSettingsPanel] = useState(false);
  const [showDonatePanel, setShowDonatePanel] = useState(false);
  const [showFeedbackManager, setShowFeedbackManager] = useState(false);

  // 监听ESC键关闭侧边栏，以及检查URL参数
  useEffect(() => {
    const handleKeyDown = (event) => {
      // ESC键关闭所有面板
      if (event.key === 'Escape') {
        if (showAppSettingsPanel) {
          setShowAppSettingsPanel(false);
        }
        if (showDonatePanel) {
          setShowDonatePanel(false);
        }
        if (showFeedbackManager) {
          setShowFeedbackManager(false);
          // 移除URL参数
          const url = new URL(window.location);
          url.searchParams.delete('admin');
          window.history.replaceState({}, '', url);
        }
      }
    };

    // 检查URL参数
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('admin') === 'feedback') {
      setShowFeedbackManager(true);
    }

    // 监听URL变化
    const handlePopState = () => {
      const urlParams = new URLSearchParams(window.location.search);
      setShowFeedbackManager(urlParams.get('admin') === 'feedback');
    };

    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('popstate', handlePopState);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [showAppSettingsPanel, showDonatePanel, showFeedbackManager]);

  // 自适应标题字体大小
  useEffect(() => {
    let tooltipCleanup = null;

    const adjustTitleFontSize = () => {
      const titleElement = document.querySelector('.header-content h1');
      if (!titleElement) return;

      const tooltipContainer = document.querySelector('.header-content .tooltip');
      if (!tooltipContainer) return;

      // 强制重置字体大小到CSS默认值
      titleElement.style.fontSize = '';
      
      // 触发重新计算（强制浏览器重新应用CSS）
      titleElement.offsetHeight;
      
      // 获取tooltip容器的实际可用宽度
      const containerRect = tooltipContainer.getBoundingClientRect();
      const containerWidth = containerRect.width;
      const titleText = title;
      
      // 获取CSS设置的初始字体大小
      let fontSize = parseFloat(window.getComputedStyle(titleElement).fontSize);
      const minFontSize = window.innerWidth <= 360 ? 18 : window.innerWidth <= 480 ? 20 : window.innerWidth <= 768 ? 24 : 28; // 恢复合理的最小字体
      
      // 创建测试元素来测量文本宽度
      const testElement = document.createElement('span');
      testElement.style.visibility = 'hidden';
      testElement.style.position = 'absolute';
      testElement.style.whiteSpace = 'nowrap';
      testElement.style.fontFamily = window.getComputedStyle(titleElement).fontFamily;
      testElement.style.fontWeight = window.getComputedStyle(titleElement).fontWeight;
      testElement.textContent = titleText;
      document.body.appendChild(testElement);
      
      while (fontSize > minFontSize) {
        testElement.style.fontSize = fontSize + 'px';
        // 桌面端不需要预留图标空间
        const reservedSpace = 0;
        if (testElement.offsetWidth <= (containerWidth - reservedSpace)) {
          break;
        }
        fontSize -= 2;
      }
      
      document.body.removeChild(testElement);
      
      // 只有当需要缩小时才设置自定义字体大小
      const currentCSSFontSize = parseFloat(window.getComputedStyle(titleElement).fontSize);
      if (fontSize < currentCSSFontSize) {
        titleElement.style.fontSize = fontSize + 'px';
      }
    };

    const handleTooltipToggle = () => {
      const tooltipContainer = document.querySelector('.header-content .tooltip');
      const tooltipText = document.querySelector('.header-content .tooltip .tooltip-text');
      
      if (!tooltipContainer || !tooltipText) return;

      let touchTimeout = null;

      // 移动端触摸事件处理
      const handleTouch = (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        // 创建或获取全局tooltip
        let globalTooltip = document.getElementById('global-title-tooltip');
        if (!globalTooltip) {
          globalTooltip = document.createElement('div');
          globalTooltip.id = 'global-title-tooltip';
          globalTooltip.className = 'global-tooltip';
          globalTooltip.textContent = title;
          document.body.appendChild(globalTooltip);
        } else {
          globalTooltip.textContent = title;
        }
        
        // 计算位置
        const titleElement = document.querySelector('.header-content h1');
        const titleRect = titleElement.getBoundingClientRect();
        
        // 动态计算tooltip位置，确保在标题下方且居中对齐
        const screenWidth = window.innerWidth;
        let dynamicTop, dynamicLeft, fontSize;
        
        // 根据屏幕尺寸调整位置和字体大小
        if (screenWidth <= 360) {
          dynamicTop = titleRect.bottom + 6;
          fontSize = '12px';
        } else if (screenWidth <= 480) {
          dynamicTop = titleRect.bottom + 8;
          fontSize = '13px';
        } else if (screenWidth <= 768) {
          dynamicTop = titleRect.bottom + 10;
          fontSize = '14px';
        } else {
          dynamicTop = titleRect.bottom + 12;
          fontSize = '16px';
        }
        
        // 标题水平中心位置
        dynamicLeft = titleRect.left + (titleRect.width / 2);
        
        // 设置样式和位置
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        Object.assign(globalTooltip.style, {
          position: 'fixed',
          top: dynamicTop + 'px',
          left: dynamicLeft + 'px',
          transform: 'translateX(-50%)',
          backgroundColor: isDark ? 'rgba(35, 35, 35, 0.95)' : 'rgba(0, 0, 0, 0.9)',
          color: isDark ? '#fff' : 'white',
          padding: screenWidth <= 480 ? '8px 12px' : '12px 16px',
          borderRadius: '8px',
          fontSize: fontSize,
          fontWeight: '600',
          zIndex: '999999',
          pointerEvents: 'none',
          maxWidth: screenWidth <= 480 ? '75vw' : '85vw',
          textAlign: 'center',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          backdropFilter: 'blur(10px)',
          border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
          visibility: 'visible',
          opacity: '1',
          transition: 'all 0.3s ease'
        });
        
        // 清除之前的定时器
        if (touchTimeout) {
          clearTimeout(touchTimeout);
        }
        
        // 3秒后自动隐藏
        touchTimeout = setTimeout(() => {
          if (globalTooltip) {
            globalTooltip.style.visibility = 'hidden';
            globalTooltip.style.opacity = '0';
          }
        }, 3000);
      };

      // 点击其他地方隐藏tooltip
      const handleDocumentClick = (e) => {
        if (!tooltipContainer.contains(e.target)) {
          const globalTooltip = document.getElementById('global-title-tooltip');
          if (globalTooltip) {
            globalTooltip.style.visibility = 'hidden';
            globalTooltip.style.opacity = '0';
          }
          if (touchTimeout) {
            clearTimeout(touchTimeout);
          }
        }
      };

      // 检测移动端设备 - 更保守的检测逻辑，确保桌面端不被误判
      const screenWidth = window.innerWidth;
      const hasTouchSupport = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const isRealMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      // 只有在小屏幕且真正的移动设备时才绑定触摸事件
      const shouldBindTouchEvents = (screenWidth <= 768) && (isRealMobile || (hasTouchSupport && screenWidth <= 480));
      
      console.log('详细设备检测:', { 
        screenWidth,
        hasTouchSupport,
        isRealMobile,
        shouldBindTouchEvents,
        userAgent: navigator.userAgent
      });
      
      if (shouldBindTouchEvents) {
        console.log('绑定移动端tooltip事件到标题元素');
        
        // 只绑定到h1元素
        const titleElement = document.querySelector('.header-content .tooltip h1');
        if (titleElement) {
          const handleTitleTouch = (e) => {
            e.stopPropagation(); // 阻止事件冒泡
            handleTouch(e);
          };
          
          titleElement.addEventListener('touchstart', handleTitleTouch, { passive: false });
          titleElement.addEventListener('click', handleTitleTouch);
          document.addEventListener('click', handleDocumentClick);
          
          console.log('移动端tooltip事件已绑定到标题元素');
          
          // 返回清理函数
          return () => {
            console.log('清理移动端tooltip事件');
            titleElement.removeEventListener('touchstart', handleTitleTouch);
            titleElement.removeEventListener('click', handleTitleTouch);
            document.removeEventListener('click', handleDocumentClick);
            if (touchTimeout) {
              clearTimeout(touchTimeout);
            }
            // 清理全局tooltip
            const globalTooltip = document.getElementById('global-title-tooltip');
            if (globalTooltip) {
              globalTooltip.remove();
            }
          };
        }
      } else {
        console.log('桌面端环境，完全不绑定JavaScript事件，使用纯CSS hover');
        // 桌面端确保没有任何JavaScript事件干扰
        return null;
      }
    };

    // 延迟执行以确保DOM已渲染
    const timeoutId = setTimeout(() => {
      adjustTitleFontSize();
      tooltipCleanup = handleTooltipToggle();
    }, 100);

    // 防抖的resize处理函数
    let resizeTimeout;
    const debouncedResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        console.log('窗口大小变化，重新计算字体大小');
        adjustTitleFontSize();
        // 同时重新绑定tooltip事件（如果设备类型可能改变）
        if (tooltipCleanup) {
          tooltipCleanup();
        }
        tooltipCleanup = handleTooltipToggle();
      }, 150); // 150ms防抖
    };

    // 监听窗口大小变化
    window.addEventListener('resize', debouncedResize);

    return () => {
      clearTimeout(timeoutId);
      clearTimeout(resizeTimeout);
      window.removeEventListener('resize', debouncedResize);
      if (tooltipCleanup) {
        tooltipCleanup();
      }
    };
  }, [title]);

  const {
    addTodo,
    deleteTodo,
    editTodo,
    toggleCompletion,
    toggleEditing,
    clearCompleted,
    toggleAllCompletion,
    exportTodos,
    importTodos,
    clearAllData
  } = actions;

  return (
    <div className="todo-app-container">
      <div className="todo-wrapper">
        <header className="todo-header">
          <div className="header-content">
            {showDonate && (
              <button 
                className="donate-toggle"
                onClick={() => setShowDonatePanel(true)}
                title="支持开发"
              >
                💝
              </button>
            )}
            <div className="tooltip" tabIndex="0">
              <h1 title={title}>{title}</h1>
              <span className="tooltip-text">{title}</span>
            </div>
            <div className="header-actions">
              <ThemeToggle />
              {showDataManager && (
                <button 
                  className="app-settings-toggle"
                  onClick={() => setShowAppSettingsPanel(true)}
                  title="应用设置"
                >
                  ⚙️
                </button>
              )}
            </div>
          </div>
          {showStats && (
            <TodoStats 
              stats={stats}
              onClearCompleted={clearCompleted}
              onToggleAll={toggleAllCompletion}
            />
          )}
        </header>

        <main className="todo-main">
          <CreateForm addTodo={addTodo} />
          
          {showFilter && todos.length > 0 && (
            <TodoFilter 
              currentFilter={currentFilter}
              onFilterChange={setCurrentFilter}
              stats={stats}
            />
          )}
          
          <div className="todo-content">
            <TodoList
              todos={todos}
              deleteTodo={deleteTodo}
              editTodo={editTodo}
              toggleCompletion={toggleCompletion}
              toggleEditing={toggleEditing}
              filter={currentFilter}
            />
          </div>
        </main>
      </div>

      {/* 应用设置侧边栏 */}
      {showDataManager && (
        <>
          {showAppSettingsPanel && (
            <div 
              className="data-manager-overlay"
              onClick={() => setShowAppSettingsPanel(false)}
            />
          )}
          <div className={`app-settings-sidebar ${showAppSettingsPanel ? 'open' : ''}`}>
            <div className="sidebar-header">
              <h3>
                <span className="header-icon">⚙️</span>
                应用设置
              </h3>
              <button 
                className="close-btn"
                onClick={() => setShowAppSettingsPanel(false)}
                title="关闭"
              >
                <span className="close-btn-icon">✕</span>
              </button>
            </div>
            <div className="sidebar-content">
              <AppSettings
                onExport={exportTodos}
                onImport={importTodos}
                onClearAll={clearAllData}
                totalItems={stats.total}
              />
            </div>
          </div>
        </>
      )}

      {/* 捐赠面板 */}
      <Donate
        isOpen={showDonatePanel}
        onClose={() => setShowDonatePanel(false)}
      />

      {/* 反馈管理器（通过 ?admin=feedback 访问） */}
      {showFeedbackManager && (
        <FeedbackManager
          isOpen={showFeedbackManager}
          onClose={() => setShowFeedbackManager(false)}
        />
      )}
    </div>
  );
}

export default TodoWrapper;
