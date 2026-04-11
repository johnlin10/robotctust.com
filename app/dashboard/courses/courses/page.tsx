import dashboardStyles from '../../dashboard.module.scss'
import CoursesLibraryClient from './CoursesLibraryClient'

export default async function DashboardCourseLibraryPage() {
  return (
    <section className={dashboardStyles.content}>
      <CoursesLibraryClient />
    </section>
  )
}
