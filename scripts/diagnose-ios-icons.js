#!/usr/bin/env node

/**
 * iOS PWA图标诊断脚本
 * 检查和修复iOS Safari PWA图标显示问题
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 检查PNG文件
 */
function checkPNGFiles() {
  const iconsDir = path.join(__dirname, '..', 'public', 'icons');
  const requiredIcons = [
    'apple-touch-icon-57x57.png',
    'apple-touch-icon-60x60.png', 
    'apple-touch-icon-72x72.png',
    'apple-touch-icon-76x76.png',
    'apple-touch-icon-114x114.png',
    'apple-touch-icon-120x120.png',
    'apple-touch-icon-144x144.png',
    'apple-touch-icon-152x152.png',
    'apple-touch-icon-167x167.png',
    'apple-touch-icon-180x180.png'
  ];
  
  console.log('🔍 检查PNG图标文件...\n');
  
  let allExists = true;
  let totalSize = 0;
  
  for (const iconName of requiredIcons) {
    const iconPath = path.join(iconsDir, iconName);
    if (fs.existsSync(iconPath)) {
      const stats = fs.statSync(iconPath);
      const sizeKB = Math.round(stats.size / 1024);
      totalSize += stats.size;
      
      if (stats.size === 0) {
        console.log(`❌ ${iconName} - 文件为空 (0 bytes)`);
        allExists = false;
      } else if (stats.size < 1000) {
        console.log(`⚠️ ${iconName} - 文件过小 (${sizeKB}KB) 可能有问题`);
      } else {
        console.log(`✅ ${iconName} - ${sizeKB}KB`);
      }
    } else {
      console.log(`❌ ${iconName} - 文件不存在`);
      allExists = false;
    }
  }
  
  console.log(`\n📊 总计: ${Math.round(totalSize / 1024)}KB`);
  return allExists;
}

/**
 * 检查HTML配置
 */
function checkHTMLConfig() {
  const htmlPath = path.join(__dirname, '..', 'index.html');
  const htmlContent = fs.readFileSync(htmlPath, 'utf8');
  
  console.log('\n🔍 检查HTML配置...\n');
  
  // 检查apple-touch-icon链接
  const appleIconRegex = /<link rel="apple-touch-icon"[^>]*>/g;
  const matches = htmlContent.match(appleIconRegex) || [];
  
  console.log(`找到 ${matches.length} 个 apple-touch-icon 链接:`);
  
  let hasDefault = false;
  let has180x180 = false;
  
  matches.forEach((match, index) => {
    console.log(`${index + 1}. ${match}`);
    
    if (match.includes('href="./icons/apple-touch-icon-180x180.png"')) {
      if (match.includes('sizes="180x180"')) {
        has180x180 = true;
      } else if (!match.includes('sizes=')) {
        hasDefault = true;
      }
    }
  });
  
  console.log(`\n✅ 180x180图标: ${has180x180 ? '存在' : '缺失'}`);
  console.log(`✅ 默认图标: ${hasDefault ? '存在' : '缺失'}`);
  
  // 检查iOS PWA meta标签
  const iosMetas = [
    'apple-mobile-web-app-capable',
    'apple-mobile-web-app-status-bar-style', 
    'apple-mobile-web-app-title',
    'apple-touch-fullscreen'
  ];
  
  console.log('\n🔍 检查iOS PWA meta标签:');
  iosMetas.forEach(metaName => {
    const hasMetaRegex = new RegExp(`<meta name="${metaName}"[^>]*>`, 'i');
    const hasMeta = hasMetaRegex.test(htmlContent);
    console.log(`${hasMeta ? '✅' : '❌'} ${metaName}: ${hasMeta ? '存在' : '缺失'}`);
  });
  
  return { hasDefault, has180x180, totalLinks: matches.length };
}

/**
 * 生成优化的HTML配置
 */
function generateOptimizedHTML() {
  console.log('\n🔧 生成优化的iOS图标配置...\n');
  
  // iOS推荐的配置顺序和格式
  const optimizedConfig = `    <!-- iOS PWA 专用配置 -->
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="default" />
    <meta name="apple-mobile-web-app-title" content="待办清单" />
    <meta name="apple-touch-fullscreen" content="yes" />
    
    <!-- iOS 图标配置 (PNG格式) -->
    <link rel="apple-touch-icon" href="./icons/apple-touch-icon-180x180.png" />
    <link rel="apple-touch-icon" sizes="180x180" href="./icons/apple-touch-icon-180x180.png" />
    <link rel="apple-touch-icon" sizes="167x167" href="./icons/apple-touch-icon-167x167.png" />
    <link rel="apple-touch-icon" sizes="152x152" href="./icons/apple-touch-icon-152x152.png" />
    <link rel="apple-touch-icon" sizes="144x144" href="./icons/apple-touch-icon-144x144.png" />
    <link rel="apple-touch-icon" sizes="120x120" href="./icons/apple-touch-icon-120x120.png" />
    <link rel="apple-touch-icon" sizes="114x114" href="./icons/apple-touch-icon-114x114.png" />
    <link rel="apple-touch-icon" sizes="76x76" href="./icons/apple-touch-icon-76x76.png" />
    <link rel="apple-touch-icon" sizes="72x72" href="./icons/apple-touch-icon-72x72.png" />
    <link rel="apple-touch-icon" sizes="60x60" href="./icons/apple-touch-icon-60x60.png" />
    <link rel="apple-touch-icon" sizes="57x57" href="./icons/apple-touch-icon-57x57.png" />`;
  
  console.log('建议的HTML配置:');
  console.log(optimizedConfig);
  
  return optimizedConfig;
}

