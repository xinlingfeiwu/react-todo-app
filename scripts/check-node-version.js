#!/usr/bin/env node

import semver from 'semver'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const packageJson = JSON.parse(readFileSync(join(__dirname, '../package.json'), 'utf8'))
const { engines } = packageJson

const currentNodeVersion = process.version
const requiredNodeVersion = engines.node

console.log(`🔍 检查 Node.js 版本...`)
console.log(`当前版本: ${currentNodeVersion}`)
console.log(`要求版本: ${requiredNodeVersion}`)

if (!semver.satisfies(currentNodeVersion, requiredNodeVersion)) {
  console.warn(`⚠️  Node.js 版本警告`)
  console.warn(`当前版本: ${currentNodeVersion}`)
  console.warn(`推荐版本: ${requiredNodeVersion}`)
  console.warn(``)
  console.warn(`为了获得最佳体验，建议升级到兼容版本：`)
  console.warn(`- 使用 nvm: nvm install 22.17.1 && nvm use`)
  console.warn(`- 或下载最新版本: https://nodejs.org/`)
  console.warn(``)

  // 检查是否在 CI 环境中
  const isCI = process.env.CI || process.env.GITHUB_ACTIONS || process.env.GITLAB_CI
  if (isCI) {
    console.warn(`🤖 检测到 CI 环境，继续执行...`)
  } else {
    console.warn(`💡 在本地开发环境中，如果遇到问题请升级 Node.js 版本`)
  }
} else {
  console.log(`✅ Node.js 版本兼容`)
}

// 检查 Vite 7.x 的特殊要求
const viteCompatible = semver.satisfies(currentNodeVersion, '^20.19.0 || >=22.12.0')
if (!viteCompatible) {
  console.warn(`⚠️  Vite 7.x 兼容性警告`)
  console.warn(`当前版本: ${currentNodeVersion}`)
  console.warn(`Vite 7.x 推荐版本: ^20.19.0 || >=22.12.0`)
  console.warn(`建议升级到 Node.js 22.17.1 以获得最佳体验`)
  console.warn(``)

  // 在 CI 环境中给出更详细的说明
  const isCI = process.env.CI || process.env.GITHUB_ACTIONS || process.env.GITLAB_CI
  if (isCI) {
    console.warn(`🤖 CI 环境检测: 可能会遇到 Vite 7.x 兼容性问题`)
    console.warn(`建议在 CI 配置中使用 Node.js 22.17.1`)
  }
} else {
  console.log(`✅ Vite 7.x 完全兼容`)
}

console.log(``)
console.log(`📋 环境信息总结:`)
console.log(`- Node.js: ${currentNodeVersion}`)
console.log(`- 项目要求: ${requiredNodeVersion}`)
console.log(`- Vite 7.x 兼容: ${viteCompatible ? '✅' : '⚠️'}`)
console.log(`- 推荐升级: ${viteCompatible ? '否' : 'Node.js 22.17.1'}`)
