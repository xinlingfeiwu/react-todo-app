import React, { useState } from "react";
import ConfirmDialog from "./ConfirmDialog";
import FeedbackForm from "./FeedbackForm";
// import ThankYouList from './ThankYouList'; // 暂时隐藏感谢榜功能

/**
 * @description 捐赠组件 - 显示支付宝收款码
 * @param {Object} props - 组件属性
 * @param {boolean} props.isOpen - 是否显示捐赠面板
 * @param {Function} props.onClose - 关闭面板的回调函数
 * @returns {JSX.Element}
 */
function Donate({ isOpen, onClose }) {
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // 打开反馈表单
  const handleFeedbackClick = () => {
    setShowFeedbackForm(true);
  };

  // 关闭反馈表单
  const handleCloseFeedbackForm = () => {
    setShowFeedbackForm(false);
  };

  // 分享功能
  const handleShare = async () => {
    const shareData = {
      title: "我的待办清单 - 简洁高效的待办事项管理工具",
      text: "发现了一个超好用的待办清单应用！界面美观、功能齐全，支持数据导入导出，还有毛玻璃特效🌟 主要特色：精美毛玻璃界面、完美适配移动端、数据导入导出、深色浅色主题、本地存储安全、极速响应流畅",
      url: window.location.href,
    };

    // 创建美观的分享文本内容
    const shareText = `${shareData.title}

${shareData.text}

🔗 立即体验：${shareData.url}

✨ 主要特色：
• 🎨 精美的毛玻璃界面设计
• 📱 完美适配移动端和桌面端
• 💾 支持数据导入/导出备份
• 🌙 深色/浅色主题切换
• 🔒 本地存储，隐私安全
• ⚡ 极速响应，操作流畅

#待办清单 #效率工具 #生产力`;

    try {
      // 检查是否支持 Web Share API
      if (navigator.share) {
        // 首先尝试不带文件的分享，确保文本信息显示
        try {
          await navigator.share(shareData);
          return; // 如果成功，直接返回
        } catch (basicShareError) {
          console.log("基础分享失败，尝试带图片分享:", basicShareError);
        }

        // 如果基础分享失败，尝试添加图片
        try {
          // 获取专门的分享图片
          const shareImageUrl = window.location.origin + "/share-image.svg";
          const response = await fetch(shareImageUrl);

          if (response.ok) {
            const blob = await response.blob();
            const file = new File([blob], "todo-app-share.svg", {
              type: "image/svg+xml",
            });

            // 尝试包含图片的分享
            await navigator.share({
              ...shareData,
              files: [file],
            });
          } else {
            // 如果获取分享图片失败，尝试使用 favicon
            const faviconUrl = window.location.origin + "/favicon.svg";
            const faviconResponse = await fetch(faviconUrl);

            if (faviconResponse.ok) {
              const faviconBlob = await faviconResponse.blob();
              const faviconFile = new File([faviconBlob], "app-icon.svg", {
                type: "image/svg+xml",
              });

              await navigator.share({
                ...shareData,
                files: [faviconFile],
              });
            } else {
              // 如果都获取失败，只分享文本内容
              await navigator.share(shareData);
            }
          }
        } catch (fileError) {
          // 如果文件分享不支持，降级到普通分享
          console.log("文件分享不支持，使用普通分享:", fileError);
          await navigator.share(shareData);
        }
      } else {
        // 降级方案：复制完整的分享文本到剪贴板
        await navigator.clipboard.writeText(shareText);
        setShowSuccessDialog(true);
      }
    } catch (error) {
      // 如果剪贴板API也不支持，提供手动复制
      console.log("分享失败，使用手动复制:", error);
      const textArea = document.createElement("textarea");
      textArea.value = shareText;
      textArea.style.position = "fixed";
      textArea.style.opacity = "0";
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setShowSuccessDialog(true);
    }
  };

  const handleCloseSuccessDialog = () => {
    setShowSuccessDialog(false);
  };

  return (
    <>
      {/* 遮罩层 */}
      {isOpen && (
        <div className="donate-overlay" onClick={handleOverlayClick}></div>
      )}

      {/* 捐赠侧边栏 */}
      <div className={`donate-sidebar ${isOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <h3>
            <span className="header-icon">💝</span>
            支持开发
          </h3>
          <button className="close-btn" onClick={onClose}>
            <span className="close-btn-icon">✕</span>
          </button>
        </div>

        <div className="sidebar-content">
          <div className="donate-content">
            {/* 感谢文字 */}
            <div className="donate-message">
              <h4>🙏 感谢您的支持</h4>
              <p>
                如果这个待办清单应用对您有帮助，欢迎通过支付宝或微信进行捐赠，支持开发者继续改进和维护这个项目。
              </p>
            </div>

            {/* 支付宝和微信收款码区域 */}
            <div className="qr-code-section">
              <h4>📱 扫码捐赠</h4>
              <div className="qr-codes-container">
                {/* 支付宝收款码 */}
                <div className="qr-code-item">
                  <h5>支付宝</h5>
                  <div className="qr-code-container">
                    <img
                      src="/images/alipay-qr.jpg"
                      alt="支付宝收款码"
                      className="qr-image"
                    />
                  </div>
                </div>

                {/* 微信收款码 */}
                <div className="qr-code-item">
                  <h5>微信支付</h5>
                  <div className="qr-code-container">
                    <img
                      src="/images/wechat-qr.jpg"
                      alt="微信收款码"
                      className="qr-image"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 其他捐赠方式 */}
            <div className="donate-options">
              <h4>💰 其他支持方式</h4>
              <div className="option-list">
                <div className="option-item" style={{ display: "none" }}>
                  <span className="option-icon">⭐</span>
                  <span>在 GitHub 上给项目点星</span>
                </div>
                <div
                  className="option-item clickable"
                  onClick={handleFeedbackClick}
                >
                  <span className="option-icon">📝</span>
                  <span>提交功能建议和 Bug 反馈</span>
                </div>
                <div className="option-item clickable" onClick={handleShare}>
                  <span className="option-icon">🔗</span>
                  <span>分享给更多需要的朋友</span>
                </div>
              </div>
            </div>

            {/* 感谢名单 - 暂时隐藏，后续开放 */}
            {/* <ThankYouList showAddDemo={true} /> */}
          </div>
        </div>
      </div>

      {/* 分享成功提示对话框 */}
      <ConfirmDialog
        isOpen={showSuccessDialog}
        title="分享内容已准备好 🎉"
        message="包含应用介绍和特色功能的完整分享文本已复制到剪贴板！快去分享给朋友们吧 ✨"
        confirmText="好的"
        cancelText={null}
        onConfirm={handleCloseSuccessDialog}
        onCancel={handleCloseSuccessDialog}
        type="info"
      />

      {/* 反馈表单 */}
      <FeedbackForm
        isOpen={showFeedbackForm}
        onClose={handleCloseFeedbackForm}
      />
    </>
  );
}

export default Donate;
