import { NextRequest } from 'next/server'
import {
  requireDashboardAccess,
  toRouteErrorResponse,
} from '@/app/utils/dashboard/auth'
import {
  fetchProgramById,
  updateProgram,
  deleteProgram,
} from '@/app/utils/dashboard/programService'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ programId: string }> }
) {
  try {
    await requireDashboardAccess('courses')
    const { programId } = await params
    const program = await fetchProgramById(programId)
    
    if (!program) {
      return Response.json({ error: '找不到程式檔案' }, { status: 404 })
    }

    return Response.json(program)
  } catch (error) {
    return toRouteErrorResponse(error)
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ programId: string }> }
) {
  try {
    await requireDashboardAccess('courses')
    const { programId } = await params
    const body = await request.json()
    
    const program = await updateProgram(programId, {
      name: body.name?.trim(),
      language: body.language,
      code_content: body.code_content,
    })

    return Response.json(program)
  } catch (error) {
    return toRouteErrorResponse(error)
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ programId: string }> }
) {
  try {
    await requireDashboardAccess('courses')
    const { programId } = await params
    await deleteProgram(programId)
    return Response.json({ success: true })
  } catch (error) {
    return toRouteErrorResponse(error)
  }
}
