#!/usr/bin/env node

/**
 * iOS PWA 图标生成脚本
 * 从SVG图标生成iOS所需的各种尺寸PNG图标
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// iOS PWA 所需的图标尺寸
const IOS_ICON_SIZES = [
  { size: 57, name: 'apple-touch-icon-57x57.png', desc: 'iPhone (iOS 6 及以下)' },
  { size: 60, name: 'apple-touch-icon-60x60.png', desc: 'iPhone (iOS 7+)' },
  { size: 72, name: 'apple-touch-icon-72x72.png', desc: 'iPad (iOS 6 及以下)' },
  { size: 76, name: 'apple-touch-icon-76x76.png', desc: 'iPad (iOS 7+)' },
  { size: 114, name: 'apple-touch-icon-114x114.png', desc: 'iPhone Retina (iOS 6 及以下)' },
  { size: 120, name: 'apple-touch-icon-120x120.png', desc: 'iPhone Retina (iOS 7+)' },
  { size: 144, name: 'apple-touch-icon-144x144.png', desc: 'iPad Retina (iOS 6 及以下)' },
  { size: 152, name: 'apple-touch-icon-152x152.png', desc: 'iPad Retina (iOS 7+)' },
  { size: 167, name: 'apple-touch-icon-167x167.png', desc: 'iPad Pro' },
  { size: 180, name: 'apple-touch-icon-180x180.png', desc: 'iPhone 6 Plus' },
  { size: 192, name: 'icon-192x192.png', desc: 'Android Chrome' },
  { size: 512, name: 'icon-512x512.png', desc: 'Android Chrome (大)' }
];

// 颜色配置
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  accent: '#f093fb',
  success: '#00f260',
  warning: '#ffeaa7',
  text: '#374151'
};

/**
 * 生成SVG内容
 */
function generateSVG(size) {
  const scale = size / 64; // 基础尺寸是64x64
  const strokeWidth = Math.max(1, 2.5 * scale);
  const smallStrokeWidth = Math.max(0.5, 1.5 * scale);
  
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
  <defs>
    <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${COLORS.primary};stop-opacity:1" />
      <stop offset="50%" style="stop-color:${COLORS.secondary};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${COLORS.accent};stop-opacity:1" />
    </linearGradient>
    <linearGradient id="checkGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#00f260;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#0575e6;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="pendingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#ffeaa7;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#fab1a0;stop-opacity:1" />
    </linearGradient>
    <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
      <feDropShadow dx="0" dy="${2 * scale}" stdDeviation="${2 * scale}" flood-opacity="0.25"/>
    </filter>
  </defs>
  
  <!-- 主背景圆形 -->
  <circle cx="${size/2}" cy="${size/2}" r="${30 * scale}" fill="url(#bgGradient)" filter="url(#shadow)"/>
  
  <!-- 内部白色区域 -->
  <circle cx="${size/2}" cy="${size/2}" r="${24 * scale}" fill="white" fill-opacity="0.95"/>
  
  <!-- 已完成任务 -->
  <rect x="${12 * scale}" y="${18 * scale}" width="${8 * scale}" height="${8 * scale}" rx="${2 * scale}" fill="url(#checkGradient)"/>
  <path d="M${14.5 * scale} ${21.5 * scale} L${16 * scale} ${23 * scale} L${19.5 * scale} ${19.5 * scale}" 
        fill="none" 
        stroke="white" 
        stroke-width="${2 * scale}" 
        stroke-linecap="round" 
        stroke-linejoin="round"/>
  
  <!-- 待办任务 -->
  <rect x="${12 * scale}" y="${30 * scale}" width="${8 * scale}" height="${8 * scale}" rx="${2 * scale}" fill="url(#pendingGradient)"/>
  <rect x="${12 * scale}" y="${42 * scale}" width="${8 * scale}" height="${8 * scale}" rx="${2 * scale}" fill="#e5e7eb"/>
  
  <!-- 任务文本线条 -->
  <line x1="${24 * scale}" y1="${22 * scale}" x2="${48 * scale}" y2="${22 * scale}" 
        stroke="url(#checkGradient)" 
        stroke-width="${strokeWidth}" 
        stroke-linecap="round"/>
  <line x1="${24 * scale}" y1="${34 * scale}" x2="${46 * scale}" y2="${34 * scale}" 
        stroke="url(#pendingGradient)" 
        stroke-width="${strokeWidth}" 
        stroke-linecap="round"/>
  <line x1="${24 * scale}" y1="${46 * scale}" x2="${42 * scale}" y2="${46 * scale}" 
        stroke="#9ca3af" 
        stroke-width="${strokeWidth}" 
        stroke-linecap="round"/>
  
  <!-- 装饰性元素 -->
  <circle cx="${49 * scale}" cy="${22 * scale}" r="${1.5 * scale}" fill="url(#checkGradient)" fill-opacity="0.7"/>
  <circle cx="${47 * scale}" cy="${34 * scale}" r="${1.5 * scale}" fill="url(#pendingGradient)" fill-opacity="0.7"/>
  <circle cx="${43 * scale}" cy="${46 * scale}" r="${1.5 * scale}" fill="#9ca3af" fill-opacity="0.7"/>
  
  <!-- 顶部装饰弧线 -->
  <path d="M${20 * scale} ${12 * scale} Q${32 * scale} ${8 * scale} ${44 * scale} ${12 * scale}" 
        fill="none" 
        stroke="url(#bgGradient)" 
        stroke-width="${smallStrokeWidth}" 
        stroke-linecap="round" 
        opacity="0.6"/>
</svg>`;
}

/**
 * 主函数
 */
async function main() {
  console.log('🎨 开始生成 iOS PWA 图标...\n');
  
  const publicDir = path.join(__dirname, '..', 'public');
  const iconsDir = path.join(publicDir, 'icons');
  
  // 创建icons目录
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
    console.log('📁 创建 icons 目录');
  }
  
  // 生成说明文件
  const readmeContent = `# iOS PWA 图标说明

这些图标是为iOS PWA应用自动生成的，包含了iOS系统所需的各种尺寸。

## 图标列表

${IOS_ICON_SIZES.map(icon => `- **${icon.name}** (${icon.size}x${icon.size}) - ${icon.desc}`).join('\n')}

## 使用方式

这些图标会自动在HTML中引用，确保iOS设备能够正确显示PWA应用图标。

生成时间: ${new Date().toLocaleString('zh-CN')}
`;
  
  fs.writeFileSync(path.join(iconsDir, 'README.md'), readmeContent);
  
  // 为每个尺寸生成SVG文件（作为PNG的替代方案）
  let generatedCount = 0;
  
  for (const iconConfig of IOS_ICON_SIZES) {
    const svgContent = generateSVG(iconConfig.size);
    const svgPath = path.join(iconsDir, iconConfig.name.replace('.png', '.svg'));
    
    fs.writeFileSync(svgPath, svgContent);
    console.log(`✅ 生成 ${iconConfig.name.replace('.png', '.svg')} (${iconConfig.size}x${iconConfig.size}) - ${iconConfig.desc}`);
    generatedCount++;
  }
  
  console.log(`\n🎉 成功生成 ${generatedCount} 个图标文件！`);
  console.log('\n📝 下一步：');
  console.log('1. 运行 npm run update-ios-config 更新HTML和manifest配置');
  console.log('2. 如需PNG格式，请安装 sharp 或使用在线转换工具');
  console.log('3. 测试iOS Safari中的PWA安装功能');
}

// 运行主函数
main().catch(console.error);
