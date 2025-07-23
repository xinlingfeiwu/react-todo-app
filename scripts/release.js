#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const currentVersion = packageJson.version;

function generateChangelog() {
  try {
    const lastTag = execSync('git describe --tags --abbrev=0 2>/dev/null || echo "初始版本"', { encoding: 'utf8' }).trim();
    const commits = execSync(`git log ${lastTag === '初始版本' ? '' : lastTag + '..'}HEAD --oneline --no-merges`, { encoding: 'utf8' }).trim();
    const contributors = execSync(`git log ${lastTag === '初始版本' ? '' : lastTag + '..'}HEAD --format='%an|%ae' | sort | uniq`, { encoding: 'utf8' }).trim();

    if (!commits) return '• 优化和修复';

    const commitLines = commits.split('\n');
    const categories = {
      features: [], fixes: [], docs: [], refactors: [], performances: [], tests: [], chores: [], others: []
    };

    commitLines.forEach(line => {
      const message = line.replace(/^[a-f0-9]+\s/, '').trim();
      const lowerMsg = message.toLowerCase();
      if (lowerMsg.includes('release v') && lowerMsg.startsWith('chore:')) return;

      let cleanMessage = message;
      if (message.includes(':')) {
        const [prefix, ...rest] = message.split(':');
        const content = rest.join(':').trim();
        switch (prefix.toLowerCase()) {
          case 'feat': case 'feature': categories.features.push(content); return;
          case 'fix': case 'bugfix': categories.fixes.push(content); return;
          case 'doc': case 'docs': categories.docs.push(content); return;
          case 'style': case 'perf': case 'performance': categories.performances.push(content); return;
          case 'refactor': categories.refactors.push(content); return;
          case 'test': case 'tests': categories.tests.push(content); return;
          case 'chore': case 'build': case 'ci': categories.chores.push(content); return;
        }
      }
      if (!lowerMsg.startsWith('initial commit') && !lowerMsg.includes('merge')) {
        categories.others.push(cleanMessage);
      }
    });

    let changelog = '';
    if (categories.features.length) changelog += '\n\n#### ✨ 新功能\n' + categories.features.map(i => `• ${i}`).join('\n');
    if (categories.fixes.length) changelog += '\n\n#### 🐛 问题修复\n' + categories.fixes.map(i => `• ${i}`).join('\n');
    if (categories.performances.length) changelog += '\n\n#### ⚡ 性能优化与样式更新\n' + categories.performances.map(i => `• ${i}`).join('\n');
    if (categories.refactors.length) changelog += '\n\n#### ♻️ 代码重构\n' + categories.refactors.map(i => `• ${i}`).join('\n');
    if (categories.docs.length) changelog += '\n\n#### 📚 文档更新\n' + categories.docs.map(i => `• ${i}`).join('\n');
    if (categories.tests.length) changelog += '\n\n#### 🧪 测试相关\n' + categories.tests.map(i => `• ${i}`).join('\n');
    if (categories.chores.length) changelog += '\n\n#### 🔧 构建/工具\n' + categories.chores.map(i => `• ${i}`).join('\n');
    if (categories.others.length) changelog += '\n\n#### 📝 其他更新\n' + categories.others.map(i => `• ${i}`).join('\n');

    if (contributors) {
      const contributorLines = contributors.split('\n').filter(l => l.trim());
      if (contributorLines.length > 0) {
        changelog += '\n\n#### ❤️ Thank You\n感谢以下贡献者的辛勤付出：\n';
        const names = new Set();
        contributorLines.forEach(line => names.add(line.split('|')[0].trim()));
        Array.from(names).sort().forEach(name => changelog += `• ${name}\n`);
      }
    }
    return changelog || '• 版本更新和优化';
  } catch (_) {
    return '• 功能优化和问题修复';
  }
}

function waitForDist(timeout = 3000) {
  const distPath = path.join(__dirname, 'dist');
  return new Promise((resolve) => {
    const start = Date.now();
    const interval = setInterval(() => {
      if (fs.existsSync(distPath)) {
        clearInterval(interval);
        resolve(true);
      } else if (Date.now() - start > timeout) {
        clearInterval(interval);
        resolve(false);
      }
    }, 300);
  });
}

async function release() {
  try {
    console.log(`🚀 准备发布版本 v${currentVersion}...`);

    const versionInfo = {
      version: currentVersion,
      buildTime: new Date().toISOString(),
      commit: execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim(),
      branch: execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim()
    };
    fs.writeFileSync('public/version.json', JSON.stringify(versionInfo, null, 2));
    console.log('✅ 生成版本信息文件');

    execSync('git add .');
    execSync(`git commit -m "chore: release v${currentVersion}"`);
    console.log('✅ 提交版本更改');

    const changelog = generateChangelog();
    execSync(`git tag -a v${currentVersion} -m "v${currentVersion}\n\n${changelog}"`);

    execSync('git push origin main');
    execSync(`git push origin v${currentVersion}`);

    const releaseNotes = `## 🎉 版本 ${currentVersion}

### 📝 本次更新${changelog}

### 📦 使用方式
\`\`\`bash
# 克隆项目
git clone https://github.com/xinlingfeiwu/react-todo-app.git
cd react-todo-app

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build:prod
\`\`\`

### 🌐 在线体验
访问 [GitHub Pages](https://xinlingfeiwu.github.io/react-todo-app/) 立即体验

### 📊 项目信息
• **版本**: ${currentVersion}
• **构建时间**: ${new Date().toISOString().replace('T', ' ').replace(/\.\d{3}Z$/, ' UTC')}
• **下载**: [源码包](https://github.com/xinlingfeiwu/react-todo-app/archive/refs/tags/v${currentVersion}.tar.gz)`;

    const tempFile = `release-notes-${currentVersion}.md`;
    fs.writeFileSync(tempFile, releaseNotes);

    const zipName = 'react-todo-app-dist.zip';
    const zipPath = path.join(__dirname, zipName);

    console.log('🛠️ 正在执行构建...');
    execSync('npm run build:prod', { stdio: 'inherit' });

    const distReady = await waitForDist();
    if (distReady) {
      console.log('📦 正在打包 dist 文件夹...');
      execSync(`zip -r ${zipName} dist`, { stdio: 'inherit' });
      console.log(`✅ 生成压缩包: ${zipName}`);
    } else {
      console.log('⚠️ 构建完成后未检测到 dist 文件夹，跳过打包');
    }

    try {
      if (fs.existsSync(zipPath)) {
        execSync(`gh release create v${currentVersion} ${zipName} --title "v${currentVersion}" --notes-file "${tempFile}" --verify-tag`, {
          stdio: 'inherit', timeout: 30000
        });
        fs.unlinkSync(zipPath);
        console.log(`🧹 已删除本地压缩文件: ${zipName}`);
      } else {
        execSync(`gh release create v${currentVersion} --title "v${currentVersion}" --notes-file "${tempFile}" --verify-tag`, {
          stdio: 'inherit', timeout: 30000
        });
        console.log('⚠️ 未找到压缩文件，未上传 dist.zip');
      }
      fs.unlinkSync(tempFile);
      console.log('✅ 创建 GitHub Release');
    } catch (_error) {
      if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
      if (fs.existsSync(zipPath)) fs.unlinkSync(zipPath);
      console.log('⚠️ 创建 Release 失败，请手动处理');
    }

    console.log(`\n🎉 版本 v${currentVersion} 发布成功！`);
    console.log(`📦 标签: v${currentVersion}`);
  } catch (error) {
    console.error('❌ 发布失败:', error.message);
    process.exit(1);
  }
}

release();
