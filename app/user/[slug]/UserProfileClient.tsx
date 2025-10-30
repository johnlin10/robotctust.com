'use client'

import React, { useEffect, useState } from 'react'
import { useAuth } from '@/app/contexts/AuthContext'
import { UserProfile } from '@/app/types/user'
import {
  SerializedUserProfile,
  deserializeUserProfile,
} from '@/app/types/serialized'
import styles from '../User.module.scss'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import EditProfileModal from '@/app/components/Profile/EditProfileModal'

interface UserProfileClientProps {
  slug: string
  initialUserProfile: SerializedUserProfile | null
}

export default function UserProfileClient({
  slug,
  initialUserProfile,
}: UserProfileClientProps) {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const [displayUserInfo, setDisplayUserInfo] = useState<UserProfile | null>(
    initialUserProfile ? deserializeUserProfile(initialUserProfile) : null
  )
  const [isOwnProfile, setIsOwnProfile] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  useEffect(() => {
    //* 檢查是否為登入者本人的資料
    if (user && user.username === slug) {
      setDisplayUserInfo(user)
      setIsOwnProfile(true)
    } else {
      // 反序列化初始使用者資料
      const deserializedProfile = initialUserProfile
        ? deserializeUserProfile(initialUserProfile)
        : null
      setDisplayUserInfo(deserializedProfile)
      setIsOwnProfile(false)
    }
  }, [user, slug, initialUserProfile])

  const handleLogout = () => {
    signOut()
    router.push('/')
  }

  if (!displayUserInfo) {
    return (
      <div className={`page-container`}>
        <div className={styles['user-not-found']}>
          <h2>使用者不存在</h2>
          <p>找不到使用者名稱為 {slug} 的使用者</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div
        className={`${styles.user_info} ${isOwnProfile && styles.own_profile}`}
      >
        <div className={styles.user_info_container}>
          {isOwnProfile && (
            <div className={styles.own_profile_badge}>
              <span>你的帳號</span>
            </div>
          )}
          <div className={styles.user_info_header}>
            <div className={styles.user_info_header_avatar}>
              <Image
                src={displayUserInfo.photoURL}
                alt={displayUserInfo.displayName}
                width={60}
                height={60}
                priority
              />
            </div>
            <div className={styles.user_info_content}>
              <div className={styles.user_info_name}>
                {displayUserInfo.displayName}
              </div>
              <div className={styles.user_info_username}>
                @{displayUserInfo.username}
              </div>
              {displayUserInfo.bio && (
                <div className={styles.user_info_bio}>
                  {displayUserInfo.bio}
                </div>
              )}
            </div>
          </div>
          {isOwnProfile && (
            <div className={styles.user_actions}>
              <button
                onClick={() => setIsEditModalOpen(true)}
                className={styles.edit_button}
              >
                編輯個人資料
              </button>
              <button onClick={handleLogout} className={styles.logout_button}>
                登出
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 編輯個人資料 Modal */}
      {isOwnProfile && displayUserInfo && (
        <EditProfileModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          userProfile={displayUserInfo}
        />
      )}
    </>
  )
}
