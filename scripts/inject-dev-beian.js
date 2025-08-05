#!/usr/bin/env node

/**
 * 开发环境备案信息注入脚本
 * 用于在开发时设置全局备案信息变量
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 读取环境变量
function loadEnvFile() {
  const envPath = path.join(__dirname, '..', '.env.local');
  const envContent = {};
  
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf-8');
    content.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          envContent[key.trim()] = valueParts.join('=').trim();
        }
      }
    });
  }
  
  return envContent;
}

// 验证值是否有效
function isValidValue(value) {
  return value && 
         value !== 'undefined' && 
         value !== 'null' && 
         value !== '' && 
         !value.startsWith('%VITE_') &&
         !value.startsWith('${');
}

// 生成开发环境的备案信息脚本
function generateDevBeianScript() {
  const env = loadEnvFile();
  
  const icpNumber = env.VITE_ICP_BEIAN_NUMBER;
  const icpUrl = env.VITE_ICP_BEIAN_URL;
  const policeNumber = env.VITE_POLICE_BEIAN_NUMBER;
  const policeCode = env.VITE_POLICE_BEIAN_CODE;
  const policeUrl = env.VITE_POLICE_BEIAN_URL;
  
  const beianInfo = {
    icpNumber: isValidValue(icpNumber) ? icpNumber : null,
    icpUrl: isValidValue(icpUrl) ? icpUrl : 'https://beian.miit.gov.cn',
    policeNumber: isValidValue(policeNumber) ? policeNumber : null,
    policeCode: isValidValue(policeCode) ? policeCode : null,
    policeUrl: isValidValue(policeUrl) ? policeUrl : null
  };
  
  const script = `
<!-- 开发环境备案信息初始化脚本 -->
<script>
  // 初始化全局备案信息
  window.__BEIAN_INFO__ = ${JSON.stringify(beianInfo, null, 2)};
  
  console.log('开发环境备案信息已加载:', window.__BEIAN_INFO__);
</script>
`;

  return script;
}

// 注入到index.html
function injectToIndexHtml() {
  const indexPath = path.join(__dirname, '..', 'index.html');
  
  if (!fs.existsSync(indexPath)) {
    console.warn('index.html 文件不存在，跳过注入');
    return;
  }
  
  let htmlContent = fs.readFileSync(indexPath, 'utf-8');
  
  // 移除已存在的开发环境备案信息脚本
  htmlContent = htmlContent.replace(
    /<!-- 开发环境备案信息初始化脚本 -->[\s\S]*?<\/script>/g,
    ''
  );
  
  // 在head结束标签前插入新的脚本
  const script = generateDevBeianScript();
  htmlContent = htmlContent.replace(
    '</head>',
    `  ${script}\n  </head>`
  );
  
  fs.writeFileSync(indexPath, htmlContent);
  console.log('✅ 开发环境备案信息已注入到 index.html');
}

// 主函数
function main() {
  try {
    injectToIndexHtml();
  } catch (error) {
    console.error('❌ 注入开发环境备案信息失败:', error);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { generateDevBeianScript, injectToIndexHtml };
