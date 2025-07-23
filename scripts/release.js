#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ES模块中获取 __dirname 的方法
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 读取当前版本号
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const currentVersion = packageJson.version;

// 生成变更日志
function generateChangelog() {
  try {
    // 获取上一个tag
    const lastTag = execSync('git describe --tags --abbrev=0 2>/dev/null || echo "初始版本"', { encoding: 'utf8' }).trim();

    // 获取提交记录
    const commits = execSync(`git log ${lastTag === '初始版本' ? '' : lastTag + '..'}HEAD --oneline --no-merges`, { encoding: 'utf8' }).trim();

    // 获取贡献者信息
    const contributors = execSync(`git log ${lastTag === '初始版本' ? '' : lastTag + '..'}HEAD --format='%an|%ae' | sort | uniq`, { encoding: 'utf8' }).trim();

    if (!commits) {
      return '• 优化和修复';
    }

    // 解析提交记录并分类
    const commitLines = commits.split('\n');
    const categories = {
      features: [],
      fixes: [],
      docs: [],
      refactors: [],
      performances: [], // 合并样式更新到性能优化
      tests: [],
      chores: [],
      others: []
    };

    commitLines.forEach(line => {
      const message = line.replace(/^[a-f0-9]+\s/, '');
      const lowerMsg = message.toLowerCase();

      if (lowerMsg.startsWith('feat:') || lowerMsg.startsWith('feature:')) {
        categories.features.push(`${message.substring(message.indexOf(':') + 1).trim()}`);
      } else if (lowerMsg.startsWith('fix:') || lowerMsg.startsWith('bugfix:')) {
        categories.fixes.push(`${message.substring(message.indexOf(':') + 1).trim()}`);
      } else if (lowerMsg.startsWith('doc:') || lowerMsg.startsWith('docs:')) {
        categories.docs.push(`${message.substring(message.indexOf(':') + 1).trim()}`);
      } else if (lowerMsg.startsWith('style:')) {
        // 样式更新合并到性能优化部分
        categories.performances.push(`${message.substring(message.indexOf(':') + 1).trim()}`);
      } else if (lowerMsg.startsWith('refactor:')) {
        categories.refactors.push(`${message.substring(message.indexOf(':') + 1).trim()}`);
      } else if (lowerMsg.startsWith('perf:') || lowerMsg.startsWith('performance:')) {
        categories.performances.push(`${message.substring(message.indexOf(':') + 1).trim()}`);
      } else if (lowerMsg.startsWith('test:') || lowerMsg.startsWith('tests:')) {
        categories.tests.push(`${message.substring(message.indexOf(':') + 1).trim()}`);
      } else if (lowerMsg.startsWith('chore:') || lowerMsg.startsWith('build:') || lowerMsg.startsWith('ci:')) {
        categories.chores.push(`${message.substring(message.indexOf(':') + 1).trim()}`);
      } else {
        categories.others.push(`${message}`);
      }
    });

    // 构建分类的变更日志
    let changelog = '';

    if (categories.features.length > 0) {
      changelog += '\n\n#### ✨ 新功能\n' + categories.features.map(item => `• ${item}`).join('\n');
    }

    if (categories.fixes.length > 0) {
      changelog += '\n\n#### 🐛 问题修复\n' + categories.fixes.map(item => `• ${item}`).join('\n');
    }

    if (categories.performances.length > 0) {
      changelog += '\n\n#### ⚡ 性能优化与样式更新\n' + categories.performances.map(item => `• ${item}`).join('\n');
    }

    if (categories.refactors.length > 0) {
      changelog += '\n\n#### ♻️ 代码重构\n' + categories.refactors.map(item => `• ${item}`).join('\n');
    }

    if (categories.docs.length > 0) {
      changelog += '\n\n#### 📚 文档更新\n' + categories.docs.map(item => `• ${item}`).join('\n');
    }

    if (categories.tests.length > 0) {
      changelog += '\n\n#### 🧪 测试相关\n' + categories.tests.map(item => `• ${item}`).join('\n');
    }

    if (categories.chores.length > 0) {
      changelog += '\n\n#### 🔧 构建/工具\n' + categories.chores.map(item => `• ${item}`).join('\n');
    }

    if (categories.others.length > 0) {
      changelog += '\n\n#### 📝 其他更新\n' + categories.others.map(item => `• ${item}`).join('\n');
    }

    // 添加贡献者感谢部分
    if (contributors) {
      const contributorLines = contributors.split('\n').filter(line => line.trim());
      if (contributorLines.length > 0) {
        changelog += '\n\n#### ❤️ Thank You\n感谢以下贡献者的辛勤付出：\n';
        contributorLines.forEach(line => {
          const [name, email] = line.split('|');
          if (name && email) {
            // 从邮箱提取 GitHub 用户名（简单处理）
            const githubUser = email.replace(/@.*/, '');
            changelog += `• [@${githubUser}](https://github.com/${githubUser})\n`;
          }
        });
      }
    }

    return changelog || '• 版本更新和优化';

  } catch (_error) {
    console.log('生成变更日志时出错，使用默认内容');
    return '• 功能优化和问题修复';
  }
}

async function release() {
  try {
    console.log(`🚀 准备发布版本 v${currentVersion}...`);

    // 检查工作目录是否干净
    try {
      execSync('git diff --exit-code', { stdio: 'ignore' });
      execSync('git diff --cached --exit-code', { stdio: 'ignore' });
    } catch {
      console.log('⚠️  检测到未提交的更改，正在提交...');
    }

    // 生成版本信息文件
    const versionInfo = {
      version: currentVersion,
      buildTime: new Date().toISOString(),
      commit: execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim(),
      branch: execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim()
    };

    fs.writeFileSync('public/version.json', JSON.stringify(versionInfo, null, 2));
    console.log('✅ 生成版本信息文件');

    // 提交版本更改
    execSync('git add .');
    execSync(`git commit -m "chore: release v${currentVersion}"`);
    console.log('✅ 提交版本更改');

    // 创建标签
    const changelog = generateChangelog();
    execSync(`git tag -a v${currentVersion} -m "v${currentVersion}\n\n${changelog}"`);
    console.log('✅ 创建版本标签');

    // 推送到远程
    execSync('git push origin main');
    execSync(`git push origin v${currentVersion}`);
    console.log('✅ 推送到 GitHub');

    // 创建 GitHub Release
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
• **提交哈希**: ${execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim()}
• **下载**: [源码包](https://github.com/xinlingfeiwu/react-todo-app/archive/refs/tags/v${currentVersion}.tar.gz)`;

    try {
      // 使用 GitHub CLI 创建 release（如果已安装）
      execSync(`gh release create v${currentVersion} --title "v${currentVersion}" --notes "${releaseNotes}"`, { stdio: 'inherit' });
      console.log('✅ 创建 GitHub Release');
    } catch {
      console.log('⚠️  未检测到 GitHub CLI，请手动创建 Release：');
      console.log(`   标题: v${currentVersion}`);
      console.log('   内容:');
      console.log(releaseNotes);
    }

    console.log(`\n🎉 版本 v${currentVersion} 发布成功！`);
    console.log(`📦 标签: v${currentVersion}`);
    console.log(`🌐 GitHub: https://github.com/xinlingfeiwu/react-todo-app/releases/tag/v${currentVersion}`);

  } catch (error) {
    console.error('❌ 发布失败:', error.message);
    process.exit(1);
  }
}

// 执行发布
release();
