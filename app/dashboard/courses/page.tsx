import CoursesOverviewClient from './overview/CoursesOverviewClient'
import { CoursesAdminSidebar } from './components/CoursesAdminSidebar'
import styles from './page.module.scss'

/**
 * 課程編輯器頁面
 * @returns 課程編輯器頁面
 */
export default async function DashboardCoursesPage() {
  return (
    <div className={styles.container}>
      <CoursesAdminSidebar />
      <section className={styles.content}>
        <CoursesOverviewClient />
      </section>
    </div>
  )
}
