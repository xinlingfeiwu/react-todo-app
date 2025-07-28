#!/usr/bin/env node
/* eslint-disable no-unused-vars */

/**
 * 敏感信息检查脚本
 * 检查即将提交的文件中是否包含真实的备案信息
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 敏感信息模式（使用正则表达式）
const SENSITIVE_PATTERNS = [
  // 真实的ICP备案号模式（避免硬编码具体号码）
  /[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼]ICP备\d{8}号-\d+/g,
  
  // 真实的公安备案号模式
  /[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼]公网安备\d{14}号/g,
  
  // 特定的测试用备案号（应该被排除）
  /京ICP备12345678号-1/g,
  /京公网安备11010802012345号/g
];

// 需要检查的文件扩展名
const CHECK_EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx', '.md', '.json', '.html', '.css', '.scss'];

// 排除的目录
const EXCLUDE_DIRS = ['node_modules', '.git', 'dist', 'build'];

/**
 * 获取Git暂存区的文件列表
 */
function getStagedFiles() {
  try {
    const output = execSync('git diff --cached --name-only', { encoding: 'utf8' });
    return output.trim().split('\n').filter(file => file.length > 0);
  } catch (error) {
    console.log('⚠️ 无法获取Git暂存区文件，检查所有文件');
    return [];
  }
}

/**
 * 递归获取所有需要检查的文件
 */
function getAllFiles(dir, files = []) {
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      if (!EXCLUDE_DIRS.includes(item)) {
        getAllFiles(fullPath, files);
      }
    } else {
      const ext = path.extname(item);
      if (CHECK_EXTENSIONS.includes(ext)) {
        files.push(fullPath);
      }
    }
  }
  
  return files;
}

/**
 * 检查文件内容是否包含敏感信息
 */
function checkFileContent(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const issues = [];
    
    for (const pattern of SENSITIVE_PATTERNS) {
      const matches = content.match(pattern);
      if (matches) {
        // 排除测试用的示例备案号
        const realMatches = matches.filter(match => 
          !match.includes('京ICP备12345678号-1') && 
          !match.includes('京公网安备11010802012345号')
        );
        
        if (realMatches.length > 0) {
          issues.push({
            pattern: pattern.toString(),
            matches: realMatches,
            lines: getMatchingLines(content, pattern)
          });
        }
      }
    }
    
    return issues;
  } catch (error) {
    console.error(`❌ 无法读取文件 ${filePath}: ${error.message}`);
    return [];
  }
}

/**
 * 获取匹配的行号
 */
function getMatchingLines(content, pattern) {
  const lines = content.split('\n');
  const matchingLines = [];
  
  lines.forEach((line, index) => {
    if (pattern.test(line)) {
      matchingLines.push({
        lineNumber: index + 1,
        content: line.trim()
      });
    }
  });
  
  return matchingLines;
}

/**
 * 主函数
 */
function main() {
  console.log('🔍 开始检查敏感信息...\n');
  
  // 获取要检查的文件列表
  const stagedFiles = getStagedFiles();
  let filesToCheck = [];
  
  if (stagedFiles.length > 0) {
    console.log('📋 检查Git暂存区文件...');
    filesToCheck = stagedFiles.filter(file => {
      const ext = path.extname(file);
      return CHECK_EXTENSIONS.includes(ext) && fs.existsSync(file);
    });
  } else {
    console.log('📋 检查所有项目文件...');
    const projectRoot = path.join(__dirname, '..');
    filesToCheck = getAllFiles(projectRoot);
  }
  
  console.log(`📊 共检查 ${filesToCheck.length} 个文件\n`);
  
  let hasIssues = false;
  const issueFiles = [];
  
  // 检查每个文件
  for (const filePath of filesToCheck) {
    const issues = checkFileContent(filePath);
    
    if (issues.length > 0) {
      hasIssues = true;
      issueFiles.push({ filePath, issues });
    }
  }
  
  // 输出结果
  if (hasIssues) {
    console.log('❌ 发现敏感信息！\n');
    
    for (const { filePath, issues } of issueFiles) {
      console.log(`📄 文件: ${filePath}`);
      
      for (const issue of issues) {
        console.log(`   🚨 发现敏感内容: ${issue.matches.join(', ')}`);
        
        for (const line of issue.lines) {
          console.log(`   📍 第${line.lineNumber}行: ${line.content}`);
        }
      }
      console.log('');
    }
    
    console.log('⚠️ 请在提交前移除或替换这些敏感信息！');
    console.log('💡 建议使用环境变量或示例数据替代真实备案信息。');
    
    process.exit(1);
  } else {
    console.log('✅ 未发现敏感信息，可以安全提交！');
    console.log('🎉 所有文件检查通过。');
  }
}

// 运行检查
main();
