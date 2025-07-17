import React from 'react';
import Todo from './Todo';

/**
 * @description Todo列表组件，负责渲染待办事项列表
 * @param {Object} props - 组件属性
 * @param {Array} props.todos - 待办事项数组
 * @param {Function} props.deleteTodo - 删除待办事项的函数
 * @param {Function} props.editTodo - 编辑待办事项的函数
 * @param {Function} props.toggleCompletion - 切换完成状态的函数
 * @param {Function} props.toggleEditing - 切换编辑状态的函数
 * @param {string} props.filter - 过滤条件 ('all', 'pending', 'completed')
 * @returns {JSX.Element}
 */
function TodoList({ 
  todos, 
  deleteTodo, 
  editTodo, 
  toggleCompletion, 
  toggleEditing,
  filter = 'all'
}) {
  
  // 根据过滤条件筛选待办事项
  const getFilteredTodos = () => {
    switch (filter) {
      case 'pending':
        return todos.filter(todo => !todo.isCompleted);
      case 'completed':
        return todos.filter(todo => todo.isCompleted);
      default:
        return todos;
    }
  };

  const filteredTodos = getFilteredTodos();

  if (filteredTodos.length === 0) {
    const emptyMessages = {
      all: '暂无待办事项，添加一个开始吧！',
      pending: '太棒了！没有待完成的事项',
      completed: '还没有完成任何待办事项'
    };

    return (
      <div className="empty-state">
        <p>{emptyMessages[filter]}</p>
      </div>
    );
  }

  return (
    <div className="todo-list">
      {filteredTodos.map((todo) => (
        <Todo 
          key={todo.id} 
          todo={todo} 
          deleteTodo={deleteTodo} 
          editTodo={editTodo} 
          toggleCompletion={toggleCompletion} 
          toggleEditing={toggleEditing} 
        />
      ))}
    </div>
  );
}

export default TodoList;
