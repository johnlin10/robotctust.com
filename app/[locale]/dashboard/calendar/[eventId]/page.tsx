import { requireDashboardAccess } from '@/app/utils/dashboard/auth'
import { getScheduleEventById } from '@/app/utils/scheduleService'
import { notFound } from 'next/navigation'
import CalendarEditorClient from '../CalendarEditorClient'

export const metadata = { title: '編輯事件 | Dashboard' }

export default async function EditCalendarEventPage({
  params,
}: {
  params: Promise<{ eventId: string }>
}) {
  await requireDashboardAccess('calendar')
  const { eventId } = await params
  const event = await getScheduleEventById(eventId)
  if (!event) notFound()
  return <CalendarEditorClient event={event} />
}
