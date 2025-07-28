#!/usr/bin/env node

/**
 * 更新iOS PNG图标配置脚本
 * 将HTML中的apple-touch-icon链接更新为PNG格式
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// iOS PNG图标配置
const IOS_PNG_ICONS = [
  { size: 57, rel: 'apple-touch-icon', sizes: '57x57' },
  { size: 60, rel: 'apple-touch-icon', sizes: '60x60' },
  { size: 72, rel: 'apple-touch-icon', sizes: '72x72' },
  { size: 76, rel: 'apple-touch-icon', sizes: '76x76' },
  { size: 114, rel: 'apple-touch-icon', sizes: '114x114' },
  { size: 120, rel: 'apple-touch-icon', sizes: '120x120' },
  { size: 144, rel: 'apple-touch-icon', sizes: '144x144' },
  { size: 152, rel: 'apple-touch-icon', sizes: '152x152' },
  { size: 167, rel: 'apple-touch-icon', sizes: '167x167' },
  { size: 180, rel: 'apple-touch-icon', sizes: '180x180' }
];

/**
 * 检查PNG文件是否存在
 */
function checkPNGFiles() {
  const iconsDir = path.join(__dirname, '..', 'public', 'icons');
  const missingFiles = [];
  const existingFiles = [];
  
  for (const icon of IOS_PNG_ICONS) {
    const pngPath = path.join(iconsDir, `apple-touch-icon-${icon.sizes}.png`);
    if (fs.existsSync(pngPath)) {
      existingFiles.push(`apple-touch-icon-${icon.sizes}.png`);
    } else {
      missingFiles.push(`apple-touch-icon-${icon.sizes}.png`);
    }
  }
  
  return { existingFiles, missingFiles };
}

/**
 * 更新HTML文件
 */
function updateHTML() {
  const htmlPath = path.join(__dirname, '..', 'index.html');
  let htmlContent = fs.readFileSync(htmlPath, 'utf8');
  
  console.log('📝 更新 index.html 中的iOS图标配置...');
  
  // 检查PNG文件
  const { existingFiles, missingFiles } = checkPNGFiles();
  
  if (existingFiles.length === 0) {
    console.error('❌ 没有找到任何PNG图标文件');
    console.log('💡 请先运行: npm run convert-svg-to-png');
    return false;
  }
  
  if (missingFiles.length > 0) {
    console.warn(`⚠️ 缺少 ${missingFiles.length} 个PNG文件:`);
    missingFiles.forEach(file => console.warn(`   - ${file}`));
  }
  
  console.log(`✅ 找到 ${existingFiles.length} 个PNG文件`);
  
  // 删除现有的apple-touch-icon配置
  htmlContent = htmlContent.replace(
    /\s*<link rel="apple-touch-icon"[^>]*>/g,
    ''
  );
  
  // 生成新的PNG图标链接
  const pngIconLinks = IOS_PNG_ICONS
    .filter(icon => existingFiles.includes(`apple-touch-icon-${icon.sizes}.png`))
    .map(icon => 
      `    <link rel="${icon.rel}" sizes="${icon.sizes}" href="./icons/apple-touch-icon-${icon.sizes}.png" />`
    ).join('\n');
  
  // 添加默认的apple-touch-icon (180x180)
  const defaultIconLink = existingFiles.includes('apple-touch-icon-180x180.png') 
    ? '\n    <link rel="apple-touch-icon" href="./icons/apple-touch-icon-180x180.png" />'
    : '';
  
  const iosIconSection = `
    <!-- iOS PNG 图标配置 -->
${pngIconLinks}${defaultIconLink}`;
  
  // 在iOS PWA专用配置后添加PNG图标配置
  const iosConfigRegex = /(<!-- iOS PWA 专用配置 -->[\s\S]*?<meta name="apple-touch-fullscreen" content="yes" \/>)/;
  
  if (iosConfigRegex.test(htmlContent)) {
    htmlContent = htmlContent.replace(iosConfigRegex, `$1${iosIconSection}`);
  } else {
    // 如果找不到iOS配置部分，在head中添加
    const headRegex = /(<head>[\s\S]*?)(\n\s*<!-- 视口和性能优化 -->)/;
    if (headRegex.test(htmlContent)) {
      htmlContent = htmlContent.replace(headRegex, `$1${iosIconSection}\n$2`);
    }
  }
  
  // 清理多余的空行
  htmlContent = htmlContent.replace(/\n\s*\n\s*\n/g, '\n\n');
  
  fs.writeFileSync(htmlPath, htmlContent);
  console.log('✅ index.html 更新完成');
  
  return true;
}

