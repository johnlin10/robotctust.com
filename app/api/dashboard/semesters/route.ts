import { requireDashboardAccess, toRouteErrorResponse } from '@/app/utils/dashboard/auth'
import { getAllSemesters } from '@/app/utils/scheduleService'

export async function GET() {
  try {
    await requireDashboardAccess('calendar')
    const semesters = await getAllSemesters()
    return Response.json(semesters)
  } catch (error) {
    return toRouteErrorResponse(error)
  }
}
