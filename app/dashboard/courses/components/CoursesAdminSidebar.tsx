'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faBookOpen,
  faCalendarDays,
  faChevronLeft,
  faFolderTree,
  faLayerGroup,
} from '@fortawesome/free-solid-svg-icons'
import { Aside } from '@/app/components/Aside'
import { Role } from '@/app/types/dashboard'
import styles from './courses-admin-sidebar.module.scss'
import { getUserRoleName } from '@/app/types/user'

const navItems = [
  { href: '/dashboard/courses', label: '課程總覽', icon: faFolderTree },
  // {
  //   href: '/dashboard/courses/semesters',
  //   label: '學期管理',
  //   icon: faCalendarDays,
  // },
  // {
  //   href: '/dashboard/courses/chapters',
  //   label: '章節管理',
  //   icon: faLayerGroup,
  // },
  // { href: '/dashboard/courses/courses', label: '課程列表', icon: faBookOpen },
]

export function CoursesAdminSidebar() {
  const pathname = usePathname()

  return (
    <Aside className={styles.sidebar}>
      <div className={styles.header}>
        <Link href="/dashboard" className={styles.backLink}>
          <FontAwesomeIcon icon={faChevronLeft} />
          <span>返回模組總覽</span>
        </Link>
        <h1>課程管理</h1>
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
