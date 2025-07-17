import React, { useState, useRef, useEffect } from 'react';

/**
 * @description 自定义下拉选择组件
 * @param {Object} props - 组件属性
 * @param {string} props.value - 当前选中的值
 * @param {Function} props.onChange - 值改变时的回调函数
 * @param {Array} props.options - 选项数组，格式为 [{ value: string, label: string, icon?: string }]
 * @param {string} props.name - 输入框name属性
 * @param {string} props.id - 输入框ID
 * @param {string} props.className - 额外的CSS类名
 * @param {boolean} props.disabled - 是否禁用
 * @returns {JSX.Element}
 */
function CustomSelect({ value, onChange, options, id, name, className = '', disabled = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const selectRef = useRef(null);
  const listRef = useRef(null);

  // 点击外部关闭下拉
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
        setFocusedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 键盘导航
  const handleKeyDown = (e) => {
    if (disabled) return;

    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          setFocusedIndex(options.findIndex(opt => opt.value === value));
        } else if (focusedIndex >= 0) {
          handleOptionSelect(options[focusedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setFocusedIndex(-1);
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          setFocusedIndex(options.findIndex(opt => opt.value === value));
        } else {
          setFocusedIndex(prev => (prev + 1) % options.length);
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          setFocusedIndex(options.findIndex(opt => opt.value === value));
        } else {
          setFocusedIndex(prev => (prev - 1 + options.length) % options.length);
        }
        break;
    }
  };

  const handleOptionSelect = (option) => {
    onChange({ target: { value: option.value, name: name || id } });
    setIsOpen(false);
    setFocusedIndex(-1);
  };

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div 
      className={`custom-select ${className} ${isOpen ? 'open' : ''} ${disabled ? 'disabled' : ''}`}
      ref={selectRef}
    >
      <div
        className="custom-select-trigger"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        tabIndex={disabled ? -1 : 0}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-labelledby={`${id}-label`}
      >
        <span className="custom-select-value">
          {selectedOption?.icon && (
            <span className="option-icon">{selectedOption.icon}</span>
          )}
          <span className="option-text">{selectedOption?.label}</span>
        </span>
        <span className={`custom-select-arrow ${isOpen ? 'open' : ''}`}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path 
              d="M7 10L12 15L17 10" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </div>
      
      {isOpen && (
        <div className="custom-select-dropdown" ref={listRef}>
          <ul className="custom-select-options" role="listbox">
            {options.map((option, index) => (
              <li
                key={option.value}
                className={`custom-select-option ${
                  option.value === value ? 'selected' : ''
                } ${index === focusedIndex ? 'focused' : ''}`}
                onClick={() => handleOptionSelect(option)}
                onMouseEnter={() => setFocusedIndex(index)}
                role="option"
                aria-selected={option.value === value}
              >
                {option.icon && (
                  <span className="option-icon">{option.icon}</span>
                )}
                <span className="option-text">{option.label}</span>
                {option.value === value && (
                  <span className="check-icon">✓</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default CustomSelect;
