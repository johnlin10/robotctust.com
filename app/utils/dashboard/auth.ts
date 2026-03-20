import { createClient } from '@/app/utils/supabase/server'
import {
  DashboardActor,
  DashboardModule,
  MODULE_PERMISSIONS_MAP,
  Role,
} from '@/app/types/dashboard'

class DashboardAccessError extends Error {
  statusCode: number

  constructor(message: string, statusCode: number) {
    super(message)
    this.name = 'DashboardAccessError'
    this.statusCode = statusCode
  }
}

const KNOWN_ROLES: Role[] = [
  'super_admin',
  'admin',
  'admin_course',
  'admin_achievement',
  'admin_verifications',
  'admin_news',
  'member',
]

/**
 * 正規化角色
 * @param role - 角色
 * @returns 正規化後的角色
 */
function normalizeRole(role: string | null | undefined): Role {
  if (!role) return 'member'
  return KNOWN_ROLES.includes(role as Role) ? (role as Role) : 'member'
}

/**
 * 獲取角色模組
 * @param role - 角色
 * @returns 角色模組
 */
export function getRoleModules(role: Role): DashboardModule[] {
  return MODULE_PERMISSIONS_MAP[role] || []
}

/**
 * 判斷角色是否可以訪問模組
 * @param role - 角色
 * @param module - 模組
 * @returns 是否可以訪問模組
 */
export function canAccessModule(role: Role, module: DashboardModule): boolean {
  return getRoleModules(role).includes(module)
}

/**
 * 獲取管理後台使用者
 * @returns 管理後台使用者
 */
export async function getDashboardActor(): Promise<DashboardActor> {
  // 建立 Supabase Client
  const supabase = await createClient()
  // 獲取使用者
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    throw new DashboardAccessError('尚未登入', 401)
  }

  // 獲取使用者資料
  const { data: userRow, error: profileError } = await supabase
    .from('users')
    .select('id, role')
    .eq('id', user.id)
    .maybeSingle()

  if (profileError || !userRow) {
    throw new DashboardAccessError('找不到使用者資料', 403)
  }

  // 正規化角色
  const role = normalizeRole(userRow.role)
  // 返回管理後台使用者
  return {
    userId: user.id,
    role,
    modules: getRoleModules(role),
  }
}

/**
 * 要求管理後台訪問
 * @param module - 模組
 * @returns 管理後台使用者
 */
export async function requireDashboardAccess(
  module?: DashboardModule,
): Promise<DashboardActor> {
  // 獲取管理後台使用者
  const actor = await getDashboardActor()

  if (actor.modules.length === 0) {
    // 如果使用者沒有模組權限，返回錯誤
    throw new DashboardAccessError('您沒有後台使用權限', 403)
  }

  if (module && !canAccessModule(actor.role, module)) {
    // 如果使用者沒有該模組的管理權限，返回錯誤
    throw new DashboardAccessError('您沒有該模組的管理權限', 403)
  }

  // 返回管理後台使用者
  return actor
}

/**
 * 轉換為路由錯誤回應
 * @param error - 錯誤
 * @returns 路由錯誤回應
 */
export function toRouteErrorResponse(error: unknown): Response {
  // 如果錯誤是管理後台存取錯誤，返回錯誤回應
  if (error instanceof DashboardAccessError) {
    return Response.json({ error: error.message }, { status: error.statusCode })
  }

  // 如果錯誤是其他類型，返回伺服器錯誤回應
  return Response.json({ error: '伺服器發生未預期錯誤' }, { status: 500 })
}
