import { useState, useCallback, useEffect } from 'react';
import { STORAGE_KEY, OLD_STORAGE_KEY } from '../constants/storageKeys';

// localStorage 相关常量
const STORAGE_VERSION = '1.0';

/**
 * localStorage 工具函数
 */
const storageUtils = {
  // 保存数据到 localStorage
  save: (todos) => {
    try {
      const data = {
        version: STORAGE_VERSION,
        timestamp: Date.now(),
        todos: todos
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('保存数据失败:', error);
    }
  },

  // 从 localStorage 读取数据
  load: () => {
    try {
      // 首先尝试从新的key读取数据
      let stored = localStorage.getItem(STORAGE_KEY);
      let isFromMigration = false;
      
      // 如果新key没有数据，尝试从旧key读取并迁移
      if (!stored) {
        const oldStored = localStorage.getItem(OLD_STORAGE_KEY);
        if (oldStored) {
          console.log('检测到旧版本数据，正在迁移...');
          stored = oldStored;
          isFromMigration = true;
        }
      }
      
      if (!stored) return [];

      const data = JSON.parse(stored);
      
      // 检查数据版本兼容性
      if (data.version !== STORAGE_VERSION) {
        console.warn('数据版本不兼容，使用默认数据');
        return [];
      }

      // 验证数据格式
      if (Array.isArray(data.todos)) {
        const migratedTodos = data.todos.map(todo => ({
          ...todo,
          // 确保所有必需字段存在
          id: todo.id || Date.now() + Math.random(),
          content: todo.content || '',
          isCompleted: Boolean(todo.isCompleted),
          isEditing: Boolean(todo.isEditing),
          createdAt: todo.createdAt || new Date().toISOString()
        }));
        
        // 如果是从旧key迁移的数据，保存到新key并清除旧key
        if (isFromMigration) {
          console.log('数据迁移完成，保存到新的存储位置');
          const newData = {
            version: STORAGE_VERSION,
            timestamp: Date.now(),
            todos: migratedTodos
          };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
          localStorage.removeItem(OLD_STORAGE_KEY);
          console.log('旧版本数据已清除');
        }
        
        return migratedTodos;
      }
      
      return [];
    } catch (error) {
      console.error('读取数据失败:', error);
      return [];
    }
  },

  // 清除存储的数据
  clear: () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      // 同时清除可能存在的旧key数据
      localStorage.removeItem(OLD_STORAGE_KEY);
    } catch (error) {
      console.error('清除数据失败:', error);
    }
  },

  // 导出数据为 JSON 文件
  exportData: (todos) => {
    try {
      const exportData = {
        appName: 'React Todo App',
        version: STORAGE_VERSION,
        exportDate: new Date().toISOString(),
        totalItems: todos.length,
        todos: todos
      };

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `todos-export-${new Date().toISOString().split('T')[0]}.json`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
      
      return true;
    } catch (error) {
      console.error('导出数据失败:', error);
      return false;
    }
  },

  // 导入数据从 JSON 文件
  importData: (file) => {
    return new Promise((resolve, reject) => {
      try {
        const reader = new FileReader();
        
        reader.onload = (e) => {
          try {
            const importedData = JSON.parse(e.target.result);
            
            // 验证导入的数据格式
            if (!importedData.todos || !Array.isArray(importedData.todos)) {
              reject({
                error: '文件格式不正确',
                details: '导入的文件必须包含有效的 todos 数组。请确保选择的是从本应用导出的 JSON 文件。'
              });
              return;
            }

            // 清理和验证每个 todo 项
            const cleanTodos = importedData.todos.map(todo => ({
              id: todo.id || Date.now() + Math.random(),
              content: String(todo.content || '').trim(),
              isCompleted: Boolean(todo.isCompleted),
              isEditing: false, // 导入时重置编辑状态
              createdAt: todo.createdAt || new Date().toISOString()
            })).filter(todo => todo.content); // 过滤空内容的项

            if (cleanTodos.length === 0) {
              reject({
                error: '文件中没有有效的待办事项',
                details: '导入的文件中没有找到有效的待办事项数据。请检查文件内容是否正确。'
              });
              return;
            }

            resolve(cleanTodos);
          } catch {
            reject({
              error: '文件格式错误',
              details: '无法解析选择的文件。请确保选择的是有效的 JSON 格式文件。'
            });
          }
        };
        
        reader.onerror = () => {
          reject({
            error: '文件读取失败',
            details: '无法读取选择的文件。请检查文件是否损坏或重新选择文件。'
          });
        };
        
        reader.readAsText(file);
      } catch {
        reject({
          error: '文件处理失败',
          details: '处理文件时发生错误。请重新选择文件并重试。'
        });
      }
    });
  }
};

/**
 * 自定义Hook：管理Todo应用的状态和逻辑（带持久化存储）
 * @returns {Object} 包含todos状态和所有操作方法的对象
 */
