/**
 * 捐赠记录管理工具
 * 用于管理和显示真实的捐赠数据
 */

import { STORAGE_KEYS } from '../constants/storageKeys';

// 捐赠记录的数据结构
// DonationRecord: {
//   id: string,
//   name: string,        // 捐赠者名称（可匿名）
//   amount: number,      // 捐赠金额
//   date: string,        // 捐赠日期
//   message?: string,    // 留言
//   isAnonymous: boolean // 是否匿名
// }

/**
 * 获取所有捐赠记录
 */
export function getDonationRecords() {
  try {
    const records = localStorage.getItem(STORAGE_KEYS.DONATION_RECORDS);
    return records ? JSON.parse(records) : [];
  } catch (error) {
    console.error('读取捐赠记录失败:', error);
    return [];
  }
}

/**
 * 添加捐赠记录
 */
export function addDonationRecord(record) {
  try {
    const records = getDonationRecords();
    const newRecord = {
      ...record,
      id: generateId()
    };
    records.push(newRecord);
    localStorage.setItem(STORAGE_KEYS.DONATION_RECORDS, JSON.stringify(records));
  } catch (error) {
    console.error('添加捐赠记录失败:', error);
  }
}

/**
 * 删除捐赠记录
 */
export function deleteDonationRecord(id) {
  try {
    const records = getDonationRecords();
    const initialLength = records.length;
    const updatedRecords = records.filter(record => record.id !== id);

    // 如果记录数量没有变化，说明没有找到要删除的记录
    if (updatedRecords.length === initialLength) {
      return false;
    }

    localStorage.setItem(STORAGE_KEYS.DONATION_RECORDS, JSON.stringify(updatedRecords));
    return true;
  } catch (error) {
    console.error('删除捐赠记录失败:', error);
    return false;
  }
}

// 保持向后兼容
export const removeDonationRecord = deleteDonationRecord;

/**
 * 获取捐赠统计
 */
export function getDonationStats() {
  const records = getDonationRecords();
  const totalAmount = records.reduce((sum, record) => sum + record.amount, 0);
  const totalCount = records.length;
  const averageAmount = totalCount > 0 ? Math.round((totalAmount / totalCount) * 100) / 100 : 0;

  // 计算匿名和实名捐赠数量
  const anonymousCount = records.filter(record => record.isAnonymous).length;
  const namedCount = totalCount - anonymousCount;

  return {
    totalAmount,
    totalCount,
    averageAmount,
    anonymousCount,
    namedCount
  };
}

/**
 * 格式化显示名称
 */
export function formatDonorName(record) {
  if (record.isAnonymous) {
    return '匿名用户';
  }
  
  // 如果名称太长，截断并显示首尾字符
  if (record.name.length > 6) {
    return record.name.slice(0, 2) + '***' + record.name.slice(-1);
  }
  
  return record.name;
}

/**
 * 格式化金额显示
 */
export function formatAmount(amount) {
  return `¥${amount}`;
}

/**
 * 生成唯一ID
 */
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * 导出捐赠记录
 */
export function exportDonationRecords() {
  const records = getDonationRecords();
  const stats = getDonationStats();
  
  const exportData = {
    exportDate: new Date().toISOString(),
    stats,
    records: records.map(record => ({
      name: formatDonorName(record),
      amount: record.amount,
      date: record.date,
      message: record.message
    }))
  };
  
  return JSON.stringify(exportData, null, 2);
}

/**
 * 清空所有捐赠记录（管理员功能）
 */
export function clearAllDonationRecords() {
  try {
    localStorage.removeItem(STORAGE_KEYS.DONATION_RECORDS);
    return true;
  } catch (error) {
    console.error('清空捐赠记录失败:', error);
    return false;
  }
}

// 测试期望的函数别名
export const clearAllDonations = clearAllDonationRecords;

/**
 * 导出捐赠数据（测试用）
 */
export function exportDonationData() {
  const records = getDonationRecords();
  const stats = getDonationStats();

  return {
    exportDate: new Date().toISOString(),
    version: '1.0',
    stats,
    donations: records
  };
}

/**
 * 导入捐赠数据
 */
export function importDonationData(data) {
  try {
    // 验证数据结构
    if (!data || typeof data !== 'object') {
      return false;
    }

    if (!data.donations || !Array.isArray(data.donations)) {
      return false;
    }

    // 验证每个捐赠记录的基本结构
    const validDonations = data.donations.filter(donation =>
      donation &&
      typeof donation === 'object' &&
      donation.id &&
      typeof donation.amount === 'number' &&
      donation.amount > 0
    );

    // 如果没有有效的捐赠记录，返回false
    if (validDonations.length === 0) {
      return false;
    }

    localStorage.setItem(STORAGE_KEYS.DONATION_RECORDS, JSON.stringify(validDonations));
    return true;
  } catch (error) {
    console.error('导入捐赠数据失败:', error);
    return false;
  }
}
