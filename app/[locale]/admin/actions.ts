'use server'

import { createAdminClient } from '@/app/utils/supabase/admin'
import { requireAdminAccess } from '@/app/utils/auth/admin'
import { UserRole } from '@/app/types/user'
import { normalizeRoles } from '@/app/utils/auth/roles'

/**
 * 取得所有註冊使用者，僅限 super_admin
 */
export async function fetchAllUsers() {
  const access = await requireAdminAccess()
  if (access.status !== 'authorized' || !access.isSuperAdmin) {
    throw new Error('Unauthorized')
  }

  const supabaseAdmin = createAdminClient()
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('id, email, username, display_name, avatar_url, roles, created_at')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Failed to fetch users', error)
    throw new Error('讀取使用者資料失敗，請稍後再試')
  }

  return data
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/**
 * 更新指定使用者的權限 (roles)，僅限 super_admin
 */
export async function updateUserRoles(userId: string, roles: UserRole[]) {
  const access = await requireAdminAccess()
  if (access.status !== 'authorized' || !access.isSuperAdmin) {
    throw new Error('Unauthorized')
  }

  if (!userId || !UUID_RE.test(userId)) {
    throw new Error('無效的使用者 ID 格式')
  }

  const finalRoles = normalizeRoles(roles)

  if (userId === access.user.id && !finalRoles.includes('super_admin')) {
    throw new Error('您不能移除自己的 super_admin 權限！')
  }

  const supabaseAdmin = createAdminClient()

  const { error } = await supabaseAdmin
    .from('users')
    .update({ roles: finalRoles })
    .eq('id', userId)

  if (error) {
    console.error('Failed to update roles', error)
    throw new Error('更新使用者權限失敗，請稍後再試')
  }

  return { success: true }
}
