/**
 * 重新排序課程章節、單元與內容 API 路由
 * @author John Lin
 */

import { NextRequest } from 'next/server'
import { reorderItems } from '@/app/utils/dashboard/curriculum'
import {
  requireDashboardAccess,
  toRouteErrorResponse,
} from '@/app/utils/dashboard/auth'

/**
 * 重新排序課程章節、單元與內容
 * @param request - 請求物件
 * @returns 回應物件
 */
export async function PATCH(request: NextRequest) {
  try {
    // 檢查是否有權限
    await requireDashboardAccess('courses')
    // 解析請求
    const body = (await request.json()) as {
      table: 'chapters' | 'courses' | 'course_contents'
      rows: Array<{ id: string; order_index: number }>
    }

    if (!body.table || !Array.isArray(body.rows) || body.rows.length === 0) {
      // 如果缺少必要欄位，返回錯誤
      return Response.json({ error: '缺少必要欄位' }, { status: 400 })
    }

    // 重新排序課程章節、單元與內容
    await reorderItems(body.table, body.rows)
    // 返回成功
    return Response.json({ success: true })
  } catch (error) {
    return toRouteErrorResponse(error)
  }
}
