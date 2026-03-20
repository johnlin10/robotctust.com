import React from 'react'
import Link from 'next/link'

// components
import { Aside } from '@/app/components/Aside'

// styles
import styles from './DashboardGlobalSidebar.module.scss'

// types
import { DASHBOARD_MODULES } from '@/app/types/dashboard'
import { Role } from '@/app/types/dashboard'

interface DashboardGlobalSidebarProps {
  role: Role
  modules: string[]
}

/**
 * [Component] 管理後台全域側邊欄
 * 提供返回模組總覽與切換模組的導覽列
 */
export const DashboardGlobalSidebar: React.FC<DashboardGlobalSidebarProps> = ({
  role,
  modules,
}) => {
  // 獲取可見模組
  const visibleModules = DASHBOARD_MODULES.filter((module) =>
    modules.includes(module.key),
  )

  return (
    <Aside className={styles.sidebar}>
      <div className={styles.asideHeader}>
        <h1 className={styles.title}>管理後台</h1>
        <p className={styles.subtitle}>角色：{role}</p>
      </div>
      <nav className={styles.nav}>
        <Link href="/dashboard" className={styles.navLink}>
          模組總覽
        </Link>
        {visibleModules.map((module) => (
          <Link key={module.key} href={module.href} className={styles.navLink}>
            {module.title}
          </Link>
        ))}
      </nav>
    </Aside>
  )
}
