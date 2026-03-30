'use client'

import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useAuth } from '../../contexts/AuthContext'
import { updateUserProfileSafe } from '../../utils/profileService'
import { UpdateUserProfileData } from '../../types/user'
import styles from './ProfileEditor.module.scss'

interface ProfileEditorProps {
  onClose?: () => void
  onSave?: () => void
}

/**
 * [Component] 個人資料編輯器
 * 目前僅保留已落地的基本欄位。
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

  const watchedValues = watch()

  useEffect(() => {
    if (user) {
      setValue('displayName', user.displayName)
      setValue('bio', user.bio || '')
    }
  }, [user, setValue])

  const onSubmit = async (data: UpdateUserProfileData) => {
    if (!user) return

    try {
      setIsLoading(true)
      setError('')
      setSuccess('')

      await updateUserProfileSafe(user.uid, data, user.uid)

      setSuccess('個人資料更新成功！')
      onSave?.()
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
        </div>

        {error && <div className={styles.error_message}>{error}</div>}
        {success && <div className={styles.success_message}>{success}</div>}

        <div className={styles.actions}>
          <button
            type="submit"
            className={styles.save_button}
            disabled={isLoading}
          >
            {isLoading ? '儲存中...' : '儲存變更'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default ProfileEditor
