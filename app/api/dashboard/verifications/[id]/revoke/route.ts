/**
 * 撤回課程驗證項目 API 路由
 * @author John Lin
 */

import { NextRequest } from 'next/server'
import {
  requireDashboardAccess,
  toRouteErrorResponse,
} from '@/app/utils/dashboard/auth'
import { revokeVerification } from '@/app/utils/dashboard/verifications'

interface RouteContext {
  params: Promise<{ id: string }>
}

/**
 * 撤回課程驗證項目
 * @param _request - 請求物件
 * @param context - 路徑參數
 * @returns 回應物件
 */
export async function PATCH(_request: NextRequest, context: RouteContext) {
  try {
    // 檢查是否有權限
    await requireDashboardAccess('verifications')
    // 獲取路徑參數
    const { id } = await context.params

    if (!id) {
      // 如果沒有驗證單號，返回錯誤
      return Response.json({ error: '缺少驗證單號' }, { status: 400 })
    }

    // 撤回課程驗證項目
    await revokeVerification(id)
    // 返回成功
    return Response.json({ success: true })
  } catch (error) {
    return toRouteErrorResponse(error)
  }
}
