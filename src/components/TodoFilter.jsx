import React from 'react';

/**
 * @description Todo过滤器组件
 * @param {Object} props - 组件属性
 * @param {string} props.currentFilter - 当前选中的过滤条件
 * @param {Function} props.onFilterChange - 过滤条件改变的回调函数
 * @param {Object} props.stats - 统计数据
 * @returns {JSX.Element}
 */
function TodoFilter({ currentFilter, onFilterChange, stats }) {
  const filters = [
    { key: 'all', label: '全部', count: stats.total },
    { key: 'pending', label: '待完成', count: stats.pending },
    { key: 'completed', label: '已完成', count: stats.completed }
  ];

  return (
    <div className="todo-filter">
      {filters.map(filter => (
        <button
          key={filter.key}
          className={`filter-btn ${currentFilter === filter.key ? 'active' : ''}`}
          onClick={() => onFilterChange(filter.key)}
        >
          <span className="filter-label">{filter.label}</span>
          {filter.count > 0 && (
            <span className={`count ${filter.count >= 100 ? 'large-number' : ''}`}>
              {filter.count >= 10000 ? '9999+' : filter.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

export default TodoFilter;
