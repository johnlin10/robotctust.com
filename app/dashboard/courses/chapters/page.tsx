import dashboardStyles from '../../dashboard.module.scss'
import { CoursesAdminSidebar } from '../components/CoursesAdminSidebar'
import ChaptersManagerClient from './ChaptersManagerClient'

export default async function DashboardCourseChaptersPage() {
  return (
    <>
      <CoursesAdminSidebar />
      <section className={dashboardStyles.content}>
        <ChaptersManagerClient />
      </section>
    </>
  )
}
