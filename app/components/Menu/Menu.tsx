'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import styles from './Menu.module.scss'
// import { useTheme } from 'next-themes'
import ThemeToggle from '../ThemeToggle/ThemeToggle'
// components
import WebsiteMap from '../WebsiteMap/WebsiteMap'
// contexts
import { useAuth } from '../../contexts/AuthContext'
// hooks
import { usePathname } from 'next/navigation'
import { useMenuAutoClose } from '../../hooks/useMenuAutoClose'
import { signOut } from 'firebase/auth'
import { auth } from '@/app/utils/firebase'

interface MenuProps {
  isOpen: boolean
  onClose?: () => void
}

interface AuthSectionProps {
  onClose?: () => void
}

const AuthSection = ({ onClose }: AuthSectionProps) => {
  // 獲取當前路徑
  const pathname = usePathname()
  // 獲取登入資訊
  const { user, loading } = useAuth()

  /**
   * 處理使用者頭像點擊
   * @returns void
   */
  const handleUserClick = () => {
    if (onClose) {
      onClose()
    }
  }

  /**
   * 處理登出
   * @returns void
   */
  const handleLogout = () => {
    signOut(auth)

    if (onClose) {
      onClose()
    }
  }

  return (
    <>
      <div
        className={`${styles.auth_section} ${
          pathname === `/user/${user?.username}` ? styles.active : ''
        }`}
      >
        {loading ? (
          <div className={styles.loading}></div>
        ) : user ? (
          <Link
            href={user ? `/user/${user.username}` : '/user'}
            className={styles.user_link}
            onClick={handleUserClick}
          >
            <div className={styles.user_info}>
              <Image
                src={user.photoURL || '/assets/image/userEmptyAvatar.webp'}
                alt={user.displayName}
                title={user.displayName}
                className={styles.user_avatar}
                width={32}
                height={32}
                priority
              />
              <span className={styles.user_name}>{user.displayName}</span>
            </div>
            <div className={styles.action_buttons}>
              <button className={styles.logout_button} onClick={handleLogout}>
                登出
              </button>
            </div>
          </Link>
        ) : (
          <div className={styles.auth_login}>
            <p>
              加入我們，
              <br />
              探索機器人世界！
            </p>
            <div className={styles.auth_buttons}>
              <Link
                href="/login"
                className={styles.login_button}
                onClick={onClose}
              >
                登入
              </Link>
              <Link
                href={{ pathname: '/login', query: { mode: 'register' } }}
                className={styles.register_button}
                onClick={onClose}
              >
                註冊
              </Link>
              <p className={styles.auth_login_text}>
                帳號功能
                <br />
                內部測試中
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default function Menu({ isOpen, onClose }: MenuProps) {
  // const { theme, setTheme, resolvedTheme } = useTheme()

  // 自動關閉選單功能
  useMenuAutoClose({
    isOpen,
    onClose: onClose || (() => {}),
    excludeSelectors: [
      '[data-theme-toggle]',
      '[data-theme-toggle] *',
      '[data-menu-toggle]',
      '[data-menu-toggle] *',
      '[data-header]',
      '[data-header] *',
    ],
    touchThreshold: 50,
  })

  return (
    <menu className={`${styles.menu} ${isOpen ? styles.open : ''}`} data-menu>
      <div className={styles.menu_items} data-menu>
        <div className={styles.menu_item + ' ' + styles.website_map} data-menu>
          <WebsiteMap onClose={onClose} />
        </div>
        <div className={styles.menu_item + ' ' + styles.theme_toggle} data-menu>
          <ThemeToggle />
        </div>
        <div className={styles.menu_item + ' ' + styles.auth_item} data-menu>
          <AuthSection onClose={onClose} />
        </div>
      </div>
    </menu>
  )
}
