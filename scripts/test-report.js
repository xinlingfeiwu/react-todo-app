#!/usr/bin/env node

/**
 * 测试报告生成脚本
 * 生成详细的测试覆盖率报告和质量分析
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dirname, '..')

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
}

function colorize(text, color) {
  return `${colors[color]}${text}${colors.reset}`
}

// 读取覆盖率数据
function readCoverageData() {
  const summaryPath = path.join(projectRoot, 'coverage', 'coverage-summary.json')
  const finalPath = path.join(projectRoot, 'coverage', 'coverage-final.json')

  // 优先使用 coverage-summary.json
  if (fs.existsSync(summaryPath)) {
    return JSON.parse(fs.readFileSync(summaryPath, 'utf8'))
  }

  // 如果没有 summary，尝试从 coverage-final.json 生成
  if (fs.existsSync(finalPath)) {
    const finalData = JSON.parse(fs.readFileSync(finalPath, 'utf8'))
    return generateSummaryFromFinal(finalData)
  }

  console.log(colorize('❌ 未找到覆盖率数据，请先运行测试', 'red'))
  console.log(colorize('   运行: npm run test:coverage', 'yellow'))
  process.exit(1)
}

// 从 coverage-final.json 生成摘要数据
function generateSummaryFromFinal(finalData) {
  const summary = { total: { statements: { total: 0, covered: 0, pct: 0 }, branches: { total: 0, covered: 0, pct: 0 }, functions: { total: 0, covered: 0, pct: 0 }, lines: { total: 0, covered: 0, pct: 0 } } }

  Object.entries(finalData).forEach(([filePath, data]) => {
    if (data.s && data.b && data.f) {
      const statements = Object.values(data.s)
      const branches = Object.values(data.b).flat()
      const functions = Object.values(data.f)

      const fileStats = {
        statements: {
          total: statements.length,
          covered: statements.filter(s => s > 0).length,
          pct: statements.length > 0 ? (statements.filter(s => s > 0).length / statements.length * 100) : 0
        },
        branches: {
          total: branches.length,
          covered: branches.filter(b => b > 0).length,
          pct: branches.length > 0 ? (branches.filter(b => b > 0).length / branches.length * 100) : 0
        },
        functions: {
          total: functions.length,
          covered: functions.filter(f => f > 0).length,
          pct: functions.length > 0 ? (functions.filter(f => f > 0).length / functions.length * 100) : 0
        },
        lines: {
          total: statements.length, // 简化处理，使用语句数作为行数
          covered: statements.filter(s => s > 0).length,
          pct: statements.length > 0 ? (statements.filter(s => s > 0).length / statements.length * 100) : 0
        }
      }

      summary[filePath] = fileStats

      // 累加到总计
      summary.total.statements.total += fileStats.statements.total
      summary.total.statements.covered += fileStats.statements.covered
      summary.total.branches.total += fileStats.branches.total
      summary.total.branches.covered += fileStats.branches.covered
      summary.total.functions.total += fileStats.functions.total
      summary.total.functions.covered += fileStats.functions.covered
      summary.total.lines.total += fileStats.lines.total
      summary.total.lines.covered += fileStats.lines.covered
    }
  })

  // 计算总体百分比
  summary.total.statements.pct = summary.total.statements.total > 0 ? (summary.total.statements.covered / summary.total.statements.total * 100) : 0
  summary.total.branches.pct = summary.total.branches.total > 0 ? (summary.total.branches.covered / summary.total.branches.total * 100) : 0
  summary.total.functions.pct = summary.total.functions.total > 0 ? (summary.total.functions.covered / summary.total.functions.total * 100) : 0
  summary.total.lines.pct = summary.total.lines.total > 0 ? (summary.total.lines.covered / summary.total.lines.total * 100) : 0

  return summary
}

// 读取测试结果
function readTestResults() {
  const resultsPath = path.join(projectRoot, 'test-results', 'results.json')
  
  if (!fs.existsSync(resultsPath)) {
    console.log(colorize('⚠️  未找到测试结果数据', 'yellow'))
    return null
  }
  
  return JSON.parse(fs.readFileSync(resultsPath, 'utf8'))
}

// 生成覆盖率报告
function generateCoverageReport(coverage) {
  console.log(colorize('\n📊 测试覆盖率报告', 'cyan'))
  console.log(colorize('=' .repeat(50), 'cyan'))
  
  const total = coverage.total
  
  // 总体覆盖率
  console.log(colorize('\n🎯 总体覆盖率:', 'bright'))
  console.log(`  语句覆盖率: ${getCoverageColor(total.statements.pct)}${total.statements.pct}%${colors.reset} (${total.statements.covered}/${total.statements.total})`)
  console.log(`  分支覆盖率: ${getCoverageColor(total.branches.pct)}${total.branches.pct}%${colors.reset} (${total.branches.covered}/${total.branches.total})`)
  console.log(`  函数覆盖率: ${getCoverageColor(total.functions.pct)}${total.functions.pct}%${colors.reset} (${total.functions.covered}/${total.functions.total})`)
  console.log(`  行覆盖率:   ${getCoverageColor(total.lines.pct)}${total.lines.pct}%${colors.reset} (${total.lines.covered}/${total.lines.total})`)
  
  // 覆盖率等级
  const avgCoverage = (total.statements.pct + total.branches.pct + total.functions.pct + total.lines.pct) / 4
  console.log(`\n📈 平均覆盖率: ${getCoverageColor(avgCoverage)}${avgCoverage.toFixed(2)}%${colors.reset}`)
  console.log(`🏆 覆盖率等级: ${getCoverageGrade(avgCoverage)}`)
  
  // 文件级别覆盖率（只显示有测试的文件）
  console.log(colorize('\n📁 文件覆盖率详情:', 'bright'))
  
  const files = Object.entries(coverage)
    .filter(([key]) => key !== 'total')
    .filter(([, data]) => data.statements.total > 0)
    .sort(([, a], [, b]) => b.statements.pct - a.statements.pct)
  
  if (files.length > 0) {
    files.slice(0, 10).forEach(([file, data]) => {
      const fileName = path.basename(file)
      const stmtPct = data.statements.pct
      console.log(`  ${fileName.padEnd(25)} ${getCoverageColor(stmtPct)}${stmtPct}%${colors.reset}`)
    })
    
    if (files.length > 10) {
      console.log(colorize(`  ... 还有 ${files.length - 10} 个文件`, 'yellow'))
    }
  }
}

// 获取覆盖率颜色
function getCoverageColor(percentage) {
  if (percentage >= 80) return colors.green
  if (percentage >= 60) return colors.yellow
  return colors.red
}

// 获取覆盖率等级
function getCoverageGrade(percentage) {
  if (percentage >= 90) return colorize('A+ (优秀)', 'green')
  if (percentage >= 80) return colorize('A  (良好)', 'green')
  if (percentage >= 70) return colorize('B+ (中等)', 'yellow')
  if (percentage >= 60) return colorize('B  (及格)', 'yellow')
  if (percentage >= 50) return colorize('C  (较差)', 'red')
  return colorize('D  (很差)', 'red')
}

// 生成测试结果报告
function generateTestReport(results) {
  if (!results) return
  
  console.log(colorize('\n🧪 测试结果报告', 'cyan'))
  console.log(colorize('=' .repeat(50), 'cyan'))
  
  const { numTotalTests, numPassedTests, numFailedTests, numPendingTests } = results
  
  console.log(`\n📊 测试统计:`)
  console.log(`  总测试数: ${numTotalTests}`)
  console.log(`  通过测试: ${colorize(numPassedTests, 'green')}`)
  console.log(`  失败测试: ${numFailedTests > 0 ? colorize(numFailedTests, 'red') : '0'}`)
  console.log(`  跳过测试: ${numPendingTests > 0 ? colorize(numPendingTests, 'yellow') : '0'}`)
  
  const successRate = ((numPassedTests / numTotalTests) * 100).toFixed(2)
  console.log(`\n✅ 成功率: ${getCoverageColor(successRate)}${successRate}%${colors.reset}`)
  
  // 显示失败的测试
  if (results.testResults) {
    const failedTests = results.testResults
      .filter(result => result.status === 'failed')
      .slice(0, 5)
    
    if (failedTests.length > 0) {
      console.log(colorize('\n❌ 失败的测试:', 'red'))
      failedTests.forEach(test => {
        console.log(`  ${test.ancestorTitles.join(' > ')} > ${test.title}`)
        if (test.failureMessages && test.failureMessages.length > 0) {
          console.log(`    ${colorize(test.failureMessages[0].split('\n')[0], 'red')}`)
        }
      })
    }
  }
}

// 生成改进建议
function generateRecommendations(coverage) {
  console.log(colorize('\n💡 改进建议', 'cyan'))
  console.log(colorize('=' .repeat(50), 'cyan'))
  
  const total = coverage.total
  const recommendations = []
  
  if (total.statements.pct < 80) {
    recommendations.push('📝 增加单元测试以提高语句覆盖率')
  }
  
  if (total.branches.pct < 80) {
    recommendations.push('🔀 添加更多边界条件测试以提高分支覆盖率')
  }
  
  if (total.functions.pct < 80) {
    recommendations.push('⚡ 确保所有函数都有对应的测试用例')
  }
  
  // 找出覆盖率最低的文件
  const files = Object.entries(coverage)
    .filter(([key]) => key !== 'total')
    .filter(([, data]) => data.statements.total > 0)
    .sort(([, a], [, b]) => a.statements.pct - b.statements.pct)
  
  if (files.length > 0) {
    const lowestCoverage = files.slice(0, 3)
    if (lowestCoverage[0][1].statements.pct < 50) {
      recommendations.push(`🎯 优先为以下文件添加测试: ${lowestCoverage.map(([file]) => path.basename(file)).join(', ')}`)
    }
  }
  
  if (recommendations.length === 0) {
    console.log(colorize('🎉 测试覆盖率良好，继续保持！', 'green'))
  } else {
    recommendations.forEach((rec, index) => {
      console.log(`${index + 1}. ${rec}`)
    })
  }
  
  console.log(colorize('\n📚 测试最佳实践:', 'bright'))
  console.log('• 为每个新功能编写测试')
  console.log('• 测试边界条件和错误情况')
  console.log('• 保持测试简单和可读')
  console.log('• 定期重构测试代码')
  console.log('• 使用有意义的测试描述')
}

// 生成 HTML 报告链接
function generateReportLinks() {
  console.log(colorize('\n🔗 详细报告', 'cyan'))
  console.log(colorize('=' .repeat(50), 'cyan'))
  
  const coverageHtml = path.join(projectRoot, 'coverage', 'index.html')
  const testHtml = path.join(projectRoot, 'test-results', 'index.html')
  
  if (fs.existsSync(coverageHtml)) {
    console.log(`📊 覆盖率报告: file://${coverageHtml}`)
  }
  
  if (fs.existsSync(testHtml)) {
    console.log(`🧪 测试报告: file://${testHtml}`)
  }
  
  console.log('\n💻 命令行工具:')
  console.log('• npm run test:watch     - 监听模式运行测试')
  console.log('• npm run test:coverage  - 生成覆盖率报告')
  console.log('• npm run test:ui        - 打开测试 UI 界面')
}

// 主函数
function main() {
  console.log(colorize('🚀 React Todo App - 测试质量报告', 'bright'))
  console.log(colorize('生成时间: ' + new Date().toLocaleString(), 'blue'))
  
  try {
    const coverage = readCoverageData()
    const testResults = readTestResults()
    
    generateCoverageReport(coverage)
    generateTestReport(testResults)
    generateRecommendations(coverage)
    generateReportLinks()
    
    console.log(colorize('\n✨ 报告生成完成！', 'green'))
    
  } catch (error) {
    console.error(colorize('❌ 生成报告时出错:', 'red'), error.message)
    process.exit(1)
  }
}

// 运行主函数
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}
