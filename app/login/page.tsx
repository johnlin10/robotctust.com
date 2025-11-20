import React, { Suspense } from 'react'
import { Metadata } from 'next'
import styles from './login.module.scss'
// components
import Page from '../components/page/Page'
import LoginClient from './LoginClient'
// utils
import { metadata } from '../utils/metadata'

/**
 * Loading fallback 元件
 * 在 LoginClient 載入時顯示
 */
function LoginLoadingFallback() {
  return (
    <div className={styles.auth_page}>
      <div className={styles.auth_panel}>
        <div className={styles.status_card} aria-live="polite">
          <p>正在載入登入頁面...</p>
        </div>
      </div>
    </div>
  )
}

function LoginPage() {
  return (
    <Page
      style={styles.login_page_wrapper}
      maxWidth="640px"
      header={{
        title: '登入 / 註冊',
        descriptions: [
          '使用社團帳號登入以管理報名資料、追蹤競賽與社課通知。',
          '第一次來訪？完成註冊後即可使用同步課程與公告提醒等進階功能。',
        ],
      }}
    >
      <Suspense fallback={<LoginLoadingFallback />}>
        <LoginClient />
      </Suspense>
    </Page>
  )
}

export function generateMetadata(): Metadata {
  return metadata({
    title: '登入｜中臺機器人研究社',
    description: '進入中臺機器人研究社會員專區，完成登入或註冊以體驗完整服務。',
    keywords: ['登入', '註冊', '會員專區', '帳號登入', '帳號註冊'],
    image: '/assets/image/metadata-backgrounds/global.webp',
    url: '/login',
    category: 'account',
  })
}

export default LoginPage
