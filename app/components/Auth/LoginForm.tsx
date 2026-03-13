'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import styles from './LoginForm.module.scss'

// third-party utils
import { useQueryState, parseAsString } from 'nuqs'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'

// component
import GoogleLoginButton from '../GoogleLoginButton/GoogleLoginButton'

// context
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'

// type
import { LoginFormData } from '../../types/user'

// icon
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmark } from '@fortawesome/free-solid-svg-icons'

/**
 * [Schema] 表單驗證規則
 */
const loginSchema = yup.object({
  email: yup
    .string()
    .required('請輸入電子郵件')
    .email('請輸入有效的電子郵件格式'),
  password: yup.string().required('請輸入密碼').min(6, '密碼至少需要 6 個字元'),
})

interface LoginFormProps {
  onSwitchToRegister: () => void // 切換到註冊模式
  onClose?: () => void // 關閉模組
  showCloseButton?: boolean // 是否顯示關閉按鈕
}

/**
 * [Component] 登入表單
 * @param onSwitchToRegister 切換到註冊模式
 * @param onClose 關閉模組
 * @param showCloseButton 是否顯示關閉按鈕
 * @returns
 */
export function LoginForm({
  onSwitchToRegister,
  onClose,
  showCloseButton = true,
}: LoginFormProps) {
  // ToastContext
  const { showToast } = useToast()
  // AuthContext
  const { signInWithEmail, signInWithGoogle } = useAuth()
  // 查詢參數電子郵件
  const [emailQuery] = useQueryState('email', parseAsString.withDefault(''))
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
    defaultValues: {
      email: emailQuery,
    },
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
      showToast('登入成功，歡迎回來！', 'success')
      onClose?.()
    } catch (error) {
      console.error('登入失敗:', error)
      setError(
        getErrorMessage((error as { message?: string })?.message || 'unknown'),
      )
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
      showToast('Google 登入成功，歡迎回來！', 'success')
    } catch (error) {
      console.error('Google 登入失敗:', error)
      setError(
        getErrorMessage((error as { message?: string })?.message || 'unknown'),
      )
      showToast('Google 登入失敗，請稍後再試', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * [Function] 錯誤訊息轉換
   * @param errorCode 錯誤代碼
   * @returns 錯誤訊息
   */
  const getErrorMessage = (errorMsg: string): string => {
    if (
      errorMsg.includes('Invalid credentials') ||
      errorMsg.includes('invalid_grant')
    ) {
      return '帳號或密碼錯誤'
    } else if (errorMsg.includes('Email not confirmed')) {
      return '請先前往信箱驗證您的帳號'
    } else if (errorMsg.includes('User not found')) {
      return '找不到此電子郵件對應的帳號'
    } else if (errorMsg.includes('Invalid login credentials')) {
      return '帳號或密碼錯誤'
    } else {
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

      {/* 切換至註冊 */}
      <p className={styles.switch_form}>
        還沒有帳號？{' '}
        <button type="button" onClick={onSwitchToRegister}>
          立即註冊
        </button>
      </p>
    </>
  )
}
