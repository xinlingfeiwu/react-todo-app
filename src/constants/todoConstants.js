/**
 * Todo应用的常量定义
 */

// Todo状态枚举
export const TODO_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  EDITING: 'editing'
};

// 操作类型
export const TODO_ACTIONS = {
  ADD: 'add',
  DELETE: 'delete',
  EDIT: 'edit',
  TOGGLE_COMPLETION: 'toggle_completion',
  TOGGLE_EDITING: 'toggle_editing'
};

// 默认配置
export const TODO_CONFIG = {
  MAX_CONTENT_LENGTH: 200,
  MIN_CONTENT_LENGTH: 1,
  PLACEHOLDER_TEXT: '输入待办事项...',
  BUTTON_TEXTS: {
    ADD: '添加',
    EDIT: '完成',
    DELETE: '删除',
    CLEAR_COMPLETED: '清除已完成'
  }
};

// 验证函数
export const validateTodoContent = (content) => {
  if (!content || typeof content !== 'string') {
    return { isValid: false, error: '内容不能为空' };
  }
  
  const trimmedContent = content.trim();
  
  if (trimmedContent.length < TODO_CONFIG.MIN_CONTENT_LENGTH) {
    return { isValid: false, error: '内容不能为空' };
  }
  
  if (trimmedContent.length > TODO_CONFIG.MAX_CONTENT_LENGTH) {
    return { isValid: false, error: `内容不能超过${TODO_CONFIG.MAX_CONTENT_LENGTH}个字符` };
  }
  
  return { isValid: true, error: null };
};
