// 反馈服务配置
export const FEEDBACK_CONFIG = {
  // Formspree 配置 (推荐)
  // 1. 访问 https://formspree.io/ 注册账户
  // 2. 创建新表单，获取表单ID
  // 3. 将下面的 YOUR_FORM_ID 替换为您的实际表单ID
  formspree: {
    enabled: true, // 设置为 true 启用 Formspree
    endpoint: 'https://formspree.io/f/xyzpyklr'
  },
  
  // 邮件降级方案配置
  email: {
    // 替换为您的邮箱地址
    address: 'lovexinlingfeiwu@foxmail.com',
    subject: '[待办清单反馈]'
  },
  
  // Netlify Forms 配置 (如果部署在 Netlify)
  netlify: {
    enabled: false, // 设置为 true 启用 Netlify Forms
    action: '/feedback' // Netlify 表单的 action 路径
  },
  
  // 自定义 API 配置
  customAPI: {
    enabled: false, // 设置为 true 启用自定义 API
    endpoint: 'https://your-api.com/feedback'
  }
};

/**
 * 获取当前启用的反馈服务配置
 */
export const getActiveFeedbackService = () => {
  if (FEEDBACK_CONFIG.formspree.enabled) {
    return { type: 'formspree', config: FEEDBACK_CONFIG.formspree };
  }
  
  if (FEEDBACK_CONFIG.netlify.enabled) {
    return { type: 'netlify', config: FEEDBACK_CONFIG.netlify };
  }
  
  if (FEEDBACK_CONFIG.customAPI.enabled) {
    return { type: 'customAPI', config: FEEDBACK_CONFIG.customAPI };
  }
  
  // 默认降级到邮件
  return { type: 'email', config: FEEDBACK_CONFIG.email };
};
