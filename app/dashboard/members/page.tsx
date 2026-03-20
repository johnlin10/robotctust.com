import { requireDashboardAccess } from '@/app/utils/dashboard/auth'
import dashboardStyles from '../dashboard.module.scss'
import { DashboardGlobalSidebar } from '../components/DashboardGlobalSidebar'

/**
 * 社員系統後台頁面
 * @returns 社員系統後台頁面
 */
export default async function DashboardMembersPage() {
  const actor = await requireDashboardAccess('members')
  return (
    <>
      <DashboardGlobalSidebar role={actor.role} modules={actor.modules} />
      <section className={dashboardStyles.content}>
        <h2>社員系統後台（預留）</h2>
        <p>此模組預留給後續社員名單、學期成員與身分管理。</p>
      </section>
    </>
  )
}
