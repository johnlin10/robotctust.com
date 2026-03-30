import dashboardStyles from '../../dashboard.module.scss'
import { CoursesAdminSidebar } from '../components/CoursesAdminSidebar'
import CoursesLibraryClient from './CoursesLibraryClient'

export default async function DashboardCourseLibraryPage() {
  return (
    <>
      <CoursesAdminSidebar />
      <section className={dashboardStyles.content}>
        <CoursesLibraryClient />
      </section>
    </>
  )
}
