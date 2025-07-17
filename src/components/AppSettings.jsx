import React, { useRef, useState } from 'react';
import ConfirmDialog from './ConfirmDialog';
import PrivacySettings from './PrivacySettings';
import PrivacyPolicy from './PrivacyPolicy';
import CustomSelect from './CustomSelect';
import { useTheme, THEME_MODES, getThemeDisplayName } from '../utils/themeManager';

/**
 * @description 应用设置组件 - 包含主题设置、数据管理、隐私设置
 * @param {Object} props - 组件属性
 * @param {Function} props.onExport - 导出函数
 * @param {Function} props.onImport - 导入函数
 * @param {Function} props.onClearAll - 清除所有数据函数
 * @param {number} props.totalItems - 当前数据总数
 * @returns {JSX.Element}
 */
function AppSettings({ onExport, onImport, onClearAll, totalItems }) {
  const fileInputRef = useRef(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importMode, setImportMode] = useState('replace'); // 'replace' 或 'merge'
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showPrivacySettings, setShowPrivacySettings] = useState(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [errorDialog, setErrorDialog] = useState({ show: false, title: '', message: '' });
  
  // 使用主题hook
  const { mode, actualTheme, setThemeMode } = useTheme();

  // 显示消息
  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  // 处理导出
  const handleExport = async () => {
    try {
      const success = await onExport();
      if (success) {
        showMessage('success', '数据导出成功！');
      } else {
        showMessage('error', '导出失败，请重试');
      }
    } catch {
      showMessage('error', '导出过程中发生错误');
    }
  };

  // 处理导入
  const handleImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // 验证文件类型
    if (!file.name.endsWith('.json')) {
      setErrorDialog({
        show: true,
        title: '文件类型错误',
        message: '请选择 JSON 格式的文件。支持从本应用导出的 JSON 文件或隐私设置导出的数据文件。'
      });
      return;
    }

    setIsImporting(true);
    
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      // 检查是否是隐私设置导出的数据格式
      let importData = data;
      let isPrivacyExport = false;
      
      if (data.exportDate && data.privacyInfo && data.userData) {
        // 这是从隐私设置导出的数据格式
        isPrivacyExport = true;
        const userData = data.userData;
        console.log('检测到隐私导出格式，userData内容:', userData);
        console.log('查找 ylingtech-todo-app 数据:', userData['ylingtech-todo-app']);
        
        // 验证隐私导出数据是否包含待办事项
        // 检查是否有 ylingtech-todo-app 对象，以及其中是否有 todos 数组
        if (!userData['ylingtech-todo-app']) {
          setErrorDialog({
            show: true,
            title: '数据格式错误',
            message: '隐私导出文件中未找到待办事项数据结构。请确认文件是否为本应用导出的隐私数据文件。'
          });
          return;
        }
        
        const todoData = userData['ylingtech-todo-app'];
        if (!todoData.todos || !Array.isArray(todoData.todos)) {
          setErrorDialog({
            show: true,
            title: '数据格式错误',
            message: '隐私导出文件中的待办事项数据格式不正确。请确认文件完整性。'
          });
          return;
        }
        
        if (todoData.todos.length === 0) {
          setErrorDialog({
            show: true,
            title: '数据为空',
            message: '隐私导出文件中没有待办事项数据。文件格式正确但不包含任何待办事项。'
          });
          return;
        }
        
        // 将隐私导出格式转换为标准导入格式
        importData = userData['ylingtech-todo-app'];
      }
      
      const result = await onImport(importData, importMode);
      if (result.success) {
        const sourceText = isPrivacyExport ? ' （来自隐私导出文件）' : '';
        showMessage('success', `数据${importMode === 'replace' ? '替换' : '合并'}成功！导入了 ${result.count} 个待办事项。${sourceText}`);
      } else {
        setErrorDialog({
          show: true,
          title: result.error || '导入失败',
          message: result.details || '导入过程中发生错误，请重试。'
        });
      }
    } catch (error) {
      console.error('导入错误:', error);
      setErrorDialog({
        show: true,
        title: 'JSON 格式错误',
        message: '无法解析选择的文件。请确保选择的是有效的 JSON 格式文件。支持本应用导出的文件或隐私设置导出的数据文件。'
      });
    } finally {
      setIsImporting(false);
      // 清空文件选择
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // 处理清除数据确认
  const handleClearAll = () => {
    setShowConfirmDialog(true);
  };

  const confirmClearAll = async () => {
    try {
      await onClearAll();
      showMessage('success', '数据清除成功！');
    } catch {
      showMessage('error', '清除数据失败');
    }
    setShowConfirmDialog(false);
  };

  const cancelClearAll = () => {
    setShowConfirmDialog(false);
  };

  // 主题选项
  const themeOptions = [
    { value: THEME_MODES.LIGHT, label: getThemeDisplayName(THEME_MODES.LIGHT), icon: '☀️' },
    { value: THEME_MODES.DARK, label: getThemeDisplayName(THEME_MODES.DARK), icon: '🌙' },
    { value: THEME_MODES.SYSTEM, label: getThemeDisplayName(THEME_MODES.SYSTEM), icon: '🔄' }
  ];

  // 导入模式选项
  const importModeOptions = [
    { value: 'replace', label: '替换现有数据', icon: '🔄' },
    { value: 'merge', label: '合并到现有数据', icon: '🔀' }
  ];

  return (
    <div className="app-settings">
      {/* 消息提示 */}
      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      {/* 主题设置部分 */}
      <div className="settings-section">
        <h3 className="section-title">
          <span className="section-icon section-theme-icon">🍀</span>
          主题设置
        </h3>
        <div className="theme-settings">
          <div className="current-theme">
            <span className="current-theme-label">当前主题：</span>
            <span className={`current-theme-value theme-${actualTheme}`}>
              {actualTheme === 'light' ? '☀️ 浅色' : '🌙 深色'}
            </span>
          </div>
          <div className="theme-options">
            {themeOptions.map(option => (
              <button
                key={option.value}
                className={`theme-option ${mode === option.value ? 'active' : ''}`}
                onClick={() => setThemeMode(option.value)}
              >
                <span className="theme-icon">{option.icon}</span>
                <span className="theme-label">{option.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 数据管理部分 */}
      <div className="settings-section">
        <h3 className="section-title">
          <span className="section-icon">💾</span>
          数据管理
        </h3>
        <div className="data-stats">
          <div className="stat-item">
            <span className="stat-label">待办事项总数</span>
            <span className="stat-value">{totalItems}</span>
          </div>
        </div>
        
        <div className="data-actions">
          <div className="action-group import-export-group">
            <h4>导入/导出</h4>
            <div className="action-buttons">
              <button 
                className="action-btn export"
                onClick={handleExport}
                disabled={totalItems === 0}
              >
                📤 导出数据
              </button>
              <div className="form-group">
                <h4>导入模式</h4>
                <CustomSelect
                  id="import-mode"
                  name="import-mode"
                  value={importMode}
                  onChange={(e) => setImportMode(e.target.value)}
                  options={importModeOptions}
                  className="feedback-custom-select"
                />
              </div>
              <button 
                className="action-btn import"
                onClick={() => fileInputRef.current?.click()}
                disabled={isImporting}
              >
                {isImporting ? '📥 导入中...' : '📥 导入数据'}
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImport}
                accept=".json"
                style={{ display: 'none' }}
              />
            </div>
          </div>

          <div className="action-group danger">
            <h4>危险操作</h4>
            <button 
              className="action-btn danger"
              onClick={handleClearAll}
              disabled={totalItems === 0}
            >
              🗑️ 清除所有数据
            </button>
          </div>
        </div>
      </div>

      {/* 隐私设置部分 */}
      <div className="settings-section">
        <h3 className="section-title">
          <span className="section-icon">🔒</span>
          隐私与法律
        </h3>
        <div className="privacy-actions">
          <button 
            className="action-btn privacy"
            onClick={() => setShowPrivacyPolicy(true)}
          >
            📄 查看隐私政策
          </button>
          <button 
            className="action-btn privacy"
            onClick={() => setShowPrivacySettings(true)}
          >
            ⚙️ 隐私设置
          </button>
        </div>
      </div>

      {/* 确认对话框 */}
      <ConfirmDialog
        isOpen={showConfirmDialog}
        title="确认清除数据"
        message={`确定要清除所有 ${totalItems} 个待办事项吗？此操作不可撤销！`}
        confirmText="确认清除"
        cancelText="取消"
        onConfirm={confirmClearAll}
        onCancel={cancelClearAll}
        type="danger"
      />

      {/* 隐私政策 */}
      <PrivacyPolicy 
        isOpen={showPrivacyPolicy} 
        onClose={() => setShowPrivacyPolicy(false)} 
      />

      {/* 错误对话框 */}
      {errorDialog.show && (
        <ConfirmDialog
          isOpen={errorDialog.show}
          title={errorDialog.title}
          message={errorDialog.message}
          confirmText="确定"
          onConfirm={() => setErrorDialog({ show: false, title: '', message: '' })}
          onCancel={() => setErrorDialog({ show: false, title: '', message: '' })}
          showCancel={false}
        />
      )}

      {/* 隐私设置 */}
      <PrivacySettings 
        isOpen={showPrivacySettings} 
        onClose={() => setShowPrivacySettings(false)}
        onDataCleared={onClearAll}
      />
    </div>
  );
}

export default AppSettings;
