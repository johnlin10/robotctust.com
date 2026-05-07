import { requireDashboardAccess } from '@/app/utils/dashboard/auth'
import CalendarEditorClient from '../CalendarEditorClient'

export const metadata = { title: '新增事件 | Dashboard' }

export default async function NewCalendarEventPage() {
  await requireDashboardAccess('calendar')
  return <CalendarEditorClient />
}
