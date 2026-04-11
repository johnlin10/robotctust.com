'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useHeaderState } from '@/app/contexts/HeaderContext'
import useStickyDetection from '@/app/hooks/useStickyDetection'
import { useAside } from './AsideContext'
import styles from './Aside.module.scss'

// icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmark, faChevronLeft } from '@fortawesome/free-solid-svg-icons'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'

export interface AsideNavItem {
  label: string
  href: string
  icon?: IconDefinition | null
}

export interface AsideHeaderConfig {
  title: string
  subtitle?: string
  hide?: boolean
  backLink?: {
    label: string
    href: string
  }
}

export interface AsideProps {
  mode: 'nav' | 'custom'
  header?: AsideHeaderConfig
  items?: AsideNavItem[]
  customContent?: React.ReactNode
  className?: string
  topOffset?: number
}

export const Aside: React.FC<AsideProps> = ({
  mode,
  header,
  items = [],
  customContent,
  className = '',
  topOffset = 60,
}) => {
  const { isCompactHeader } = useHeaderState()
  const { isOpen, setIsOpen } = useAside()
  const pathname = usePathname()

  const stickyState = useStickyDetection({
    topOffset,
    enabled: true,
  })

  const isLinkActive = (href: string) => {
    if (href === '/dashboard' || href === '/courses') {
      return pathname === href
    }
    return pathname?.startsWith(href)
  }

  return (
    <>
      <div
        className={`${styles.drawerOverlay} ${isOpen ? styles.open : ''}`}
        onClick={() => setIsOpen(false)}
      />
      <aside
        ref={stickyState.ref}
        className={`
          ${styles.aside}
          ${isCompactHeader ? styles.headerCompact : ''}
          ${stickyState.isSticky ? styles.sticky : ''}
          ${isOpen ? styles.open : ''}
          ${className}
        `}
      >
        <button
          className={styles.closeBtn}
          onClick={() => setIsOpen(false)}
          aria-label="關閉側邊欄"
        >
          <FontAwesomeIcon icon={faXmark} />
        </button>

        <div className={styles.scrollableContent}>
          {(!header || !header.hide) && (
            <header className={styles.asideHeader}>
              {header?.backLink && (
                <Link href={header.backLink.href} className={styles.backLink}>
                  <FontAwesomeIcon icon={faChevronLeft} />
                  <span>{header.backLink.label}</span>
                </Link>
              )}
              {header?.title && <h1 className={styles.title}>{header.title}</h1>}
              {header?.subtitle && (
                <p className={styles.subtitle}>{header.subtitle}</p>
              )}
            </header>
          )}

          {mode === 'nav' && (
            <nav className={styles.nav}>
              {items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`${styles.navLink} ${
                    isLinkActive(item.href) ? styles.active : ''
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  {item.icon && <FontAwesomeIcon icon={item.icon} />}
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>
          )}

          {mode === 'custom' && customContent}
        </div>
      </aside>
    </>
  )
}
