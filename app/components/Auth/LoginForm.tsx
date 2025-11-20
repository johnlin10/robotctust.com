'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import styles from './LoginForm.module.scss'
// utils
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
// component
import GoogleLoginButton from '../GoogleLoginButton/GoogleLoginButton'
// context
import { useAuth } from '../../contexts/AuthContext'
// type
import { LoginFormData } from '../../types/user'
// icon
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmark } from '@fortawesome/free-solid-svg-icons'

/**
 * [Function] 表單驗證規則
 */
const loginSchema = yup.object({
  email: yup
    .string()
    .required('請輸入電子郵件')
    .email('請輸入有效的電子郵件格式'),
  password: yup.string().required('請輸入密碼').min(6, '密碼至少需要 6 個字元'),
})

interface LoginFormProps {
  onSwitchToRegister: () => void
  onClose?: () => void
  showCloseButton?: boolean
}

/**
 * [Component] 登入表單
 * @param onSwitchToRegister 切換到註冊模式
 * @param onClose 關閉模組
 * @returns
 */
export function LoginForm({
  onSwitchToRegister,
  onClose,
  showCloseButton = true,
}: LoginFormProps) {
  // AuthContext
  const { signInWithEmail, signInWithGoogle } = useAuth()
  // 登入狀態
  const [isLoading, setIsLoading] = useState(false)
  // 錯誤訊息
  const [error, setError] = useState<string>('')
  // 表單狀態
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema),
  })

  /**
   * [Function] 電子郵件登入處理
   * @param data 表單資料
   * @returns void
   */
  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true)
      setError('')
      await signInWithEmail(data.email, data.password)
      onClose?.()
    } catch (error) {
      console.error('登入失敗:', error)
      setError(getErrorMessage((error as { code?: string })?.code || 'unknown'))
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * [Function] Google 登入處理
   * @returns void
   */
  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true)
      setError('')
      await signInWithGoogle()
      onClose?.()
    } catch (error) {
      console.error('Google 登入失敗:', error)
      if (
        (error as { message?: string })?.message ===
        'NEW_USER_NEEDS_REGISTRATION'
      ) {
        setError('此 Google 帳號尚未註冊，請先完成註冊流程')
        onSwitchToRegister()
      } else {
        setError(
          getErrorMessage((error as { code?: string })?.code || 'unknown')
        )
      }
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * [Function] 錯誤訊息轉換
   * @param errorCode 錯誤代碼
   * @returns 錯誤訊息
   */
  const getErrorMessage = (errorCode: string): string => {
    switch (errorCode) {
      case 'auth/user-not-found':
        return '找不到此電子郵件對應的帳號'
      case 'auth/wrong-password':
        return '密碼錯誤'
      case 'auth/invalid-email':
        return '電子郵件格式無效'
      case 'auth/user-disabled':
        return '此帳號已被停用'
      case 'auth/too-many-requests':
        return '登入嘗試次數過多，請稍後再試'
      case 'auth/invalid-credential':
        return '帳號或密碼錯誤'
      default:
        return '登入失敗，請稍後再試'
    }
  }

  return (
    <>
      {/* 表單標題 */}
      <div className={styles.form_header}>
        <h2>登入</h2>
        {showCloseButton && (
          <button className={styles.close_button} onClick={onClose}>
            <FontAwesomeIcon icon={faXmark} />
          </button>
        )}
      </div>

      {/* 錯誤訊息 */}
      {error && <div className={styles.error_message}>{error}</div>}

      {/* 表單 */}
      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        {/* 電子郵件 */}
        <div className={styles.form_group}>
          <label htmlFor="email">電子郵件</label>
          <input
            id="email"
            type="email"
            {...register('email')}
            className={errors.email ? styles.error : ''}
            placeholder="請輸入您的電子郵件"
          />
          {errors.email && (
            <span className={styles.field_error}>{errors.email.message}</span>
          )}
        </div>

        {/* 密碼 */}
        <div className={styles.form_group}>
          <label htmlFor="password">密碼</label>
          <input
            id="password"
            type="password"
            {...register('password')}
            className={errors.password ? styles.error : ''}
            placeholder="請輸入您的密碼"
          />
          {errors.password && (
            <span className={styles.field_error}>
              {errors.password.message}
            </span>
          )}
        </div>

        {/* 登入按鈕 */}
        <button
          type="submit"
          className={styles.submit_button}
          disabled={isLoading}
        >
          {isLoading ? '登入中...' : '登入'}
        </button>
      </form>

      {/* 分割線 */}
      <div className={styles.divider}>
        <span className={styles.divider_line}></span>
        <span className={styles.divider_text}>或</span>
      </div>

      {/* Google 登入按鈕 */}
      <GoogleLoginButton
        onClick={handleGoogleSignIn}
        disabled={isLoading}
        mode="login"
      />
    </>
  )
}
