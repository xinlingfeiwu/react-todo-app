import React from 'react';

/**
 * @description Todo统计信息组件
 * @param {Object} props - 组件属性
 * @param {Object} props.stats - 统计数据对象
 * @param {number} props.stats.total - 总数
 * @param {number} props.stats.completed - 已完成数
 * @param {number} props.stats.pending - 待完成数
 * @param {Function} props.onClearCompleted - 清除已完成项的回调
 * @param {Function} props.onToggleAll - 全选/全不选的回调
 * @returns {JSX.Element}
 */
function TodoStats({ stats, onClearCompleted, onToggleAll }) {
  const { total, completed, pending } = stats;

  if (total === 0) {
    return null;
  }

  return (
    <div className="todo-stats">
      <div className="stats-info">
        <span className="stats-item">
          总计: <strong>{total}</strong>
        </span>
        <span className="stats-item">
          已完成: <strong>{completed}</strong>
        </span>
        <span className="stats-item">
          待完成: <strong>{pending}</strong>
        </span>
      </div>
      
      <div className="stats-actions">
        {total > 0 && (
          <button 
            className="btn-toggle-all"
            onClick={onToggleAll}
            title={completed === total ? "全部标记为未完成" : "全部标记为完成"}
          >
            {completed === total ? "全部未完成" : "全部完成"}
          </button>
        )}
        
        {completed > 0 && (
          <button 
            className="btn-clear-completed"
            onClick={onClearCompleted}
            title="清除所有已完成的待办事项"
          >
            清除已完成 ({completed})
          </button>
        )}
      </div>
    </div>
  );
}

export default TodoStats;
