/**
 * 备案信息工具函数
 * 提供稳定的备案信息获取机制
 */

/**
 * 验证值是否有效
 */
export function isValidValue(value) {
  return value && 
         value !== 'undefined' && 
         value !== 'null' && 
         value !== '' && 
         !value.startsWith('%VITE_') &&
         !value.startsWith('${');
}

/**
 * 获取备案信息
 * 使用多种策略确保在不同环境下都能正确获取备案信息
 */
export function getBeianInfo() {
  // 策略1: 直接从 import.meta.env 获取
  let icpNumber = import.meta.env.VITE_ICP_BEIAN_NUMBER;
  let icpUrl = import.meta.env.VITE_ICP_BEIAN_URL;
  let policeNumber = import.meta.env.VITE_POLICE_BEIAN_NUMBER;
  let policeCode = import.meta.env.VITE_POLICE_BEIAN_CODE;
  let policeUrl = import.meta.env.VITE_POLICE_BEIAN_URL;

  // 策略2: 如果第一种方式失败，尝试从全局变量获取（适用于某些部署环境）
  if (typeof window !== 'undefined' && window.__BEIAN_INFO__) {
    const globalBeian = window.__BEIAN_INFO__;
    icpNumber = icpNumber || globalBeian.icpNumber;
    icpUrl = icpUrl || globalBeian.icpUrl;
    policeNumber = policeNumber || globalBeian.policeNumber;
    policeCode = policeCode || globalBeian.policeCode;
    policeUrl = policeUrl || globalBeian.policeUrl;
  }

  // 策略3: 最后的回退策略 - 从localStorage读取（如果有的话）
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const stored = localStorage.getItem('app_beian_info');
      if (stored) {
        const parsedBeian = JSON.parse(stored);
        icpNumber = icpNumber || parsedBeian.icpNumber;
        icpUrl = icpUrl || parsedBeian.icpUrl;
        policeNumber = policeNumber || parsedBeian.policeNumber;
        policeCode = policeCode || parsedBeian.policeCode;
        policeUrl = policeUrl || parsedBeian.policeUrl;
      }
    } catch (error) {
      console.warn('从localStorage读取备案信息失败:', error);
    }
  }

  // 验证和清理值
  const validIcpNumber = isValidValue(icpNumber) ? icpNumber : null;
  const validIcpUrl = isValidValue(icpUrl) ? icpUrl : 'https://beian.miit.gov.cn';
  const validPoliceNumber = isValidValue(policeNumber) ? policeNumber : null;
  const validPoliceCode = isValidValue(policeCode) ? policeCode : null;
  const validPoliceUrl = isValidValue(policeUrl) ? policeUrl : null;

  return {
    icpNumber: validIcpNumber,
    icpUrl: validIcpUrl,
    policeNumber: validPoliceNumber,
    policeCode: validPoliceCode,
    policeUrl: validPoliceUrl,
    hasBeianInfo: !!(validIcpNumber || validPoliceNumber)
  };
}

/**
 * 设置全局备案信息
 * 供构建时或运行时动态设置备案信息使用
 */
export function setGlobalBeianInfo(beianInfo) {
  if (typeof window !== 'undefined') {
    window.__BEIAN_INFO__ = beianInfo;
    
    // 同时保存到localStorage作为备份
    try {
      localStorage.setItem('app_beian_info', JSON.stringify(beianInfo));
    } catch (error) {
      console.warn('保存备案信息到localStorage失败:', error);
    }
  }
}

/**
 * 检查备案信息是否可用
 */
export function isBeianInfoAvailable() {
  const info = getBeianInfo();
  return info.hasBeianInfo;
}
