'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import styles from './Header.module.scss'

// component
import Menu from '../Menu/Menu'

// contexts
import { useAuth } from '../../contexts/AuthContext'
import { useHeaderState } from '../../contexts/HeaderContext'

// hooks
import { useNavAutoCenter } from './useNavAutoCenter'

// icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBars, faXmark } from '@fortawesome/free-solid-svg-icons'

// configs
import { NAV_AUTO_CENTER_CONFIG } from './headerScrollConfig'

//* 需要隱藏 Header 的頁面路徑列表
const HIDDEN_HEADER_PATHS = [
  '/login',
  '/register',
  '/auth/callback',
  '/onboarding',
]

/**
 * 檢查當前路徑是否需要隱藏 Header
 * @param {string} pathname 當前路徑
 * @returns {boolean} 是否需要隱藏
 */
const shouldHideHeader = (pathname: string): boolean => {
  return HIDDEN_HEADER_PATHS.some((path) => pathname.startsWith(path))
}

/**
 * [Component] Header 元件
 * @returns {JSX.Element} Header 元件
 */
export default function Header() {
  // 獲取當前路徑
  const pathname = usePathname()
  // 獲取登入資訊與管理權限
  const { isAdmin, isSuperAdmin, isSemesterMember } = useAuth()
  // 選單狀態
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  // Header 的縮放狀態
  const { isCompactHeader } = useHeaderState()
  // 導航自動居中功能
  const { containerRef, handleLinkClick, handleScroll, centerActiveItem } =
    useNavAutoCenter(`.${styles.active}`, NAV_AUTO_CENTER_CONFIG)

  /**
   * 關閉選單
   * @returns {void}
   */
  const handleCloseMenu = () => {
    setIsMenuOpen(false)
  }

  /**
   * 處理導航連結點擊事件
   * @returns {void}
   */
  const handleNavLinkClick = () => {
    handleCloseMenu()
    handleLinkClick()
  }

  /**
   * 處理 Logo 點擊事件
   * @returns {void}
   */
  const handleLogoClick = () => {
    window.location.href = '/'
  }

  // 監聽 Header 模式變化，當從緊湊模式恢復時自動居中
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      centerActiveItem()
    }, 250)
    return () => clearTimeout(timeoutId)
  }, [isCompactHeader, centerActiveItem])

  // 如果當前頁面需要隱藏 Header，則不渲染
  if (shouldHideHeader(pathname)) {
    return null
  }

  return (
    <>
      {/* 選單 */}
      <Menu isOpen={isMenuOpen} onClose={handleCloseMenu} />

      {/* Header */}
      <header
        className={`${styles.header}${isMenuOpen ? ` ${styles.open}` : ''}${
          isCompactHeader ? ` ${styles.compact}` : ''
        }`}
        data-header
      >
        <div className={styles.headerContainer}>
          {/* 選單按鈕 */}

          <div className={styles.logo}>
            <div
              className={`${styles.logoContainer} ${
                isCompactHeader ? styles.compact : ''
              }`}
              onClick={handleLogoClick}
            >
              <Image
                src="/assets/image/home/robotctust-home-image.png"
                alt="中臺機器人研究社"
                width={96}
                height={96}
                className={styles.logoImage}
              />
              <div className={styles.logoText}>
                <h1>中臺機器人研究社</h1>
                <p>Robotics Research Club of CTUST</p>
              </div>
            </div>
          </div>

          {/* 導航 */}
          <div
            className={styles.nav_links}
            ref={containerRef}
            onScroll={handleScroll}
          >
            {isSemesterMember && (
              <>
                <Link
                  href="/courses"
                  onClick={handleNavLinkClick}
                  className={
                    pathname.startsWith('/courses') ? styles.active : ''
                  }
                >
                  課程
                </Link>
                <div className={styles.separator} />
              </>
            )}
            <Link
              href="/update"
              onClick={handleNavLinkClick}
              className={pathname.startsWith('/update') ? styles.active : ''}
            >
              新聞
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
              href="/schedules"
              onClick={handleNavLinkClick}
              className={pathname.startsWith('/schedules') ? styles.active : ''}
            >
              行事曆
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
            {(isAdmin || isSuperAdmin) && (
              <>
                <div className={styles.separator} />
                <Link
                  href="/dashboard"
                  onClick={handleNavLinkClick}
                  className={
                    pathname.startsWith('/dashboard') ? styles.active : ''
                  }
                >
                  後台
                </Link>
              </>
            )}
            {isSuperAdmin && (
              <>
                <Link
                  href="/admin"
                  onClick={handleNavLinkClick}
                  className={pathname.startsWith('/admin') ? styles.active : ''}
                >
                  總控台
                </Link>
              </>
            )}
          </div>

          <div className={styles.menu_button}>
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} data-menu-toggle>
              <FontAwesomeIcon icon={faBars} className={styles.faBars} />
              <FontAwesomeIcon icon={faXmark} className={styles.faXmark} />
            </button>
          </div>
        </div>
      </header>
      <div
        className={`${styles.gradient_blur} ${
          isCompactHeader ? styles.compact : ''
        }`}
      >
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
    </>
  )
}
