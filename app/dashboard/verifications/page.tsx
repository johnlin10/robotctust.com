import { requireDashboardAccess } from '@/app/utils/dashboard/auth'
import VerificationClient from './VerificationClient'
import dashboardStyles from '../dashboard.module.scss'
import { DashboardGlobalSidebar } from '../components/DashboardGlobalSidebar'

/**
 * 課程審核中控台頁面
 * @returns 課程審核中控台頁面
 */
export default async function DashboardVerificationPage() {
  // 檢查是否有權限
  const actor = await requireDashboardAccess('verifications')
  // 返回課程審核中控台頁面
  return (
    <>
      <DashboardGlobalSidebar role={actor.role} modules={actor.modules} />
      <section className={dashboardStyles.content}>
        <VerificationClient />
      </section>
    </>
  )
}
