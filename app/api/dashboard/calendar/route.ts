import { NextRequest } from 'next/server'
import { requireDashboardAccess, toRouteErrorResponse } from '@/app/utils/dashboard/auth'
import { getAllScheduleEvents, createScheduleEvent } from '@/app/utils/scheduleService'
import { ScheduleEvent } from '@/app/types/Schedule'

export async function GET() {
  try {
    await requireDashboardAccess('calendar')
    const events = await getAllScheduleEvents()
    return Response.json(events)
  } catch (error) {
    return toRouteErrorResponse(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const actor = await requireDashboardAccess('calendar')
    const body = await request.json() as Partial<ScheduleEvent> & {
      startDate?: string
      startTime?: string
      endDate?: string
      endTime?: string
    }

    const {
      title,
      description,
      type,
      startDateTime,
      endDateTime,
      location,
      instructor,
      color,
      priority,
      published,
      semesterId,
    } = body as ScheduleEvent

    if (!title?.trim()) return Response.json({ error: '請提供事件標題' }, { status: 400 })
    if (!type) return Response.json({ error: '請選擇事件類型' }, { status: 400 })
    if (!startDateTime?.date) return Response.json({ error: '請提供開始日期' }, { status: 400 })
    if (!endDateTime?.date) return Response.json({ error: '請提供結束日期' }, { status: 400 })

    const event = await createScheduleEvent(
      {
        title,
        description,
        type,
        startDate: startDateTime.date,
        startTime: startDateTime.time || '00:00',
        endDate: endDateTime.date,
        endTime: endDateTime.time || '23:59',
        location,
        instructor,
        color,
        priority: priority ?? 0,
        published: published ?? false,
        semesterId: semesterId ?? null,
      },
      actor.userId,
    )

    return Response.json(event, { status: 201 })
  } catch (error) {
    return toRouteErrorResponse(error)
  }
}
