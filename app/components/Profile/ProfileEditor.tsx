'use client'

import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useAuth } from '../../contexts/AuthContext'
import { updateUserProfileSafe } from '../../utils/userManagementService'
import { UpdateUserProfileData } from '../../types/user'
import styles from './ProfileEditor.module.scss'

interface ProfileEditorProps {
  onClose?: () => void
  onSave?: () => void
}

/**
 * [Component] 個人資料編輯器
 * 讓使用者編輯自己的個人資料
 */
export const ProfileEditor: React.FC<ProfileEditorProps> = ({
  onClose,
  onSave,
}) => {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [success, setSuccess] = useState<string>('')

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<UpdateUserProfileData>()

  // 監聽表單變化以提供即時預覽
  const watchedValues = watch()

  // 初始化表單資料
  useEffect(() => {
    if (user) {
      setValue('displayName', user.displayName)
      setValue('bio', user.bio || '')
      setValue('location', user.location || '')
      setValue('website', user.website || '')
      setValue('socialLinks', user.socialLinks || {})
      setValue(
        'privacy',
        user.privacy || {
          profileVisibility: 'public',
          showEmail: false,
          showStats: true,
        }
      )
    }
  }, [user, setValue])

  //* 提交表單
  const onSubmit = async (data: UpdateUserProfileData) => {
    if (!user) return

    try {
      setIsLoading(true)
      setError('')
      setSuccess('')

      // 使用安全的更新函數
      await updateUserProfileSafe(user.uid, data, user.uid)

      setSuccess('個人資料更新成功！')

      if (onSave) {
        onSave()
      }
    } catch (error) {
      console.error('更新個人資料失敗:', error)
      setError((error as Error).message || '更新失敗，請稍後再試')
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) {
    return (
      <div className={styles.no_user}>
        <p>請先登入以編輯個人資料</p>
      </div>
    )
  }

  return (
    <div className={styles.profile_editor}>
      <div className={styles.header}>
        <h2>編輯個人資料</h2>
        {onClose && (
          <button onClick={onClose} className={styles.close_button}>
            ✕
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        {/* 基本資訊 */}
        <div className={styles.section}>
          <h3>基本資訊</h3>

          <div className={styles.form_group}>
            <label htmlFor="displayName">暱稱</label>
            <input
              id="displayName"
              type="text"
              {...register('displayName', {
                required: '請輸入暱稱',
                maxLength: {
                  value: 15,
                  message: '暱稱不能超過 15 個字元',
                },
              })}
              className={errors.displayName ? styles.error : ''}
              placeholder="您的公開顯示名稱"
            />
            {errors.displayName && (
              <span className={styles.field_error}>
                {errors.displayName.message}
              </span>
            )}
          </div>

          <div className={styles.form_group}>
            <label htmlFor="bio">個人簡介</label>
            <textarea
              id="bio"
              {...register('bio', {
                maxLength: {
                  value: 500,
                  message: '個人簡介不能超過 500 個字元',
                },
              })}
              className={errors.bio ? styles.error : ''}
              placeholder="簡單介紹一下自己..."
              rows={4}
            />
            {errors.bio && (
              <span className={styles.field_error}>{errors.bio.message}</span>
            )}
            <div className={styles.char_count}>
              {(watchedValues.bio || '').length} / 500
            </div>
          </div>

          <div className={styles.form_group}>
            <label htmlFor="location">所在地</label>
            <input
              id="location"
              type="text"
              {...register('location', {
                maxLength: {
                  value: 100,
                  message: '所在地不能超過 100 個字元',
                },
              })}
              className={errors.location ? styles.error : ''}
              placeholder="例如：台北市, 台灣"
            />
            {errors.location && (
              <span className={styles.field_error}>
                {errors.location.message}
              </span>
            )}
          </div>

          <div className={styles.form_group}>
            <label htmlFor="website">個人網站</label>
            <input
              id="website"
              type="url"
              {...register('website', {
                pattern: {
                  value: /^https?:\/\/.+/,
                  message: '請輸入有效的網站 URL（需包含 http:// 或 https://）',
                },
              })}
              className={errors.website ? styles.error : ''}
              placeholder="https://your-website.com"
            />
            {errors.website && (
              <span className={styles.field_error}>
                {errors.website.message}
              </span>
            )}
          </div>
        </div>

        {/* 社群連結 */}
        <div className={styles.section}>
          <h3>社群連結</h3>

          <div className={styles.social_links}>
            <div className={styles.form_group}>
              <label htmlFor="github">GitHub</label>
              <input
                id="github"
                type="text"
                {...register('socialLinks.github')}
                placeholder="您的 GitHub 使用者名稱"
              />
            </div>

            <div className={styles.form_group}>
              <label htmlFor="linkedin">LinkedIn</label>
              <input
                id="linkedin"
                type="text"
                {...register('socialLinks.linkedin')}
                placeholder="您的 LinkedIn 個人檔案 URL"
              />
            </div>

            <div className={styles.form_group}>
              <label htmlFor="twitter">Twitter</label>
              <input
                id="twitter"
                type="text"
                {...register('socialLinks.twitter')}
                placeholder="您的 Twitter 使用者名稱"
              />
            </div>

            <div className={styles.form_group}>
              <label htmlFor="instagram">Instagram</label>
              <input
                id="instagram"
                type="text"
                {...register('socialLinks.instagram')}
                placeholder="您的 Instagram 使用者名稱"
              />
            </div>
          </div>
        </div>

        {/* 隱私設定 */}
        <div className={styles.section}>
          <h3>隱私設定</h3>

          <div className={styles.privacy_settings}>
            <div className={styles.form_group}>
              <label htmlFor="profileVisibility">個人檔案可見性</label>
              <select
                id="profileVisibility"
                {...register('privacy.profileVisibility')}
                className={styles.select}
              >
                <option value="public">公開</option>
                <option value="private">私人</option>
                <option value="friends">僅朋友</option>
              </select>
            </div>

            <div className={styles.checkbox_group}>
              <label className={styles.checkbox_label}>
                <input type="checkbox" {...register('privacy.showEmail')} />
                <span className={styles.checkmark}></span>
                顯示電子郵件地址
              </label>
            </div>

            <div className={styles.checkbox_group}>
              <label className={styles.checkbox_label}>
                <input type="checkbox" {...register('privacy.showStats')} />
                <span className={styles.checkmark}></span>
                顯示統計資料（發文數、追蹤者等）
              </label>
            </div>
          </div>
        </div>

        {/* 錯誤和成功訊息 */}
        {error && <div className={styles.error_message}>{error}</div>}
        {success && <div className={styles.success_message}>{success}</div>}

        {/* 提交按鈕 */}
        <div className={styles.form_actions}>
          <button
            type="submit"
            className={styles.save_button}
            disabled={isLoading}
          >
            {isLoading ? '儲存中...' : '儲存變更'}
          </button>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className={styles.cancel_button}
            >
              取消
            </button>
          )}
        </div>
      </form>
    </div>
  )
}

export default ProfileEditor
