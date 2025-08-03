#!/usr/bin/env python3
"""
修复 Markdown 文档中的常见格式问题
自动修复 markdownlint 检测到的常见问题
"""

import os
import re
import sys
import glob
from pathlib import Path

def fix_markdown_file(file_path):
    """修复单个 Markdown 文件的格式问题"""
    print(f"处理文件: {file_path}")
    
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    fixed_lines = []
    i = 0
    
    while i < len(lines):
        line = lines[i]
        original_line = line
        
        # 移除行尾空格 (MD009)
        line = line.rstrip() + '\n' if line.strip() else '\n'
        
        # 修复标题后的标点符号 (MD026)
        if re.match(r'^#{1,6}\s+', line):
            # 移除标题末尾的冒号和感叹号
            line = re.sub(r'[：!]+\s*$', '\n', line.rstrip()) + '\n'
        
        # 检查各种元素类型
        is_heading = re.match(r'^#{1,6}\s+', line.strip())
        is_list = re.match(r'^[\s]*[-*+]\s+|^[\s]*\d+\.\s+', line.strip())
        is_code_block = line.strip().startswith('```')
        is_table = '|' in line and line.strip().startswith('|')
        is_empty = line.strip() == ''
        
        # 获取前一行和后一行的信息
        prev_line = lines[i-1].strip() if i > 0 else ''
        next_line = lines[i+1].strip() if i + 1 < len(lines) else ''
        
        prev_is_empty = prev_line == ''
        next_is_empty = next_line == ''
        
        # MD022: 标题周围需要空行
        if is_heading:
            # 标题前需要空行（除非是文件开头或前面已经是空行）
            if i > 0 and not prev_is_empty and prev_line:
                fixed_lines.append('\n')
            
            fixed_lines.append(line)
            
            # 标题后需要空行（除了下一行是标题或空行）
            if i + 1 < len(lines) and not next_is_empty and not re.match(r'^#{1,6}\s+', next_line):
                fixed_lines.append('\n')
        
        # MD032: 列表周围需要空行
        elif is_list:
            # 列表前需要空行（除非前面是列表项或空行）
            if i > 0 and not prev_is_empty and not re.match(r'^[\s]*[-*+]\s+|^[\s]*\d+\.\s+', prev_line):
                fixed_lines.append('\n')
            
            fixed_lines.append(line)
            
            # 列表后需要空行（除非后面是列表项或空行）
            if i + 1 < len(lines) and not next_is_empty and not re.match(r'^[\s]*[-*+]\s+|^[\s]*\d+\.\s+', next_line):
                fixed_lines.append('\n')
        
        # MD031: 代码块周围需要空行
        elif is_code_block:
            # 代码块前需要空行
            if i > 0 and not prev_is_empty:
                fixed_lines.append('\n')
            
            fixed_lines.append(line)
            
            # 代码块后需要空行
            if i + 1 < len(lines) and not next_is_empty:
                fixed_lines.append('\n')
        
        # MD058: 表格周围需要空行
        elif is_table:
            # 表格前需要空行（除非前面是表格行）
            if i > 0 and not prev_is_empty and '|' not in prev_line:
                fixed_lines.append('\n')
            
            fixed_lines.append(line)
            
            # 表格后需要空行（除非后面是表格行）
            if i + 1 < len(lines) and not next_is_empty and '|' not in next_line:
                fixed_lines.append('\n')
        
        else:
            fixed_lines.append(line)
        
        i += 1
    
    # 移除多余的连续空行，但保留必要的空行
    final_lines = []
    prev_empty = False
    
    for line in fixed_lines:
        is_empty = line.strip() == ''
        
        if is_empty:
            if not prev_empty:  # 只保留一个空行
                final_lines.append(line)
            prev_empty = True
        else:
            final_lines.append(line)
            prev_empty = False
    
    # 确保文件以单个换行符结尾 (MD047)
    if final_lines:
        if not final_lines[-1].endswith('\n'):
            final_lines[-1] += '\n'
        
        # 移除文件末尾多余的空行
        while len(final_lines) > 1 and final_lines[-1].strip() == '' and final_lines[-2].strip() == '':
            final_lines.pop()
    
    # 写回文件
    with open(file_path, 'w', encoding='utf-8') as f:
        f.writelines(final_lines)

def main():
    """主函数"""
    print("🔧 开始修复 Markdown 文档格式问题...")
    
    # 获取所有 .md 文件
    md_files = []
    for pattern in ['*.md', '**/*.md']:
        md_files.extend(glob.glob(pattern, recursive=True))
    
    # 过滤掉不需要处理的文件
    exclude_patterns = ['node_modules/', 'test-results/', 'playwright-report/']
    filtered_files = []
    
    for file_path in md_files:
        if not any(pattern in file_path for pattern in exclude_patterns):
            filtered_files.append(file_path)
    
    print(f"找到 {len(filtered_files)} 个 Markdown 文件需要处理")
    
    # 处理每个文件
    for file_path in filtered_files:
        try:
            fix_markdown_file(file_path)
        except Exception as e:
            print(f"处理文件 {file_path} 时出错: {e}")
    
    print("✅ Markdown 文件格式修复完成！")
    print("\n运行 markdownlint 检查修复结果...")

if __name__ == '__main__':
    main()