export const useTodos = () => {
  // 初始化时从 localStorage 读取数据
  const [todos, setTodos] = useState(() => storageUtils.load());

  // 每当 todos 状态变化时，自动保存到 localStorage
  useEffect(() => {
    storageUtils.save(todos);
  }, [todos]);

  // 生成唯一ID的函数
  const generateId = useCallback(() => {
    return Date.now() + Math.random();
  }, []);

  // 添加新的待办事项
  const addTodo = useCallback((content) => {
    if (!content.trim()) return;
    
    const newTodo = {
      id: generateId(),
      content: content.trim(),
      isCompleted: false,
      isEditing: false,
      createdAt: new Date().toISOString()
    };
    
    setTodos(prevTodos => [...prevTodos, newTodo]);
  }, [generateId]);

  // 删除待办事项
  const deleteTodo = useCallback((id) => {
    setTodos(prevTodos => prevTodos.filter(todo => todo.id !== id));
  }, []);

  // 编辑待办事项内容
  const editTodo = useCallback((id, newContent) => {
    if (!newContent.trim()) return;
    
    setTodos(prevTodos =>
      prevTodos.map(todo =>
        todo.id === id 
          ? { ...todo, content: newContent.trim(), isEditing: false }
          : todo
      )
    );
  }, []);

  // 切换完成状态
  const toggleCompletion = useCallback((id) => {
    setTodos(prevTodos =>
      prevTodos.map(todo =>
        todo.id === id 
          ? { ...todo, isCompleted: !todo.isCompleted }
          : todo
      )
    );
  }, []);

  // 切换编辑状态
  const toggleEditing = useCallback((id) => {
    setTodos(prevTodos =>
      prevTodos.map(todo =>
        todo.id === id 
          ? { ...todo, isEditing: !todo.isEditing }
          : todo
      )
    );
  }, []);

  // 清除所有已完成的待办事项
  const clearCompleted = useCallback(() => {
    setTodos(prevTodos => prevTodos.filter(todo => !todo.isCompleted));
  }, []);

  // 标记所有为完成/未完成
  const toggleAllCompletion = useCallback(() => {
    const allCompleted = todos.every(todo => todo.isCompleted);
    setTodos(prevTodos =>
      prevTodos.map(todo => ({ ...todo, isCompleted: !allCompleted }))
    );
  }, [todos]);

  // 导出数据
  const exportTodos = useCallback(() => {
    return storageUtils.exportData(todos);
  }, [todos]);

  // 导入数据
  const importTodos = useCallback(async (data, mode = 'replace') => {
    try {
      let importedTodos;
      
      // 如果传入的是 File 对象，读取文件
      if (data instanceof File) {
        try {
          importedTodos = await storageUtils.importData(data);
        } catch (error) {
          return { 
            success: false, 
            error: error.error || '导入失败', 
            details: error.details || '文件处理时发生错误，请重试。' 
          };
        }
      } else {
        // 如果传入的是已解析的数据对象
        if (!data.todos || !Array.isArray(data.todos)) {
          return { 
            success: false, 
            error: '文件格式不正确', 
            details: '导入的文件必须包含有效的 todos 数组。请确保选择的是从本应用导出的 JSON 文件。' 
          };
        }
        
        // 验证 todos 数组中是否有有效数据
        const validTodos = data.todos.filter(todo => 
          todo && typeof todo === 'object' && 
          (todo.content || '').toString().trim()
        );
        
        if (validTodos.length === 0) {
          return { 
            success: false, 
            error: '文件中没有有效的待办事项', 
            details: '导入的文件中没有找到有效的待办事项数据。请检查文件内容是否正确。' 
          };
        }
        
        // 清理和验证每个 todo 项
        importedTodos = validTodos.map(todo => ({
          id: todo.id || Date.now() + Math.random(),
          content: String(todo.content || '').trim(),
          isCompleted: Boolean(todo.isCompleted),
          isEditing: false, // 导入时重置编辑状态
          createdAt: todo.createdAt || new Date().toISOString()
        }));
      }
      
      if (mode === 'merge') {
        // 合并模式：追加到现有数据
        setTodos(prevTodos => {
          const existingIds = new Set(prevTodos.map(todo => todo.id));
          const newTodos = importedTodos.filter(todo => !existingIds.has(todo.id));
          return [...prevTodos, ...newTodos];
        });
      } else {
        // 替换模式：完全替换现有数据
        setTodos(importedTodos);
      }
      
      return { success: true, count: importedTodos.length };
    } catch {
      return { 
        success: false, 
        error: '文件解析失败', 
        details: '无法解析选择的文件。请确保选择的是有效的 JSON 格式文件。' 
      };
    }
  }, []);

  // 清除所有数据
  const clearAllData = useCallback(() => {
    setTodos([]);
    storageUtils.clear();
  }, []);

  // 统计信息
  const stats = {
    total: todos.length,
    completed: todos.filter(todo => todo.isCompleted).length,
    pending: todos.filter(todo => !todo.isCompleted).length
  };

  return {
    todos,
    stats,
    actions: {
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
    }
  };
};
