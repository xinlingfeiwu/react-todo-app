import React, { useRef, useState } from 'react';
import ConfirmDialog from './ConfirmDialog';
import PrivacySettings from './PrivacySettings';
import PrivacyPolicy from './PrivacyPolicy';

/**
 * @description 数据管理组件 - 提供导入/导出功能
 * @param {Object} props - 组件属性
 * @param {Function} props.onExport - 导出函数
 * @param {Function} props.onImport - 导入函数
 * @param {Function} props.onClearAll - 清除所有数据函数
 * @param {number} props.totalItems - 当前数据总数
 * @returns {JSX.Element}
 */
function DataManager({ onExport, onImport, onClearAll, totalItems }) {
  const fileInputRef = useRef(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importMode, setImportMode] = useState('replace'); // 'replace' 或 'merge'
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showPrivacySettings, setShowPrivacySettings] = useState(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);

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
    } catch (error) {
      console.error('导出错误:', error);
      showMessage('error', '导出过程中发生错误');
    }
  };

  // 处理导入
  const handleImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // 验证文件类型
    if (!file.name.toLowerCase().endsWith('.json')) {
      showMessage('error', '请选择 JSON 格式的文件');
      return;
    }

    setIsImporting(true);
    
    try {
      const result = await onImport(file, importMode === 'merge');
      
      if (result.success) {
        const modeText = importMode === 'merge' ? '合并' : '替换';
        showMessage('success', `${modeText}导入成功！共导入 ${result.count} 个项目`);
      } else {
        showMessage('error', result.error || '导入失败');
      }
    } catch (error) {
      console.error('导入错误:', error);
      showMessage('error', '导入过程中发生错误');
    } finally {
      setIsImporting(false);
      // 清空 file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // 处理清除所有数据
  const handleClearAll = () => {
    if (totalItems === 0) {
      showMessage('info', '当前没有数据需要清除');
      return;
    }

    setShowConfirmDialog(true);
  };

  // 确认清除数据
  const confirmClearAll = () => {
    onClearAll();
    showMessage('success', '所有数据已清除');
    setShowConfirmDialog(false);
  };

  // 取消清除数据
  const cancelClearAll = () => {
    setShowConfirmDialog(false);
  };

  return (
    <div className="data-manager-content">
      {/* 消息提示 */}
      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      {/* 当前数据状态 */}
      <div className="data-status">
        <span>当前共有 <strong>{totalItems}</strong> 个待办事项</span>
      </div>

      {/* 导出功能 */}
      <div className="action-group">
        <h4>导出数据</h4>
        <p>将所有待办事项导出为 JSON 文件</p>
        <button 
          className="btn-export" 
          onClick={handleExport}
          disabled={totalItems === 0}
        >
          📥 导出数据
        </button>
      </div>

      {/* 导入功能 */}
      <div className="action-group">
        <h4>导入数据</h4>
        <p>从 JSON 文件导入待办事项</p>
        
        {/* 导入模式选择 */}
        <div className="import-mode">
          <label>
            <input
              type="radio"
              name="importMode"
              value="replace"
              checked={importMode === 'replace'}
              onChange={(e) => setImportMode(e.target.value)}
            />
            替换模式（清除现有数据）
          </label>
          <label>
            <input
              type="radio"
              name="importMode"
              value="merge"
              checked={importMode === 'merge'}
              onChange={(e) => setImportMode(e.target.value)}
            />
            合并模式（保留现有数据）
          </label>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImport}
          style={{ display: 'none' }}
        />
        
        <button 
          className="btn-import" 
          onClick={() => fileInputRef.current?.click()}
          disabled={isImporting}
        >
          {isImporting ? '⏳ 导入中...' : '📤 选择文件导入'}
        </button>
      </div>

      {/* 清除数据功能 */}
      <div className="action-group danger-zone">
        <h4>危险操作</h4>
        <p>清除所有待办事项和本地存储数据</p>
        <button 
          className="btn-clear-all" 
          onClick={handleClearAll}
        >
          🗑️ 清除所有数据
        </button>
      </div>

      {/* 隐私和法律 */}
      <div className="action-group privacy-section">
        <h4>隐私与法律</h4>
        <p>查看隐私政策和管理您的数据权利</p>
        <div className="privacy-buttons">
          <button 
            className="btn-privacy-policy" 
            onClick={() => setShowPrivacyPolicy(true)}
          >
            📄 查看隐私政策
          </button>
          <button 
            className="btn-privacy-settings" 
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

      {/* 隐私设置 */}
      <PrivacySettings 
        isOpen={showPrivacySettings} 
        onClose={() => setShowPrivacySettings(false)}
        onDataCleared={onClearAll}
      />
    </div>
  );
}

export default DataManager;
