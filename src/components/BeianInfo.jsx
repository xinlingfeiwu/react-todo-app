import { useState, useEffect } from 'react';
import { getBeianInfo, isValidValue } from '../utils/beianUtils';

/**
 * 备案信息组件
 * 支持ICP备案和公安备案信息展示
 * 使用环境变量来避免敏感信息上传到代码仓库
 *
 * 样式文件: src/styles/components/BeianInfo.scss
 * 通过 src/styles/main.scss 统一导入管理
 */
const BeianInfo = () => {
  const [beianInfo, setBeianInfo] = useState(null);
  const [renderKey, setRenderKey] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  // 获取备案信息的函数
  const loadBeianInfo = () => {
    let foundInfo = null;

    // 1. 优先从全局变量获取（构建时注入）
    if (typeof window !== 'undefined' && window.__BEIAN_INFO__) {
      const globalInfo = window.__BEIAN_INFO__;
      if (isValidValue(globalInfo.icpNumber)) {
        foundInfo = {
          icpNumber: globalInfo.icpNumber,
          icpUrl: globalInfo.icpUrl || 'https://beian.miit.gov.cn',
          policeNumber: isValidValue(globalInfo.policeNumber) ? globalInfo.policeNumber : null,
          policeCode: isValidValue(globalInfo.policeCode) ? globalInfo.policeCode : null,
          policeUrl: isValidValue(globalInfo.policeUrl) ? globalInfo.policeUrl : null,
          hasBeianInfo: true
        };
      }
    }

    // 2. 从工具函数获取
    if (!foundInfo) {
      try {
        const info = getBeianInfo();
        if (info.hasBeianInfo && isValidValue(info.icpNumber)) {
          foundInfo = info;
        }
      } catch (error) {
        console.warn('从工具函数获取备案信息失败:', error);
      }
    }

    // 3. 从环境变量获取（开发环境）
    if (!foundInfo) {
      const envIcpNumber = import.meta.env.VITE_ICP_BEIAN_NUMBER;
      const envIcpUrl = import.meta.env.VITE_ICP_BEIAN_URL;
      const envPoliceNumber = import.meta.env.VITE_POLICE_BEIAN_NUMBER;
      const envPoliceCode = import.meta.env.VITE_POLICE_BEIAN_CODE;
      const envPoliceUrl = import.meta.env.VITE_POLICE_BEIAN_URL;
      
      if (isValidValue(envIcpNumber)) {
        foundInfo = {
          icpNumber: envIcpNumber,
          icpUrl: isValidValue(envIcpUrl) ? envIcpUrl : 'https://beian.miit.gov.cn',
          policeNumber: isValidValue(envPoliceNumber) ? envPoliceNumber : null,
          policeCode: isValidValue(envPoliceCode) ? envPoliceCode : null,
          policeUrl: isValidValue(envPoliceUrl) ? envPoliceUrl : null,
          hasBeianInfo: true
        };
      }
    }

    if (foundInfo) {
      setBeianInfo(foundInfo);
      setIsLoaded(true);
      return true;
    }
    return false;
  };

  useEffect(() => {
    // 立即尝试加载
    if (loadBeianInfo()) {
      return;
    }

    // 延迟重试机制 - 多次尝试确保在各种加载时机都能获取到数据
    const retryIntervals = [10, 50, 100, 200, 500, 1000, 2000];
    const timeouts = [];

    retryIntervals.forEach((delay, index) => {
      const timeout = setTimeout(() => {
        if (!isLoaded && loadBeianInfo()) {
          // 成功加载后清除后续的重试
          timeouts.slice(index + 1).forEach(clearTimeout);
          setRenderKey(prev => prev + 1); // 强制重新渲染
        }
      }, delay);
      timeouts.push(timeout);
    });

    // 监听页面加载状态变化
    const handleLoadingStateChange = () => {
      setTimeout(() => {
        if (!isLoaded) {
          loadBeianInfo();
          setRenderKey(prev => prev + 1);
        }
      }, 50);
    };

    // 监听DOM状态
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', handleLoadingStateChange);
    }
    
    window.addEventListener('load', handleLoadingStateChange);

    // 清理函数
    return () => {
      timeouts.forEach(clearTimeout);
      document.removeEventListener('DOMContentLoaded', handleLoadingStateChange);
      window.removeEventListener('load', handleLoadingStateChange);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // 渲染备案信息
  const renderBeianInfo = () => {
    // 如果没有状态信息，尝试从全局变量或环境变量直接获取
    if (!beianInfo) {
      let directInfo = null;
      
      // 从全局变量获取
      if (typeof window !== 'undefined' && window.__BEIAN_INFO__) {
        const globalInfo = window.__BEIAN_INFO__;
        if (isValidValue(globalInfo.icpNumber)) {
          directInfo = globalInfo;
        }
      }
      
      // 从环境变量获取（开发环境）
      if (!directInfo) {
        const envIcpNumber = import.meta.env.VITE_ICP_BEIAN_NUMBER;
        const envIcpUrl = import.meta.env.VITE_ICP_BEIAN_URL;
        
        if (isValidValue(envIcpNumber)) {
          directInfo = {
            icpNumber: envIcpNumber,
            icpUrl: isValidValue(envIcpUrl) ? envIcpUrl : 'https://beian.miit.gov.cn'
          };
        }
      }
      
      // 如果找到直接信息，渲染它
      if (directInfo && isValidValue(directInfo.icpNumber)) {
        return (
          <footer className="beian-info" key={renderKey}>
            <div className="beian-container">
              <div className="beian-item icp-beian">
                <a
                  href={directInfo.icpUrl || 'https://beian.miit.gov.cn'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="beian-link"
                >
                  {directInfo.icpNumber}
                </a>
              </div>
            </div>
          </footer>
        );
      }
      
      return null;
    }

    const hasIcp = isValidValue(beianInfo.icpNumber);
    const hasPolice = isValidValue(beianInfo.policeNumber);
    
    if (!hasIcp && !hasPolice) {
      return null;
    }

    return (
      <footer className="beian-info" key={renderKey}>
        <div className="beian-container">
          {/* 公安备案信息 */}
          {hasPolice && isValidValue(beianInfo.policeCode) && (
            <div className="beian-item police-beian">
              <img
                src="/beian-logo.svg"
                alt="公安备案"
                className="police-logo"
                width="20"
                height="20"
              />
              <a
                href={beianInfo.policeUrl || `https://beian.mps.gov.cn/#/query/webSearch?code=${beianInfo.policeCode}`}
                target="_blank"
                rel="noopener noreferrer"
                className="beian-link"
              >
                {beianInfo.policeNumber}
              </a>
            </div>
          )}

          {/* ICP备案信息 */}
          {hasIcp && (
            <div className="beian-item icp-beian">
              <a
                href={beianInfo.icpUrl || 'https://beian.miit.gov.cn'}
                target="_blank"
                rel="noopener noreferrer"
                className="beian-link"
              >
                {beianInfo.icpNumber}
              </a>
            </div>
          )}
        </div>
      </footer>
    );
  };

  return renderBeianInfo();
};

export default BeianInfo;
