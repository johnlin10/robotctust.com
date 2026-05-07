import { NextRequest } from 'next/server'
import { requireDashboardAccess, toRouteErrorResponse } from '@/app/utils/dashboard/auth'
import {
  getScheduleEventById,
  updateScheduleEvent,
  deleteScheduleEvent,
} from '@/app/utils/scheduleService'
import { ScheduleEvent } from '@/app/types/Schedule'

type Params = { params: Promise<{ eventId: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    await requireDashboardAccess('calendar')
    const { eventId } = await params
    const event = await getScheduleEventById(eventId)
    if (!event) return Response.json({ error: '找不到事件' }, { status: 404 })
    return Response.json(event)
  } catch (error) {
    return toRouteErrorResponse(error)
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    await requireDashboardAccess('calendar')
    const { eventId } = await params
    const body = await request.json() as Partial<ScheduleEvent>

    const patch: Parameters<typeof updateScheduleEvent>[1] = {}
    if (body.title !== undefined) patch.title = body.title
    if (body.description !== undefined) patch.description = body.description
    if (body.type !== undefined) patch.type = body.type
    if (body.startDateTime !== undefined) {
      patch.startDate = body.startDateTime.date
      patch.startTime = body.startDateTime.time
    }
    if (body.endDateTime !== undefined) {
      patch.endDate = body.endDateTime.date
      patch.endTime = body.endDateTime.time
    }
    if (body.location !== undefined) patch.location = body.location
    if (body.instructor !== undefined) patch.instructor = body.instructor
    if (body.color !== undefined) patch.color = body.color
    if (body.priority !== undefined) patch.priority = body.priority
    if (body.published !== undefined) patch.published = body.published
    if ('semesterId' in body) patch.semesterId = body.semesterId

    const updated = await updateScheduleEvent(eventId, patch)
    return Response.json(updated)
  } catch (error) {
    return toRouteErrorResponse(error)
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    await requireDashboardAccess('calendar')
    const { eventId } = await params
    await deleteScheduleEvent(eventId)
    return Response.json({ success: true })
  } catch (error) {
    return toRouteErrorResponse(error)
  }
}
