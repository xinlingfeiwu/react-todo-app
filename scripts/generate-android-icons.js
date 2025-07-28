#!/usr/bin/env node

/**
 * Android PWA 图标生成脚本
 * 从SVG图标生成Android所需的各种尺寸PNG图标，包括maskable图标
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Android PWA 所需的图标尺寸
const ANDROID_ICON_SIZES = [
  { size: 36, name: 'android-chrome-36x36.svg', desc: 'Android LDPI' },
  { size: 48, name: 'android-chrome-48x48.svg', desc: 'Android MDPI' },
  { size: 72, name: 'android-chrome-72x72.svg', desc: 'Android HDPI' },
  { size: 96, name: 'android-chrome-96x96.svg', desc: 'Android XHDPI' },
  { size: 144, name: 'android-chrome-144x144.svg', desc: 'Android XXHDPI' },
  { size: 192, name: 'android-chrome-192x192.svg', desc: 'Android XXXHDPI' },
  { size: 256, name: 'android-chrome-256x256.svg', desc: 'Android 高分辨率' },
  { size: 384, name: 'android-chrome-384x384.svg', desc: 'Android 超高分辨率' },
  { size: 512, name: 'android-chrome-512x512.svg', desc: 'Android 最高分辨率' }
];

// Maskable图标尺寸（Android自适应图标）
const MASKABLE_ICON_SIZES = [
  { size: 192, name: 'maskable-icon-192x192.svg', desc: 'Android Maskable 标准' },
  { size: 512, name: 'maskable-icon-512x512.svg', desc: 'Android Maskable 大尺寸' }
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
 * 生成标准Android图标SVG
 */
