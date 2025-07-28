#!/usr/bin/env node

/**
 * 清理备案信息临时文件脚本
 * 构建完成后清理临时生成的.env.production文件
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

/**
 * 清理临时的.env.production文件
 */
function cleanupTempFiles() {
  const envProductionPath = path.join(projectRoot, '.env.production');
  
  if (fs.existsSync(envProductionPath)) {
    const content = fs.readFileSync(envProductionPath, 'utf8');
    
    // 检查是否是我们创建的临时文件
    if (content.includes('构建时自动生成')) {
      fs.unlinkSync(envProductionPath);
      console.log('✅ 临时.env.production文件已清理');
    } else {
      console.log('ℹ️ .env.production文件不是临时文件，保留');
    }
  } else {
    console.log('ℹ️ 未找到.env.production文件');
  }
}

/**
 * 主函数
 */
function main() {
  console.log('🧹 开始清理备案信息临时文件...');
  
  try {
    cleanupTempFiles();
    console.log('✅ 清理完成');
  } catch (error) {
    console.error('❌ 清理失败:', error.message);
    process.exit(1);
  }
}

// 运行脚本
main();
