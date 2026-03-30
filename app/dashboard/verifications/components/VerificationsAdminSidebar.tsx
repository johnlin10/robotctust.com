'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faChevronLeft,
  faCheckCircle,
  faHistory,
} from '@fortawesome/free-solid-svg-icons'
import { Aside } from '@/app/components/Aside'
import styles from './verifications-admin-sidebar.module.scss'

const navItems = [
  { href: '/dashboard/verifications', label: '待審核清單', icon: faCheckCircle },
  // { href: '/dashboard/verifications/history', label: '審核歷史', icon: faHistory },
]

export function VerificationsAdminSidebar() {
  const pathname = usePathname()

  return (
    <Aside className={styles.sidebar}>
      <div className={styles.header}>
        <Link href="/dashboard" className={styles.backLink}>
          <FontAwesomeIcon icon={faChevronLeft} />
          <span>返回模組總覽</span>
        </Link>
        <h1>課程審核</h1>
      </div>

      <nav className={styles.nav}>
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`${styles.navLink} ${
              pathname === item.href ? styles.navLinkActive : ''
            }`}
          >
            <FontAwesomeIcon icon={item.icon} />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </Aside>
  )
}
