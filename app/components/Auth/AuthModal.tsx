'use client'

import React, { useState } from 'react'
import { LoginForm } from './LoginForm'
import { RegisterForm } from './RegisterForm'
import styles from './AuthModal.module.scss'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  initialMode?: 'login' | 'register'
}

/**
 * [Component] 登入模組
 * @param isOpen 是否開啟
 * @param onClose 關閉模組
 * @param initialMode 初始模式
 * @returns
 */
export function AuthModal({
  isOpen,
  onClose,
  initialMode = 'login',
}: AuthModalProps) {
  // 模式
  const [mode, setMode] = useState<'login' | 'register'>(initialMode)

  // 如果未開啟，則返回 null
  if (!isOpen) return null

  /**
   * 切換到登入模式
   * @returns void
   */
  const handleSwitchToLogin = () => setMode('login')

  /**
   * 切換到註冊模式
   * @returns void
   */
  const handleSwitchToRegister = () => setMode('register')

  return (
    <div className={styles.modal_overlay} onClick={onClose}>
      <div
        className={styles.modal_content}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.auth_modal_container}>
          {mode === 'login' ? (
            <LoginForm
              onSwitchToRegister={handleSwitchToRegister}
              onClose={onClose}
            />
          ) : (
            <RegisterForm
              onSwitchToLogin={handleSwitchToLogin}
              onClose={onClose}
            />
          )}
        </div>
      </div>
    </div>
  )
}
