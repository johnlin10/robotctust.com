'use client'

import { useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import styles from './login.module.scss'

// third-party utils
import { useQueryState, parseAsStringLiteral, parseAsString } from 'nuqs'

// components
import { LoginForm } from '../components/Auth/LoginForm'
import { RegisterForm } from '../components/Auth/RegisterForm'

// contexts
import { useAuth } from '../contexts/AuthContext'

/**
 * [Component] 登入／註冊頁面的互動式容器
 * @returns JSX.Element
 */
export default function LoginClient() {
  // 路由器
  const router = useRouter()
  // 使用者狀態
  const { user, loading } = useAuth()
  // 模式
  const [mode, setMode] = useQueryState(
    'mode',
    parseAsStringLiteral(['login', 'register'] as const)
      .withDefault('login')
      .withOptions({ clearOnDefault: true, scroll: false }),
  )
  // 電子郵件
  const [email, setEmail] = useQueryState(
    'email',
    parseAsString
      .withDefault('')
      .withOptions({ clearOnDefault: true, scroll: false }),
  )

  /**
   * [Effect] 若使用者已登入則導向個人頁面
   * @returns {void}
   */
  useEffect(() => {
    if (user?.username) {
      router.replace('/profile')
    }
  }, [router, user])

  /**
   * 切換至登入模式
   * @param email 可選的預填電子郵件
   * @returns {void}
   */
  const handleSwitchToLogin = useCallback(
    (emailToSet?: string) => {
      setMode('login')
      if (typeof emailToSet === 'string') {
        setEmail(emailToSet)
      }
    },
    [setMode, setEmail],
  )

  /**
   * 切換至註冊模式
   * @returns {void}
   */
  const handleSwitchToRegister = useCallback(() => {
    setMode('register')
    setEmail(null) // 切換到註冊時清空 email param
  }, [setMode, setEmail])

  // 是否為登入模式
  const isLoginMode = mode === 'login'

  return (
    <section className={styles.auth_page} data-testid="login-page">
      <div className={styles.auth_panel}>
        {loading && (
          <div className={styles.status_card} aria-live="polite">
            <p>正在載入使用者狀態...</p>
          </div>
        )}

        {!loading && user && (
          <div className={styles.status_card} aria-live="polite">
            <p>偵測到您已登入，正在帶您前往個人主頁...</p>
          </div>
        )}

        {!user && (
          <div className={styles.form_container}>
            {isLoginMode ? (
              <LoginForm
                onSwitchToRegister={handleSwitchToRegister}
                showCloseButton={false}
              />
            ) : (
              <RegisterForm
                onSwitchToLogin={handleSwitchToLogin}
                showCloseButton={false}
              />
            )}
          </div>
        )}
      </div>
    </section>
  )
}
