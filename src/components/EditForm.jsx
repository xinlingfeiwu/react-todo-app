import React, { useState, useEffect, useRef } from "react";
import { validateTodoContent, TODO_CONFIG } from "../constants/todoConstants";

/**
 * @description 编辑待办事项的表单组件
 * @param {Object} todo - 待办事项对象
 * @param {Function} editTodo - 编辑待办事项的函数
 * @param {Function} onCancel - 取消编辑的回调函数
 * @returns {JSX.Element}
 */
function EditForm({ todo, editTodo, onCancel }) {
  const [newContent, setNewContent] = useState(todo.content);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  // 组件挂载时自动聚焦并选中文本
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const validation = validateTodoContent(newContent);
    
    if (!validation.isValid) {
      setError(validation.error);
      return;
    }
    
    editTodo(todo.id, newContent);
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setNewContent(value);
    
    // 实时验证
    if (error && value.trim()) {
      setError('');
    }
  };

  return (
    <form className="edit-form" onSubmit={handleSubmit}>
      <div className="input-group">
        <input
          ref={inputRef}
          type="text"
          value={newContent}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          maxLength={TODO_CONFIG.MAX_CONTENT_LENGTH}
          className={error ? 'input-error' : ''}
        />
        <button type="submit" disabled={!newContent.trim()}>
          {TODO_CONFIG.BUTTON_TEXTS.EDIT}
        </button>
        <button type="button" onClick={handleCancel}>
          取消
        </button>
      </div>
      {error && <div className="error-message">{error}</div>}
    </form>
  );
}
export default EditForm;