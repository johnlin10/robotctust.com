import 'server-only'

import { User } from '@supabase/supabase-js'
import { UserProfile } from '@/app/types/user'
import { createClient } from '@/app/utils/supabase/server'
import { getUserProfileServer } from '@/app/utils/userServiceServer'
import {
  isAdminRole,
  isSuperAdminRole,
  normalizeRoles,
} from '@/app/utils/auth/roles'

type UnauthorizedAccess = {
  status: 'unauthenticated' | 'forbidden'
}

type AuthorizedAccess = {
  status: 'authorized'
  profile: UserProfile
  user: User
  isAdmin: boolean
  isSuperAdmin: boolean
}

export type AdminAccessResult = UnauthorizedAccess | AuthorizedAccess

export async function getAdminAccess(): Promise<AdminAccessResult> {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error) {
    console.error('Failed to read Supabase session:', error.message)
    return { status: 'unauthenticated' }
  }

  if (!user) {
    return { status: 'unauthenticated' }
  }

  const profile = await getUserProfileServer(user.id)
  if (!profile) {
    return { status: 'forbidden' }
  }

  const roles = normalizeRoles(profile.roles)
  if (!isAdminRole(roles)) {
    return { status: 'forbidden' }
  }

  return {
    status: 'authorized',
    profile: {
      ...profile,
      roles,
    },
    user,
    isAdmin: true,
    isSuperAdmin: isSuperAdminRole(roles),
  }
}

export async function requireAdminAccess(options?: {
  requireSuperAdmin?: boolean
}): Promise<AdminAccessResult> {
  const access = await getAdminAccess()

  if (access.status !== 'authorized') {
    return access
  }

  if (options?.requireSuperAdmin && !access.isSuperAdmin) {
    return { status: 'forbidden' }
  }

  return access
}
