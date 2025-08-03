# SVG转PNG图标指南

## 🎯 为什么需要PNG格式

iOS Safari对PWA图标有特殊要求：

- **apple-touch-icon必须是PNG格式**
- SVG格式在iOS Safari中无法正确显示
- 需要多个尺寸以适配不同设备

## 🔧 转换方法

### 方法一：使用Sharp (推荐)

1. 安装Sharp：

   ```bash

   npm install sharp --save-dev

   ```

2. 运行转换脚本：

   ```bash

   npm run convert-svg-to-png

   ```

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

- **apple-touch-icon-57x57.png** (57x57)
- **apple-touch-icon-60x60.png** (60x60)
- **apple-touch-icon-72x72.png** (72x72)
- **apple-touch-icon-76x76.png** (76x76)
- **apple-touch-icon-114x114.png** (114x114)
- **apple-touch-icon-120x120.png** (120x120)
- **apple-touch-icon-144x144.png** (144x144)
- **apple-touch-icon-152x152.png** (152x152)
- **apple-touch-icon-167x167.png** (167x167)
- **apple-touch-icon-180x180.png** (180x180)
- **icon-192x192.png** (192x192)
- **icon-512x512.png** (512x512)

## 🔄 转换后的操作

1. 将PNG文件放入 `public/icons/` 目录
2. 运行 `npm run update-ios-png-config` 更新HTML配置
3. 重新构建和部署应用
4. 在iOS Safari中测试PWA安装

## 📱 验证方法

1. 在iOS Safari中访问应用
2. 点击分享按钮 → "添加到主屏幕"
3. 检查预览中的图标是否正确显示
4. 安装后检查主屏幕图标

---

生成时间: 2025/7/28 10:22:03
