import { requireDashboardAccess } from '@/app/utils/dashboard/auth'
import dashboardStyles from '../dashboard.module.scss'

/**
 * 帳號與社員管理後台頁面
 * @returns 帳號與社員管理後台頁面
 */
export default async function DashboardAccountsPage() {
  await requireDashboardAccess('accounts')

  return (
    <section className={dashboardStyles.content}>
      <h2>帳號管理後台（預留）</h2>
      <p>此模組預留給後續社員名單、學期成員與角色授權管理。</p>
    </section>
  )
}
