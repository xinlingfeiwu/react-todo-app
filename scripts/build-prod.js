#!/usr/bin/env node

/**
 * 生产构建脚本
 * 注入备案信息并执行构建
 */

import { spawn } from 'child_process';
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
 * 主函数
 */
async function main() {
  console.log('🏗️ 开始生产构建...');
  
  try {
    // 1. 生成版本信息
    console.log('📦 生成版本信息...');
    await new Promise((resolve, reject) => {
      const generateVersion = spawn('npm', ['run', 'generate-version'], {
        cwd: projectRoot,
        stdio: 'inherit'
      });
      generateVersion.on('close', (code) => {
        if (code === 0) resolve();
        else reject(new Error(`版本信息生成失败，退出码: ${code}`));
      });
    });

    // 2. 读取备案信息
    console.log('🏛️ 读取备案信息...');
    const beianVars = getBeianVarsFromLocal();
    
    if (Object.keys(beianVars).length > 0) {
      console.log('✅ 从.env.local读取到备案信息:');
      Object.entries(beianVars).forEach(([key, value]) => {
        const maskedValue = value.length > 10 ? 
          value.substring(0, 8) + '***' : 
          value;
        console.log(`   ${key}=${maskedValue}`);
      });
    } else {
      console.log('⚠️ 未在.env.local中找到备案信息，将使用默认配置');
      beianVars.VITE_ICP_BEIAN_NUMBER = '京ICP备12345678号-1';
      beianVars.VITE_ICP_BEIAN_URL = 'https://beian.miit.gov.cn';
    }

    // 3. 设置环境变量并构建
    console.log('🔨 开始Vite构建...');
    const buildEnv = {
      ...process.env,
      NODE_ENV: 'production',
      ...beianVars
    };

    await new Promise((resolve, reject) => {
      const build = spawn('npx', ['vite', 'build'], {
        cwd: projectRoot,
        stdio: 'inherit',
        env: buildEnv
      });
      build.on('close', (code) => {
        if (code === 0) resolve();
        else reject(new Error(`构建失败，退出码: ${code}`));
      });
    });

    console.log('✅ 生产构建完成！');
    
  } catch (error) {
    console.error('❌ 构建失败:', error.message);
    process.exit(1);
  }
}

// 运行脚本
main();
