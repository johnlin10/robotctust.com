/**
 * 課程 API 路由
 * @author John Lin
 */

import { NextRequest } from 'next/server'
import {
  createChapter,
  createCourse,
  createCourseContent,
  getCurriculumTree,
  updateCoursePublishState,
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
    // 檢查是否有權限
    await requireDashboardAccess('courses')
    // 獲取學期 ID
    const semesterId = request.nextUrl.searchParams.get('semesterId')
    // 獲取課程大綱
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
    // 檢查是否有權限
    await requireDashboardAccess('courses')

    // 解析請求
    const body = (await request.json()) as
      | { type: 'chapter'; semester_id: string; title: string }
      | {
          type: 'course'
          chapter_id: string
          id: string
          name: string
          description?: string
        }
      | {
          type: 'content'
          course_id: string
          content_type: string
          content: string
          program_id?: string | null
        }

    // 新增章節
    if (body.type === 'chapter') {
      if (!body.semester_id || !body.title?.trim()) {
        // 如果缺少必要欄位，返回錯誤
        return Response.json({ error: '缺少必要欄位' }, { status: 400 })
      }
      // 新增章節
      const chapter = await createChapter({
        // 章節所屬學期
        semester_id: body.semester_id,
        // 章節標題
        title: body.title.trim(),
      })
      // 返回新增的章節
      return Response.json({ chapter }, { status: 201 })
    }

    // 新增課程
    if (body.type === 'course') {
      // 如果缺少必要欄位，返回錯誤
      if (!body.chapter_id || !body.id?.trim() || !body.name?.trim()) {
        return Response.json({ error: '缺少必要欄位' }, { status: 400 })
      }
      // 新增課程
      const course = await createCourse({
        // 課程所屬章節
        chapter_id: body.chapter_id,
        // 課程 ID
        id: body.id.trim(),
        // 課程名稱
        name: body.name.trim(),
        // 課程描述
        description: body.description?.trim(),
      })
      return Response.json({ course }, { status: 201 })
    }

    // 新增內容
    if (
      !body.course_id ||
      !body.content?.trim() ||
      !body.content_type?.trim()
    ) {
      // 如果缺少必要欄位，返回錯誤
      return Response.json({ error: '缺少必要欄位' }, { status: 400 })
    }
    // 新增內容
    const content = await createCourseContent({
      // 內容所屬課程
      course_id: body.course_id,
      // 內容文字
      content: body.content.trim(),
      // 內容類型
      type: body.content_type.trim(),
      // 程式碼 ID
      program_id: body.program_id || null,
    })
    // 返回新增的內容
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
    // 檢查是否有權限
    await requireDashboardAccess('courses')

    // 解析請求
    const body = (await request.json()) as {
      // 課程 ID
      course_id: string
      // 是否發布
      is_published: boolean
    }

    if (!body.course_id || typeof body.is_published !== 'boolean') {
      // 如果缺少必要欄位，返回錯誤
      return Response.json({ error: '缺少必要欄位' }, { status: 400 })
    }

    // 更新課程發布狀態
    await updateCoursePublishState(
      // 課程 ID
      body.course_id,
      // 是否發布
      body.is_published,
    )
    // 返回成功
    return Response.json({ success: true })
  } catch (error) {
    return toRouteErrorResponse(error)
  }
}
