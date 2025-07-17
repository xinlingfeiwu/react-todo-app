import { useEffect } from 'react'
import './App.css'
import './styles/main.css'
import { TodoWrapper } from './components'
import CustomSelectDemo from './components/CustomSelectDemo'
import FeedbackTest from './components/FeedbackTest'
import CookieConsent from './components/CookieConsent'
import PrivacyPolicy from './components/PrivacyPolicy'
import { initTheme } from './utils/themeManager'

function App() {
  // 初始化主题系统
  useEffect(() => {
    const cleanup = initTheme();
    return cleanup;
  }, []);

  // 检查是否需要显示演示页面
  const showDemo = window.location.search.includes('demo=customselect');
  const showFeedbackTest = window.location.search.includes('test=feedback');
  const showPrivacyPolicy = window.location.search.includes('page=privacy');
  
  if (showDemo) {
    return <CustomSelectDemo />;
  }
  
  if (showFeedbackTest) {
    return <FeedbackTest />;
  }
  
  if (showPrivacyPolicy) {
    return <PrivacyPolicy />;
  }

  return (
    <div className="App">
      <TodoWrapper 
        title="我的待办清单"
        showStats={true}
        showFilter={true}
      />
      
      {/* Cookie 隐私同意提示 */}
      <CookieConsent />
    </div>
  )
}

export default App
