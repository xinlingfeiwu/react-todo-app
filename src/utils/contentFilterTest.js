/**
 * 内容过滤功能测试
 */

import { validateFormContent, detectSensitiveWords, detectMaliciousPatterns } from '../utils/contentFilter';

// 测试用例
const testCases = [
  {
    name: '正常内容',
    formData: {
      title: '功能建议：增加待办事项分类功能',
      description: '希望能够为待办事项添加分类标签，方便管理不同类型的任务。'
    },
    expected: true
  },
  {
    name: '包含敏感词 - 政治',
    formData: {
      title: '这是一个政治相关的建议',
      description: '关于政府政策的一些想法'
    },
    expected: false
  },
  {
    name: '包含敏感词 - 暴力',
    formData: {
      title: '关于暴力游戏的讨论',
      description: '游戏中的杀害场面太血腥了'
    },
    expected: false
  },
  {
    name: '包含敏感词 - 赌博',
    formData: {
      title: '在线赌博网站推荐',
      description: '这个博彩网站很不错'
    },
    expected: false
  },
  {
    name: '包含恶意模式 - URL',
    formData: {
      title: '请访问 https://example.com',
      description: '这是一个推广链接'
    },
    expected: false
  },
  {
    name: '包含恶意模式 - QQ号',
    formData: {
      title: '联系我QQ：123456789',
      description: '有问题可以联系我'
    },
    expected: false
  },
  {
    name: '包含恶意模式 - 微信号',
    formData: {
      title: '加我微信：abc123456',
      description: '微信联系更方便'
    },
    expected: false
  },
  {
    name: '包含重复字符',
    formData: {
      title: 'aaaaaaaaaaaaaaaaaaaaa',
      description: '正常描述'
    },
    expected: false
  },
  {
    name: '包含营销词汇',
    formData: {
      title: '免费赠送，限时优惠！',
      description: '点击下载，立即注册获得大礼包'
    },
    expected: false
  },
  {
    name: '包含HTML标签',
    formData: {
      title: '测试<script>alert("xss")</script>',
      description: '这包含了恶意代码'
    },
    expected: false
  }
];

// 运行测试
console.log('=== 内容过滤功能测试 ===');

testCases.forEach((testCase, index) => {
  console.log(`\n测试 ${index + 1}: ${testCase.name}`);
  console.log('输入:', testCase.formData);
  
  const result = validateFormContent(testCase.formData);
  console.log('结果:', result);
  
  const passed = result.isValid === testCase.expected;
  console.log(`状态: ${passed ? '✅ 通过' : '❌ 失败'}`);
  
  if (!result.isValid) {
    console.log('检测到的问题:', result.issues);
  }
});

// 单独测试敏感词检测
console.log('\n=== 敏感词检测测试 ===');
const sensitiveTexts = [
  '政治问题', 
  '暴力内容', 
  '赌博网站', 
  '毒品交易', 
  '诈骗信息',
  '色情内容',
  '恐怖主义',
  '自杀方法',
  '正常文本'
];
sensitiveTexts.forEach(text => {
  const words = detectSensitiveWords(text);
  console.log(`"${text}" -> 敏感词:`, words);
});

// 单独测试恶意模式检测
console.log('\n=== 恶意模式检测测试 ===');
const maliciousTexts = [
  'aaaaaaaaaaaaaaaaaaa',
  'https://spam.com',
  'call 13800138000',
  'SPAM SPAM SPAM SPAM SPAM',
  '联系QQ：123456789',
  '加微信：abc123',
  '免费赠送限时优惠',
  '点击下载注册',
  '<script>alert("xss")</script>',
  'SELECT * FROM users',
  'test@example.com',
  '￥9999元特价',
  'javascript:alert(1)'
];
maliciousTexts.forEach(text => {
  const patterns = detectMaliciousPatterns(text);
  console.log(`"${text}" -> 恶意模式:`, patterns);
});
