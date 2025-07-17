import { MdDelete, MdEdit, MdCheck, MdUndo } from "react-icons/md";
import { useState } from "react";
import EditForm from "./EditForm";
import ConfirmDialog from "./ConfirmDialog";

/**
 * @description 待办事项组件
 * @param {Object} todo - 待办事项对象，包含内容和ID
 * @param {Function} deleteTodo - 函数用于删除待办事项
 * @param {Function} editTodo - 函数用于编辑待办事项
 * @param {Function} toggleCompletion - 函数用于切换待办事项的完成状态
 * @param {Function} toggleEditing - 函数用于切换编辑状态
 * @returns {JSX.Element}
 */
function Todo({
  todo,
  deleteTodo,
  editTodo,
  toggleCompletion,
  toggleEditing,
}) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const handleToggleCompletion = () => {
    toggleCompletion(todo.id);
  };

  const handleEdit = () => {
    if (!todo.isCompleted) {
      toggleEditing(todo.id);
    }
  };

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    deleteTodo(todo.id);
    setShowDeleteConfirm(false);
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  const handleCancelEdit = () => {
    toggleEditing(todo.id);
  };

  // 如果正在编辑，显示编辑表单
  if (todo.isEditing) {
    return (
      <EditForm 
        todo={todo} 
        editTodo={editTodo} 
        onCancel={handleCancelEdit}
      />
    );
  }

  // 正常显示模式
  return (
    <>
      <div className={`todo ${todo.isCompleted ? "completed" : ""}`}>
        <div className="todo-content">
          <button 
            className={`completion-btn ${todo.isCompleted ? 'completed' : ''}`}
            onClick={handleToggleCompletion}
            title={todo.isCompleted ? "标记为未完成" : "标记为完成"}
          >
            {todo.isCompleted ? <MdUndo /> : <MdCheck />}
          </button>
          
          <span 
            className="todo-text"
            onClick={handleToggleCompletion}
            title="点击切换完成状态"
          >
            {todo.content}
          </span>
        </div>
        
        <div className="todo-actions">
          <button
            className="action-btn edit-btn"
            onClick={handleEdit}
            disabled={todo.isCompleted}
            title={todo.isCompleted ? "已完成的项目无法编辑" : "编辑"}
          >
            <MdEdit />
          </button>
          
          <button
            className="action-btn delete-btn"
            onClick={handleDelete}
            title="删除"
          >
            <MdDelete />
          </button>
        </div>
      </div>

      {/* 删除确认对话框 */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="确认删除"
        message={`确定要删除待办事项"${todo.content}"吗？`}
        confirmText="删除"
        cancelText="取消"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        type="danger"
      />
    </>
  );
}
export default Todo;
