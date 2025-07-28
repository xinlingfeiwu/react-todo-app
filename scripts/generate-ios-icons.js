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

/**
 * 读取基础SVG文件并调整尺寸
 */
function generateSVG(size) {
  const baseSvgPath = path.join(__dirname, '..', 'public', 'todo-icon.svg');

  // 检查基础SVG文件是否存在
  if (!fs.existsSync(baseSvgPath)) {
    throw new Error(`基础SVG文件不存在: ${baseSvgPath}`);
  }

  // 读取基础SVG内容
  let svgContent = fs.readFileSync(baseSvgPath, 'utf8');

  // 更新SVG的尺寸属性
  svgContent = svgContent.replace(
    /viewBox="0 0 64 64" width="64" height="64"/,
    `viewBox="0 0 ${size} ${size}" width="${size}" height="${size}"`
  );

  // 如果需要缩放内部元素，可以添加transform
  if (size !== 64) {
    const scale = size / 64;
    // 在SVG开始标签后添加缩放组
    svgContent = svgContent.replace(
      /(<svg[^>]*>)/,
      `$1\n  <g transform="scale(${scale})">`
    );
    // 在SVG结束标签前关闭缩放组
    svgContent = svgContent.replace(
      /(<\/svg>)/,
      '  </g>\n$1'
    );
  }

  return svgContent;
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
