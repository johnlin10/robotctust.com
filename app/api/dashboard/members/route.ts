import { NextRequest } from 'next/server'
import { getMembersOverview, addSemesterMembers, deleteSemesterMember } from '@/app/utils/dashboard/members'
import { requireDashboardAccess, toRouteErrorResponse } from '@/app/utils/dashboard/auth'

export async function GET(request: NextRequest) {
  try {
    // 檢查是否有帳號管理 (Accounts/Members) 的權限
    await requireDashboardAccess('members')

    const payload = await getMembersOverview()
    return Response.json(payload)
  } catch (error) {
    return toRouteErrorResponse(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireDashboardAccess('members')

    const body = (await request.json()) as {
      type: 'add-members'
      semester_id: string
      student_ids: string[]
    }

    if (body.type === 'add-members') {
      if (!body.semester_id || !Array.isArray(body.student_ids)) {
        return Response.json({ error: '缺少必要參數' }, { status: 400 })
      }

      const result = await addSemesterMembers(body.semester_id, body.student_ids)
      return Response.json({ success: true, added: result })
    }

    return Response.json({ error: '無效的操作 type' }, { status: 400 })
  } catch (error) {
    return toRouteErrorResponse(error)
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await requireDashboardAccess('members')

    const body = (await request.json()) as {
      type: 'delete-member'
      id: string
    }

    if (body.type === 'delete-member') {
      if (!body.id) {
        return Response.json({ error: '缺少必要參數' }, { status: 400 })
      }

      await deleteSemesterMember(body.id)
      return Response.json({ success: true })
    }

    return Response.json({ error: '無效的操作 type' }, { status: 400 })
  } catch (error) {
    return toRouteErrorResponse(error)
  }
}
