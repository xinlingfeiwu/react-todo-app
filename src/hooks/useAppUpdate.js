import { useState, useEffect, useRef } from 'react';
import { 
  APP_UPDATE_DISMISSED_KEY, 
  APP_UPDATE_AVAILABLE_KEY, 
  APP_UPDATE_APPLIED_KEY, 
  APP_ETAG_KEY, 
  APP_LAST_MODIFIED_KEY 
} from '../constants/storageKeys';

/**
 * 应用更新检测 Hook
 * 检测应用是否有新版本，并提供更新提示功能
 */
export function useAppUpdate() {
  const [hasUpdate, setHasUpdate] = useState(false);
  const [currentVersion, setCurrentVersion] = useState('');
  const [latestVersion, setLatestVersion] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const intervalRef = useRef(null);
  const lastCheckRef = useRef(0);

  // 配置选项
  const config = {
    checkInterval: 5 * 60 * 1000, // 5分钟检查一次
    versionEndpoint: '/version.json', // 版本信息端点
    minCheckInterval: 60 * 1000, // 最小检查间隔1分钟
    retryDelay: 30 * 1000, // 重试延迟30秒
    enableAutoCheck: true, // 是否启用自动检查
  };

  /**
   * 获取当前应用版本
   */
  const getCurrentVersion = () => {
    // 从环境变量或构建时注入的版本信息获取
    return import.meta.env.VITE_APP_VERSION || 
           window.__APP_VERSION__ || 
           '1.0.0';
  };

  /**
   * 生成版本信息文件（工具函数，供构建脚本使用）
   */
  // eslint-disable-next-line no-unused-vars
  const generateVersionInfo = () => {
    const version = getCurrentVersion();
    const buildTime = new Date().toISOString();
    const buildHash = Date.now().toString(36); // 简单的构建哈希
    
    return {
      version,
      buildTime,
      buildHash,
      timestamp: Date.now()
    };
  };

  /**
   * 检查服务器版本
   */
  const checkServerVersion = async () => {
    const now = Date.now();
    
    // 防止频繁检查
    if (now - lastCheckRef.current < config.minCheckInterval) {
      return false;
    }
    
    lastCheckRef.current = now;
    setIsChecking(true);

    try {
      // 添加时间戳防止缓存
      const response = await fetch(`${config.versionEndpoint}?t=${now}`, {
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
      const currentVer = getCurrentVersion();
      
      setCurrentVersion(currentVer);
      setLatestVersion(serverInfo.version);

      // 检查版本是否不同 - 优先比较版本号，buildHash作为辅助
      const hasNewVersion = serverInfo.version !== currentVer ||
                           (serverInfo.buildHash && window.__BUILD_HASH__ &&
                            serverInfo.buildHash !== window.__BUILD_HASH__);

      if (hasNewVersion) {
        // 检查是否刚刚应用过更新（5分钟内）
        const appliedUpdate = localStorage.getItem(APP_UPDATE_APPLIED_KEY);
        if (appliedUpdate) {
          try {
            const appliedInfo = JSON.parse(appliedUpdate);
            const timeSinceApplied = now - appliedInfo.appliedAt;
            
            // 如果15分钟内刚应用过更新，则不再显示提醒
            if (timeSinceApplied < 15 * 60 * 1000) {
              console.log('🔄 刚刚应用过更新，跳过提醒:', appliedInfo);
              return false;
            } else {
              // 超过15分钟，清除应用记录
              localStorage.removeItem(APP_UPDATE_APPLIED_KEY);
            }
          } catch {
            localStorage.removeItem(APP_UPDATE_APPLIED_KEY);
          }
        }
        
        // 检查是否已经忽略了这个版本
        const dismissedUpdate = localStorage.getItem(APP_UPDATE_DISMISSED_KEY);
        if (dismissedUpdate) {
          try {
            const dismissedInfo = JSON.parse(dismissedUpdate);
            // 如果忽略的版本与当前检测到的版本相同，则不显示提醒
            if (dismissedInfo.version === serverInfo.version) {
              console.log('⏸️ 此版本更新已被用户忽略:', serverInfo.version);
              return false;
            }
            // 如果检测到新的版本（比忽略的版本更新），清除忽略记录
            else {
              localStorage.removeItem(APP_UPDATE_DISMISSED_KEY);
              console.log('🆕 检测到比忽略版本更新的版本:', {
                ignored: dismissedInfo.version,
                latest: serverInfo.version
              });
            }
          } catch {
            // 如果解析失败，清除损坏的数据
            localStorage.removeItem(APP_UPDATE_DISMISSED_KEY);
          }
        }

        setHasUpdate(true);
        
        // 存储更新信息到localStorage
        localStorage.setItem(APP_UPDATE_AVAILABLE_KEY, JSON.stringify({
          currentVersion: currentVer,
          latestVersion: serverInfo.version,
          detectedAt: now,
          serverInfo
        }));

        console.log('🔄 检测到应用更新:', {
          current: currentVer,
          latest: serverInfo.version,
          buildTime: serverInfo.buildTime
        });

        return true;
      }

      return false;
    } catch (error) {
      console.warn('⚠️ 版本检查失败:', error.message);
      
      // 如果网络错误，尝试检查页面是否已更新
      return checkPageUpdate();
    } finally {
      setIsChecking(false);
    }
  };

  /**
   * 检查页面更新（备用方法）
   * 通过检查主要资源文件的变化来检测更新
   */
  const checkPageUpdate = async () => {
    try {
      // 获取当前页面的ETag或Last-Modified
      const response = await fetch(window.location.href, {
        method: 'HEAD',
        cache: 'no-store'
      });

      const etag = response.headers.get('etag');
      const lastModified = response.headers.get('last-modified');
      
      const storedEtag = localStorage.getItem(APP_ETAG_KEY);
      const storedLastModified = localStorage.getItem(APP_LAST_MODIFIED_KEY);

      if ((etag && etag !== storedEtag) || 
          (lastModified && lastModified !== storedLastModified)) {
        
        // 更新存储的值
        if (etag) localStorage.setItem(APP_ETAG_KEY, etag);
        if (lastModified) localStorage.setItem(APP_LAST_MODIFIED_KEY, lastModified);
        
        setHasUpdate(true);
        return true;
      }

      return false;
    } catch (error) {
      console.warn('⚠️ 页面更新检查失败:', error.message);
      return false;
    }
  };

  /**
   * 手动检查更新
   */
  const checkForUpdate = async () => {
    if (isChecking) return false;
    return await checkServerVersion();
  };

  /**
   * 应用更新（刷新页面）
   */
  const applyUpdate = () => {
    // 立即停止所有检查，防止在刷新前继续检查
    stopAutoCheck();

    // 立即清除更新状态，防止重复弹出
    setHasUpdate(false);

    // 设置更新标记，防止刷新后重复弹出
    const updateAppliedInfo = {
      version: latestVersion,
      appliedAt: Date.now(),
      currentVersion: getCurrentVersion()
    };
    localStorage.setItem(APP_UPDATE_APPLIED_KEY, JSON.stringify(updateAppliedInfo));

    // 清除更新状态
    localStorage.removeItem(APP_UPDATE_AVAILABLE_KEY);
    localStorage.removeItem(APP_UPDATE_DISMISSED_KEY);
    localStorage.removeItem(APP_ETAG_KEY);
    localStorage.removeItem(APP_LAST_MODIFIED_KEY);

    // 清除所有缓存
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        registrations.forEach(registration => {
          registration.unregister();
        });
      });
    }

    // 延迟刷新页面，给用户一点时间看到更新进度
    setTimeout(() => {
      window.location.reload(true);
    }, 1000);
  };

  /**
   * 忽略当前更新
   */
  const dismissUpdate = () => {
    setHasUpdate(false);
    
    // 记录忽略的版本信息，防止重复提醒
    const dismissedInfo = {
      version: latestVersion,
      dismissedAt: Date.now(),
      currentVersion: getCurrentVersion()
    };
    
    localStorage.setItem(APP_UPDATE_DISMISSED_KEY, JSON.stringify(dismissedInfo));
    localStorage.removeItem(APP_UPDATE_AVAILABLE_KEY);
    
    console.log('⏸️ 用户已忽略版本更新:', dismissedInfo);
  };

  /**
   * 启动自动检查
   */
  const startAutoCheck = () => {
    if (!config.enableAutoCheck || intervalRef.current) return;

    // 立即检查一次
    setTimeout(checkServerVersion, 1000);

    // 设置定期检查
    intervalRef.current = setInterval(checkServerVersion, config.checkInterval);
  };

  /**
   * 停止自动检查
   */
  const stopAutoCheck = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // 初始化
  useEffect(() => {
    // 设置当前版本
    setCurrentVersion(getCurrentVersion());

    // 检查是否刚刚应用过更新
    const appliedUpdate = localStorage.getItem(APP_UPDATE_APPLIED_KEY);
    if (appliedUpdate) {
      try {
        const appliedInfo = JSON.parse(appliedUpdate);
        const timeSinceApplied = Date.now() - appliedInfo.appliedAt;
        
        // 如果15分钟内刚应用过更新，则清除所有更新相关记录
        if (timeSinceApplied < 15 * 60 * 1000) {
          localStorage.removeItem(APP_UPDATE_AVAILABLE_KEY);
          localStorage.removeItem(APP_UPDATE_DISMISSED_KEY);
          console.log('🔄 检测到刚应用过更新，清除更新记录');

          // 启动自动检查但延迟更长时间
          setTimeout(() => startAutoCheck(), 5 * 60 * 1000); // 延迟5分钟开始检查
          return;
        } else {
          // 超过15分钟，清除应用记录
          localStorage.removeItem(APP_UPDATE_APPLIED_KEY);
        }
      } catch {
        localStorage.removeItem(APP_UPDATE_APPLIED_KEY);
      }
    }

    // 检查是否有未处理的更新提醒
    const storedUpdate = localStorage.getItem(APP_UPDATE_AVAILABLE_KEY);
    const dismissedUpdate = localStorage.getItem(APP_UPDATE_DISMISSED_KEY);
    
    if (storedUpdate) {
      try {
        const updateInfo = JSON.parse(storedUpdate);
        const timeDiff = Date.now() - updateInfo.detectedAt;
        
        // 检查是否已忽略了这个版本
        let shouldShowUpdate = true;
        if (dismissedUpdate) {
          try {
            const dismissedInfo = JSON.parse(dismissedUpdate);
            if (dismissedInfo.version === updateInfo.latestVersion) {
              shouldShowUpdate = false;
              console.log('⏸️ 启动时发现已忽略的版本更新:', dismissedInfo.version);
            }
          } catch {
            // 忽略解析错误，清除损坏的数据
            localStorage.removeItem(APP_UPDATE_DISMISSED_KEY);
          }
        }
        
        // 如果更新提醒在1小时内且未被忽略，则显示
        if (shouldShowUpdate && timeDiff < 60 * 60 * 1000) {
          setHasUpdate(true);
          setLatestVersion(updateInfo.latestVersion);
          if (import.meta.env.DEV) {
            console.log('🔄 启动时恢复更新提醒:', updateInfo.latestVersion);
          }
        } else if (!shouldShowUpdate) {
          // 清除已忽略版本的更新记录
          localStorage.removeItem(APP_UPDATE_AVAILABLE_KEY);
        }
      } catch (error) {
        console.warn('解析更新信息失败:', error);
        localStorage.removeItem(APP_UPDATE_AVAILABLE_KEY);
      }
    }

    // 页面可见性变化处理函数
    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopAutoCheck();
      } else {
        // 页面重新可见时，检查更新
        setTimeout(checkServerVersion, 2000);
        startAutoCheck();
      }
    };

    // 启动自动检查
    startAutoCheck();

    // 监听页面可见性变化
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // 监听网络状态变化
    const handleOnline = () => {
      if (navigator.onLine) {
        setTimeout(checkServerVersion, 1000);
      }
    };

    window.addEventListener('online', handleOnline);

    // 清理函数
    return () => {
      stopAutoCheck();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('online', handleOnline);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    hasUpdate,
    currentVersion,
    latestVersion,
    isChecking,
    checkForUpdate,
    applyUpdate,
    dismissUpdate,
    startAutoCheck,
    stopAutoCheck
  };
}
