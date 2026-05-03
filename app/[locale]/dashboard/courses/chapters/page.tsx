import dashboardStyles from '../../dashboard.module.scss'
import ChaptersManagerClient from './ChaptersManagerClient'

export default async function DashboardCourseChaptersPage() {
  return (
    <section className={dashboardStyles.content}>
      <ChaptersManagerClient />
    </section>
  )
}
