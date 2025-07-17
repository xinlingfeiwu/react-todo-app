import { useState } from "react";
import { validateTodoContent, TODO_CONFIG } from "../constants/todoConstants";

/**
 * @description 创建待办事项表单
 * @param {Function} addTodo - 函数用于添加新的待办事项
 * @param {string} placeholder - 输入框占位符文本
 * @param {boolean} disabled - 是否禁用表单
 * @returns {JSX.Element}
 */
function CreateForm({ 
  addTodo, 
  placeholder = TODO_CONFIG.PLACEHOLDER_TEXT,
  disabled = false 
}) {
  const [content, setContent] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const validation = validateTodoContent(content);
    
    if (!validation.isValid) {
      setError(validation.error);
      return;
    }
    
    addTodo(content);
    setContent(''); // 清空输入框
    setError(''); // 清空错误信息
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setContent(value);
    
    // 实时验证
    if (error && value.trim()) {
      setError('');
    }
  };

  return (
    <form className="create-form" onSubmit={handleSubmit}>
      <div className="input-group">
        <input 
          type="text" 
          placeholder={placeholder}
          value={content}
          onChange={handleInputChange}
          disabled={disabled}
          maxLength={TODO_CONFIG.MAX_CONTENT_LENGTH}
          className={error ? 'input-error' : ''}
        />
        <button 
          type="submit" 
          disabled={disabled || !content.trim()}
        >
          {TODO_CONFIG.BUTTON_TEXTS.ADD}
        </button>
      </div>
      {error && <div className="error-message">{error}</div>}
    </form>
  );
}

export default CreateForm;
