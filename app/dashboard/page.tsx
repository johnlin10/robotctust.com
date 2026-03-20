import Link from 'next/link'
import styles from './page.module.scss'
import dashboardStyles from './dashboard.module.scss'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowRight } from '@fortawesome/free-solid-svg-icons'

// components
import { DashboardGlobalSidebar } from './components/DashboardGlobalSidebar'

// type
import { DASHBOARD_MODULES } from '@/app/types/dashboard'

// util
import { requireDashboardAccess } from '@/app/utils/dashboard/auth'

/**
 * [Component] 管理後台首頁
 * @returns 管理後台首頁
 */
export default async function DashboardHomePage() {
  // 獲取使用者資料
  const actor = await requireDashboardAccess()
  // 獲取可見模組
  const visibleModules = DASHBOARD_MODULES.filter((module) =>
    actor.modules.includes(module.key),
  )

  return (
    <>
      <DashboardGlobalSidebar role={actor.role} modules={actor.modules} />
      <section className={dashboardStyles.content}>
        <div className={styles.wrapper}>
          <header className={styles.header}>
            <h2>系統總覽</h2>
            <p>依角色顯示可操作模組，便於後續擴充。</p>
          </header>
          <section className={styles.grid}>
            {visibleModules.map((module) => (
              <article key={module.key} className={styles.card}>
                <h3>{module.title}</h3>
                <p>{module.description}</p>
                <Link href={module.href} className={styles.link}>
                  <span>前往模組</span>
                  <FontAwesomeIcon icon={faArrowRight} />
                </Link>
              </article>
            ))}
          </section>
        </div>
      </section>
    </>
  )
}
