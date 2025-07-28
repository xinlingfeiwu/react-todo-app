#!/usr/bin/env node

/**
 * SVG转PNG脚本 - 专门为iOS PWA图标转换
 * iOS Safari需要PNG格式的apple-touch-icon才能正确显示
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// iOS需要的PNG图标尺寸
const IOS_PNG_SIZES = [
  { size: 57, name: 'apple-touch-icon-57x57.png' },
  { size: 60, name: 'apple-touch-icon-60x60.png' },
  { size: 72, name: 'apple-touch-icon-72x72.png' },
  { size: 76, name: 'apple-touch-icon-76x76.png' },
  { size: 114, name: 'apple-touch-icon-114x114.png' },
  { size: 120, name: 'apple-touch-icon-120x120.png' },
  { size: 144, name: 'apple-touch-icon-144x144.png' },
  { size: 152, name: 'apple-touch-icon-152x152.png' },
  { size: 167, name: 'apple-touch-icon-167x167.png' },
  { size: 180, name: 'apple-touch-icon-180x180.png' },
  { size: 192, name: 'icon-192x192.png' },
  { size: 512, name: 'icon-512x512.png' }
];

/**
 * 检查是否安装了sharp
 */
async function checkSharp() {
  try {
    const sharp = (await import('sharp')).default;
    return sharp !== undefined;
  } catch (_e) {
    return false;
  }
}

/**
 * 使用sharp转换SVG到PNG
 */
async function convertWithSharp() {
  const sharp = (await import('sharp')).default;
  
  const publicDir = path.join(__dirname, '..', 'public');
  const iconsDir = path.join(publicDir, 'icons');
  
  let convertedCount = 0;
  
  for (const iconConfig of IOS_PNG_SIZES) {
    const svgPath = path.join(iconsDir, iconConfig.name.replace('.png', '.svg'));
    const pngPath = path.join(iconsDir, iconConfig.name);
    
    if (fs.existsSync(svgPath)) {
      try {
        await sharp(svgPath)
          .resize(iconConfig.size, iconConfig.size)
          .png()
          .toFile(pngPath);
        
        console.log(`✅ 转换 ${iconConfig.name} (${iconConfig.size}x${iconConfig.size})`);
        convertedCount++;
      } catch (error) {
        console.error(`❌ 转换失败 ${iconConfig.name}:`, error.message);
      }
    } else {
      console.warn(`⚠️ SVG文件不存在: ${svgPath}`);
    }
  }
  
  return convertedCount;
}

/**
 * 生成在线转换指南
 */
function generateConversionGuide() {
  const guidePath = path.join(__dirname, '..', 'public', 'svg-to-png-guide.md');
  
  const guideContent = `# SVG转PNG图标指南

## 🎯 为什么需要PNG格式

iOS Safari对PWA图标有特殊要求：
- **apple-touch-icon必须是PNG格式**
- SVG格式在iOS Safari中无法正确显示
- 需要多个尺寸以适配不同设备

## 🔧 转换方法

### 方法一：使用Sharp (推荐)

1. 安装Sharp：
   \`\`\`bash
   npm install sharp --save-dev
   \`\`\`

2. 运行转换脚本：
   \`\`\`bash
   npm run convert-svg-to-png
   \`\`\`

### 方法二：在线转换工具

推荐的在线SVG转PNG工具：

1. **Convertio** - https://convertio.co/svg-png/
   - 支持批量转换
   - 可设置输出尺寸
   - 质量较高

2. **CloudConvert** - https://cloudconvert.com/svg-to-png
   - 专业转换服务
   - 支持API调用
   - 批量处理

3. **Online-Convert** - https://image.online-convert.com/convert-to-png
   - 简单易用
   - 支持尺寸调整
   - 免费使用

### 方法三：使用设计工具

1. **Figma**：
   - 导入SVG文件
   - 调整到目标尺寸
   - 导出为PNG格式

2. **Adobe Illustrator**：
   - 打开SVG文件
   - 文件 → 导出 → 导出为PNG
   - 设置对应尺寸

3. **Inkscape** (免费)：
   - 打开SVG文件
   - 文件 → 导出PNG图像
   - 设置宽度和高度

## 📋 需要转换的图标

${IOS_PNG_SIZES.map(icon => `- **${icon.name}** (${icon.size}x${icon.size})`).join('\n')}

## 🔄 转换后的操作

1. 将PNG文件放入 \`public/icons/\` 目录
2. 运行 \`npm run update-ios-png-config\` 更新HTML配置
3. 重新构建和部署应用
4. 在iOS Safari中测试PWA安装

## 📱 验证方法

1. 在iOS Safari中访问应用
2. 点击分享按钮 → "添加到主屏幕"
3. 检查预览中的图标是否正确显示
4. 安装后检查主屏幕图标

---

生成时间: ${new Date().toLocaleString('zh-CN')}
`;
  
  fs.writeFileSync(guidePath, guideContent);
  console.log('✅ 生成转换指南: public/svg-to-png-guide.md');
}

/**
 * 主函数
 */
async function main() {
  console.log('🔄 开始SVG转PNG转换...\n');
  
  if (await checkSharp()) {
    console.log('📦 检测到Sharp，使用Sharp进行转换...\n');
    
    try {
      const convertedCount = await convertWithSharp();
      console.log(`\n🎉 成功转换 ${convertedCount} 个PNG图标！`);
      
      if (convertedCount > 0) {
        console.log('\n📝 下一步：');
        console.log('1. 运行 npm run update-ios-png-config 更新HTML配置');
        console.log('2. 构建并部署应用');
        console.log('3. 在iOS Safari中测试PWA图标显示');
      }
    } catch (error) {
      console.error('❌ Sharp转换失败：', error.message);
      console.log('\n💡 请尝试手动转换或使用在线工具');
    }
  } else {
    console.log('⚠️ 未检测到Sharp包');
    console.log('\n💡 安装Sharp以自动转换：');
    console.log('   npm install sharp --save-dev');
    console.log('   npm run convert-svg-to-png');
    console.log('\n📋 或者使用在线转换工具，详见转换指南');
  }
  
  // 生成转换指南
  generateConversionGuide();
  
  console.log('\n📖 查看完整转换指南: public/svg-to-png-guide.md');
}

// 运行主函数
main().catch(console.error);
