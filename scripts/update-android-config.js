#!/usr/bin/env node

/**
 * 更新Android PWA配置脚本
 * 更新HTML和manifest.json以支持Android PWA图标和功能
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 更新HTML文件，添加Android PWA配置
 */
function updateHTML() {
  const htmlPath = path.join(__dirname, '..', 'index.html');
  let htmlContent = fs.readFileSync(htmlPath, 'utf8');
  
  console.log('📝 更新 index.html 添加Android PWA配置...');
  
  // Android PWA专用的meta标签
  const androidMetaTags = `
    <!-- Android PWA 专用配置 -->
    <meta name="mobile-web-app-capable" content="yes" />
    <meta name="mobile-web-app-status-bar-style" content="default" />
    <meta name="mobile-web-app-title" content="待办清单" />
    
    <!-- Android Chrome 主题色 -->
    <meta name="theme-color" content="#667eea" />
    <meta name="msapplication-navbutton-color" content="#667eea" />
    
    <!-- Android 安装横幅优化 -->
    <meta name="google-site-verification" content="" />
    
    <!-- Android 图标链接 -->
    <link rel="icon" type="image/svg+xml" sizes="192x192" href="./icons/android-chrome-192x192.svg" />
    <link rel="icon" type="image/svg+xml" sizes="512x512" href="./icons/android-chrome-512x512.svg" />
    <link rel="shortcut icon" href="./icons/android-chrome-192x192.svg" />`;
  
  // 在PWA应用相关部分添加Android配置
  const pwaRegex = /(<!-- PWA 应用相关 -->[\s\S]*?)(\n\s*<!-- 性能优化 -->)/;
  
  if (pwaRegex.test(htmlContent)) {
    htmlContent = htmlContent.replace(pwaRegex, (match, pwaSection, nextSection) => {
      // 检查是否已经包含Android配置
      if (!pwaSection.includes('Android PWA 专用配置')) {
        return pwaSection + androidMetaTags + nextSection;
      }
      return match;
    });
  } else {
    // 如果找不到PWA应用相关部分，在head中添加
    const headRegex = /(<head>[\s\S]*?)(\n\s*<\/head>)/;
    htmlContent = htmlContent.replace(headRegex, (match, headContent, closeHead) => {
      return headContent + '\n' + androidMetaTags + closeHead;
    });
  }
  
  fs.writeFileSync(htmlPath, htmlContent);
  console.log('✅ index.html Android配置更新完成');
}

/**
 * 更新manifest.json，添加Android图标和配置
 */
