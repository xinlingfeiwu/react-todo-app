#!/usr/bin/env node

/**
 * 更新iOS PWA配置脚本
 * 更新HTML和manifest.json以支持iOS PWA图标
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// iOS图标配置
const IOS_ICONS = [
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
 * 更新HTML文件
 */
function updateHTML() {
  const htmlPath = path.join(__dirname, '..', 'index.html');
  let htmlContent = fs.readFileSync(htmlPath, 'utf8');
  
  console.log('📝 更新 index.html...');
  
  // 找到现有的apple-touch-icon行并替换
  const appleIconRegex = /<link rel="apple-touch-icon"[^>]*>/g;
  
  // 生成新的iOS图标链接
  const iosIconLinks = IOS_ICONS.map(icon => 
    `    <link rel="${icon.rel}" sizes="${icon.sizes}" href="./icons/apple-touch-icon-${icon.sizes}.svg" />`
  ).join('\n');
  
  // 添加iOS专用的meta标签
  const iosMetaTags = `
    <!-- iOS PWA 专用配置 -->
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="default" />
    <meta name="apple-mobile-web-app-title" content="待办清单" />
    <meta name="apple-touch-fullscreen" content="yes" />
    
    <!-- iOS 图标配置 -->
${iosIconLinks}
    <link rel="apple-touch-icon" href="./icons/apple-touch-icon-180x180.svg" />`;
  
  // 替换现有的apple-touch-icon配置
  if (appleIconRegex.test(htmlContent)) {
    htmlContent = htmlContent.replace(appleIconRegex, '');
  }
  
  // 在图标配置部分添加iOS配置
  const iconSectionRegex = /(<!-- 图标配置 -->[\s\S]*?)(\n\s*<!-- 视口和性能优化 -->)/;
  
  if (iconSectionRegex.test(htmlContent)) {
    htmlContent = htmlContent.replace(iconSectionRegex, (match, iconSection, nextSection) => {
      return iconSection + iosMetaTags + nextSection;
    });
  } else {
    // 如果找不到图标配置部分，在head中添加
    const headRegex = /(<head>[\s\S]*?)(\n\s*<\/head>)/;
    htmlContent = htmlContent.replace(headRegex, (match, headContent, closeHead) => {
      return headContent + '\n' + iosMetaTags + closeHead;
    });
  }
  
  fs.writeFileSync(htmlPath, htmlContent);
  console.log('✅ index.html 更新完成');
}

/**
 * 更新manifest.json
 */
function updateManifest() {
  const manifestPath = path.join(__dirname, '..', 'public', 'manifest.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  
  console.log('📝 更新 manifest.json...');
  
  // 更新图标配置，添加PNG和SVG两种格式
  manifest.icons = [
    // 小尺寸图标
    {
      "src": "./favicon.svg",
      "sizes": "32x32",
      "type": "image/svg+xml",
      "purpose": "any"
    },
    {
      "src": "./icons/apple-touch-icon-57x57.svg",
      "sizes": "57x57",
      "type": "image/svg+xml",
      "purpose": "any"
    },
    {
      "src": "./icons/apple-touch-icon-72x72.svg",
      "sizes": "72x72",
      "type": "image/svg+xml",
      "purpose": "any"
    },
    {
      "src": "./icons/apple-touch-icon-120x120.svg",
      "sizes": "120x120",
      "type": "image/svg+xml",
      "purpose": "any"
    },
    {
      "src": "./icons/apple-touch-icon-152x152.svg",
      "sizes": "152x152",
      "type": "image/svg+xml",
      "purpose": "any"
    },
    {
      "src": "./icons/apple-touch-icon-180x180.svg",
      "sizes": "180x180",
      "type": "image/svg+xml",
      "purpose": "any"
    },
    // 标准PWA图标
    {
      "src": "./icons/icon-192x192.svg",
      "sizes": "192x192",
      "type": "image/svg+xml",
      "purpose": "any maskable"
    },
    {
      "src": "./icons/icon-512x512.svg",
      "sizes": "512x512",
      "type": "image/svg+xml",
      "purpose": "any"
    }
  ];
  
  // 优化iOS相关配置
  manifest.display = "standalone";
  manifest.orientation = "portrait-primary";
  manifest.start_url = "./";
  manifest.scope = "./";
  
  // 添加iOS专用配置
  manifest.apple = {
    "touch_icon": {
      "sizes": "180x180",
      "href": "./icons/apple-touch-icon-180x180.svg"
    },
    "mobile_web_app_capable": true,
    "mobile_web_app_status_bar_style": "default",
    "mobile_web_app_title": "待办清单"
  };
  
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log('✅ manifest.json 更新完成');
}

/**
 * 生成iOS PWA安装指南
 */
function generateInstallGuide() {
  const guidePath = path.join(__dirname, '..', 'public', 'ios-install-guide.md');
  
  const guideContent = `# iOS PWA 安装指南

## 📱 如何在iOS设备上安装待办清单应用

### 方法一：Safari浏览器安装

1. **打开Safari浏览器**
   - 在iOS设备上打开Safari浏览器
   - 访问应用网址

2. **添加到主屏幕**
   - 点击底部的"分享"按钮 📤
   - 在分享菜单中找到"添加到主屏幕"选项
   - 点击"添加到主屏幕"

3. **确认安装**
   - 确认应用名称和图标
   - 点击右上角的"添加"按钮
   - 应用图标将出现在主屏幕上

### 方法二：Chrome浏览器安装

1. **打开Chrome浏览器**
   - 在iOS设备上打开Chrome浏览器
   - 访问应用网址

2. **添加到主屏幕**
   - 点击右上角的"更多"按钮 ⋯
   - 选择"添加到主屏幕"
   - 确认安装

### 🎯 安装后的优势

- **独立应用体验**：像原生应用一样运行
- **快速启动**：直接从主屏幕启动
- **全屏显示**：没有浏览器地址栏干扰
- **离线使用**：支持离线访问和使用
- **推送通知**：支持应用通知（如果启用）

### 🔧 故障排除

如果图标显示不正确：

1. **清除Safari缓存**
   - 设置 → Safari → 清除历史记录和网站数据

2. **重新安装应用**
   - 删除主屏幕上的应用图标
   - 重新按照上述步骤安装

3. **检查iOS版本**
   - 确保iOS版本为11.0或更高
   - 更新到最新版本以获得最佳体验

4. **网络连接**
   - 确保网络连接稳定
   - 尝试使用WiFi网络

### 📞 技术支持

如果仍有问题，请：
- 检查设备兼容性
- 尝试重启设备
- 联系技术支持

---

更新时间: ${new Date().toLocaleString('zh-CN')}
`;
  
  fs.writeFileSync(guidePath, guideContent);
  console.log('✅ iOS安装指南生成完成');
}

/**
 * 主函数
 */
async function main() {
  console.log('🔧 开始更新iOS PWA配置...\n');
  
  try {
    // 更新HTML配置
    updateHTML();
    
    // 更新manifest配置
    updateManifest();
    
    // 生成安装指南
    generateInstallGuide();
    
    console.log('\n🎉 iOS PWA配置更新完成！');
    console.log('\n📝 下一步：');
    console.log('1. 运行 npm run generate-icons 生成图标文件');
    console.log('2. 构建并部署应用');
    console.log('3. 在iOS Safari中测试PWA安装功能');
    console.log('4. 检查主屏幕图标是否正确显示');
    
  } catch (error) {
    console.error('❌ 更新配置时出错：', error.message);
    process.exit(1);
  }
}

// 运行主函数
main().catch(console.error);
