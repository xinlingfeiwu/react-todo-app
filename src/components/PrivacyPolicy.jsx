import React from 'react';

/**
 * @description 隐私政策组件
 * @param {Object} props - 组件属性
 * @param {boolean} props.isOpen - 是否显示
 * @param {Function} props.onClose - 关闭回调
 * @returns {JSX.Element}
 */
function PrivacyPolicy({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="privacy-settings-overlay" onClick={onClose}>
      <div className="privacy-settings-modal" onClick={e => e.stopPropagation()}>
        <div className="privacy-settings-header">
          <h2>隐私政策</h2>
          <button className="close-btn" onClick={onClose}>
            <span className="close-btn-icon">✕</span>
          </button>
        </div>
        
        <div className="privacy-settings-content">
          <div className="privacy-policy-content">
            <p className="last-updated">最后更新：2025年7月17日</p>

            <section className="privacy-section">
              <h3>1. 概述</h3>
              <div className="privacy-info">
                <p>
                  我的待办清单（以下简称"应用"）尊重并保护您的隐私。本隐私政策说明了我们如何收集、
                  使用和保护您的信息。
                </p>
              </div>
            </section>

            <section className="privacy-section">
              <h3>2. 信息收集</h3>
              <div className="privacy-info">
                <h4>我们收集的信息：</h4>
                <ul>
                  <li><strong>待办事项数据</strong>：您创建的待办事项内容、完成状态、创建时间等</li>
                  <li><strong>应用设置</strong>：主题偏好、过滤器设置、界面配置等</li>
                  <li><strong>使用统计</strong>：匿名的应用使用情况，用于改进用户体验</li>
                </ul>
                
                <h4>我们不收集：</h4>
                <ul>
                  <li>个人身份信息（姓名、邮箱、电话等）</li>
                  <li>位置信息</li>
                  <li>设备标识符</li>
                  <li>与第三方的通信内容</li>
                </ul>
              </div>
            </section>

            <section className="privacy-section">
              <h3>3. 数据存储</h3>
              <div className="privacy-info">
                <p>
                  您的所有数据都存储在您的设备本地（浏览器的 localStorage），我们不会将您的数据
                  上传到任何服务器。这意味着：
                </p>
                <ul>
                  <li>✅ 您拥有数据的完全控制权</li>
                  <li>✅ 数据不会被第三方访问</li>
                  <li>✅ 离线时应用仍可正常使用</li>
                  <li>⚠️ 清除浏览器数据会导致待办事项丢失</li>
                </ul>
              </div>
            </section>

            <section className="privacy-section">
              <h3>4. Cookie 使用</h3>
              <div className="privacy-info">
                <p>我们使用 Cookie 和本地存储技术来：</p>
                <ul>
                  <li>保存您的待办事项和应用设置</li>
                  <li>记住您的主题偏好</li>
                  <li>提供更好的用户体验</li>
                  <li>记录您的隐私设置选择</li>
                </ul>
              </div>
            </section>

            <section className="privacy-section">
              <h3>5. 数据安全</h3>
              <div className="privacy-info">
                <p>
                  由于数据仅存储在您的设备上，您的信息安全主要依赖于您设备的安全性。
                  我们建议您：
                </p>
                <ul>
                  <li>定期导出备份您的待办事项数据</li>
                  <li>使用安全的设备和浏览器</li>
                  <li>避免在公共设备上使用敏感信息</li>
                </ul>
              </div>
            </section>

            <section className="privacy-section">
              <h3>6. 第三方服务</h3>
              <div className="privacy-info">
                <p>本应用可能包含以下第三方服务：</p>
                <ul>
                  <li><strong>字体服务</strong>：Google Fonts（用于提供美观字体）</li>
                  <li><strong>CDN 服务</strong>：用于加速资源加载</li>
                </ul>
                <p>这些服务有自己的隐私政策，我们建议您查阅相关条款。</p>
              </div>
            </section>

            <section className="privacy-section">
              <h3>7. 您的权利</h3>
              <div className="privacy-info">
                <p>您拥有以下权利：</p>
                <ul>
                  <li><strong>访问权</strong>：随时查看您的所有数据</li>
                  <li><strong>修改权</strong>：随时编辑或删除您的待办事项</li>
                  <li><strong>导出权</strong>：将数据导出为 JSON 格式</li>
                  <li><strong>删除权</strong>：清除所有存储的数据</li>
                  <li><strong>撤回同意</strong>：随时更改隐私设置</li>
                </ul>
              </div>
            </section>

            <section className="privacy-section">
              <h3>8. 数据管理</h3>
              <div className="privacy-info">
                <h4>导出数据：</h4>
                <p>您可以通过应用的"数据管理"功能导出所有待办事项数据。</p>
                
                <h4>删除数据：</h4>
                <p>您可以通过以下方式删除数据：</p>
                <ul>
                  <li>使用应用内的"清空所有数据"功能</li>
                  <li>清除浏览器的本地存储</li>
                  <li>卸载应用（如果是 PWA 安装版）</li>
                </ul>
              </div>
            </section>

            <section className="privacy-section">
              <h3>9. 未成年人保护</h3>
              <div className="privacy-info">
                <p>
                  我们不会故意收集 13 岁以下儿童的个人信息。如果发现收集了此类信息，
                  我们会立即删除。
                </p>
              </div>
            </section>

            <section className="privacy-section">
              <h3>10. 政策更新</h3>
              <div className="privacy-info">
                <p>
                  我们可能会不时更新本隐私政策。重大变更时，我们会通过应用内通知的方式
                  告知您。建议您定期查看本政策。
                </p>
              </div>
            </section>

            <section className="privacy-section">
              <h3>11. 联系我们</h3>
              <div className="privacy-info">
                <p>如果您对本隐私政策有任何疑问，可以通过以下方式联系我们：</p>
                <ul>
                  <li>应用内反馈功能</li>
                  <li>GitHub 项目页面</li>
                </ul>
              </div>
            </section>

            <section className="privacy-section">
              <h3>12. 法律适用</h3>
              <div className="privacy-info">
                <p>
                  本隐私政策受中华人民共和国法律管辖。同时，我们努力遵守 GDPR、CCPA 
                  等国际隐私法规的要求。
                </p>
              </div>
            </section>

            <section className="privacy-section">
              <div className="privacy-summary">
                <p>
                  <strong>简而言之</strong>：我们不收集您的个人信息，您的待办事项数据完全属于您，
                  存储在您的设备上，我们只是提供一个好用的工具帮您管理待办事项。
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PrivacyPolicy;