/**
 * 更新manifest.json
 */
function updateManifest() {
  const manifestPath = path.join(__dirname, '..', 'public', 'manifest.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  
  console.log('📝 更新 manifest.json...');
  
  const { existingFiles } = checkPNGFiles();
  
  // 添加PNG图标到manifest
  const pngIcons = [
    // 保留现有的SVG图标
    ...manifest.icons,
    // 添加PNG图标
    ...IOS_PNG_ICONS
      .filter(icon => existingFiles.includes(`apple-touch-icon-${icon.sizes}.png`))
      .map(icon => ({
        "src": `./icons/apple-touch-icon-${icon.sizes}.png`,
        "sizes": icon.sizes,
        "type": "image/png",
        "purpose": "any"
      }))
  ];
  
  // 添加标准PNG图标
  if (existingFiles.includes('icon-192x192.png')) {
    pngIcons.push({
      "src": "./icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any"
    });
  }
  
  if (existingFiles.includes('icon-512x512.png')) {
    pngIcons.push({
      "src": "./icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any"
    });
  }
  
  manifest.icons = pngIcons;
  
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log('✅ manifest.json 更新完成');
}

/**
 * 生成iOS PWA测试指南
 */
function generateTestGuide() {
  const guidePath = path.join(__dirname, '..', 'public', 'ios-pwa-test-guide.md');
  
  const guideContent = `# iOS PWA 图标测试指南

## 🎯 测试目标

验证iOS Safari中PWA图标是否正确显示

## 📱 测试步骤

### 1. 清除缓存
- 设置 → Safari → 清除历史记录和网站数据
- 或者使用无痕浏览模式

### 2. 访问应用
- 在iOS Safari中打开应用网址
- 确保页面完全加载

### 3. 添加到主屏幕
- 点击底部的"分享"按钮 📤
- 选择"添加到主屏幕"
- **检查预览中的图标是否正确显示**

### 4. 确认安装
- 如果图标正确，点击"添加"
- 检查主屏幕上的图标

## 🔍 故障排除

### 图标仍然不显示？

1. **检查PNG文件**：
   \`\`\`bash
   ls -la public/icons/*.png
   \`\`\`

2. **检查文件大小**：
   - PNG文件不应该为0字节
   - 文件应该是有效的PNG格式

3. **检查HTML配置**：
   - 确保apple-touch-icon链接指向PNG文件
   - 检查文件路径是否正确

4. **网络问题**：
   - 确保PNG文件能够正常访问
   - 检查服务器MIME类型配置

### 常见问题

**Q: 为什么SVG不行？**
A: iOS Safari对apple-touch-icon有特殊要求，只支持PNG格式。

**Q: 需要哪些尺寸？**
A: 主要需要180x180，其他尺寸用于兼容旧设备。

**Q: 图标模糊怎么办？**
A: 确保PNG图标是高质量的，使用2x或3x分辨率。

## 📊 支持的尺寸

| 尺寸 | 设备 | 重要性 |
|------|------|--------|
| 180x180 | iPhone 6+ | ⭐⭐⭐ 必需 |
| 152x152 | iPad Retina | ⭐⭐⭐ 重要 |
| 120x120 | iPhone Retina | ⭐⭐ 推荐 |
| 76x76 | iPad | ⭐⭐ 推荐 |
| 其他尺寸 | 旧设备 | ⭐ 可选 |

## ✅ 成功标志

- 添加到主屏幕时预览显示正确图标
- 主屏幕上显示应用图标而不是网页截图
- 图标清晰，没有模糊或变形

---

测试时间: ${new Date().toLocaleString('zh-CN')}
`;
  
  fs.writeFileSync(guidePath, guideContent);
  console.log('✅ 生成测试指南: public/ios-pwa-test-guide.md');
}

/**
 * 主函数
 */
async function main() {
  console.log('🔧 开始更新iOS PNG图标配置...\n');
  
  try {
    // 更新HTML配置
    const htmlUpdated = updateHTML();
    
    if (htmlUpdated) {
      // 更新manifest配置
      updateManifest();
      
      // 生成测试指南
      generateTestGuide();
      
      console.log('\n🎉 iOS PNG图标配置更新完成！');
      console.log('\n📝 下一步：');
      console.log('1. 构建并部署应用');
      console.log('2. 在iOS Safari中测试PWA图标显示');
      console.log('3. 查看测试指南: public/ios-pwa-test-guide.md');
    }
    
  } catch (error) {
    console.error('❌ 更新配置时出错：', error.message);
    process.exit(1);
  }
}

// 运行主函数
main().catch(console.error);
