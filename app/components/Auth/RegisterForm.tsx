'use client'

import React, { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import styles from './RegisterForm.module.scss'

// third-party utils
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'

// components
import GoogleLoginButton from '../GoogleLoginButton/GoogleLoginButton'

// contexts
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'

// utils
import { uploadUserAvatarToFirebaseStorage } from '../../utils/firebaseService'

// types
import {
  ClubIdentity,
  RegisterFormData,
  SchoolIdentity,
} from '../../types/user'

// icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faXmark,
  faChevronLeft,
  faChevronRight,
  faCheck,
  faCircle,
} from '@fortawesome/free-solid-svg-icons'

interface RegisterFormProps {
  onSwitchToLogin: (email?: string) => void // 切換到登入模式
  onClose?: () => void // 關閉模組
  showCloseButton?: boolean // 是否顯示關閉按鈕
  next?: string // 登入後跳轉的路徑
}

interface FormData {
  email: string // 電子郵件
  password: string // 密碼
  confirmPassword: string // 確認密碼
  username?: string // 帳號名稱
  displayName?: string // 顯示名稱
  schoolIdentity: SchoolIdentity // 校園身分
  clubIdentity: ClubIdentity // 社團身分
  studentId?: string // 學號
}

const schoolIdentityOptions: Array<{
  value: SchoolIdentity
  label: string
}> = [
  { value: 'current_student', label: '本校學生' },
  { value: 'teacher', label: '本校老師' },
  { value: 'external', label: '非本校人士' },
  { value: 'alumni', label: '畢業生' },
]

const clubIdentityOptions: Array<{
  value: ClubIdentity
  label: string
}> = [
  { value: 'member', label: '我是社團成員' },
  { value: 'non_member', label: '我不是社團成員' },
]

/**
 * [Schema] 註冊表單驗證規則
 */
