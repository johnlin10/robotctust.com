'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import styles from './Header.module.scss'
// components
import { AuthModal } from '../Auth/AuthModal'
import Menu from '../Menu/Menu'
// contexts
import { useAuth } from '../../contexts/AuthContext'
import { useHeaderState } from '../../contexts/HeaderContext'
// hooks
import { useNavAutoCenter } from './useNavAutoCenter'
import { usePathname } from 'next/navigation'
// icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBars } from '@fortawesome/free-solid-svg-icons'
// configs
import { NAV_AUTO_CENTER_CONFIG } from './headerScrollConfig'

/**
 * [Component] 導航列
 */
export default function Header() {
  // 獲取當前路徑
  const pathname = usePathname()
  // 獲取登入資訊 與 驗證超級管理員權限
  const { user, loading, isSuperAdmin } = useAuth()
  // 登入模組狀態
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  // 登入模組的類型
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
  // 選單狀態
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  // Header 的縮放狀態
  const { isCompactHeader } = useHeaderState()
  // 導航自動居中功能
  const { containerRef, handleLinkClick, handleScroll, centerActiveItem } =
    useNavAutoCenter(`.${styles.active}`, NAV_AUTO_CENTER_CONFIG)

  /**
   * 開啟登入模組
   * @returns void
   */
  const handleOpenLogin = () => {
    setAuthMode('login')
    setIsAuthModalOpen(true)
  }

  /**
   * 關閉登入模組
   * @returns void
   */
  const handleCloseModal = () => {
    setIsAuthModalOpen(false)
  }

  /**
   * 關閉選單
   * @returns void
   */
  const handleCloseMenu = () => {
    setIsMenuOpen(false)
  }

  /**
   * 處理導航連結點擊事件
   * @returns void
   */
  const handleNavLinkClick = () => {
    handleCloseMenu()
    handleLinkClick()
  }

  // 監聽 Header 模式變化，當從緊湊模式恢復時自動居中
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      centerActiveItem()
    }, 250)
    return () => clearTimeout(timeoutId)
  }, [isCompactHeader, centerActiveItem])

  return (
    <>
      {/* 選單 */}
      <Menu isOpen={isMenuOpen} />

      {/* Header */}
      <header
        className={`${styles.header}${isMenuOpen ? ` ${styles.open}` : ''}${
          isCompactHeader ? ` ${styles.compact}` : ''
        }`}
      >
        <div className={styles.headerContainer}>
          {/* 選單按鈕 */}
          <div className={styles.menu_button}>
            <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
              <FontAwesomeIcon icon={faBars} />
            </button>
          </div>

          {/* 導航 */}
          <div
            className={styles.nav_links}
            ref={containerRef}
            onScroll={handleScroll}
          >
            <Link
              href="/"
              onClick={handleNavLinkClick}
              className={pathname === '/' ? styles.active : ''}
            >
              首頁
            </Link>
            <Link
              href="/schedules"
              onClick={handleNavLinkClick}
              className={pathname.startsWith('/schedules') ? styles.active : ''}
            >
              行事曆
            </Link>
            <Link
              href="/update"
              onClick={handleNavLinkClick}
              className={pathname.startsWith('/update') ? styles.active : ''}
            >
              最新資訊
            </Link>
            <Link
              href="/competitions"
              onClick={handleNavLinkClick}
              className={
                pathname.startsWith('/competitions') ? styles.active : ''
              }
            >
              競賽
            </Link>
            <Link
              href="/docs"
              onClick={handleNavLinkClick}
              className={pathname.startsWith('/docs') ? styles.active : ''}
            >
              文檔
            </Link>
            <Link
              href="/about"
              onClick={handleNavLinkClick}
              className={pathname.startsWith('/about') ? styles.active : ''}
            >
              關於
            </Link>
            {isSuperAdmin && (
              <>
                <div className={styles.separator} />
                <Link
                  href="/admin"
                  onClick={handleNavLinkClick}
                  className={pathname.startsWith('/admin') ? styles.active : ''}
                >
                  權限管理
                </Link>
              </>
            )}
          </div>

          {/* 帳號資訊與登入按鈕 */}
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
                className={styles.user_info}
                onClick={handleCloseMenu}
              >
                <Image
                  src={user.photoURL || '/assets/image/userEmptyAvatar.webp'}
                  alt={user.displayName}
                  title={user.displayName}
                  className={styles.user_avatar}
                  width={32}
                  height={32}
                  priority
                />
              </Link>
            ) : (
              <div className={styles.auth_buttons}>
                <button
                  className={styles.login_button}
                  onClick={handleOpenLogin}
                >
                  登入
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 登入模組 */}
      {isAuthModalOpen && (
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={handleCloseModal}
          initialMode={authMode}
        />
      )}
    </>
  )
}
