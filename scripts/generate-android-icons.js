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

/**
 * 生成标准Android图标SVG
 */
function generateAndroidSVG(size) {
  const baseSvgPath = path.join(__dirname, '..', 'public', 'todo-icon.svg');

  // 检查基础SVG文件是否存在
  if (!fs.existsSync(baseSvgPath)) {
    throw new Error(`基础SVG文件不存在: ${baseSvgPath}`);
  }

  // 读取基础SVG内容
  let svgContent = fs.readFileSync(baseSvgPath, 'utf8');

  // 为每个尺寸创建唯一的ID前缀，避免ID冲突
  const idPrefix = `android${size}`;

  // 替换所有ID引用，避免多个SVG在同一页面时的ID冲突
  svgContent = svgContent.replace(/id="([^"]+)"/g, `id="${idPrefix}_$1"`);
  svgContent = svgContent.replace(/url\(#([^)]+)\)/g, `url(#${idPrefix}_$1)`);
  svgContent = svgContent.replace(/filter="url\(#([^)]+)\)"/g, `filter="url(#${idPrefix}_$1)"`);

  // 直接更新viewBox和尺寸，不使用transform缩放
  svgContent = svgContent.replace(
    /viewBox="0 0 64 64" width="64" height="64"/,
    `viewBox="0 0 64 64" width="${size}" height="${size}"`
  );

  return svgContent;
}

/**
 * 生成Maskable图标SVG（Android自适应图标）
 */
function generateMaskableSVG(size) {
  const baseSvgPath = path.join(__dirname, '..', 'public', 'todo-icon.svg');

  // 检查基础SVG文件是否存在
  if (!fs.existsSync(baseSvgPath)) {
    throw new Error(`基础SVG文件不存在: ${baseSvgPath}`);
  }

  // 读取基础SVG内容
  let svgContent = fs.readFileSync(baseSvgPath, 'utf8');

  // 为Maskable图标创建唯一的ID前缀，避免ID冲突
  const idPrefix = `maskable${size}`;

  // 替换所有ID引用，避免多个SVG在同一页面时的ID冲突
  svgContent = svgContent.replace(/id="([^"]+)"/g, `id="${idPrefix}_$1"`);
  svgContent = svgContent.replace(/url\(#([^)]+)\)/g, `url(#${idPrefix}_$1)`);
  svgContent = svgContent.replace(/filter="url\(#([^)]+)\)"/g, `filter="url(#${idPrefix}_$1)"`);

  // 直接更新viewBox和尺寸，不使用transform缩放
  svgContent = svgContent.replace(
    /viewBox="0 0 64 64" width="64" height="64"/,
    `viewBox="0 0 64 64" width="${size}" height="${size}"`
  );

  // Maskable图标需要在安全区域内（中心80%区域）
  // 添加背景和安全区域缩放
  const safeZoneScale = 0.8;
  const offset = size * 0.1; // 10%边距

  // 为maskable图标添加全尺寸背景和安全区域缩放
  svgContent = svgContent.replace(
    /(<svg[^>]*>)/,
    `$1
  <!-- Maskable图标全尺寸背景 -->
  <rect x="0" y="0" width="${size}" height="${size}" fill="url(#${idPrefix}_bgGradient)" opacity="0.1"/>
  <g transform="translate(${offset}, ${offset}) scale(${safeZoneScale})">`
  );

  svgContent = svgContent.replace(
    /(<\/svg>)/,
    '  </g>\n$1'
  );

  return svgContent;
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
