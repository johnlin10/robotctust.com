import { NextRequest } from 'next/server'
import {
  requireDashboardAccess,
  toRouteErrorResponse,
} from '@/app/utils/dashboard/auth'
import {
  fetchAllPrograms,
  createProgram,
} from '@/app/utils/dashboard/programService'

export async function GET() {
  try {
    await requireDashboardAccess('courses')
    const programs = await fetchAllPrograms()
    return Response.json(programs)
  } catch (error) {
    return toRouteErrorResponse(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireDashboardAccess('courses')
    const body = await request.json()
    
    if (!body.name || !body.code_content) {
      return Response.json({ error: '請提供名稱與程式碼內容' }, { status: 400 })
    }

    const program = await createProgram({
      name: body.name.trim(),
      language: body.language || 'cpp',
      code_content: body.code_content,
    })

    return Response.json(program, { status: 201 })
  } catch (error) {
    return toRouteErrorResponse(error)
  }
}
