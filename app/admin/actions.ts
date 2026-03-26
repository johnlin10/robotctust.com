'use server'

import { createAdminClient } from '@/app/utils/supabase/admin'
import { requireAdminAccess } from '@/app/utils/auth/admin'
import { UserRole } from '@/app/types/user'

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
    throw new Error(`Failed to fetch users: ${error.message}`)
  }

  return data
}

/**
 * 更新指定使用者的權限 (roles)，僅限 super_admin
 */
export async function updateUserRoles(userId: string, roles: string[]) {
  const access = await requireAdminAccess()
  if (access.status !== 'authorized' || !access.isSuperAdmin) {
    throw new Error('Unauthorized')
  }

  if (userId === access.user.id && !roles.includes('super_admin')) {
    throw new Error('您不能移除自己的 super_admin 權限！')
  }

  const supabaseAdmin = createAdminClient()
  
  const finalRoles = Array.isArray(roles) ? roles : [roles]

  const { error } = await supabaseAdmin
    .from('users')
    .update({ roles: finalRoles })
    .eq('id', userId)

  if (error) {
    console.error('Failed to update roles', error)
    throw new Error(`Failed to update user roles: ${error.message}`)
  }
  
  return { success: true }
}