function generateAndroidSVG(size) {
  const scale = size / 64;
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
 * 生成Maskable图标SVG（Android自适应图标）
 */
function generateMaskableSVG(size) {
  const scale = size / 64;
  const strokeWidth = Math.max(1, 2.5 * scale);
  const smallStrokeWidth = Math.max(0.5, 1.5 * scale);
  
  // Maskable图标需要在安全区域内（中心80%区域）
  const safeZoneScale = scale * 0.8;
  const offset = size * 0.1; // 10%边距
  
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
      <feDropShadow dx="0" dy="${2 * safeZoneScale}" stdDeviation="${2 * safeZoneScale}" flood-opacity="0.25"/>
    </filter>
  </defs>
  
  <!-- 全尺寸背景（确保maskable图标有完整背景） -->
  <rect x="0" y="0" width="${size}" height="${size}" fill="url(#bgGradient)" opacity="0.1"/>
  
  <!-- 主背景圆形（在安全区域内） -->
  <circle cx="${size/2}" cy="${size/2}" r="${30 * safeZoneScale}" fill="url(#bgGradient)" filter="url(#shadow)"/>
  
  <!-- 内部白色区域 -->
  <circle cx="${size/2}" cy="${size/2}" r="${24 * safeZoneScale}" fill="white" fill-opacity="0.95"/>
  
  <!-- 已完成任务 -->
  <rect x="${12 * safeZoneScale + offset}" y="${18 * safeZoneScale + offset}" width="${8 * safeZoneScale}" height="${8 * safeZoneScale}" rx="${2 * safeZoneScale}" fill="url(#checkGradient)"/>
  <path d="M${14.5 * safeZoneScale + offset} ${21.5 * safeZoneScale + offset} L${16 * safeZoneScale + offset} ${23 * safeZoneScale + offset} L${19.5 * safeZoneScale + offset} ${19.5 * safeZoneScale + offset}" 
        fill="none" 
        stroke="white" 
        stroke-width="${2 * safeZoneScale}" 
        stroke-linecap="round" 
        stroke-linejoin="round"/>
  
  <!-- 待办任务 -->
  <rect x="${12 * safeZoneScale + offset}" y="${30 * safeZoneScale + offset}" width="${8 * safeZoneScale}" height="${8 * safeZoneScale}" rx="${2 * safeZoneScale}" fill="url(#pendingGradient)"/>
  <rect x="${12 * safeZoneScale + offset}" y="${42 * safeZoneScale + offset}" width="${8 * safeZoneScale}" height="${8 * safeZoneScale}" rx="${2 * safeZoneScale}" fill="#e5e7eb"/>
  
  <!-- 任务文本线条 -->
  <line x1="${24 * safeZoneScale + offset}" y1="${22 * safeZoneScale + offset}" x2="${48 * safeZoneScale + offset}" y2="${22 * safeZoneScale + offset}" 
        stroke="url(#checkGradient)" 
        stroke-width="${strokeWidth * 0.8}" 
        stroke-linecap="round"/>
  <line x1="${24 * safeZoneScale + offset}" y1="${34 * safeZoneScale + offset}" x2="${46 * safeZoneScale + offset}" y2="${34 * safeZoneScale + offset}" 
        stroke="url(#pendingGradient)" 
        stroke-width="${strokeWidth * 0.8}" 
        stroke-linecap="round"/>
  <line x1="${24 * safeZoneScale + offset}" y1="${46 * safeZoneScale + offset}" x2="${42 * safeZoneScale + offset}" y2="${46 * safeZoneScale + offset}" 
        stroke="#9ca3af" 
        stroke-width="${strokeWidth * 0.8}" 
        stroke-linecap="round"/>
  
  <!-- 装饰性元素 -->
  <circle cx="${49 * safeZoneScale + offset}" cy="${22 * safeZoneScale + offset}" r="${1.5 * safeZoneScale}" fill="url(#checkGradient)" fill-opacity="0.7"/>
  <circle cx="${47 * safeZoneScale + offset}" cy="${34 * safeZoneScale + offset}" r="${1.5 * safeZoneScale}" fill="url(#pendingGradient)" fill-opacity="0.7"/>
  <circle cx="${43 * safeZoneScale + offset}" cy="${46 * safeZoneScale + offset}" r="${1.5 * safeZoneScale}" fill="#9ca3af" fill-opacity="0.7"/>
  
  <!-- 顶部装饰弧线 -->
  <path d="M${20 * safeZoneScale + offset} ${12 * safeZoneScale + offset} Q${32 * safeZoneScale + offset} ${8 * safeZoneScale + offset} ${44 * safeZoneScale + offset} ${12 * safeZoneScale + offset}" 
        fill="none" 
        stroke="url(#bgGradient)" 
        stroke-width="${smallStrokeWidth * 0.8}" 
        stroke-linecap="round" 
        opacity="0.6"/>
</svg>`;
}

/**
 * 主函数
 */
async function main() {
  console.log('🤖 开始生成 Android PWA 图标...\n');
  
  const publicDir = path.join(__dirname, '..', 'public');
  const iconsDir = path.join(publicDir, 'icons');
  
  // 确保icons目录存在
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
    console.log('📁 创建 icons 目录');
  }
  
  let generatedCount = 0;
  
  // 生成标准Android图标
  console.log('📱 生成标准Android图标...');
  for (const iconConfig of ANDROID_ICON_SIZES) {
    const svgContent = generateAndroidSVG(iconConfig.size);
    const svgPath = path.join(iconsDir, iconConfig.name);
    
    fs.writeFileSync(svgPath, svgContent);
    console.log(`✅ 生成 ${iconConfig.name} (${iconConfig.size}x${iconConfig.size}) - ${iconConfig.desc}`);
    generatedCount++;
  }
  
  // 生成Maskable图标
  console.log('\n🎭 生成Maskable图标（Android自适应）...');
  for (const iconConfig of MASKABLE_ICON_SIZES) {
    const svgContent = generateMaskableSVG(iconConfig.size);
    const svgPath = path.join(iconsDir, iconConfig.name);
    
    fs.writeFileSync(svgPath, svgContent);
    console.log(`✅ 生成 ${iconConfig.name} (${iconConfig.size}x${iconConfig.size}) - ${iconConfig.desc}`);
    generatedCount++;
  }
  
  // 生成Android说明文件
  const androidReadmeContent = `# Android PWA 图标说明

这些图标是为Android PWA应用自动生成的，包含了Android系统所需的各种尺寸和格式。

## 标准Android图标

${ANDROID_ICON_SIZES.map(icon => `- **${icon.name}** (${icon.size}x${icon.size}) - ${icon.desc}`).join('\n')}

## Maskable图标（自适应图标）

${MASKABLE_ICON_SIZES.map(icon => `- **${icon.name}** (${icon.size}x${icon.size}) - ${icon.desc}`).join('\n')}

## 使用方式

- **标准图标**: 用于常规的Android PWA显示
- **Maskable图标**: 支持Android自适应图标系统，可以被系统裁剪成不同形状

## Android PWA特性

- 支持Android 5.0+
- 兼容Chrome 76+
- 支持自适应图标
- 优化安装横幅体验

生成时间: ${new Date().toLocaleString('zh-CN')}
`;
  
  fs.writeFileSync(path.join(iconsDir, 'ANDROID_README.md'), androidReadmeContent);
  
  console.log(`\n🎉 成功生成 ${generatedCount} 个Android图标文件！`);
  console.log('\n📝 下一步：');
  console.log('1. 运行 npm run update-android-config 更新HTML和manifest配置');
  console.log('2. 如需PNG格式，请安装 sharp 或使用在线转换工具');
  console.log('3. 测试Android Chrome中的PWA安装功能');
}

// 运行主函数
main().catch(console.error);
