'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import styles from './Header.module.scss'
// components
import Menu from '../Menu/Menu'
// contexts
import { useAuth } from '../../contexts/AuthContext'
import { useHeaderState } from '../../contexts/HeaderContext'
// hooks
import { useNavAutoCenter } from './useNavAutoCenter'
import { usePathname } from 'next/navigation'
// icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBars, faXmark } from '@fortawesome/free-solid-svg-icons'
// configs
import { NAV_AUTO_CENTER_CONFIG } from './headerScrollConfig'
import Image from 'next/image'

/**
 * [Component] 導航列
 */
export default function Header() {
  // 獲取當前路徑
  const pathname = usePathname()
  // 獲取登入資訊 與 驗證超級管理員權限
  const { isSuperAdmin } = useAuth()
  // 選單狀態
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  // Header 的縮放狀態
  const { isCompactHeader } = useHeaderState()
  // 導航自動居中功能
  const { containerRef, handleLinkClick, handleScroll, centerActiveItem } =
    useNavAutoCenter(`.${styles.active}`, NAV_AUTO_CENTER_CONFIG)

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

  /**
   * 處理 Logo 點擊事件
   * @returns void
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
                <p>Robot Research Club of CTUST</p>
              </div>
            </div>
          </div>

          {/* 導航 */}
          <div
            className={styles.nav_links}
            ref={containerRef}
            onScroll={handleScroll}
          >
            <Link
              href="/update"
              onClick={handleNavLinkClick}
              className={pathname.startsWith('/update') ? styles.active : ''}
            >
              最新資訊
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
