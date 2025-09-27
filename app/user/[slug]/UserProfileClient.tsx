'use client'

import React, { useEffect, useState } from 'react'
import { useAuth } from '@/app/contexts/AuthContext'
import { UserProfile } from '@/app/types/user'
import styles from '../User.module.scss'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

interface UserProfileClientProps {
  slug: string
  initialUserProfile: UserProfile | null
}

export default function UserProfileClient({
  slug,
  initialUserProfile,
}: UserProfileClientProps) {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const [displayUserInfo, setDisplayUserInfo] = useState<UserProfile | null>(
    initialUserProfile
  )
  const [isOwnProfile, setIsOwnProfile] = useState(false)

  useEffect(() => {
    //* 檢查是否為登入者本人的資料
    if (user && user.username === slug) {
      setDisplayUserInfo(user)
      setIsOwnProfile(true)
    } else {
      setDisplayUserInfo(initialUserProfile)
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
          </div>
        </div>
        {isOwnProfile && (
          <div className={styles.logout}>
            <button onClick={handleLogout}>登出</button>
          </div>
        )}
      </div>
    </div>
  )
}
