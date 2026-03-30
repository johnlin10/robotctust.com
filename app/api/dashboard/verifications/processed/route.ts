/**
 * 獲取最近已處理的課程驗證 API 路由
 * @author John Lin
 */

import { getRecentlyProcessedVerifications } from '@/app/utils/dashboard/verifications'
import {
  requireDashboardAccess,
  toRouteErrorResponse,
} from '@/app/utils/dashboard/auth'

/**
 * 獲取最近已處理的課程驗證
 * @returns 回應物件
 */
export async function GET() {
  try {
    // 檢查是否有權限
    await requireDashboardAccess('verifications')
    // 獲取最近已處理的課程驗證項目
    const rows = await getRecentlyProcessedVerifications()
    // 返回最近已處理的課程驗證項目
    return Response.json({ rows })
  } catch (error) {
    return toRouteErrorResponse(error)
  }
}