/**
 * 生成缓存清理指南
 */
function generateCacheCleaningGuide() {
  const guidePath = path.join(__dirname, '..', 'public', 'ios-cache-cleaning-guide.md');
  
  const guideContent = `# iOS PWA图标缓存清理指南

## 🎯 问题描述

iOS Safari会缓存PWA图标，即使更新了PNG文件，也可能显示旧的图标或默认图标。

## 🧹 清理方法

### 方法一：清除Safari缓存 (推荐)

1. **打开设置应用**
2. **滚动找到Safari**
3. **点击"清除历史记录和网站数据"**
4. **确认清除**

### 方法二：强制刷新

1. **在Safari中打开应用**
2. **长按刷新按钮**
3. **选择"重新加载页面"**
4. **等待页面完全加载**

### 方法三：无痕浏览模式测试

1. **打开Safari**
2. **点击右下角标签页按钮**
3. **点击"无痕"**
4. **在无痕模式下访问应用**
5. **测试添加到主屏幕**

### 方法四：删除现有PWA

1. **长按主屏幕上的应用图标**
2. **选择"删除应用"**
3. **清除Safari缓存**
4. **重新访问应用并添加到主屏幕**

## 🔍 验证步骤

1. **访问应用URL**
2. **检查页面是否完全加载**
3. **点击分享按钮 📤**
4. **选择"添加到主屏幕"**
5. **检查预览中的图标是否正确**

## ⚠️ 注意事项

- **iOS缓存很顽固**：可能需要多次清理
- **等待时间**：清理后等待几分钟再测试
- **网络连接**：确保网络连接稳定
- **文件访问**：确保PNG文件能正常访问

## 🛠️ 开发者调试

### 检查文件访问

在Safari中直接访问图标URL：
- https://your-domain.com/icons/apple-touch-icon-180x180.png

### 检查HTML源码

在Safari中查看页面源码，确认：
- apple-touch-icon链接指向PNG文件
- 文件路径正确
- 没有404错误

### 使用开发者工具

1. **Safari → 开发 → 显示Web检查器**
2. **检查Network标签页**
3. **查看图标文件是否成功加载**
4. **检查是否有404或其他错误**

---

更新时间: ${new Date().toLocaleString('zh-CN')}
`;
  
  fs.writeFileSync(guidePath, guideContent);
  console.log(`\n📖 生成缓存清理指南: public/ios-cache-cleaning-guide.md`);
}

/**
 * 主函数
 */
async function main() {
  console.log('🔍 iOS PWA图标诊断开始...\n');
  
  // 检查PNG文件
  const pngFilesOK = checkPNGFiles();
  
  // 检查HTML配置
  const htmlConfig = checkHTMLConfig();
  
  // 生成优化配置
  const optimizedHTML = generateOptimizedHTML();
  
  // 生成缓存清理指南
  generateCacheCleaningGuide();
  
  console.log('\n📋 诊断总结:');
  console.log(`PNG文件: ${pngFilesOK ? '✅ 正常' : '❌ 有问题'}`);
  console.log(`HTML配置: ${htmlConfig.totalLinks > 0 ? '✅ 存在' : '❌ 缺失'}`);
  console.log(`默认图标: ${htmlConfig.hasDefault ? '✅ 存在' : '❌ 缺失'}`);
  console.log(`180x180图标: ${htmlConfig.has180x180 ? '✅ 存在' : '❌ 缺失'}`);
  
  console.log('\n💡 建议的解决步骤:');
  console.log('1. 确保PNG文件正确生成: npm run convert-svg-to-png');
  console.log('2. 部署应用到服务器');
  console.log('3. 在iOS Safari中清除缓存');
  console.log('4. 使用无痕模式测试');
  console.log('5. 查看缓存清理指南: public/ios-cache-cleaning-guide.md');
  
  if (!pngFilesOK) {
    console.log('\n⚠️ 发现PNG文件问题，请运行: npm run setup-ios-png');
  }
}

// 运行主函数
main().catch(console.error);
