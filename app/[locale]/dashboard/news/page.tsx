import { requireDashboardAccess } from '@/app/utils/dashboard/auth'
import NewsListClient from './NewsListClient'

export const metadata = { title: '新聞管理 | Dashboard' }

export default async function DashboardNewsPage() {
  await requireDashboardAccess('news')
  return <NewsListClient />
}
