import { requireDashboardAccess } from '@/app/utils/dashboard/auth'
import dashboardStyles from '../dashboard.module.scss'
import { DashboardGlobalSidebar } from '../components/DashboardGlobalSidebar'

/**
 * 成就系統後台頁面
 * @returns 成就系統後台頁面
 */
export default async function DashboardAchievementsPage() {
  const actor = await requireDashboardAccess('achievements')
  return (
    <>
      <DashboardGlobalSidebar role={actor.role} modules={actor.modules} />
      <section className={dashboardStyles.content}>
        <h2>成就系統後台（預留）</h2>
        <p>此模組預留給後續成就圖鑑與發放規則管理。</p>
      </section>
    </>
  )
}