function updateManifest() {
  const manifestPath = path.join(__dirname, '..', 'public', 'manifest.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  
  console.log('📝 更新 manifest.json 添加Android配置...');
  
  // 添加Android图标到现有图标数组
  const androidIcons = [
    // Android标准图标
    {
      "src": "./icons/android-chrome-36x36.svg",
      "sizes": "36x36",
      "type": "image/svg+xml",
      "purpose": "any",
      "density": "0.75"
    },
    {
      "src": "./icons/android-chrome-48x48.svg",
      "sizes": "48x48",
      "type": "image/svg+xml",
      "purpose": "any",
      "density": "1.0"
    },
    {
      "src": "./icons/android-chrome-72x72.svg",
      "sizes": "72x72",
      "type": "image/svg+xml",
      "purpose": "any",
      "density": "1.5"
    },
    {
      "src": "./icons/android-chrome-96x96.svg",
      "sizes": "96x96",
      "type": "image/svg+xml",
      "purpose": "any",
      "density": "2.0"
    },
    {
      "src": "./icons/android-chrome-144x144.svg",
      "sizes": "144x144",
      "type": "image/svg+xml",
      "purpose": "any",
      "density": "3.0"
    },
    {
      "src": "./icons/android-chrome-192x192.svg",
      "sizes": "192x192",
      "type": "image/svg+xml",
      "purpose": "any",
      "density": "4.0"
    },
    {
      "src": "./icons/android-chrome-256x256.svg",
      "sizes": "256x256",
      "type": "image/svg+xml",
      "purpose": "any"
    },
    {
      "src": "./icons/android-chrome-384x384.svg",
      "sizes": "384x384",
      "type": "image/svg+xml",
      "purpose": "any"
    },
    {
      "src": "./icons/android-chrome-512x512.svg",
      "sizes": "512x512",
      "type": "image/svg+xml",
      "purpose": "any"
    },
    // Maskable图标（Android自适应）
    {
      "src": "./icons/maskable-icon-192x192.svg",
      "sizes": "192x192",
      "type": "image/svg+xml",
      "purpose": "maskable"
    },
    {
      "src": "./icons/maskable-icon-512x512.svg",
      "sizes": "512x512",
      "type": "image/svg+xml",
      "purpose": "maskable"
    }
  ];
  
  // 将Android图标添加到现有图标数组
  manifest.icons = [...manifest.icons, ...androidIcons];
  
  // 优化Android PWA配置
  manifest.display = "standalone";
  manifest.orientation = "portrait-primary";
  manifest.start_url = "./";
  manifest.scope = "./";
  manifest.theme_color = "#667eea";
  manifest.background_color = "#667eea";
  
  // 添加Android专用配置
  manifest.android = {
    "package_name": "com.todoapp.pwa",
    "sha256_cert_fingerprints": [],
    "version_code": 1,
    "version_name": "1.0.0",
    "min_sdk_version": 21,
    "target_sdk_version": 33,
    "permissions": [
      "android.permission.INTERNET",
      "android.permission.ACCESS_NETWORK_STATE"
    ],
    "features": [
      "android.software.webview",
      "android.hardware.touchscreen"
    ]
  };
  
  // 优化安装横幅
  manifest.prefer_related_applications = false;
  manifest.related_applications = [];
  
  // 添加更多PWA功能
  manifest.categories = ["productivity", "utilities", "lifestyle"];
  manifest.iarc_rating_id = "";
  
  // 优化shortcuts配置，使用Android图标
  if (manifest.shortcuts) {
    manifest.shortcuts = manifest.shortcuts.map(shortcut => ({
      ...shortcut,
      icons: [
        {
          "src": "./icons/android-chrome-192x192.svg",
          "sizes": "192x192",
          "type": "image/svg+xml"
        }
      ]
    }));
  }
  
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log('✅ manifest.json Android配置更新完成');
}

/**
 * 生成Android PWA安装指南
 */
function generateAndroidInstallGuide() {
  const guidePath = path.join(__dirname, '..', 'public', 'android-install-guide.md');
  
  const guideContent = `# Android PWA 安装指南

## 📱 如何在Android设备上安装待办清单应用

### 方法一：Chrome浏览器安装（推荐）

1. **打开Chrome浏览器**
   - 在Android设备上打开Chrome浏览器
   - 访问应用网址

2. **查看安装提示**
   - Chrome会自动显示"添加到主屏幕"横幅
   - 或者点击右上角菜单 ⋮ → "添加到主屏幕"

3. **确认安装**
   - 确认应用名称和图标
   - 点击"添加"按钮
   - 应用图标将出现在主屏幕和应用抽屉中

### 方法二：其他浏览器安装

1. **Firefox浏览器**
   - 访问应用网址
   - 点击地址栏右侧的"安装"图标
   - 确认安装

2. **Edge浏览器**
   - 访问应用网址
   - 点击右上角菜单 → "应用" → "将此站点安装为应用"

3. **Samsung Internet**
   - 访问应用网址
   - 点击菜单 → "添加页面到" → "主屏幕"

### 🎯 安装后的优势

- **原生应用体验**：独立窗口运行，无浏览器界面
- **快速启动**：从主屏幕或应用抽屉直接启动
- **自适应图标**：支持Android自适应图标系统
- **离线使用**：支持离线访问和使用
- **系统集成**：出现在最近使用的应用列表中
- **通知支持**：支持Web推送通知（如果启用）

### 🔧 故障排除

如果无法安装或图标显示不正确：

1. **更新Chrome浏览器**
   - 确保Chrome版本为76或更高
   - 前往Play Store更新Chrome

2. **检查网络连接**
   - 确保网络连接稳定
   - 尝试使用WiFi网络

3. **清除浏览器缓存**
   - Chrome设置 → 隐私和安全 → 清除浏览数据
   - 选择"缓存的图片和文件"

4. **重新安装应用**
   - 长按主屏幕上的应用图标 → 卸载
   - 重新按照上述步骤安装

5. **检查Android版本**
   - 确保Android版本为5.0或更高
   - 建议Android 8.0+以获得最佳体验

### 📊 兼容性信息

| 浏览器 | 最低版本 | PWA支持 | 自适应图标 |
|--------|----------|---------|------------|
| Chrome | 76+ | ✅ 完整支持 | ✅ 支持 |
| Firefox | 85+ | ✅ 支持 | ❌ 不支持 |
| Edge | 79+ | ✅ 支持 | ✅ 支持 |
| Samsung Internet | 12+ | ✅ 支持 | ✅ 支持 |

### 🎨 自适应图标说明

Android 8.0+设备支持自适应图标：
- **圆形**：在圆形图标主题下显示
- **方形**：在方形图标主题下显示
- **水滴形**：在水滴形图标主题下显示
- **其他形状**：根据系统主题自动适配

### 📞 技术支持

如果仍有问题，请：
- 检查设备和浏览器兼容性
- 尝试重启设备
- 联系技术支持并提供设备型号和Android版本

---

更新时间: ${new Date().toLocaleString('zh-CN')}
`;
  
  fs.writeFileSync(guidePath, guideContent);
  console.log('✅ Android安装指南生成完成');
}

/**
 * 主函数
 */
async function main() {
  console.log('🤖 开始更新Android PWA配置...\n');
  
  try {
    // 更新HTML配置
    updateHTML();
    
    // 更新manifest配置
    updateManifest();
    
    // 生成安装指南
    generateAndroidInstallGuide();
    
    console.log('\n🎉 Android PWA配置更新完成！');
    console.log('\n📝 下一步：');
    console.log('1. 运行 npm run generate-android-icons 生成Android图标文件');
    console.log('2. 构建并部署应用');
    console.log('3. 在Android Chrome中测试PWA安装功能');
    console.log('4. 检查主屏幕图标是否正确显示');
    console.log('5. 测试自适应图标在不同主题下的显示效果');
    
  } catch (error) {
    console.error('❌ 更新Android配置时出错：', error.message);
    process.exit(1);
  }
}

// 运行主函数
main().catch(console.error);
