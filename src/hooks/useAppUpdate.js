import { useState, useEffect, useRef, useCallback } from 'react';
import {
  APP_CURRENT_VERSION_KEY,
  APP_UPDATE_DISMISSED_KEY,
  APP_UPDATE_SNOOZED_KEY
} from '../constants/storageKeys';
import { autoCleanup } from '../utils/storageCleanup';

/**
 * 简化的应用更新检测 Hook
 * 核心逻辑：比较localStorage中的版本信息与服务器version.json
 */
export function useAppUpdate() {
  const [hasUpdate, setHasUpdate] = useState(false);
  const [currentVersion, setCurrentVersion] = useState('');
  const [latestVersion, setLatestVersion] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const intervalRef = useRef(null);

  // 配置选项
  const config = {
    checkInterval: 5 * 60 * 1000, // 5分钟检查一次
    versionEndpoint: '/version.json', // 版本信息端点
    snoozeTime: 60 * 60 * 1000, // 稍后更新的延迟时间：1小时
  };

  /**
   * 获取当前应用版本信息
   */
  const getCurrentVersionInfo = () => {
    return {
      version: import.meta.env.VITE_APP_VERSION || window.__APP_VERSION__ || '1.0.0',
      buildHash: import.meta.env.VITE_BUILD_HASH || window.__BUILD_HASH__ || '',
      buildTime: import.meta.env.VITE_BUILD_TIME || window.__BUILD_TIME__ || ''
    };
  };

  /**
   * 获取存储的版本信息
   */
  const getStoredVersionInfo = () => {
    try {
      const stored = localStorage.getItem(APP_CURRENT_VERSION_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  };

  /**
   * 存储当前版本信息
   */
  const storeCurrentVersionInfo = (versionInfo) => {
    try {
      localStorage.setItem(APP_CURRENT_VERSION_KEY, JSON.stringify(versionInfo));
    } catch (error) {
      console.warn('存储版本信息失败:', error);
    }
  };

  /**
   * 简化的版本检测逻辑
   */
  const checkForUpdate = useCallback(async (minCheckingTime = 2000) => {
    setIsChecking(true);
    const startTime = Date.now();

    try {
      // 获取当前版本信息
      const currentInfo = getCurrentVersionInfo();
      setCurrentVersion(currentInfo.version);

      // 获取存储的版本信息
      const storedInfo = getStoredVersionInfo();

      // 如果没有存储的版本信息，说明是首次访问或清除了缓存
      // 需要先获取服务器版本信息，然后提示更新
      if (!storedInfo) {
        console.log('🔄 首次访问或缓存已清除，获取服务器版本信息...');

        // 获取服务器版本信息
        const response = await fetch(`${config.versionEndpoint}?t=${Date.now()}`, {
          method: 'GET',
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          },
          cache: 'no-store'
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const serverInfo = await response.json();
        setLatestVersion(serverInfo.version);
        setHasUpdate(true);
        console.log('✅ 首次访问，提示更新到版本:', serverInfo.version);
        return true;
      }

      // 获取服务器版本信息
      const response = await fetch(`${config.versionEndpoint}?t=${Date.now()}`, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        cache: 'no-store'
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const serverInfo = await response.json();
      setLatestVersion(serverInfo.version);

      // 简单比较：如果服务器版本信息与存储的不同，则提示更新
      const needsUpdate = (
        serverInfo.version !== storedInfo.version ||
        serverInfo.buildHash !== storedInfo.buildHash ||
        serverInfo.buildTime !== storedInfo.buildTime
      );

      console.log('🔍 版本检测信息:', {
        stored: storedInfo,
        server: serverInfo,
        needsUpdate: needsUpdate
      });

      if (needsUpdate) {
        // 检查是否已永久忽略此版本
        const dismissedVersion = localStorage.getItem(APP_UPDATE_DISMISSED_KEY);
        if (dismissedVersion === serverInfo.version) {
          console.log('⏸️ 此版本已被用户永久忽略:', serverInfo.version);
          return false;
        }

        // 检查是否在"稍后更新"的延迟期内
        const snoozedData = localStorage.getItem(APP_UPDATE_SNOOZED_KEY);
        if (snoozedData) {
          try {
            const snoozedInfo = JSON.parse(snoozedData);
            const now = Date.now();
            const timeSinceSnoozed = now - snoozedInfo.snoozedAt;

            // 如果是相同版本且在延迟期内，不提示
            if (snoozedInfo.version === serverInfo.version && timeSinceSnoozed < config.snoozeTime) {
              const remainingTime = Math.ceil((config.snoozeTime - timeSinceSnoozed) / (60 * 1000));
              console.log(`😴 版本更新已暂缓，剩余时间: ${remainingTime} 分钟`);
              return false;
            } else if (snoozedInfo.version === serverInfo.version) {
              // 延迟期已过，清除暂缓记录
              localStorage.removeItem(APP_UPDATE_SNOOZED_KEY);
              console.log('⏰ 稍后更新的延迟期已过，重新提示更新');
            }
          } catch {
            // 解析失败，清除损坏的数据
            localStorage.removeItem(APP_UPDATE_SNOOZED_KEY);
          }
        }

        setHasUpdate(true);
        console.log('✅ 检测到版本更新');
        return true;
      } else {
        console.log('✅ 版本检测完成，无需更新');
        return false;
      }
    } catch (error) {
      console.warn('⚠️ 版本检查失败:', error.message);
      return false;
    } finally {
      // 确保检查动画至少显示指定时间，让用户能看到
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, minCheckingTime - elapsedTime);

      if (remainingTime > 0) {
        setTimeout(() => {
          setIsChecking(false);
        }, remainingTime);
      } else {
        setIsChecking(false);
      }
    }
  }, [config.versionEndpoint, config.snoozeTime]);

  /**
   * 应用更新（刷新页面）
   */
  const applyUpdate = () => {
    // 获取服务器版本信息并存储
    fetch(`${config.versionEndpoint}?t=${Date.now()}`)
      .then(response => response.json())
      .then(serverInfo => {
        storeCurrentVersionInfo(serverInfo);
        console.log('✅ 已存储新版本信息:', serverInfo);
      })
      .catch(error => {
        console.warn('获取服务器版本信息失败:', error);
      });

    // 清除更新状态和相关记录
    setHasUpdate(false);
    localStorage.removeItem(APP_UPDATE_DISMISSED_KEY);
    localStorage.removeItem(APP_UPDATE_SNOOZED_KEY);

    // 刷新页面
    setTimeout(() => {
      window.location.reload(true);
    }, 500);
  };

  /**
   * 稍后更新（临时延迟1小时）
   */
  const snoozeUpdate = () => {
    setHasUpdate(false);

    // 确保latestVersion是一个有效的版本号
    if (latestVersion && latestVersion !== '最新版本' && latestVersion.trim()) {
      const snoozeData = {
        version: latestVersion,
        snoozedAt: Date.now()
      };
      localStorage.setItem(APP_UPDATE_SNOOZED_KEY, JSON.stringify(snoozeData));
      console.log(`😴 用户选择稍后更新，版本 ${latestVersion} 将在 ${config.snoozeTime / (60 * 1000)} 分钟后重新提示`);
    } else {
      console.warn('⚠️ 无效的版本号，无法记录暂缓状态:', latestVersion);
    }
  };

  /**
   * 永久忽略当前更新
   */
  const dismissUpdate = () => {
    setHasUpdate(false);

    // 确保latestVersion是一个有效的版本号
    if (latestVersion && latestVersion !== '最新版本' && latestVersion.trim()) {
      localStorage.setItem(APP_UPDATE_DISMISSED_KEY, latestVersion);
      // 同时清除可能存在的暂缓记录
      localStorage.removeItem(APP_UPDATE_SNOOZED_KEY);
      console.log('⏸️ 用户已永久忽略版本更新:', latestVersion);
    } else {
      console.warn('⚠️ 无效的版本号，无法记录忽略状态:', latestVersion);
    }
  };

  /**
   * 启动自动检查
   */
  const startAutoCheck = useCallback(() => {
    if (intervalRef.current) return;

    // 设置定期检查
    intervalRef.current = setInterval(checkForUpdate, config.checkInterval);
    console.log('🔄 启动自动版本检查，间隔:', config.checkInterval / 1000 / 60, '分钟');
  }, [checkForUpdate, config.checkInterval]);

  /**
   * 停止自动检查
   */
  const stopAutoCheck = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      console.log('⏹️ 停止自动版本检查');
    }
  };

  // 初始化
  useEffect(() => {
    // 自动清理旧的存储数据
    autoCleanup();

    // 设置当前版本
    const currentInfo = getCurrentVersionInfo();
    setCurrentVersion(currentInfo.version);

    // 页面刷新时检测版本更新（异步，不阻塞页面）
    console.log('🔄 页面加载完成，开始检测版本更新...');
    setTimeout(() => {
      checkForUpdate(3000); // 确保检查动画至少显示3秒
    }, 1000); // 延迟1秒，让页面先完成渲染

    // 启动定时检查
    startAutoCheck();

    // 监听页面可见性变化
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // 页面重新可见时，检查更新
        setTimeout(checkForUpdate, 2000);
      }
    };

    // 监听网络重连
    const handleOnline = () => {
      setTimeout(checkForUpdate, 1000);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('online', handleOnline);

    // 清理函数
    return () => {
      stopAutoCheck();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('online', handleOnline);
    };
  }, [checkForUpdate, startAutoCheck]);

  return {
    hasUpdate,
    currentVersion,
    latestVersion,
    isChecking,
    checkForUpdate,
    applyUpdate,
    snoozeUpdate,
    dismissUpdate,
    startAutoCheck,
    stopAutoCheck
  };
}