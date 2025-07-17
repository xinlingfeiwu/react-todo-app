/**
 * 内容过滤工具 - 检测敏感词和恶意内容
 */

// 敏感词库 - 可以根据需要扩展
const SENSITIVE_WORDS = [
  // 政治敏感词
  '政治', '政府', '官员', '腐败', '抗议', '示威', '革命', '政权',
  '共产党', '民主党', '自由党', '独裁', '专制', '政变', '起义',
  '反政府', '颠覆', '叛乱', '分裂', '台独', '藏独', '疆独',
  '六四', '天安门', '法轮功', '达赖', '习近平', '毛泽东',
  
  // 暴力相关
  '暴力', '杀害', '伤害', '攻击', '武器', '炸弹', '枪支', '刀具',
  '打击', '报复', '仇恨', '威胁', '恐吓', '殴打', '斗殴', '械斗',
  '杀死', '谋杀', '暗杀', '屠杀', '血腥', '残忍', '虐待', '折磨',
  '爆炸', '纵火', '投毒', '砍杀', '捅死', '枪杀', '刺杀',
  '恐怖主义', '恐怖分子', '恐怖袭击', 'ISIS', '基地组织',
  
  // 色情相关
  '色情', '裸体', '性行为', '成人', '情色', '黄色', '淫秽',
  '性爱', '做爱', '上床', '性交', '性器官', '生殖器', '阴茎',
  '阴道', '乳房', '胸部', '臀部', '性感', '诱惑', '挑逗',
  '自慰', '手淫', '口交', '肛交', '群交', '乱伦', '强奸',
  '性侵', '猥亵', '嫖娼', '卖淫', '妓女', '援交', '包养',
  
  // 赌博相关
  '赌博', '博彩', '彩票', '赌场', '下注', '投注', '押注',
  '赌钱', '赌球', '赌马', '老虎机', '轮盘', '百家乐', '德州扑克',
  '麻将赌博', '斗地主', '炸金花', '牛牛', '21点', '骰子',
  '赌注', '庄家', '赔率', '开盘', '盘口', '赌徒', '赌瘾',
  
  // 毒品相关
  '毒品', '吸毒', '贩毒', '大麻', '海洛因', '冰毒', '摇头丸',
  '可卡因', '鸦片', '吗啡', 'K粉', '麻醉剂', '致幻剂',
  '毒贩', '制毒', '贩卖毒品', '吸食毒品', '注射毒品',
  '麻黄素', '氯胺酮', '苯丙胺', 'LSD', 'MDMA',
  
  // 欺诈相关
  '诈骗', '欺诈', '骗钱', '传销', '洗钱', '假币', '伪造',
  '造假', '假冒', '冒充', '钓鱼', '套路贷', '高利贷',
  '非法集资', '庞氏骗局', '金字塔骗局', '电信诈骗',
  '网络诈骗', '信用卡诈骗', '保险诈骗', '投资诈骗',
  
  // 仇恨言论
  '种族歧视', '性别歧视', '仇恨', '歧视', '偏见', '排外',
  '民族仇恨', '宗教仇恨', '地域歧视', '贬低', '侮辱',
  '人身攻击', '恶意中伤', '诽谤', '造谣', '传谣',
  
  // 自残自杀相关
  '自杀', '自残', '自杀方法', '结束生命', '轻生', '寻死',
  '割腕', '跳楼', '上吊', '服毒', '烧炭自杀', '安乐死',
  '自我伤害', '自虐', '抑郁自杀', '想死', '不想活',
  
  // 违法犯罪
  '犯罪', '违法', '盗窃', '抢劫', '抢夺', '偷盗', '入室盗窃',
  '绑架', '拐卖', '人口贩卖', '拐骗', '敲诈', '勒索',
  '非法拘禁', '故意伤害', '寻衅滋事', '聚众斗殴',
  '破坏公物', '纵火', '爆炸', '危害公共安全',
  
  // 网络安全
  '黑客', '病毒', '木马', '钓鱼网站', '网络攻击', '入侵',
  '破解', '盗号', '撞库', 'DDOS', '肉鸡', '僵尸网络',
  '社工', '暗网', '数据泄露', '隐私泄露', '信息窃取',
  
  // 极端组织
  '极端主义', '原教旨主义', '分离主义', '邪教', '异端',
  '宗教极端', '民族极端', '暴力极端', '激进组织',
  
  // 其他不当内容
  '恶意', '破坏', '骚扰', '跟踪', '偷拍', '偷窥',
  '垃圾邮件', 'spam', '广告', '推广', '营销', '刷单',
  '水军', '僵尸粉', '买粉', '刷量', '刷评', '恶意差评',
  '人肉搜索', '网络暴力', '网络霸凌', '键盘侠',
  
  // 金融诈骗
  '虚拟货币诈骗', '比特币诈骗', 'ICO诈骗', 'P2P诈骗',
  '外汇诈骗', '股票诈骗', '期货诈骗', '基金诈骗',
  '理财诈骗', '投资陷阱', '资金盘', '跑路',
  
  // 儿童相关敏感内容
  '儿童色情', '恋童', '儿童性侵', '儿童虐待',
  '拐卖儿童', '儿童绑架', '校园霸凌',
  
  // 动物虐待
  '虐待动物', '杀害动物', '动物暴力', '非法捕猎',
  '野生动物交易', '象牙', '犀牛角', '虎骨',
  
  // 环境破坏
  '非法排污', '环境污染', '生态破坏', '乱砍滥伐',
  '非法采矿', '盗采', '破坏湿地', '捕杀珍稀动物'
];

