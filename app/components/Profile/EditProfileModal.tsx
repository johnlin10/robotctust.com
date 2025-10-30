'use client'

import React, { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { useForm } from 'react-hook-form'
import styles from './EditProfileModal.module.scss'
// icon
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmark } from '@fortawesome/free-solid-svg-icons'
// context
import { useAuth } from '../../contexts/AuthContext'
// utils
import {
  uploadUserAvatar,
  updateUsername,
  updateDisplayName,
  updateBio,
  updateAvatar,
} from '../../utils/userProfileService'
import { UserProfile } from '../../types/user'

interface EditProfileModalProps {
  isOpen: boolean
  onClose: () => void
  userProfile: UserProfile
}

interface FormData {
  username: string
  displayName: string
  bio?: string
  photoURL?: string
}

/**
 * [Component] 編輯個人資料 Modal
 * @param isOpen 是否開啟
 * @param onClose 關閉回調
 * @param userProfile 使用者資料
 * @returns
 */
export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  userProfile,
}) => {
  const { user, updateUserProfile, getUserProfileByUsername } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [success, setSuccess] = useState<string>('')
  const [previewImage, setPreviewImage] = useState<string>(
    userProfile.photoURL || '/assets/image/userEmptyAvatar.png'
  )
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<FormData>({
    defaultValues: {
      username: userProfile.username,
      displayName: userProfile.displayName,
      bio: userProfile.bio || '',
    },
  })

  // 監聽 Modal 開啟狀態，重置表單
  useEffect(() => {
    if (isOpen) {
      reset({
        username: userProfile.username,
        displayName: userProfile.displayName,
        bio: userProfile.bio || '',
      })
      setPreviewImage(userProfile.photoURL || '/assets/image/userEmptyAvatar.png')
      setAvatarFile(null)
      setError('')
      setSuccess('')
    }
  }, [isOpen, userProfile, reset])

  /**
   * [Function] 頭像上傳處理
   */
  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
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
      reader.onload = (e) => {
        const result = e.target?.result as string
        setPreviewImage(result)
        setAvatarFile(file)
      }
      reader.readAsDataURL(file)
    }
  }

  /**
   * [Function] 表單提交處理
   */
  const onSubmit = async (data: FormData) => {
    if (!user || user.uid !== userProfile.uid) {
      setError('沒有權限編輯此帳號')
      return
    }

    try {
      setIsLoading(true)
      setError('')
      setSuccess('')

      // 檢查是否有變更
      const hasChanges =
        data.username !== userProfile.username ||
        data.displayName !== userProfile.displayName ||
        data.bio !== (userProfile.bio || '') ||
        avatarFile !== null

      if (!hasChanges) {
        setError('沒有需要更新的資料')
        setIsLoading(false)
        return
      }

      // 檢查 username 是否已變更
      if (data.username !== userProfile.username) {
        const checkUnique = async (username: string): Promise<boolean> => {
          const existing = await getUserProfileByUsername(username)
          return !!existing && existing.uid !== user.uid
        }
        await updateUsername(user.uid, data.username, checkUnique)
      }

      // 更新 displayName
      if (data.displayName !== userProfile.displayName) {
        await updateDisplayName(user.uid, data.displayName)
      }

      // 更新 bio
      if (data.bio !== (userProfile.bio || '')) {
        // 如果 bio 是空字串，傳入 undefined 以刪除欄位
        await updateBio(user.uid, data.bio?.trim() || undefined)
      }

      // 上傳新頭像（如果有）
      if (avatarFile) {
        const newPhotoURL = await uploadUserAvatar(user.uid, avatarFile)
        await updateAvatar(user.uid, newPhotoURL, userProfile.photoURL)
      }

      setSuccess('個人資料更新成功')
      
      // 延遲關閉 Modal，讓使用者看到成功訊息
      setTimeout(() => {
        onClose()
        // 通知 AuthContext 重新載入使用者資料
        // 透過重新獲取使用者資料來更新狀態
        if (user) {
          window.location.reload()
        }
      }, 1500)
    } catch (error) {
      console.error('更新個人資料失敗:', error)
      setError(
        error instanceof Error ? error.message : '更新失敗，請稍後再試'
      )
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className={styles.modal_overlay} onClick={onClose}>
      <div
        className={styles.modal_container}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal 標題 */}
        <div className={styles.modal_header}>
          <h2>編輯個人資料</h2>
          <button className={styles.close_button} onClick={onClose}>
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        {/* 錯誤訊息 */}
        {error && <div className={styles.error_message}>{error}</div>}

        {/* 成功訊息 */}
        {success && <div className={styles.success_message}>{success}</div>}

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
            <p className={styles.avatar_hint}>
              點擊 + 號上傳新頭像（最大 5MB）
            </p>
          </div>

          {/* 帳號名稱 */}
          <div className={styles.form_group}>
            <label htmlFor="username">帳號名稱</label>
            <input
              id="username"
              type="text"
              {...register('username', {
                required: '請輸入帳號名稱',
                pattern: {
                  value: /^[a-zA-Z0-9_.-]+$/,
                  message: '帳號名稱只能包含英文字母、數字、底線、點和連字號',
                },
                minLength: {
                  value: 3,
                  message: '帳號名稱需要 3-20 個字元',
                },
                maxLength: {
                  value: 20,
                  message: '帳號名稱需要 3-20 個字元',
                },
              })}
              className={errors.username ? styles.error : ''}
              placeholder="英文字母、數字、_、.、- (3-20字元)"
            />
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
              {...register('displayName', {
                required: '請輸入暱稱',
                maxLength: {
                  value: 15,
                  message: '暱稱不能超過 15 個字元',
                },
              })}
              className={errors.displayName ? styles.error : ''}
              placeholder="公開顯示的名稱（15字元以內）"
            />
            {errors.displayName && (
              <span className={styles.field_error}>
                {errors.displayName.message}
              </span>
            )}
          </div>

          {/* 個人簡介 */}
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
              placeholder="介紹一下自己吧（選填，最多 500 字）"
              rows={4}
            />
            {errors.bio && (
              <span className={styles.field_error}>
                {errors.bio.message}
              </span>
            )}
            <span className={styles.char_count}>
              {watch('bio')?.length || 0} / 500
            </span>
          </div>

          {/* 提交按鈕 */}
          <button
            type="submit"
            className={styles.submit_button}
            disabled={isLoading}
          >
            {isLoading ? '儲存中...' : '儲存變更'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default EditProfileModal