const registerSchema: yup.ObjectSchema<FormData> = yup.object({
  email: yup
    .string()
    .required('請輸入電子郵件')
    .email('請輸入有效的電子郵件格式'),
  password: yup
    .string()
    .required('請輸入密碼')
    .min(8, '密碼至少需要 8 個字元')
    .matches(/[a-z]/, '密碼必須包含小寫英文字母')
    .matches(/[A-Z]/, '密碼必須包含大寫英文字母')
    .matches(/[0-9]/, '密碼必須包含數字')
    .matches(
      /[!@#$%^&*(),.?":{}|<>_\-+=[\]\\/'`;~]/,
      '密碼必須包含至少一個特殊字元',
    ),
  confirmPassword: yup
    .string()
    .required('請再次輸入密碼')
    .oneOf([yup.ref('password')], '密碼不一致'),
  username: yup
    .string()
    .optional()
    .matches(/^[a-z0-9_]*$/, '僅能使用英文小寫、數字和底線')
    .min(3, '至少 3 個字元')
    .max(20, '最多 20 個字元'),
  displayName: yup.string().optional().max(20, '最多 20 個字元'),
  schoolIdentity: yup
    .mixed<SchoolIdentity>()
    .oneOf(
      schoolIdentityOptions.map((option) => option.value),
      '請選擇您的校園身分',
    )
    .required('請選擇您的校園身分'),
  clubIdentity: yup
    .mixed<ClubIdentity>()
    .oneOf(
      clubIdentityOptions.map((option) => option.value),
      '請選擇是否為社團成員',
    )
    .required('請選擇是否為社團成員'),
  studentId: yup
    .string()
    .trim()
    .max(20, '學號最多 20 個字元')
    .matches(/^[A-Za-z0-9_-]*$/, '學號僅能使用英文字母、數字、底線與連字號')
    .when('schoolIdentity', {
      is: 'current_student',
      then: (schema) => schema.required('若您是本校學生，請輸入學號'),
      otherwise: (schema) => schema.optional(),
    }),
})

/**
 * [Component] 註冊表單
 * @param onSwitchToLogin 切換到登入模式
 * @param onClose 關閉模組
 * @param showCloseButton 是否顯示關閉按鈕
 * @returns
 */
export const RegisterForm: React.FC<RegisterFormProps> = ({
  onSwitchToLogin,
  onClose,
  showCloseButton = true,
  next,
}) => {
  // AuthContext
  const {
    register: registerUser,
    signInWithGoogle,
    checkEmailExists,
  } = useAuth()
  // ToastContext
  const { showToast } = useToast()
  // 註冊步數: 1. Email, 2. Password, 3. Profile, 4. Identity
  const [step, setStep] = useState(1)
  // 註冊狀態
  const [isLoading, setIsLoading] = useState(false)
  // 錯誤訊息
  const [error, setError] = useState<string>('')
  // 信箱驗證等待狀態
  const [emailSent, setEmailSent] = useState(false)
  // 頭像預覽
  const [previewImage, setPreviewImage] = useState<string>(
    '/assets/image/userEmptyAvatar.svg',
  )
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  // 頭像上傳 ref
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 表單狀態
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    trigger,
    clearErrors,
    setValue,
  } = useForm<FormData>({
    resolver: yupResolver(registerSchema),
    mode: 'onBlur', // 預設失焦時驗證
    reValidateMode: 'onChange',
  })

  // 監聽表單變化
  const watchPassword = watch('password') ?? ''
  const watchEmail = watch('email') ?? ''
  const watchUsername = watch('username') ?? ''
  const watchDisplayName = watch('displayName') ?? ''
  const watchSchoolIdentity = watch('schoolIdentity')
  const watchClubIdentity = watch('clubIdentity')
  const watchStudentId = watch('studentId') ?? ''
  const isCurrentStudent = watchSchoolIdentity === 'current_student'

  // 密碼規則驗證（用於 UI 顯示）
  const passwordRules = {
    length: watchPassword.length >= 8,
    hasLowercase: /[a-z]/.test(watchPassword),
    hasUppercase: /[A-Z]/.test(watchPassword),
    hasNumber: /[0-9]/.test(watchPassword),
    hasSpecial: /[!@#$%^&*(),.?":{}|<>_\-+=[\]\\/'`;~]/.test(watchPassword),
  }

  // Password 即時驗證（用於即時顯示規則達成狀態）
  useEffect(() => {
    // 如果密碼存在，則觸發驗證
    if (watchPassword) {
      // 觸發驗證
      trigger('password')
    }
  }, [watchPassword, trigger])

  // ConfirmPassword 即時驗證
  useEffect(() => {
    // 如果確認密碼存在，則觸發驗證
    if (watch('confirmPassword')) {
      // 觸發驗證
      trigger('confirmPassword')
    }
  }, [watch('confirmPassword'), watchPassword, trigger])

  // Debounce 驗證 email（輸入停止 1 秒後才驗證）
  useEffect(() => {
    // 如果電子郵件不存在，則清除錯誤
    if (!watchEmail) {
      clearErrors('email')
      return
    }
    // 設定延遲驗證
    const timer = setTimeout(() => {
      trigger('email')
    }, 1500)
    return () => clearTimeout(timer)
  }, [watchEmail, trigger, clearErrors])

  // Debounce 驗證 username（輸入停止 1 秒後才驗證）
  useEffect(() => {
    // 如果帳號名稱不存在，則清除錯誤
    if (!watchUsername) {
      clearErrors('username')
      return
    }
    // 設定延遲驗證
    const timer = setTimeout(() => {
      trigger('username')
    }, 1500)
    return () => clearTimeout(timer)
  }, [watchUsername, trigger, clearErrors])

  // Debounce 驗證 displayName（輸入停止 1 秒後才驗證）
  useEffect(() => {
    // 如果顯示名稱不存在，則清除錯誤
    if (!watchDisplayName) {
      clearErrors('displayName')
      return
    }
    // 設定延遲驗證
    const timer = setTimeout(() => {
      trigger('displayName')
    }, 1500)
    return () => clearTimeout(timer)
  }, [watchDisplayName, trigger, clearErrors])

  useEffect(() => {
    if (watchSchoolIdentity !== 'current_student') {
      clearErrors('studentId')
      setValue('studentId', '')
    }
  }, [watchSchoolIdentity, clearErrors, setValue])

  /**
   * [Function] 檢查目前步驟是否可以進入下一步
   * @returns void
   */
  const handleNextStep = async () => {
    // 設定需要驗證的欄位
    let fieldsToValidate: (keyof FormData)[] = []
    if (step === 1) fieldsToValidate = ['email']
    if (step === 2) fieldsToValidate = ['password', 'confirmPassword']
    if (step === 3) fieldsToValidate = ['username', 'displayName']

    // 觸發驗證
    const result = await trigger(fieldsToValidate)
    // 如果驗證結果為 true，則進入下一步
    if (result) {
      // 如果是第一步，檢查 Email 是否已註冊
      if (step === 1) {
        // 設定為載入中
        setIsLoading(true)
        // 嘗試檢查 Email 是否已註冊
        try {
          // 嘗試檢查 Email 是否已註冊
          const emailExists = await checkEmailExists(watchEmail)
          // 如果 Email 已註冊，則跳轉至登入頁面
          if (emailExists) {
            showToast('偵測到此電子郵件已註冊，已為您跳轉至登入頁面。', 'info')
            onSwitchToLogin(watchEmail)
            return
          }
        } catch (err) {
          console.error('檢查 Email 時發生錯誤:', err)
        } finally {
          setIsLoading(false)
        }
      }

      // 進入下一步
      setStep(step + 1)
      // 清空錯誤訊息
      setError('')
    }
  }

  /**
   * [Function] 前一步驟處理
   * @returns void
   */
  const handlePrevStep = () => {
    // 前一步驟
    setStep(step - 1)
    setError('')
  }

  /**
   * [Function] 頭像上傳處理
   * @param event 事件
   * @returns void
   */
  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    // 獲取檔案
    const file = event.target.files?.[0]
    // 如果檔案存在，則處理檔案
    if (file) {
      // 如果檔案大小超過 5MB，則設定錯誤訊息
      if (file.size > 5 * 1024 * 1024) {
        setError('頭像檔案大小不能超過 5MB')
        return
      }
      // 如果檔案類型不是圖片，則設定錯誤訊息
      if (!file.type.startsWith('image/')) {
        setError('請選擇圖片檔案')
        return
      }
      // 創建 FileReader 實例
      const reader = new FileReader()
      // 設定 FileReader 的 onload 事件
      reader.onload = (e) => {
        // 獲取結果
        const result = e.target?.result as string
        // 設定頭像預覽
        setPreviewImage(result)
        // 設定頭像檔案
        setAvatarFile(file)
      }
      // 讀取檔案
      reader.readAsDataURL(file)
    }
  }

  /**
   * [Function] 表單提交處理
   * @param {FormData} data 表單資料
   * @returns void
   */
  const onSubmit = async (data: FormData) => {
    // 嘗試註冊
    try {
      // 設定為載入中
      setIsLoading(true)
      // 清空錯誤訊息
      setError('')

      // 設定頭像 URL
      let avatarURL = '/assets/image/userEmptyAvatar.png'
      // 如果頭像檔案存在，則上傳頭像
      if (avatarFile) {
        // 上傳頭像
        avatarURL = await uploadUserAvatarToFirebaseStorage(
          avatarFile,
          data.email,
        )
      }

      // 設定註冊資料
      const registerData: RegisterFormData = {
        email: data.email!,
        password: data.password!,
        username: data.username?.trim(),
        displayName: data.displayName?.trim(),
        photoURL: avatarURL,
        schoolIdentity: data.schoolIdentity,
        clubIdentity: data.clubIdentity,
        studentId: data.studentId?.trim(),
      }

      // 註冊使用者
      const { requiresEmailConfirmation } = await registerUser(registerData)
      // 如果需要信箱驗證，則顯示提示訊息等待使用者確認
      if (requiresEmailConfirmation) {
        setEmailSent(true)
        showToast('驗證信已寄出，請前往信箱完成驗證！', 'success')
      } else {
        showToast('註冊成功，歡迎加入！', 'success')
        onClose?.()
      }
    } catch (error) {
      console.error('註冊失敗:', error)
      setError(
        getErrorMessage((error as { message?: string })?.message || '未知錯誤'),
      )
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * [Function] 錯誤訊息轉換
   * @param {string} errorMessage 錯誤訊息
   * @returns {string} 錯誤訊息
   */
  const getErrorMessage = (errorMessage: string): string => {
    if (errorMessage.includes('使用者名稱已存在')) return '此帳號名稱已被使用'
    if (errorMessage.includes('User already registered'))
      return '此電子郵件已被註冊'
    if (errorMessage.includes('student_id') || errorMessage.includes('學號'))
      return '此學號已被綁定，請確認輸入是否正確，或改用既有帳號登入'
    if (errorMessage.toLowerCase().includes('password'))
      return '密碼不符合安全性要求'
    return `註冊失敗: ${errorMessage}`
  }

  /**
   * [Function] Google 登入處理
   * @returns void
   */
  const handleGoogleSignIn = async () => {
    // 嘗試 Google 登入
    try {
      setIsLoading(true)
      setError('')
      // 觸發 Google 登入
      await signInWithGoogle(next)
      // 設定為註冊成功
      showToast('Google 登入成功，歡迎加入！', 'success')
      onClose?.()
    } catch (err: unknown) {
      setError(
        getErrorMessage((err as { message?: string })?.message || '未知錯誤'),
      )
    } finally {
      setIsLoading(false)
    }
  }

  // 如果需要信箱驗證，則顯示提示訊息等待使用者確認
  if (emailSent) {
    return (
      <div className={styles.email_sent}>
        <div className={styles.form_header}>
          <h2>請驗證您的信箱</h2>
          {showCloseButton && (
            <button className={styles.close_button} onClick={onClose}>
              <FontAwesomeIcon icon={faXmark} />
            </button>
          )}
        </div>
        <p className={styles.email_sent_text}>
          驗證信已寄送至您的信箱，請點擊信中的連結完成帳號驗證後即可登入。
        </p>
        <Link href="/login" className={styles.submit_button}>
          前往登入
        </Link>
      </div>
    )
  }

  return (
    <>
      {step > 1 && (
        <button
          className={styles.back_button}
          onClick={handlePrevStep}
          disabled={isLoading}
        >
          <FontAwesomeIcon icon={faChevronLeft} />
        </button>
      )}

      {/* 步驟指示器 */}
      <div className={styles.stepper}>
        {[1, 2, 3, 4].map((s) => (
          <div
            key={s}
            className={`${styles.step_item} ${step >= s ? styles.active : ''}`}
          >
            {s > 1 && <div className={styles.step_line} />}
            <span className={styles.step_dot}>
              {step > s ? <FontAwesomeIcon icon={faCheck} /> : s}
            </span>
            {/* <span className={styles.step_text}>
              {s === 1 && step === 1
                ? '選擇註冊方式'
                : s === 2 && step === 2
                  ? '密碼設定'
                  : s === 3 && step === 3
                    ? '完成個人資料'
                    : ''}
            </span> */}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        {/* Step 1: Email */}
        {step === 1 && (
          <div className={styles.step_content}>
            <div className={styles.register_options}>
              <GoogleLoginButton
                onClick={handleGoogleSignIn}
                mode="register"
                disabled={isLoading}
              />
              <div className={styles.divider}>
                <span className={styles.divider_line}></span>
                <span className={styles.divider_text}>或使用 Email 註冊</span>
              </div>
            </div>

            <div className={styles.form_group}>
              <label htmlFor="email">
                電子郵件 <span className={styles.required}>*</span>
              </label>
              <input
                id="email"
                type="email"
                autoFocus
                {...register('email')}
                className={errors.email ? styles.error : ''}
                placeholder="email@example.com"
              />
              {errors.email && (
                <span className={styles.field_error}>
                  {errors.email.message}
                </span>
              )}
            </div>

            <button
              type="button"
              className={styles.next_button}
              onClick={handleNextStep}
              disabled={!watchEmail || !!errors.email}
            >
              下一步 <FontAwesomeIcon icon={faChevronRight} />
            </button>

            <p className={styles.switch_text}>
              已經有帳號了？{' '}
              <button type="button" onClick={() => onSwitchToLogin()}>
                立即登入
              </button>
            </p>
          </div>
        )}

        {/* Step 2: Password */}
        {step === 2 && (
          <div className={styles.step_content}>
            <div className={styles.form_group}>
              <label htmlFor="password">
                設定密碼 <span className={styles.required}>*</span>
              </label>
              <input
                id="password"
                type="password"
                autoFocus
                {...register('password')}
                className={errors.password ? styles.error : ''}
                placeholder="請輸入密碼"
              />

              <div className={styles.password_rules}>
                <div
                  className={`${styles.rule_item} ${passwordRules.length ? styles.valid : ''}`}
                >
                  <FontAwesomeIcon
                    icon={passwordRules.length ? faCheck : faCircle}
                    className={styles.rule_icon}
                  />
                  至少 8 個字元
                </div>
                <div
                  className={`${styles.rule_item} ${passwordRules.hasLowercase ? styles.valid : ''}`}
                >
                  <FontAwesomeIcon
                    icon={passwordRules.hasLowercase ? faCheck : faCircle}
                    className={styles.rule_icon}
                  />
                  包含小寫英文字母
                </div>
                <div
                  className={`${styles.rule_item} ${passwordRules.hasUppercase ? styles.valid : ''}`}
                >
                  <FontAwesomeIcon
                    icon={passwordRules.hasUppercase ? faCheck : faCircle}
                    className={styles.rule_icon}
                  />
                  包含大寫英文字母
                </div>
                <div
                  className={`${styles.rule_item} ${passwordRules.hasNumber ? styles.valid : ''}`}
                >
                  <FontAwesomeIcon
                    icon={passwordRules.hasNumber ? faCheck : faCircle}
                    className={styles.rule_icon}
                  />
                  包含數字
                </div>
                <div
                  className={`${styles.rule_item} ${passwordRules.hasSpecial ? styles.valid : ''}`}
                >
                  <FontAwesomeIcon
                    icon={passwordRules.hasSpecial ? faCheck : faCircle}
                    className={styles.rule_icon}
                  />
                  包含特殊字元
                </div>
              </div>
              {errors.password && (
                <span className={styles.field_error}>
                  {errors.password.message}
                </span>
              )}
            </div>

            <div className={styles.form_group}>
              <label htmlFor="confirmPassword">
                確認密碼 <span className={styles.required}>*</span>
              </label>
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

            <button
              type="button"
              className={styles.next_button}
              onClick={handleNextStep}
              disabled={
                !!errors.password || !!errors.confirmPassword || !watchPassword
              }
            >
              下一步 <FontAwesomeIcon icon={faChevronRight} />
            </button>
          </div>
        )}

        {/* Step 3: Profile */}
        {step === 3 && (
          <div className={styles.step_content}>
            <div className={styles.avatar_section}>
              <label>上傳大頭貼</label>
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

            <div className={styles.form_group}>
              <label htmlFor="username">帳號名稱</label>
              <input
                id="username"
                type="text"
                {...register('username')}
                className={errors.username ? styles.error : ''}
                placeholder="例如: robot_lover"
              />
              <p className={styles.hint}>
                僅能使用英文小寫、數字和底線，將作為個人首頁網址的一部分
              </p>
              {errors.username && (
                <span className={styles.field_error}>
                  {errors.username.message}
                </span>
              )}
            </div>

            <div className={styles.form_group}>
              <label htmlFor="displayName">顯示名稱</label>
              <input
                id="displayName"
                type="text"
                {...register('displayName')}
                className={errors.displayName ? styles.error : ''}
                placeholder="你想讓大家怎麼稱呼你？"
              />
              <p className={styles.hint}>最多 20 個字元</p>
              {errors.displayName && (
                <span className={styles.field_error}>
                  {errors.displayName.message}
                </span>
              )}
            </div>

            <button
              type="button"
              className={styles.next_button}
              onClick={handleNextStep}
              disabled={isLoading}
            >
              下一步 <FontAwesomeIcon icon={faChevronRight} />
            </button>
          </div>
        )}

        {/* Step 4: Identity */}
        {step === 4 && (
          <div className={styles.step_content}>
            <p className={styles.section_hint}>
              這些資訊會用於辨識社員身分與後續課程權限設定。
            </p>

            <div className={styles.form_group}>
              <label htmlFor="schoolIdentity">
                您目前的校園身分 <span className={styles.required}>*</span>
              </label>
              <select
                id="schoolIdentity"
                autoFocus
                {...register('schoolIdentity')}
                className={errors.schoolIdentity ? styles.error : ''}
                defaultValue=""
              >
                <option value="" disabled>
                  請選擇您的校園身分
                </option>
                {schoolIdentityOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.schoolIdentity && (
                <span className={styles.field_error}>
                  {errors.schoolIdentity.message}
                </span>
              )}
            </div>

            <div className={styles.form_group}>
              <label htmlFor="clubIdentity">
                您是否為社團成員 <span className={styles.required}>*</span>
              </label>
              <select
                id="clubIdentity"
                {...register('clubIdentity')}
                className={errors.clubIdentity ? styles.error : ''}
                defaultValue=""
              >
                <option value="" disabled>
                  請選擇社團身分
                </option>
                {clubIdentityOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.clubIdentity && (
                <span className={styles.field_error}>
                  {errors.clubIdentity.message}
                </span>
              )}
            </div>

            {isCurrentStudent && (
              <div className={styles.form_group}>
                <label htmlFor="studentId">
                  學號 <span className={styles.required}>*</span>
                </label>
                <input
                  id="studentId"
                  type="text"
                  {...register('studentId')}
                  className={errors.studentId ? styles.error : ''}
                  placeholder="請輸入學號"
                />
                <p className={styles.hint}>
                  本校學生需提供學號以便核對社員名單
                </p>
                {errors.studentId && (
                  <span className={styles.field_error}>
                    {errors.studentId.message}
                  </span>
                )}
              </div>
            )}

            <button
              type="submit"
              className={styles.submit_button}
              disabled={
                isLoading ||
                !watchSchoolIdentity ||
                !watchClubIdentity ||
                !!errors.schoolIdentity ||
                !!errors.clubIdentity ||
                !!errors.studentId ||
                (isCurrentStudent && !watchStudentId.trim())
              }
            >
              {isLoading ? '處理中...' : '開始探索'}
            </button>
          </div>
        )}

        {error && <div className={styles.error_message}>{error}</div>}
      </form>
    </>
  )
}
