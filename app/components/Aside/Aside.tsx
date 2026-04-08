'use client'

import React, { useEffect } from 'react'
import { useHeaderState } from '@/app/contexts/HeaderContext'
import useStickyDetection from '@/app/hooks/useStickyDetection'
import styles from './Aside.module.scss'

// icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmark } from '@fortawesome/free-solid-svg-icons'

interface AsideProps {
  children: React.ReactNode
  className?: string
  topOffset?: number
  isMobileDrawer?: boolean
  isOpen?: boolean
  onClose?: () => void
}

export const Aside: React.FC<AsideProps> = ({
  children,
  className = '',
  topOffset = 60,
  isMobileDrawer = false,
  isOpen = false,
  onClose,
}) => {
  const { isCompactHeader } = useHeaderState()
  const stickyState = useStickyDetection({
    topOffset,
    enabled: !isMobileDrawer, // Disable sticky if it's acting as a drawer
  })

  // Prevent background scrolling when drawer is open
  // useEffect(() => {
  //   if (isMobileDrawer && isOpen) {
  //     document.body.style.overflow = 'hidden'
  //   } else {
  //     document.body.style.overflow = ''
  //   }
  //   return () => {
  //     document.body.style.overflow = ''
  //   }
  // }, [isMobileDrawer, isOpen])

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {isMobileDrawer && (
        <div
          className={`${styles.drawerOverlay} ${isOpen ? styles.open : ''}`}
          onClick={onClose}
        />
      )}
      <aside
        ref={stickyState.ref}
        className={`
          ${styles.aside}
          ${isCompactHeader && !isMobileDrawer ? styles.headerCompact : ''}
          ${stickyState.isSticky && !isMobileDrawer ? styles.sticky : ''}
          ${isMobileDrawer ? styles.mobileDrawer : ''}
          ${isMobileDrawer && isOpen ? styles.open : ''}
          ${className}
        `}
      >
        {isMobileDrawer && typeof onClose === 'function' && (
          <button className={styles.closeBtn} onClick={onClose} aria-label="關閉側邊欄">
            <FontAwesomeIcon icon={faXmark} />
          </button>
        )}
        <div className={styles.scrollableContent}>
          {children}
        </div>
      </aside>
    </>
  )
}
