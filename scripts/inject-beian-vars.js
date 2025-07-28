#!/usr/bin/env node

/**
 * 备案信息环境变量注入脚本
 * 在生产构建时从.env.local读取真实备案信息并注入到构建环境
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

// 备案相关的环境变量键名
const BEIAN_ENV_KEYS = [
  'VITE_ICP_BEIAN_NUMBER',
  'VITE_ICP_BEIAN_URL',
  'VITE_POLICE_BEIAN_NUMBER',
  'VITE_POLICE_BEIAN_CODE',
  'VITE_POLICE_BEIAN_URL'
];

/**
 * 解析.env文件内容
 */
function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return {};
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  const env = {};
  
  content.split('\n').forEach(line => {
    line = line.trim();
    if (line && !line.startsWith('#') && line.includes('=')) {
      const [key, ...valueParts] = line.split('=');
      const value = valueParts.join('=').trim();
      env[key.trim()] = value;
    }
  });
  
  return env;
}

/**
 * 从.env.local读取备案信息
 */
function getBeianVarsFromLocal() {
  const envLocalPath = path.join(projectRoot, '.env.local');
  const localEnv = parseEnvFile(envLocalPath);
  
  const beianVars = {};
  BEIAN_ENV_KEYS.forEach(key => {
    if (localEnv[key]) {
      beianVars[key] = localEnv[key];
    }
  });
  
  return beianVars;
}

/**
 * 创建临时的.env.production文件
 */
function createTempProductionEnv(beianVars) {
  const envProductionPath = path.join(projectRoot, '.env.production');
  
  // 如果已存在，先备份
  let existingContent = '';
  if (fs.existsSync(envProductionPath)) {
    existingContent = fs.readFileSync(envProductionPath, 'utf8');
  }
  
  // 生成新的内容
  const lines = [
    '# 临时生产环境配置文件 - 构建时自动生成',
    '# 此文件包含从.env.local注入的备案信息',
    '# 构建完成后会自动清理',
    ''
  ];
  
  // 添加备案变量
  Object.entries(beianVars).forEach(([key, value]) => {
    lines.push(`${key}=${value}`);
  });
  
  if (Object.keys(beianVars).length === 0) {
    lines.push('# 未找到备案信息，使用示例配置');
    lines.push('VITE_ICP_BEIAN_NUMBER=京ICP备12345678号-1');
    lines.push('VITE_ICP_BEIAN_URL=https://beian.miit.gov.cn');
  }
  
  fs.writeFileSync(envProductionPath, lines.join('\n'));
  
  return { envProductionPath, existingContent };
}

/**
 * 主函数
 */
function main() {
  console.log('🏛️ 开始注入备案信息环境变量...');
  
  try {
    // 从.env.local读取备案信息
    const beianVars = getBeianVarsFromLocal();
    
    if (Object.keys(beianVars).length > 0) {
      console.log('✅ 从.env.local读取到备案信息:');
      Object.entries(beianVars).forEach(([key, value]) => {
        // 只显示前几个字符，保护隐私
        const maskedValue = value.length > 10 ? 
          value.substring(0, 8) + '***' : 
          value;
        console.log(`   ${key}=${maskedValue}`);
      });
    } else {
      console.log('⚠️ 未在.env.local中找到备案信息，将使用示例配置');
    }
    
    // 创建临时的.env.production文件
    const { envProductionPath } = createTempProductionEnv(beianVars);

    console.log(`✅ 临时.env.production文件已创建: ${envProductionPath}`);
    console.log('💡 构建完成后请运行 npm run cleanup-beian-vars 清理临时文件');
    
    // 设置清理脚本
    process.on('exit', () => {
      console.log('🧹 进程退出，清理临时文件...');
    });
    
  } catch (error) {
    console.error('❌ 注入备案信息失败:', error.message);
    process.exit(1);
  }
}

// 运行脚本
main();
