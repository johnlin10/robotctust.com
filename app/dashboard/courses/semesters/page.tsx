import dashboardStyles from '../../dashboard.module.scss'
import { CoursesAdminSidebar } from '../components/CoursesAdminSidebar'
import SemestersManagerClient from './SemestersManagerClient'

export default async function DashboardCourseSemestersPage() {
  return (
    <>
      <CoursesAdminSidebar />
      <section className={dashboardStyles.content}>
        <SemestersManagerClient />
      </section>
    </>
  )
}
