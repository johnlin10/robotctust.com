/**
 * 課程 API 路由
 * @author John Lin
 */

import { NextRequest } from 'next/server'
import {
  createSemester,
  createChapter,
  createCourse,
  createCourseContent,
  deleteChapter,
  deleteCourse,
  deleteCourseContent,
  deleteSemester,
  getCourseWorkspace,
  getCurriculumOverview,
  getCurriculumTree,
  updateChapter,
  updateCourse,
  updateCourseContent,
  updateCoursePublishState,
  updateSemester,
} from '@/app/utils/dashboard/curriculum'
import {
  requireDashboardAccess,
  toRouteErrorResponse,
} from '@/app/utils/dashboard/auth'

/**
 * 獲取課程大綱
 * @param request - 請求物件
 * @returns
 */
export async function GET(request: NextRequest) {
  try {
    await requireDashboardAccess('courses')

    const view = request.nextUrl.searchParams.get('view')
    const semesterId = request.nextUrl.searchParams.get('semesterId')
    const courseId = request.nextUrl.searchParams.get('courseId')

    if (view === 'overview') {
      const payload = await getCurriculumOverview()
      return Response.json(payload)
    }

    if (view === 'course-workspace') {
      if (!courseId) {
        return Response.json({ error: '缺少課程 ID' }, { status: 400 })
      }

      const payload = await getCourseWorkspace(courseId)
      return Response.json(payload)
    }

    const payload = await getCurriculumTree(semesterId)
    return Response.json(payload)
  } catch (error) {
    return toRouteErrorResponse(error)
  }
}

/**
 * 新增課程章節、單元與內容
 * @param request - 請求物件
 * @returns 回應物件r
 */
export async function POST(request: NextRequest) {
  try {
    await requireDashboardAccess('courses')

    const body = (await request.json()) as
      | { type: 'semester'; name: string; is_active?: boolean }
      | { type: 'chapter'; semester_id: string; title: string }
      | {
          type: 'course'
          chapter_id: string
          id?: string
          name: string
          description?: string
          reward_exp?: number
          is_published?: boolean
          order_index?: number
        }
      | {
          type: 'content'
          course_id: string
          content_type: string
          content: string
          program_id?: string | null
        }

    if (body.type === 'semester') {
      if (!body.name?.trim()) {
        return Response.json({ error: '缺少必要欄位' }, { status: 400 })
      }

      const semester = await createSemester({
        name: body.name.trim(),
        is_active: body.is_active,
      })
      return Response.json({ semester }, { status: 201 })
    }

    if (body.type === 'chapter') {
      if (!body.semester_id || !body.title?.trim()) {
        return Response.json({ error: '缺少必要欄位' }, { status: 400 })
      }
      const chapter = await createChapter({
        semester_id: body.semester_id,
        title: body.title.trim(),
      })
      return Response.json({ chapter }, { status: 201 })
    }

    if (body.type === 'course') {
      if (!body.chapter_id || !body.name?.trim()) {
        return Response.json({ error: '缺少必要欄位' }, { status: 400 })
      }
      const course = await createCourse({
        chapter_id: body.chapter_id,
        id: body.id?.trim(),
        name: body.name.trim(),
        description: body.description?.trim(),
        reward_exp: body.reward_exp,
        is_published: body.is_published,
        order_index: body.order_index,
      })
      return Response.json({ course }, { status: 201 })
    }

    if (
      !body.course_id ||
      !body.content?.trim() ||
      !body.content_type?.trim()
    ) {
      return Response.json({ error: '缺少必要欄位' }, { status: 400 })
    }
    const content = await createCourseContent({
      course_id: body.course_id,
      content: body.content.trim(),
      type: body.content_type.trim(),
      program_id: body.program_id || null,
    })
    return Response.json({ content }, { status: 201 })
  } catch (error) {
    return toRouteErrorResponse(error)
  }
}

/**
 * 更新課程發布狀態
 * @param request - 請求物件
 * @returns 回應物件
 */
export async function PATCH(request: NextRequest) {
  try {
    await requireDashboardAccess('courses')

    const body = (await request.json()) as
      | {
          type: 'semester'
          id: string
          name?: string
          is_active?: boolean
        }
      | {
          type: 'chapter'
          id: string
          title?: string
          semester_id?: string
        }
      | {
          type: 'course'
          id: string
          new_id?: string
          name?: string
          description?: string | null
          chapter_id?: string
          reward_exp?: number
          is_published?: boolean
          order_index?: number
        }
      | {
          type: 'content'
          id: string
          content_type?: string
          content?: string
          program_id?: string | null
        }
      | {
          type: 'course-publish'
          course_id: string
          is_published: boolean
        }

    if (body.type === 'semester') {
      if (!body.id) {
        return Response.json({ error: '缺少必要欄位' }, { status: 400 })
      }

      const semester = await updateSemester({
        id: body.id,
        name: body.name?.trim(),
        is_active: body.is_active,
      })
      return Response.json({ semester })
    }

    if (body.type === 'chapter') {
      if (!body.id) {
        return Response.json({ error: '缺少必要欄位' }, { status: 400 })
      }

      const chapter = await updateChapter({
        id: body.id,
        title: body.title?.trim(),
        semester_id: body.semester_id,
      })
      return Response.json({ chapter })
    }

    if (body.type === 'course') {
      if (!body.id) {
        return Response.json({ error: '缺少必要欄位' }, { status: 400 })
      }

      const course = await updateCourse({
        id: body.id,
        new_id: body.new_id?.trim(),
        name: body.name?.trim(),
        description:
          typeof body.description === 'string' ? body.description.trim() : body.description,
        chapter_id: body.chapter_id,
        reward_exp: body.reward_exp,
        is_published: body.is_published,
        order_index: body.order_index,
      })
      return Response.json({ course })
    }

    if (body.type === 'content') {
      if (!body.id) {
        return Response.json({ error: '缺少必要欄位' }, { status: 400 })
      }

      const content = await updateCourseContent({
        id: body.id,
        type: body.content_type?.trim(),
        content: body.content?.trim(),
        program_id: body.program_id,
      })
      return Response.json({ content })
    }

    if (!body.course_id || typeof body.is_published !== 'boolean') {
      return Response.json({ error: '缺少必要欄位' }, { status: 400 })
    }

    await updateCoursePublishState(body.course_id, body.is_published)
    return Response.json({ success: true })
  } catch (error) {
    return toRouteErrorResponse(error)
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await requireDashboardAccess('courses')

    const body = (await request.json()) as
      | { type: 'semester'; id: string }
      | { type: 'chapter'; id: string }
      | { type: 'course'; id: string }
      | { type: 'content'; id: string }

    if (!body.id) {
      return Response.json({ error: '缺少必要欄位' }, { status: 400 })
    }

    if (body.type === 'semester') {
      await deleteSemester(body.id)
      return Response.json({ success: true })
    }

    if (body.type === 'chapter') {
      await deleteChapter(body.id)
      return Response.json({ success: true })
    }

    if (body.type === 'course') {
      await deleteCourse(body.id)
      return Response.json({ success: true })
    }

    await deleteCourseContent(body.id)
    return Response.json({ success: true })
  } catch (error) {
    return toRouteErrorResponse(error)
  }
}
