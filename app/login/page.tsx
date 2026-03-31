import { Suspense } from 'react'
import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import styles from './login.module.scss'

// components
import Page from '../components/page/Page'
import LoginClient from './LoginClient'

// util
import { metadata } from '../utils/metadata'
import { createClient } from '../utils/supabase/server'
import { getUserProfileServer } from '../utils/userServiceServer'
import { isUserOnboardingComplete } from '../utils/auth/onboarding'
import { isSafeRedirectPath } from '../utils/auth/redirect'

// icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faGraduationCap,
  faLaptopCode,
  faMedal,
  faEnvelope,
} from '@fortawesome/free-solid-svg-icons'

/**
 * Loading fallback 元件
 * 在 LoginClient 載入時顯示
 * @returns {JSX.Element}
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

/**
 * [Page] 登入頁面
 * @returns {Promise<JSX.Element>}
 */
async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  // 獲取查詢參數
  const sParams = await searchParams
  const nextRaw = typeof sParams.next === 'string' ? sParams.next : '/profile'
  const nextPath = isSafeRedirectPath(nextRaw) ? nextRaw : '/profile'

  // 伺服器端驗證
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // 若已登入，根據 Onboarding 狀態導向
  if (user) {
    const profile = await getUserProfileServer(user.id)
    if (isUserOnboardingComplete(profile)) {
      redirect(nextPath)
    } else {
      // 帶上 next 參數，以便完成 onboarding 後能跳轉回來
      redirect(`/onboarding?next=${encodeURIComponent(nextPath)}`)
    }
  }

  return (
    <Page
      style={styles.login_page_wrapper}
      backgroundGrid
      mouseDynamicGlow
      maxWidth="1000px"
    >
      <Link href="/" passHref className={styles.back_to_home}>
        <Image
          src="/assets/image/home/robotctust-home-image.png"
          alt="中臺機器人研究社"
          width={96}
          height={96}
        />
        <p>回到首頁</p>
      </Link>
      <div className={styles.auth_container}>
        {/* 左側：功能介紹 */}
        <div className={styles.welcome_section}>
          <div className={styles.welcome_content}>
            <h1 className={styles.welcome_title}>
              歡迎來到
              <br />
              中臺機器人研究社
            </h1>
            <p className={styles.welcome_subtitle}>登入以解鎖更多專屬功能</p>

            <div className={styles.features_list}>
              <div className={styles.feature_item}>
                <div className={styles.feature_icon_wrapper}>
                  <FontAwesomeIcon
                    icon={faGraduationCap}
                    className={styles.feature_icon}
                  />
                </div>
                <div className={styles.feature_text}>
                  <h3>社團課程系統</h3>
                  <p>查看參與學期的所有課程與進度</p>
                </div>
              </div>
              <div className={styles.feature_item}>
                <div className={styles.feature_icon_wrapper}>
                  <FontAwesomeIcon
                    icon={faLaptopCode}
                    className={styles.feature_icon}
                  />
                </div>
                <div className={styles.feature_text}>
                  <h3>技術分享文章</h3>
                  <p>幹部總結與成員優秀作品分享</p>
                </div>
              </div>
              <div className={styles.feature_item}>
                <div className={styles.feature_icon_wrapper}>
                  <FontAwesomeIcon
                    icon={faMedal}
                    className={styles.feature_icon}
                  />
                </div>
                <div className={styles.feature_text}>
                  <h3>成就與經驗值</h3>
                  <p>完成課程任務，獲得專屬成就徽章</p>
                </div>
              </div>
              <div className={styles.feature_item}>
                <div className={styles.feature_icon_wrapper}>
                  <FontAwesomeIcon
                    icon={faEnvelope}
                    className={styles.feature_icon}
                  />
                </div>
                <div className={styles.feature_text}>
                  <h3>專屬信件通知</h3>
                  <p>重要通知與活動自動發送至 Email</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 右側：登入表單 */}
        <div className={styles.auth_form_wrapper}>
          <Suspense fallback={<LoginLoadingFallback />}>
            <LoginClient next={nextPath} />
          </Suspense>
        </div>
      </div>
    </Page>
  )
}

/**
 * [Function] 生成 Metadata
 * @returns {Metadata}
 */
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
