import { useState, useEffect } from 'react';

/**
 * 备案信息组件
 * 支持ICP备案和公安备案信息展示
 * 使用环境变量来避免敏感信息上传到代码仓库
 *
 * 样式文件: src/styles/components/BeianInfo.scss
 * 通过 src/styles/main.scss 统一导入管理
 */
const BeianInfo = () => {
  const [envLoaded, setEnvLoaded] = useState(false);

  // 从环境变量读取备案信息
  const icpNumber = import.meta.env.VITE_ICP_BEIAN_NUMBER;
  const icpUrl = import.meta.env.VITE_ICP_BEIAN_URL || 'https://beian.miit.gov.cn';

  const policeNumber = import.meta.env.VITE_POLICE_BEIAN_NUMBER;
  const policeUrl = import.meta.env.VITE_POLICE_BEIAN_URL;
  const policeCode = import.meta.env.VITE_POLICE_BEIAN_CODE;

  useEffect(() => {
    // 延迟检查环境变量，确保它们已经加载
    const timer = setTimeout(() => {
      setEnvLoaded(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // 如果环境变量还没有加载完成，暂不显示
  if (!envLoaded) {
    return null;
  }

  // 如果没有配置任何备案信息，不显示组件
  if (!icpNumber && !policeNumber) {
    return null;
  }

  return (
    <div className="beian-info">
      <div className="beian-container">
        {/* 公安备案信息 - 在左边 */}
        {policeNumber && policeCode && (
          <div className="beian-item police-beian">
            <img
              src="/beian-logo.svg"
              alt="公安备案"
              className="police-logo"
              width="20"
              height="20"
            />
            <a
              href={policeUrl || `https://beian.mps.gov.cn/#/query/webSearch?code=${policeCode}`}
              target="_blank"
              rel="noopener noreferrer"
              className="beian-link"
            >
              {policeNumber}
            </a>
          </div>
        )}

        {/* ICP备案信息 - 在右边 */}
        {icpNumber && (
          <div className="beian-item icp-beian">
            <a
              href={icpUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="beian-link"
            >
              {icpNumber}
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default BeianInfo;
