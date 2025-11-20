'use client'

import React, { useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useQueryState, parseAsStringLiteral } from 'nuqs'
import styles from './login.module.scss'
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
  const router = useRouter()
  const { user, loading } = useAuth()
  const [mode, setMode] = useQueryState(
    'mode',
    parseAsStringLiteral(['login', 'register'] as const)
      .withDefault('login')
      .withOptions({ clearOnDefault: true, scroll: false })
  )

  //* 若使用者已登入則導向個人頁面
  useEffect(() => {
    if (user?.username) {
      router.replace(`/user/${user.username}`)
    }
  }, [router, user])

  /**
   * 切換至登入模式
   * @returns void
   */
  const handleSwitchToLogin = useCallback(() => {
    setMode('login')
  }, [setMode])

  /**
   * 切換至註冊模式
   * @returns void
   */
  const handleSwitchToRegister = useCallback(() => {
    setMode('register')
  }, [setMode])

  const isLoginMode = mode === 'login'

  return (
    <section className={styles.auth_page} data-testid="login-page">
      <div className={styles.auth_panel}>
        <div className={styles.tab_header}>
          <button
            type="button"
            className={`${styles.tab_button} ${
              isLoginMode ? styles.active : ''
            }`}
            onClick={handleSwitchToLogin}
            aria-pressed={isLoginMode}
          >
            登入
          </button>
          <button
            type="button"
            className={`${styles.tab_button} ${
              !isLoginMode ? styles.active : ''
            }`}
            onClick={handleSwitchToRegister}
            aria-pressed={!isLoginMode}
          >
            註冊
          </button>
        </div>

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
