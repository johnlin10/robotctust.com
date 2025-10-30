'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { useForm } from 'react-hook-form'
import styles from './RegisterForm.module.scss'
// component
import GoogleLoginButton from '../GoogleLoginButton/GoogleLoginButton'
// firebase
import { signInWithPopup } from 'firebase/auth'
import { auth, googleProvider } from '../../utils/firebase'
// context
import { useAuth } from '../../contexts/AuthContext'
// type
import { RegisterFormData } from '../../types/user'
// icon
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmark } from '@fortawesome/free-solid-svg-icons'

//* 表單資料型別
interface FormData {
  email?: string
  password?: string
  confirmPassword?: string
  username: string
  displayName: string
  photoURL?: string
}

interface RegisterFormProps {
  onSwitchToLogin: () => void
  onClose: () => void
}

/**
 * [Component] 註冊表單
 * @param onSwitchToLogin 切換到登入模式
 * @param onClose 關閉模組
 * @returns
 */
export const RegisterForm: React.FC<RegisterFormProps> = ({
  onSwitchToLogin,
  onClose,
}) => {
  // AuthContext
  const { register: registerUser, getUserProfile, signOut } = useAuth()
  // 註冊狀態
  const [isLoading, setIsLoading] = useState(false)
  // 錯誤訊息
  const [error, setError] = useState<string>('')
  // Google 註冊狀態
  const [isGoogleRegister, setIsGoogleRegister] = useState(false)
  // 頭像預覽
  const [previewImage, setPreviewImage] = useState<string>(
    '/assets/image/userEmptyAvatar.svg'
  )
  // 頭像上傳 ref
  const fileInputRef = useRef<HTMLInputElement>(null)
  // Username 檢查狀態
  const [usernameChecking, setUsernameChecking] = useState(false)
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(
    null
  )

  // 表單狀態
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
    setError: setFieldError,
    watch,
  } = useForm<FormData>()

  // 監聽 username 變化
  const watchedUsername = watch('username')

  //* 檢查 username 是否可用（防抖處理）
  const checkUsernameAvailability = useCallback(
    async (username: string) => {
      if (!username || username.length < 3) {
        setUsernameAvailable(null)
        return
      }

      // 驗證格式
      if (!/^[a-zA-Z0-9_.-]+$/.test(username)) {
        setUsernameAvailable(null)
        return
      }

      try {
        setUsernameChecking(true)
        const existingProfile = await getUserProfileByUsername(username)
        setUsernameAvailable(!existingProfile)
      } catch (error) {
        console.error('檢查使用者名稱失敗:', error)
        setUsernameAvailable(null)
      } finally {
        setUsernameChecking(false)
      }
    },
    [getUserProfileByUsername]
  )

  // 防抖處理 username 檢查
  useEffect(() => {
    if (!watchedUsername) {
      setUsernameAvailable(null)
      return
    }

    const timeoutId = setTimeout(() => {
      checkUsernameAvailability(watchedUsername)
    }, 500) // 500ms 防抖

    return () => clearTimeout(timeoutId)
  }, [watchedUsername, checkUsernameAvailability])

  /**
   * [Function] 手動驗證函數
   * @param data 表單資料
   * @returns 是否驗證成功
   */
  const validateForm = (data: FormData): boolean => {
    let isValid = true

    // 驗證帳號名稱
    if (!data.username) {
      setFieldError('username', { message: '請輸入帳號名稱' })
      isValid = false
    } else if (!/^[a-zA-Z0-9_.-]+$/.test(data.username)) {
      setFieldError('username', {
        message: '帳號名稱只能包含英文字母、數字、底線、點和連字號',
      })
      isValid = false
    } else if (data.username.length < 3 || data.username.length > 20) {
      setFieldError('username', { message: '帳號名稱需要 3-20 個字元' })
      isValid = false
    } else if (usernameAvailable === false) {
      setFieldError('username', { message: '此帳號名稱已被使用' })
      isValid = false
    } else if (usernameChecking) {
      setFieldError('username', { message: '正在檢查帳號名稱...' })
      isValid = false
    }

    // 驗證暱稱
    if (!data.displayName) {
      setFieldError('displayName', { message: '請輸入暱稱' })
      isValid = false
    } else if (data.displayName.length > 15) {
      setFieldError('displayName', { message: '暱稱不能超過 15 個字元' })
      isValid = false
    }

    // 如果不是 Google 註冊，驗證電子郵件和密碼
    if (!isGoogleRegister) {
      if (!data.email) {
        setFieldError('email', { message: '請輸入電子郵件' })
        isValid = false
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        setFieldError('email', { message: '請輸入有效的電子郵件格式' })
        isValid = false
      }

      if (!data.password) {
        setFieldError('password', { message: '請輸入密碼' })
        isValid = false
      } else if (data.password.length < 6) {
        setFieldError('password', { message: '密碼至少需要 6 個字元' })
        isValid = false
      }

      if (!data.confirmPassword) {
        setFieldError('confirmPassword', { message: '請確認密碼' })
        isValid = false
      } else if (data.password !== data.confirmPassword) {
        setFieldError('confirmPassword', { message: '密碼確認不一致' })
        isValid = false
      }
    }

    return isValid
  }

  /**
   * [Function] Google 註冊處理（改進版本）
   * @returns void
   */
  const handleGoogleRegister = async () => {
    try {
      setIsLoading(true)
      setError('')

      // 執行 Google 註冊
      const result = await signInWithPopup(auth, googleProvider)
      const user = result.user

      // 檢查是否已經是註冊使用者（避免重複註冊）
      const existingProfile = await getUserProfile(user.uid)
      if (existingProfile) {
        setError('此 Google 帳號已經註冊過，請直接登入')
        // 自動登出以避免狀態混亂
        await auth.signOut()
        return
      }

      // 設定 Google 使用者資料
      setIsGoogleRegister(true)
      // 重置表單並預填 Google 資料
      reset()

      // 設定頭像
      if (user.photoURL) {
        setPreviewImage(user.photoURL)
        setValue('photoURL', user.photoURL)
      } else {
        setPreviewImage('/assets/image/userEmptyAvatar.png')
        setValue('photoURL', '/assets/image/userEmptyAvatar.png')
      }

      // 設定暱稱
      if (user.displayName) {
        setValue('displayName', user.displayName)
      }

      // 生成建議的使用者名稱（允許點號）
      const suggestedUsername = user.email
        ? user.email.split('@')[0].replace(/[^a-zA-Z0-9_.-]/g, '_')
        : `user_${user.uid.slice(0, 8)}`
      setValue('username', suggestedUsername)
    } catch (error) {
      console.error('Google 註冊失敗:', error)

      // 更詳細的錯誤處理
      const firebaseError = error as { code?: string }
      if (firebaseError?.code === 'auth/popup-closed-by-user') {
        setError('Google 登入視窗被關閉，請重試')
      } else if (firebaseError?.code === 'auth/popup-blocked') {
        setError('瀏覽器阻擋了彈出視窗，請允許彈出視窗後重試')
      } else if (firebaseError?.code === 'auth/cancelled-popup-request') {
        setError('Google 登入被取消，請重試')
      } else {
        setError('Google 註冊失敗，請稍後再試')
      }
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * [Function] 頭像上傳處理
   * @param event 事件
   * @returns void
   */
  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    // 取得檔案
    const file = event.target.files?.[0]
    // 檢查檔案
    if (file) {
      // 檢查檔案大小（限制 5MB）
      if (file.size > 5 * 1024 * 1024) {
        setError('頭像檔案大小不能超過 5MB')
        return
      }
      // 檢查檔案類型
      if (!file.type.startsWith('image/')) {
        setError('請選擇圖片檔案')
        return
      }
      // 建立 FileReader
      const reader = new FileReader()
      // 讀取檔案
      reader.onload = (e) => {
        const result = e.target?.result as string
        setPreviewImage(result)
        setValue('photoURL', result)
      }
      // 讀取檔案
      reader.readAsDataURL(file)
    }
  }

  /**
   * [Function] 表單提交處理
   * @param data 表單資料
   * @returns void
   */
  const onSubmit = async (data: FormData) => {
    try {
      // 手動驗證
      if (!validateForm(data)) {
        return
      }
      // 設定註冊狀態
      setIsLoading(true)
      setError('')
      // 建立註冊資料
      const registerData: RegisterFormData = {
        username: data.username,
        displayName: data.displayName,
        photoURL: data.photoURL || '/assets/image/userEmptyAvatar.png',
      }
      // 如果不是 Google 註冊，設定電子郵件和密碼
      if (!isGoogleRegister) {
        registerData.email = data.email
        registerData.password = data.password
      }
      // 執行註冊
      await registerUser(registerData)
      // 註冊成功後，重置 Google 註冊狀態
      setIsGoogleRegister(false)
      onClose()
    } catch (error) {
      console.error('註冊失敗:', error)
      setError(
        getErrorMessage((error as { message?: string })?.message || '未知錯誤')
      )
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * [Function] 錯誤訊息轉換
   * @param errorMessage 錯誤訊息
   * @returns 錯誤訊息
   */
  const getErrorMessage = (errorMessage: string): string => {
    if (errorMessage.includes('使用者名稱已存在')) {
      return '此帳號名稱已被使用，請選擇其他名稱'
    }
    if (errorMessage.includes('建立使用者資料失敗')) {
      return '註冊失敗，資料建立時發生錯誤，請稍後再試'
    }
    switch (errorMessage) {
      case 'auth/email-already-in-use':
        return '此電子郵件已被註冊'
      case 'auth/invalid-email':
        return '電子郵件格式無效'
      case 'auth/weak-password':
        return '密碼強度不足'
      default:
        return errorMessage || '註冊失敗，請稍後再試'
    }
  }

  return (
    <>
      {/* 表單標題 */}
      <div className={styles.form_header}>
        <h2>註冊</h2>
        <button
          className={styles.close_button}
          onClick={async () => {
            // 如果是 Google 註冊且未完成，關閉時登出
            if (isGoogleRegister) {
              await signOut()
            }
            onClose()
          }}
        >
          <FontAwesomeIcon icon={faXmark} />
        </button>
      </div>

      {/* Google 註冊按鈕 */}
      {!isGoogleRegister && (
        <div className={styles.register_options}>
          <GoogleLoginButton
            onClick={handleGoogleRegister}
            mode="register"
            disabled={isLoading}
          />

          <div className={styles.divider}>
            <span className={styles.divider_line}></span>
            <span className={styles.divider_text}>或</span>
          </div>
        </div>
      )}

      {/* 表單 */}
      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        {/* 頭像上傳 */}
        <div className={styles.avatar_section}>
          <label>大頭貼</label>
          <div className={styles.avatar_upload}>
            <button
              type="button"
              className={styles.upload_button}
              onClick={() => fileInputRef.current?.click()}
            >
              +
            </button>
            <div className={styles.avatar_preview}>
              <Image
                src={previewImage || '/assets/image/userEmptyAvatar.png'}
                alt="頭像預覽"
                className={styles.avatar_image}
                width={80}
                height={80}
              />
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className={styles.file_input}
            />
          </div>
        </div>

        {/* 電子郵件註冊欄位 */}
        {!isGoogleRegister && (
          <>
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
                <span className={styles.field_error}>
                  {errors.email.message}
                </span>
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
                placeholder="請輸入密碼（至少 6 個字元）"
              />
              {errors.password && (
                <span className={styles.field_error}>
                  {errors.password.message}
                </span>
              )}
            </div>

            {/* 確認密碼 */}
            <div className={styles.form_group}>
              <label htmlFor="confirmPassword">確認密碼</label>
              <input
                id="confirmPassword"
                type="password"
                {...register('confirmPassword')}
                className={errors.confirmPassword ? styles.error : ''}
                placeholder="請再次輸入密碼"
              />
              {errors.confirmPassword && (
                <span className={styles.field_error}>
                  {errors.confirmPassword.message}
                </span>
              )}
            </div>
          </>
        )}

        {/* 共用欄位 */}
        {/* 帳號名稱 */}
        <div className={styles.form_group}>
          <label htmlFor="username">帳號名稱</label>
          <input
            id="username"
            type="text"
            {...register('username')}
            className={errors.username ? styles.error : ''}
            placeholder="英文字母、數字、_、.、- (3-20字元)"
          />
          {usernameChecking && (
            <span className={styles.field_info}>正在檢查...</span>
          )}
          {!usernameChecking && usernameAvailable === true && (
            <span className={styles.field_success}>✓ 此帳號名稱可用</span>
          )}
          {!usernameChecking && usernameAvailable === false && (
            <span className={styles.field_error}>此帳號名稱已被使用</span>
          )}
          {errors.username && (
            <span className={styles.field_error}>
              {errors.username.message}
            </span>
          )}
        </div>

        {/* 暱稱 */}
        <div className={styles.form_group}>
          <label htmlFor="displayName">暱稱</label>
          <input
            id="displayName"
            type="text"
            {...register('displayName')}
            className={errors.displayName ? styles.error : ''}
            placeholder="公開顯示的名稱（15字元以內）"
          />
          {errors.displayName && (
            <span className={styles.field_error}>
              {errors.displayName.message}
            </span>
          )}
        </div>

        {/* 註冊按鈕 */}
        <button
          type="submit"
          className={styles.submit_button}
          disabled={isLoading}
        >
          {isLoading ? '註冊中...' : '完成註冊'}
        </button>

        {/* 錯誤訊息 */}
        {error && <div className={styles.error_message}>{error}</div>}
      </form>

      {/* 切換到登入模式 */}
      <div className={styles.switch_form}>
        <span>已經有帳號了？</span>
        <button type="button" onClick={onSwitchToLogin}>
          立即登入
        </button>
      </div>
    </>
  )
}
