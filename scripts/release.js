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
      const message = line.replace(/^[a-f0-9]+\s/, '').trim();
      const lowerMsg = message.toLowerCase();

      // 跳过release相关的提交
      if (lowerMsg.includes('release v') && lowerMsg.startsWith('chore:')) {
        return;
      }

      // 清理和格式化提交信息
      let cleanMessage = message;
      if (message.includes(':')) {
        const colonIndex = message.indexOf(':');
        const prefix = message.substring(0, colonIndex).toLowerCase();
        const content = message.substring(colonIndex + 1).trim();

        if (['feat', 'feature'].includes(prefix)) {
          categories.features.push(content);
          return;
        } else if (['fix', 'bugfix'].includes(prefix)) {
          categories.fixes.push(content);
          return;
        } else if (['doc', 'docs'].includes(prefix)) {
          categories.docs.push(content);
          return;
        } else if (prefix === 'style') {
          categories.performances.push(content);
          return;
        } else if (prefix === 'refactor') {
          categories.refactors.push(content);
          return;
        } else if (['perf', 'performance'].includes(prefix)) {
          categories.performances.push(content);
          return;
        } else if (['test', 'tests'].includes(prefix)) {
          categories.tests.push(content);
          return;
        } else if (['chore', 'build', 'ci'].includes(prefix)) {
          categories.chores.push(content);
          return;
        }
      }

      // 处理没有明确前缀的提交
      if (!lowerMsg.startsWith('initial commit') && !lowerMsg.includes('merge')) {
        categories.others.push(cleanMessage);
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

// 检查命令行参数
const args = process.argv.slice(2);
const skipGithubRelease = args.includes('--skip-github-release') || args.includes('--skip-release');

// 网络重试函数
function executeWithRetry(command, options = {}, maxRetries = 3) {
  const { stdio = 'pipe', timeout = 30000 } = options;

  for (let i = 0; i < maxRetries; i++) {
    try {
      console.log(`🔄 执行: ${command} ${i > 0 ? `(第${i + 1}次尝试)` : ''}`);
      return execSync(command, { stdio, timeout, encoding: 'utf8' });
    } catch (error) {
      console.log(`⚠️  执行失败: ${error.message}`);

      if (i === maxRetries - 1) {
        throw error;
      }

      // 如果是HTTP2错误，尝试禁用HTTP2
      if (error.message.includes('HTTP2') || error.message.includes('framing layer')) {
        console.log('🔧 检测到HTTP2错误，尝试降级到HTTP/1.1...');
        try {
          execSync('git config --global http.version HTTP/1.1', { stdio: 'ignore' });
        } catch (_configError) {
          console.log('⚠️  无法设置HTTP版本，继续重试...');
        }
      }

      // 等待后重试
      const waitTime = (i + 1) * 2000; // 2秒, 4秒, 6秒
      console.log(`⏳ 等待 ${waitTime/1000} 秒后重试...`);
      execSync(`sleep ${waitTime/1000}`, { stdio: 'ignore' });
    }
  }
}

// 推送到远程的函数
function pushToRemote(currentVersion) {
  console.log('🚀 开始推送到远程仓库...');

  try {
    // 首先尝试推送main分支
    executeWithRetry('git push origin main');
    console.log('✅ 推送主分支成功');

    // 然后推送标签
    executeWithRetry(`git push origin v${currentVersion}`);
    console.log('✅ 推送标签成功');

  } catch (_error) {
    console.log('❌ 推送失败，尝试其他解决方案...');

    // 尝试不同的推送方式
    const solutions = [
      {
        name: '切换到SSH协议',
        commands: [
          'git remote set-url origin git@github.com:xinlingfeiwu/react-todo-app.git',
          'git push origin main',
          `git push origin v${currentVersion}`
        ]
      },
      {
        name: '强制使用HTTP/1.1',
        commands: [
          'git config --global http.version HTTP/1.1',
          'git config --global http.postBuffer 524288000',
          'git push origin main',
          `git push origin v${currentVersion}`
        ]
      },
      {
        name: '分别推送',
        commands: [
          'git push origin main --no-verify',
          `git push origin v${currentVersion} --no-verify`
        ]
      }
    ];

    for (const solution of solutions) {
      try {
        console.log(`🔧 尝试解决方案: ${solution.name}`);
        for (const cmd of solution.commands) {
          executeWithRetry(cmd, {}, 2);
        }
        console.log(`✅ ${solution.name} 成功`);
        return;
      } catch (solutionError) {
        console.log(`❌ ${solution.name} 失败: ${solutionError.message}`);
        continue;
      }
    }

    // 所有方案都失败了
    throw new Error(`推送失败。请手动执行以下命令:\n  git push origin main\n  git push origin v${currentVersion}\n\n可能的解决方案:\n1. 检查网络连接\n2. 切换到SSH: git remote set-url origin git@github.com:xinlingfeiwu/react-todo-app.git\n3. 禁用HTTP2: git config --global http.version HTTP/1.1`);
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

    // 推送到远程 - 使用改进的推送函数
    pushToRemote(currentVersion);

    if (skipGithubRelease) {
      console.log('⏭️  跳过 GitHub Release 创建');
      console.log(`\n🎉 版本 v${currentVersion} 发布成功！`);
      console.log(`📦 标签: v${currentVersion}`);
      console.log(`🌐 手动创建 Release: https://github.com/xinlingfeiwu/react-todo-app/releases/new?tag=v${currentVersion}`);
      return;
    }

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

    // 将Release notes写入临时文件，避免命令行参数过长和转义问题
    const tempFile = `release-notes-${currentVersion}.md`;
    fs.writeFileSync(tempFile, releaseNotes);

    try {
      // 使用 GitHub CLI 创建 release（如果已安装）
      console.log('📝 正在创建 GitHub Release...');
      execSync(`gh release create v${currentVersion} --title "v${currentVersion}" --notes-file "${tempFile}" --verify-tag`, {
        stdio: 'inherit',
        timeout: 30000 // 30秒超时
      });
      console.log('✅ 创建 GitHub Release');

      // 清理临时文件
      fs.unlinkSync(tempFile);
    } catch (_error) {
      // 清理临时文件
      if (fs.existsSync(tempFile)) {
        fs.unlinkSync(tempFile);
      }

      console.log('⚠️  GitHub CLI 创建 Release 失败，可能的原因：');
      console.log('   1. 未安装 GitHub CLI (gh)');
      console.log('   2. 未登录 GitHub CLI');
      console.log('   3. 网络连接问题');
      console.log('   4. 仓库权限问题');
      console.log('');
      console.log('🔧 解决方案：');
      console.log('   1. 安装 GitHub CLI: https://cli.github.com/');
      console.log('   2. 登录: gh auth login');
      console.log('   3. 或手动创建 Release：');
      console.log(`      - 访问: https://github.com/xinlingfeiwu/react-todo-app/releases/new`);
      console.log(`      - 标签: v${currentVersion}`);
      console.log(`      - 标题: v${currentVersion}`);
      console.log('      - 将以下内容复制到描述框：');
      console.log('');
      console.log(releaseNotes);
    }

    console.log(`\n🎉 版本 v${currentVersion} 发布成功！`);
    console.log(`📦 标签: v${currentVersion}`);
    console.log(`🌐 GitHub: https://github.com/xinlingfeiwu/react-todo-app/releases/tag/v${currentVersion}`);

  } catch (_error) {
    console.error('❌ 发布失败:', _error.message);
    process.exit(1);
  }
}

// 执行发布
release();