// 恶意模式检测 - 使用正则表达式检测常见的恶意模式
const MALICIOUS_PATTERNS = [
  // 重复字符（可能是垃圾信息）
  /(.)\1{10,}/g,
  
  // 过多的特殊字符
  /[!@#$%^&*()_+={}[\]|\\:";'<>?,./]{10,}/g,
  
  // 疑似URL或邮箱（可能是广告）
  /https?:\/\/[^\s]+/gi,
  /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
  
  // 疑似电话号码（可能是广告）
  /(\+?86)?1[3-9]\d{9}/g,
  
  // 全大写文本（可能是垃圾信息）
  /[A-Z]{20,}/g,
  
  // 过多数字（可能是广告或垃圾信息）
  /\d{15,}/g,
  
  // QQ号码模式
  /qq[:：\s]*\d{5,}/gi,
  /[^\d]\d{5,11}[^\d]/g,
  
  // 微信号模式
  /微信[:：\s]*[a-zA-Z0-9_-]{5,}/gi,
  /wx[:：\s]*[a-zA-Z0-9_-]{5,}/gi,
  
  // 金钱数字模式（可能是诈骗）
  /\d+元|\d+块|￥\d+|\$\d+/g,
  
  // 银行卡号模式
  /\d{16,19}/g,
  
  // 身份证号模式
  /\d{15}|\d{18}/g,
  
  // 过多表情符号
  /[\u{1F600}-\u{1F64F}]{10,}/gu,
  /[\u{1F300}-\u{1F5FF}]{10,}/gu,
  
  // 营销关键词组合
  /加我|扫码|免费|优惠|折扣|限时|特价|秒杀/gi,
  
  // 诱导点击
  /点击|下载|安装|注册|登录|关注|订阅/gi,
  
  // base64编码（可能隐藏恶意内容）
  /[A-Za-z0-9+/]{50,}={0,2}/g,
  
  // 十六进制编码
  /[0-9a-fA-F]{50,}/g,
  
  // 过多换行符（格式化攻击）
  /\n{10,}/g,
  
  // 过多空格
  /\s{20,}/g,
  
  // HTML标签（可能是XSS攻击）
  /<[^>]+>/g,
  
  // JavaScript代码
  /(javascript|eval|alert|confirm|prompt)[:：\s]*\(/gi,
  
  // SQL注入模式
  /(select|insert|update|delete|drop|union|script)[:：\s]+/gi
];

/**
 * 检测文本中的敏感词
 * @param {string} text - 要检测的文本
 * @returns {string[]} 检测到的敏感词数组
 */
export function detectSensitiveWords(text) {
  if (!text || typeof text !== 'string' || !SENSITIVE_WORD_CONFIG.enabled) {
    return [];
  }
  
  const lowerText = text.toLowerCase();
  const foundWords = [];
  
  // 检测内置敏感词
  SENSITIVE_WORDS.forEach(word => {
    if (lowerText.includes(word.toLowerCase())) {
      // 检查是否在白名单中
      const isWhitelisted = SENSITIVE_WORD_CONFIG.whitelist.some(whiteWord => 
        lowerText.includes(whiteWord.toLowerCase())
      );
      
      if (!isWhitelisted) {
        foundWords.push(word);
      }
    }
  });
  
  // 检测自定义敏感词
  SENSITIVE_WORD_CONFIG.customWords.forEach(word => {
    if (lowerText.includes(word.toLowerCase())) {
      const isWhitelisted = SENSITIVE_WORD_CONFIG.whitelist.some(whiteWord => 
        lowerText.includes(whiteWord.toLowerCase())
      );
      
      if (!isWhitelisted) {
        foundWords.push(word);
      }
    }
  });
  
  // 根据检测级别过滤结果
  if (SENSITIVE_WORD_CONFIG.level === 'loose') {
    // 宽松模式：只返回严重的敏感词
    return foundWords.filter(word => 
      ['暴力', '杀害', '恐怖', '爆炸', '毒品', '诈骗'].includes(word)
    );
  } else if (SENSITIVE_WORD_CONFIG.level === 'strict') {
    // 严格模式：返回所有检测到的敏感词
    return foundWords;
  } else {
    // 普通模式：排除一些常见但不太敏感的词
    return foundWords.filter(word => 
      !['广告', '推广', '营销'].includes(word)
    );
  }
}

/**
 * 检测文本中的恶意模式
 * @param {string} text - 要检测的文本
 * @returns {string[]} 检测到的恶意模式描述数组
 */
export function detectMaliciousPatterns(text) {
  if (!text || typeof text !== 'string') {
    return [];
  }
  
  const issues = [];
  
  // 检查重复字符
  if (MALICIOUS_PATTERNS[0].test(text)) {
    issues.push('包含过多重复字符');
  }
  
  // 检查特殊字符
  if (MALICIOUS_PATTERNS[1].test(text)) {
    issues.push('包含过多特殊字符');
  }
  
  // 检查URL
  if (MALICIOUS_PATTERNS[2].test(text)) {
    issues.push('包含可疑链接');
  }
  
  // 检查邮箱
  if (MALICIOUS_PATTERNS[3].test(text)) {
    issues.push('包含邮箱地址');
  }
  
  // 检查电话号码
  if (MALICIOUS_PATTERNS[4].test(text)) {
    issues.push('包含电话号码');
  }
  
  // 检查全大写
  if (MALICIOUS_PATTERNS[5].test(text)) {
    issues.push('包含过多大写字母');
  }
  
  // 检查过多数字
  if (MALICIOUS_PATTERNS[6].test(text)) {
    issues.push('包含过多数字');
  }
  
  // 检查QQ号码
  if (MALICIOUS_PATTERNS[7].test(text) || MALICIOUS_PATTERNS[8].test(text)) {
    issues.push('包含QQ号码');
  }
  
  // 检查微信号
  if (MALICIOUS_PATTERNS[9].test(text) || MALICIOUS_PATTERNS[10].test(text)) {
    issues.push('包含微信号');
  }
  
  // 检查金钱相关
  if (MALICIOUS_PATTERNS[11].test(text)) {
    issues.push('包含金钱数字');
  }
  
  // 检查银行卡号
  if (MALICIOUS_PATTERNS[12].test(text)) {
    issues.push('包含可疑数字串');
  }
  
  // 检查身份证号
  if (MALICIOUS_PATTERNS[13].test(text)) {
    issues.push('包含身份证号格式');
  }
  
  // 检查过多表情
  if (MALICIOUS_PATTERNS[14].test(text) || MALICIOUS_PATTERNS[15].test(text)) {
    issues.push('包含过多表情符号');
  }
  
  // 检查营销词汇
  if (MALICIOUS_PATTERNS[16].test(text)) {
    issues.push('包含营销推广词汇');
  }
  
  // 检查诱导词汇
  if (MALICIOUS_PATTERNS[17].test(text)) {
    issues.push('包含诱导点击词汇');
  }
  
  // 检查编码内容
  if (MALICIOUS_PATTERNS[18].test(text)) {
    issues.push('包含可疑编码内容');
  }
  
  if (MALICIOUS_PATTERNS[19].test(text)) {
    issues.push('包含十六进制编码');
  }
  
  // 检查格式异常
  if (MALICIOUS_PATTERNS[20].test(text)) {
    issues.push('包含过多换行符');
  }
  
  if (MALICIOUS_PATTERNS[21].test(text)) {
    issues.push('包含过多空格');
  }
  
  // 检查代码注入
  if (MALICIOUS_PATTERNS[22].test(text)) {
    issues.push('包含HTML标签');
  }
  
  if (MALICIOUS_PATTERNS[23].test(text)) {
    issues.push('包含JavaScript代码');
  }
  
  if (MALICIOUS_PATTERNS[24].test(text)) {
    issues.push('包含SQL查询语句');
  }
  
  return issues;
}

/**
 * 综合内容检查
 * @param {string} text - 要检测的文本
 * @returns {Object} 检测结果
 */
export function checkContent(text) {
  const sensitiveWords = detectSensitiveWords(text);
  const maliciousPatterns = detectMaliciousPatterns(text);
  
  return {
    isValid: sensitiveWords.length === 0 && maliciousPatterns.length === 0,
    sensitiveWords,
    maliciousPatterns,
    issues: [...sensitiveWords.map(word => `包含敏感词: ${word}`), ...maliciousPatterns]
  };
}

/**
 * 检查表单内容
 * @param {Object} formData - 表单数据
 * @returns {Object} 检测结果
 */
export function validateFormContent(formData) {
  const { title, description } = formData;
  
  // 检查标题
  const titleCheck = checkContent(title);
  
  // 检查描述
  const descriptionCheck = checkContent(description);
  
  const allIssues = [
    ...titleCheck.issues.map(issue => `标题${issue}`),
    ...descriptionCheck.issues.map(issue => `描述${issue}`)
  ];
  
  return {
    isValid: titleCheck.isValid && descriptionCheck.isValid,
    issues: allIssues,
    details: {
      title: titleCheck,
      description: descriptionCheck
    }
  };
}

/**
 * 敏感词配置管理
 */
export const SENSITIVE_WORD_CONFIG = {
  // 是否启用敏感词检测
  enabled: true,
  
  // 检测级别：'strict' | 'normal' | 'loose'
  level: 'normal',
  
  // 自定义敏感词（可以动态添加）
  customWords: [],
  
  // 白名单（即使匹配敏感词也允许通过）
  whitelist: [
    '政治学', '政治课', '政府工作报告', // 正常的政治相关词汇
    '游戏暴力', '影视暴力', // 娱乐相关的暴力词汇
    '正常广告', '合法推广' // 正常的商业推广
  ],
  
  // 按分类启用/禁用
  categories: {
    political: true,    // 政治敏感词
    violence: true,     // 暴力相关
    adult: true,        // 色情相关
    gambling: true,     // 赌博相关
    drugs: true,        // 毒品相关
    fraud: true,        // 欺诈相关
    hate: true,         // 仇恨言论
    selfHarm: true,     // 自残自杀
    crime: true,        // 违法犯罪
    cybersecurity: true, // 网络安全
    extremism: true,    // 极端组织
    other: true         // 其他不当内容
  }
};

/**
 * 添加自定义敏感词
 * @param {string[]} words - 要添加的敏感词数组
 */
export function addCustomSensitiveWords(words) {
  SENSITIVE_WORD_CONFIG.customWords.push(...words);
}

/**
 * 添加白名单词汇
 * @param {string[]} words - 要添加到白名单的词汇
 */
export function addWhitelistWords(words) {
  SENSITIVE_WORD_CONFIG.whitelist.push(...words);
}

/**
 * 设置检测级别
 * @param {'strict' | 'normal' | 'loose'} level - 检测级别
 */
export function setSensitiveWordLevel(level) {
  SENSITIVE_WORD_CONFIG.level = level;
}
