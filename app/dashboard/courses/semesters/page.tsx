import dashboardStyles from '../../dashboard.module.scss'
import SemestersManagerClient from './SemestersManagerClient'

export default async function DashboardCourseSemestersPage() {
  return (
    <section className={dashboardStyles.content}>
      <SemestersManagerClient />
    </section>
  )
}
