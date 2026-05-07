import { requireDashboardAccess } from '@/app/utils/dashboard/auth'
import CalendarListClient from './CalendarListClient'

export const metadata = { title: '行事曆管理 | Dashboard' }

export default async function DashboardCalendarPage() {
  await requireDashboardAccess('calendar')
  return <CalendarListClient />
}
