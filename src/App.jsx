import './App.scss'
import './styles/main.scss'
import { TodoWrapper, AppUpdateNotification } from './components'
import CustomSelectDemo from './components/CustomSelectDemo'
import FeedbackTest from './components/FeedbackTest'
import CookieConsent from './components/CookieConsent'
import PrivacyPolicy from './components/PrivacyPolicy'

function App() {
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
      
      {/* 应用更新通知 */}
      <AppUpdateNotification />
    </div>
  )
}

export default App
